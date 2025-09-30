import { supabase } from '$lib/supabase.js';
import { error, fail } from '@sveltejs/kit';
import { handleUpvote, handleDownvote } from '$lib/voting.js';
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
	const postId = params.id?.toString()?.trim();
	
	if (!postId) {
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
			comments: comments || []
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
		const clientIP = locals.ip;
		
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

			// Insert comment
			const commentData = {
				post_id: postId,
				content,
				author_ip: clientIP,
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