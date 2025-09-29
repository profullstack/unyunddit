import { supabase } from '$lib/supabase.js';
import { fail } from '@sveltejs/kit';
import { createHash } from 'crypto';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts ordered by score (upvotes - downvotes) and then by creation time
		const { data: posts, error } = await supabase
			.from('posts')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('Error fetching posts:', error);
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
			posts: posts || [],
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
		try {
			const data = await request.formData();
			const postId = data.get('postId');
			
			if (!postId) {
				return fail(400, { error: 'Post ID is required' });
			}

			const ipHash = hashIP(getClientAddress());

			// Check if user already voted on this post
			const { data: existingVote } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('post_id', postId)
				.single();

			if (existingVote) {
				if (existingVote.vote_type === 'up') {
					// Remove upvote if already upvoted
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error removing upvote:', error);
						return fail(500, { error: 'Failed to remove vote' });
					}
				} else {
					// Change downvote to upvote
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: 'up' })
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error changing vote:', error);
						return fail(500, { error: 'Failed to change vote' });
					}
				}
			} else {
				// Add new upvote
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
			}

			return { success: true };
		} catch (error) {
			console.error('Unexpected error in upvote action:', error);
			return fail(500, { error: 'Internal server error' });
		}
	},

	downvote: async ({ request, getClientAddress }) => {
		try {
			const data = await request.formData();
			const postId = data.get('postId');
			
			if (!postId) {
				return fail(400, { error: 'Post ID is required' });
			}

			const ipHash = hashIP(getClientAddress());

			// Check if user already voted on this post
			const { data: existingVote } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('post_id', postId)
				.single();

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

			return { success: true };
		} catch (error) {
			console.error('Unexpected error in downvote action:', error);
			return fail(500, { error: 'Internal server error' });
		}
	}
};