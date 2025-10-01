import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {

	try {
		// Fetch latest comments
		const { data: comments, error: commentsError } = await supabase
			.from('comments')
			.select('id, content, created_at, post_id')
			.order('created_at', { ascending: false })
			.limit(50);

		if (commentsError) {
			console.error('Error fetching comments:', commentsError);
			return {
				comments: [],
				currentPage: 'comments'
			};
		}

		// Fetch post information for each comment
		const postIds = [...new Set(comments?.map((c) => c.post_id) || [])];
		const { data: posts, error: postsError } = await supabase
			.from('posts')
			.select('id, title, category')
			.in('id', postIds);

		if (postsError) {
			console.error('Error fetching posts:', postsError);
		}

		// Create a map of posts for quick lookup
		const postsMap = new Map(posts?.map((p) => [p.id, p]) || []);

		// Attach post data to comments
		const commentsWithPosts = comments?.map((comment) => ({
			...comment,
			post: postsMap.get(comment.post_id) || null
		})) || [];

		return {
			comments: commentsWithPosts,
			currentPage: 'comments'
		};
	} catch (error) {
		console.error('Error in comments page load:', error);
		return {
			comments: [],
			currentPage: 'comments'
		};
	}
}