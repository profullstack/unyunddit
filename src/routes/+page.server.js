import { supabase } from '$lib/supabase.js';
import { fail, redirect } from '@sveltejs/kit';
import { createHash } from 'crypto';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with categories, ordered by score (upvotes - downvotes) and then by creation time
		const { data: posts, error } = await supabase
			.from('posts')
			.select(`
				*,
				categories (
					id,
					name,
					slug,
					description
				)
			`)
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('Error fetching posts:', error);
		}

		// Calculate real-time vote counts for each post
		let postsWithVoteCounts = [];
		if (posts && posts.length > 0) {
			postsWithVoteCounts = await Promise.all(
				posts.map(async (post) => {
					// Get upvote count
					const { count: upvoteCount } = await supabase
						.from('votes')
						.select('*', { count: 'exact', head: true })
						.eq('post_id', post.id)
						.eq('vote_type', 'up');

					// Get downvote count
					const { count: downvoteCount } = await supabase
						.from('votes')
						.select('*', { count: 'exact', head: true })
						.eq('post_id', post.id)
						.eq('vote_type', 'down');

					return {
						...post,
						upvotes: upvoteCount || 0,
						downvotes: downvoteCount || 0
					};
				})
			);
		}

		// Get all categories first
		const { data: allCategories, error: categoriesError } = await supabase
			.from('categories')
			.select('*');
		
		let finalCategories = [];
		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
		} else if (allCategories) {
			// Get post counts for each category
			const categoriesWithCounts = await Promise.all(
				allCategories.map(async (category) => {
					const { count } = await supabase
						.from('posts')
						.select('*', { count: 'exact', head: true })
						.eq('category_id', category.id);
					
					return {
						...category,
						actual_post_count: count || 0
					};
				})
			);
			
			// Sort by actual post count and limit to 20
			finalCategories = categoriesWithCounts
				.sort((a, b) => b.actual_post_count - a.actual_post_count)
				.slice(0, 20);
		}

		return {
			posts: postsWithVoteCounts || [],
			popularCategories: finalCategories || []
		};
	} catch (error) {
		console.error('Unexpected error in load function:', error);
		return {
			posts: [],
			popularCategories: []
		};
	}
}

/**
 * Get the real client IP address, handling various proxy configurations
 * @param {Request} request - The request object
 * @param {Function} getClientAddress - SvelteKit's getClientAddress function
 * @returns {string} The client IP address
 */
function getRealClientIP(request, getClientAddress) {
	// Check various proxy headers in order of preference
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIP = request.headers.get('x-real-ip');
	const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
	const trueClientIP = request.headers.get('true-client-ip'); // Some CDNs
	const xClientIP = request.headers.get('x-client-ip'); // Some proxies
	
	// x-forwarded-for can contain multiple IPs, take the first (original client)
	if (forwardedFor) {
		const firstIP = forwardedFor.split(',')[0]?.trim();
		if (firstIP && firstIP !== '127.0.0.1' && firstIP !== 'localhost') {
			return firstIP;
		}
	}
	
	// Check other headers
	if (realIP && realIP !== '127.0.0.1' && realIP !== 'localhost') return realIP;
	if (cfConnectingIP && cfConnectingIP !== '127.0.0.1') return cfConnectingIP;
	if (trueClientIP && trueClientIP !== '127.0.0.1') return trueClientIP;
	if (xClientIP && xClientIP !== '127.0.0.1') return xClientIP;
	
	// Fallback to SvelteKit's getClientAddress
	return getClientAddress();
}

/**
 * Hash IP address for anonymous voting while preventing double voting
 * @param {string} ip - IP address to hash
 * @returns {string} SHA256 hash of the IP address
 */
function hashIP(ip) {
	return createHash('sha256').update(ip).digest('hex');
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: async ({ request, getClientAddress }) => {
		const data = await request.formData();
		const postId = data.get('postId');
		
		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			// Get real client IP using improved detection
			const clientIP = getRealClientIP(request, getClientAddress);
			const ipHash = hashIP(clientIP);
			
			// Log all relevant headers for debugging
			const headers = {
				'x-forwarded-for': request.headers.get('x-forwarded-for'),
				'x-real-ip': request.headers.get('x-real-ip'),
				'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
				'true-client-ip': request.headers.get('true-client-ip'),
				'x-client-ip': request.headers.get('x-client-ip')
			};
			
			console.log(`Vote request from IP: ${clientIP} (hash: ${ipHash.substring(0, 8)}...)`);
			console.log('Proxy headers:', Object.fromEntries(Object.entries(headers).filter(([k, v]) => v)));

			// Check if user already voted on this post
			const { data: existingVote, error: voteCheckError } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('post_id', postId)
				.single();

			if (voteCheckError && voteCheckError.code !== 'PGRST116') {
				console.error('Error checking existing vote:', voteCheckError);
				return fail(500, { error: 'Failed to check existing vote' });
			}

			if (existingVote) {
				if (existingVote.vote_type === 'up') {
					// Remove upvote if already upvoted
					console.log(`Removing upvote for post ${postId} by IP hash ${ipHash.substring(0, 8)}...`);
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error removing upvote:', error);
						return fail(500, { error: 'Failed to remove vote' });
					}
					console.log('Upvote removed successfully');
				} else {
					// Change downvote to upvote
					console.log(`Changing downvote to upvote for post ${postId} by IP hash ${ipHash.substring(0, 8)}...`);
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: 'up' })
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error changing vote:', error);
						return fail(500, { error: 'Failed to change vote' });
					}
					console.log('Vote changed to upvote successfully');
				}
			} else {
				// Add new upvote
				console.log(`Adding new upvote for post ${postId} by IP hash ${ipHash.substring(0, 8)}...`);
				const { error } = await supabase
					.from('votes')
					.insert({
						ip_hash: ipHash,
						post_id: postId,
						vote_type: 'up'
					});

				if (error) {
					console.error('Error adding upvote:', error);
					return fail(500, { error: 'Failed to add vote' });
				}
				console.log('New upvote added successfully');
			}

			// Manually update post vote counts by counting votes directly
			const { count: upvoteCount } = await supabase
				.from('votes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId)
				.eq('vote_type', 'up');
				
			const { count: downvoteCount } = await supabase
				.from('votes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId)
				.eq('vote_type', 'down');
				
			const { error: updateError } = await supabase
				.from('posts')
				.update({
					upvotes: upvoteCount || 0,
					downvotes: downvoteCount || 0
				})
				.eq('id', postId);
				
			if (updateError) {
				console.error('Error updating vote counts:', updateError);
				// Don't fail the request, just log the error
			} else {
				console.log(`Updated post ${postId} vote counts: ${upvoteCount || 0} upvotes, ${downvoteCount || 0} downvotes`);
			}
		} catch (error) {
			console.error('Unexpected error in upvote action:', error);
			return fail(500, { error: 'Internal server error' });
		}

		// Redirect back to the referring page to refresh the data
		const referer = request.headers.get('referer');
		const redirectUrl = referer ? new URL(referer).pathname : '/';
		throw redirect(302, redirectUrl);
	},

	downvote: async ({ request, getClientAddress }) => {
		const data = await request.formData();
		const postId = data.get('postId');
		
		if (!postId) {
			return fail(400, { error: 'Post ID is required' });
		}

		try {
			// Get real client IP using improved detection
			const clientIP = getRealClientIP(request, getClientAddress);
			const ipHash = hashIP(clientIP);
			
			// Log all relevant headers for debugging
			const headers = {
				'x-forwarded-for': request.headers.get('x-forwarded-for'),
				'x-real-ip': request.headers.get('x-real-ip'),
				'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
				'true-client-ip': request.headers.get('true-client-ip'),
				'x-client-ip': request.headers.get('x-client-ip')
			};
			
			console.log(`Vote request from IP: ${clientIP} (hash: ${ipHash.substring(0, 8)}...)`);
			console.log('Proxy headers:', Object.fromEntries(Object.entries(headers).filter(([k, v]) => v)));

			// Check if user already voted on this post
			const { data: existingVote, error: voteCheckError } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('post_id', postId)
				.single();

			if (voteCheckError && voteCheckError.code !== 'PGRST116') {
				console.error('Error checking existing vote:', voteCheckError);
				return fail(500, { error: 'Failed to check existing vote' });
			}

			if (existingVote) {
				if (existingVote.vote_type === 'down') {
					// Remove downvote if already downvoted
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error removing downvote:', error);
						return fail(500, { error: 'Failed to remove vote' });
					}
				} else {
					// Change upvote to downvote
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: 'down' })
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error changing vote:', error);
						return fail(500, { error: 'Failed to change vote' });
					}
				}
			} else {
				// Add new downvote
				const { error } = await supabase
					.from('votes')
					.insert({
						ip_hash: ipHash,
						post_id: postId,
						vote_type: 'down'
					});

				if (error) {
					console.error('Error adding downvote:', error);
					return fail(500, { error: 'Failed to add vote' });
				}
			}

			// Manually update post vote counts by counting votes directly
			const { count: upvoteCount } = await supabase
				.from('votes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId)
				.eq('vote_type', 'up');
				
			const { count: downvoteCount } = await supabase
				.from('votes')
				.select('*', { count: 'exact', head: true })
				.eq('post_id', postId)
				.eq('vote_type', 'down');
				
			const { error: updateError } = await supabase
				.from('posts')
				.update({
					upvotes: upvoteCount || 0,
					downvotes: downvoteCount || 0
				})
				.eq('id', postId);
				
			if (updateError) {
				console.error('Error updating vote counts:', updateError);
				// Don't fail the request, just log the error
			} else {
				console.log(`Updated post ${postId} vote counts: ${upvoteCount || 0} upvotes, ${downvoteCount || 0} downvotes`);
			}
		} catch (error) {
			console.error('Unexpected error in downvote action:', error);
			return fail(500, { error: 'Internal server error' });
		}

		// Redirect back to the referring page to refresh the data
		const referer = request.headers.get('referer');
		const redirectUrl = referer ? new URL(referer).pathname : '/';
		throw redirect(302, redirectUrl);
	}
};