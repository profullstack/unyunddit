import { supabase } from '$lib/supabase.js';
import { fail, error } from '@sveltejs/kit';
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
export async function load({ params }) {
	const postId = params.id;

	try {
		// Fetch the post
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select('*')
			.eq('id', postId)
			.single();

		if (postError || !post) {
			throw error(404, 'Post not found');
		}

		// Fetch comments for this post
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('*')
			.eq('post_id', postId)
			.order('created_at', { ascending: true });

		if (commentsError) {
			console.error('Error fetching comments:', commentsError);
			return {
				post,
				comments: []
			};
		}

		return {
			post,
			comments: comments || []
		};
	} catch (err) {
		if (err?.status === 404) {
			throw err;
		}
		console.error('Unexpected error in post load function:', err);
		throw error(500, 'Internal server error');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: async ({ request, getClientAddress, params }) => {
		try {
			const data = await request.formData();
			const postId = data.get('postId') || params.id;
			
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

	downvote: async ({ request, getClientAddress, params }) => {
		try {
			const data = await request.formData();
			const postId = data.get('postId') || params.id;
			
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
	},

	upvoteComment: async ({ request, getClientAddress }) => {
		try {
			const data = await request.formData();
			const commentId = data.get('commentId');
			
			if (!commentId) {
				return fail(400, { error: 'Comment ID is required' });
			}

			const ipHash = hashIP(getClientAddress());

			// Check if user already voted on this comment
			const { data: existingVote } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('comment_id', commentId)
				.single();

			if (existingVote) {
				if (existingVote.vote_type === 'up') {
					// Remove upvote if already upvoted
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error removing comment upvote:', error);
						return fail(500, { error: 'Failed to remove vote' });
					}
				} else {
					// Change downvote to upvote
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: 'up' })
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error changing comment vote:', error);
						return fail(500, { error: 'Failed to change vote' });
					}
				}
			} else {
				// Add new upvote
				const { error } = await supabase
					.from('votes')
					.insert({
						ip_hash: ipHash,
						comment_id: commentId,
						vote_type: 'up'
					});

				if (error) {
					console.error('Error adding comment upvote:', error);
					return fail(500, { error: 'Failed to add vote' });
				}
			}

			return { success: true };
		} catch (error) {
			console.error('Unexpected error in upvoteComment action:', error);
			return fail(500, { error: 'Internal server error' });
		}
	},

	downvoteComment: async ({ request, getClientAddress }) => {
		try {
			const data = await request.formData();
			const commentId = data.get('commentId');
			
			if (!commentId) {
				return fail(400, { error: 'Comment ID is required' });
			}

			const ipHash = hashIP(getClientAddress());

			// Check if user already voted on this comment
			const { data: existingVote } = await supabase
				.from('votes')
				.select('id, vote_type')
				.eq('ip_hash', ipHash)
				.eq('comment_id', commentId)
				.single();

			if (existingVote) {
				if (existingVote.vote_type === 'down') {
					// Remove downvote if already downvoted
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error removing comment downvote:', error);
						return fail(500, { error: 'Failed to remove vote' });
					}
				} else {
					// Change upvote to downvote
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: 'down' })
						.eq('id', existingVote.id);

					if (error) {
						console.error('Error changing comment vote:', error);
						return fail(500, { error: 'Failed to change vote' });
					}
				}
			} else {
				// Add new downvote
				const { error } = await supabase
					.from('votes')
					.insert({
						ip_hash: ipHash,
						comment_id: commentId,
						vote_type: 'down'
					});

				if (error) {
					console.error('Error adding comment downvote:', error);
					return fail(500, { error: 'Failed to add vote' });
				}
			}

			return { success: true };
		} catch (error) {
			console.error('Unexpected error in downvoteComment action:', error);
			return fail(500, { error: 'Internal server error' });
		}
	},

	comment: async ({ request, params }) => {
		try {
			const data = await request.formData();
			const postId = data.get('postId') || params.id;
			const parentId = data.get('parentId');
			const content = data.get('content')?.toString().trim();

			// Validation
			if (!postId) {
				return fail(400, { error: 'Post ID is required', content });
			}

			if (!content) {
				return fail(400, { error: 'Comment content is required', content });
			}

			if (content.length > 5000) {
				return fail(400, { error: 'Comment must be 5,000 characters or less', content });
			}

			// Calculate depth for nested comments
			let depth = 0;
			if (parentId) {
				const { data: parentComment } = await supabase
					.from('comments')
					.select('depth')
					.eq('id', parentId)
					.single();

				if (parentComment) {
					depth = parentComment.depth + 1;
				}

				// Limit nesting depth
				if (depth > 10) {
					return fail(400, { error: 'Maximum comment nesting depth reached', content });
				}
			}

			// Insert comment into database
			const { error } = await supabase
				.from('comments')
				.insert({
					post_id: postId,
					parent_id: parentId || null,
					content,
					depth
				});

			if (error) {
				console.error('Error creating comment:', error);
				return fail(500, { error: 'Failed to create comment. Please try again.', content });
			}

			return { success: true };

		} catch (error) {
			console.error('Unexpected error in comment action:', error);
			return fail(500, { error: 'An unexpected error occurred. Please try again.', content: '' });
		}
	}
};