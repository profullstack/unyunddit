import { supabase } from '$lib/supabase.js';
import { error, fail } from '@sveltejs/kit';

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

	vote: async ({ request, params, getClientAddress }) => {
		const postId = parseInt(params.id);
		const clientIP = getClientAddress();
		
		if (isNaN(postId)) {
			return fail(400, { error: 'Invalid post ID' });
		}

		try {
			const data = await request.formData();
			const voteType = data.get('vote');

			if (!['up', 'down'].includes(voteType)) {
				return fail(400, { error: 'Invalid vote type' });
			}

			// Check if user has already voted on this post
			const { data: existingVote } = await supabase
				.from('votes')
				.select('vote_type')
				.eq('post_id', postId)
				.eq('voter_ip', clientIP)
				.single();

			if (existingVote) {
				if (existingVote.vote_type === voteType) {
					// Remove vote if clicking same vote type
					const { error } = await supabase
						.from('votes')
						.delete()
						.eq('post_id', postId)
						.eq('voter_ip', clientIP);

					if (error) {
						return fail(500, { error: 'Failed to remove vote' });
					}
				} else {
					// Update vote if clicking different vote type
					const { error } = await supabase
						.from('votes')
						.update({ vote_type: voteType })
						.eq('post_id', postId)
						.eq('voter_ip', clientIP);

					if (error) {
						return fail(500, { error: 'Failed to update vote' });
					}
				}
			} else {
				// Insert new vote
				const { error } = await supabase
					.from('votes')
					.insert({
						post_id: postId,
						voter_ip: clientIP,
						vote_type: voteType
					});

				if (error) {
					return fail(500, { error: 'Failed to cast vote' });
				}
			}

			return { success: true };
		} catch (err) {
			console.error('Error in vote action:', err);
			return fail(500, { error: 'Failed to process vote' });
		}
	}
};