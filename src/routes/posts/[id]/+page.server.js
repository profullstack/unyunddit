import { supabase } from '$lib/supabase.js';
import { error, fail } from '@sveltejs/kit';
import { createHash } from 'crypto';

/**
 * Hash IP address for anonymous voting while preventing double voting
 * @param {string} ip - IP address to hash
 * @returns {string} SHA256 hash of the IP address
 */
function hashIP(ip) {
	return createHash('sha256').update(ip).digest('hex');
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, getClientAddress }) {
	const postId = parseInt(params.id);
	
	if (isNaN(postId)) {
		throw error(404, 'Post not found');
	}

	try {
		// Get the post
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select(`
				*,
				categories (
					id,
					name,
					slug
				)
			`)
			.eq('id', postId)
			.single();

		if (postError || !post) {
			throw error(404, 'Post not found');
		}

		// Get threaded comments using our custom function
		const { data: comments, error: commentsError } = await supabase
			.rpc('get_post_comments', { post_id_param: postId });

		if (commentsError) {
			console.error('Error fetching comments:', commentsError);
		}

		return {
			post,
			comments: comments || []
		};
	} catch (err) {
		console.error('Error in post load:', err);
		throw error(500, 'Failed to load post');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	comment: async ({ request, params, getClientAddress }) => {
		const postId = parseInt(params.id);
		const clientIP = getClientAddress();
		
		if (isNaN(postId)) {
			return fail(400, { error: 'Invalid post ID' });
		}

		try {
			const data = await request.formData();
			const content = data.get('content')?.toString()?.trim();
			const parentId = data.get('parent_id')?.toString();

			// Validation
			if (!content) {
				return fail(400, { error: 'Comment content is required', content });
			}

			if (content.length > 10000) {
				return fail(400, { error: 'Comment is too long (max 10,000 characters)', content });
			}

			// Verify post exists
			const { data: post, error: postError } = await supabase
				.from('posts')
				.select('id')
				.eq('id', postId)
				.single();

			if (postError || !post) {
				return fail(404, { error: 'Post not found' });
			}

			// If replying to a comment, verify parent exists
			if (parentId && parentId !== '') {
				const parentIdInt = parseInt(parentId);
				if (!isNaN(parentIdInt)) {
					const { data: parentComment, error: parentError } = await supabase
						.from('comments')
						.select('id, post_id')
						.eq('id', parentIdInt)
						.eq('post_id', postId)
						.single();

					if (parentError || !parentComment) {
						return fail(400, { error: 'Parent comment not found', content });
					}
				}
			}

			// Insert comment
			const commentData = {
				post_id: postId,
				content,
				author_ip: clientIP,
				parent_id: parentId && parentId !== '' ? parseInt(parentId) : null
			};

			const { error: insertError } = await supabase
				.from('comments')
				.insert(commentData);

			if (insertError) {
				console.error('Error inserting comment:', insertError);
				return fail(500, { error: 'Failed to post comment', content });
			}

			return { success: true };
		} catch (err) {
			console.error('Error in comment action:', err);
			return fail(500, { error: 'Failed to post comment' });
		}
	},

	upvote: async ({ request, params, getClientAddress }) => {
		try {
			const postId = parseInt(params.id);
			if (isNaN(postId)) {
				return fail(400, { error: 'Invalid post ID' });
			}

			const data = await request.formData();
			const postIdFromForm = data.get('postId');
			
			if (!postIdFromForm || parseInt(postIdFromForm) !== postId) {
				return fail(400, { error: 'Post ID mismatch' });
			}

			const ipHash = hashIP(getClientAddress());

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

	downvote: async ({ request, params, getClientAddress }) => {
		try {
			const postId = parseInt(params.id);
			if (isNaN(postId)) {
				return fail(400, { error: 'Invalid post ID' });
			}

			const data = await request.formData();
			const postIdFromForm = data.get('postId');
			
			if (!postIdFromForm || parseInt(postIdFromForm) !== postId) {
				return fail(400, { error: 'Post ID mismatch' });
			}

			const ipHash = hashIP(getClientAddress());

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

			return { success: true };
		} catch (error) {
			console.error('Unexpected error in downvote action:', error);
			return fail(500, { error: 'Internal server error' });
		}
	}
};