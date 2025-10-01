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

		// If no comments, return early
		if (!comments || comments.length === 0) {
			return {
				comments: [],
				currentPage: 'comments'
			};
		}

		// Fetch post information for each comment
		const postIds = [...new Set(comments.map((c) => c.post_id))];
		
		// Only fetch posts if we have post IDs
		if (postIds.length === 0) {
			return {
				comments: comments.map(c => ({ ...c, post: null })),
				currentPage: 'comments'
			};
		}

		const { data: posts, error: postsError } = await supabase
			.from('posts')
			.select(`
				id,
				title,
				category_id,
				categories (
					slug
				)
			`)
			.in('id', postIds);

		if (postsError) {
			console.error('Error fetching posts:', postsError);
			// Return comments without post data if posts fetch fails
			return {
				comments: comments.map(c => ({ ...c, post: null })),
				currentPage: 'comments'
			};
		}

		// Create a map of posts for quick lookup with category slug
		const postsMap = new Map(
			(posts || []).map((p) => {
				// Handle categories - Supabase returns it as an array
				let categorySlug = 'general';
				if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
					categorySlug = p.categories[0].slug || 'general';
				}
				
				return [
					p.id,
					{
						id: p.id,
						title: p.title,
						category: categorySlug
					}
				];
			})
		);

		// Attach post data to comments
		const commentsWithPosts = comments.map((comment) => ({
			...comment,
			post: postsMap.get(comment.post_id) || null
		}));

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