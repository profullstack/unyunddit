import { supabase } from '$lib/supabase.js';
import { fail, redirect } from '@sveltejs/kit';
import { getFingerprint } from '$lib/fingerprint.js';
import { createHash } from 'crypto';

/**
 * Hash IP address for backward compatibility during migration
 * @param {string} ip - IP address to hash
 * @returns {string} SHA256 hash of the IP address
 */
function hashIP(ip) {
	return createHash('sha256').update(ip).digest('hex');
}

/**
 * Handle upvote action
 * @param {import('@sveltejs/kit').RequestEvent} event - SvelteKit request event
 * @returns {Promise<import('@sveltejs/kit').ActionResult>}
 */
export async function handleUpvote(event) {
	const { request, locals } = event;
	const data = await request.formData();
	const postId = data.get('postId');
	
	if (!postId) {
		return fail(400, { error: 'Post ID is required' });
	}

	try {
		// Get both IP and browser fingerprint for transition period
		const clientIP = locals.ip;
		const ipHash = hashIP(clientIP);
		const browserFingerprint = getFingerprint(locals);
		
		console.log(`Vote request from IP: ${clientIP} (hash: ${ipHash.substring(0, 8)}...) fingerprint: ${browserFingerprint.substring(0, 8)}...`);

		// Check if user already voted on this post (check both ip_hash and browser_fingerprint)
		const { data: existingVote, error: voteCheckError } = await supabase
			.from('votes')
			.select('id, vote_type')
			.or(`ip_hash.eq.${ipHash},browser_fingerprint.eq.${browserFingerprint}`)
			.eq('post_id', postId)
			.single();

		if (voteCheckError && voteCheckError.code !== 'PGRST116') {
			console.error('Error checking existing vote:', voteCheckError);
			return fail(500, { error: 'Failed to check existing vote' });
		}

		if (existingVote) {
			if (existingVote.vote_type === 'up') {
				// Remove upvote if already upvoted
				console.log(`Removing upvote for post ${postId} by fingerprint ${browserFingerprint.substring(0, 8)}...`);
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
				console.log(`Changing downvote to upvote for post ${postId} by fingerprint ${browserFingerprint.substring(0, 8)}...`);
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
			console.log(`Adding new upvote for post ${postId} by fingerprint ${browserFingerprint.substring(0, 8)}...`);
			const { error } = await supabase
				.from('votes')
				.insert({
					ip_hash: ipHash,
					browser_fingerprint: browserFingerprint,
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
}

/**
 * Handle downvote action
 * @param {import('@sveltejs/kit').RequestEvent} event - SvelteKit request event
 * @returns {Promise<import('@sveltejs/kit').ActionResult>}
 */
export async function handleDownvote(event) {
	const { request, locals } = event;
	const data = await request.formData();
	const postId = data.get('postId');
	
	if (!postId) {
		return fail(400, { error: 'Post ID is required' });
	}

	try {
		// Get both IP and browser fingerprint for transition period
		const clientIP = locals.ip;
		const ipHash = hashIP(clientIP);
		const browserFingerprint = getFingerprint(locals);
		
		console.log(`Vote request from IP: ${clientIP} (hash: ${ipHash.substring(0, 8)}...) fingerprint: ${browserFingerprint.substring(0, 8)}...`);

		// Check if user already voted on this post (check both ip_hash and browser_fingerprint)
		const { data: existingVote, error: voteCheckError } = await supabase
			.from('votes')
			.select('id, vote_type')
			.or(`ip_hash.eq.${ipHash},browser_fingerprint.eq.${browserFingerprint}`)
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
					browser_fingerprint: browserFingerprint,
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