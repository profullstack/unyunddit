import { supabase } from '$lib/supabase.js';
import { error, fail } from '@sveltejs/kit';
import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostWithVotes } from '$lib/posts.js';
import { getFingerprint } from '$lib/fingerprint.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const postId = params.id?.toString()?.trim();
	const replyTo = url.searchParams.get('reply_to');
	
	if (!postId) {
		throw error(404, 'Post not found');
	}

	try {
		// Get the post with vote counts
		const post = await fetchPostWithVotes(postId);
		
		if (!post) {
			throw error(404, 'Post not found');
		}

		// Get comments directly (bypassing RPC function for now)
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('*')
			.eq('post_id', postId)
			.order('created_at', { ascending: true });

		if (commentsError) {
			console.error('Error fetching comments:', commentsError);
		}

		return {
			post,
			comments: comments || [],
			replyTo
		};
	} catch (err) {
		console.error('Error in post load:', err);
		throw error(500, 'Failed to load post');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: handleUpvote,
	downvote: handleDownvote,
	
	comment: async ({ request, params, locals }) => {
		const postId = params.id?.toString()?.trim();
		const browserFingerprint = getFingerprint(locals);
		
		if (!postId) {
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
				const { data: parentComment, error: parentError } = await supabase
					.from('comments')
					.select('id, post_id')
					.eq('id', parentId)
					.eq('post_id', postId)
					.single();

				if (parentError || !parentComment) {
					return fail(400, { error: 'Parent comment not found', content });
				}
			}

			// Insert comment using browser fingerprint only
			const commentData = {
				post_id: postId,
				content,
				browser_fingerprint: browserFingerprint,
				parent_id: parentId && parentId !== '' ? parentId : null
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
	}
};