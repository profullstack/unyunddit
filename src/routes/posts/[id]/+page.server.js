import { supabase } from '$lib/supabase.js';
import { error, fail } from '@sveltejs/kit';
import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostWithVotes } from '$lib/posts.js';
import { getFingerprint } from '$lib/fingerprint.js';
import { sanitizeToAscii } from '$lib/sanitize.js';

/**
 * Build a hierarchical comment tree from flat comment array
 * @param {Array} comments - Flat array of comments
 * @returns {Array} - Hierarchical comment tree
 */
function buildCommentTree(comments) {
	if (!comments || comments.length === 0) return [];
	
	// Create a map for quick lookup
	const commentMap = new Map();
	const rootComments = [];
	
	// First pass: create map and add children arrays
	comments.forEach(comment => {
		comment.children = [];
		comment.depth = 0;
		commentMap.set(comment.id, comment);
	});
	
	// Second pass: build the tree structure
	comments.forEach(comment => {
		if (comment.parent_id && commentMap.has(comment.parent_id)) {
			const parent = commentMap.get(comment.parent_id);
			comment.depth = parent.depth + 1;
			parent.children.push(comment);
		} else {
			rootComments.push(comment);
		}
	});
	
	// Flatten the tree for display while preserving hierarchy
	function flattenTree(nodes, result = []) {
		nodes.forEach(node => {
			result.push(node);
			if (node.children && node.children.length > 0) {
				// Sort children by creation time
				node.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
				flattenTree(node.children, result);
			}
		});
		return result;
	}
	
	// Sort root comments by creation time
	rootComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
	
	return flattenTree(rootComments);
}

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

		// Build hierarchical comment tree
		const threadedComments = buildCommentTree(comments || []);

		return {
			post,
			comments: threadedComments,
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
			const asciiOnly = data.get('ascii_only') === 'true';

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

			// Conditionally sanitize content based on ascii_only flag
			const finalContent = asciiOnly ? sanitizeToAscii(content) : content;

			// Insert comment using browser fingerprint only
			const commentData = {
				post_id: postId,
				content: finalContent,
				browser_fingerprint: browserFingerprint,
				parent_id: parentId && parentId !== '' ? parentId : null,
				ascii_only: asciiOnly
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