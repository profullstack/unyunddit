import { supabase } from '$lib/supabase.js';

/**
 * Fetch posts with real-time vote counts
 * @param {Object} options - Query options
 * @param {string} options.select - Supabase select query string
 * @param {Object} options.filters - Additional filters to apply
 * @param {string} options.orderBy - Column to order by (default: 'created_at')
 * @param {boolean} options.ascending - Sort order (default: false)
 * @param {number} options.limit - Number of posts to fetch (default: 50)
 * @returns {Promise<Array>} Posts with vote counts
 */
export async function fetchPostsWithVotes(options = {}) {
	const {
		select = `
			*,
			categories (
				id,
				name,
				slug,
				description
			)
		`,
		filters = {},
		orderBy = 'created_at',
		ascending = false,
		limit = 50
	} = options;

	try {
		// Build the query
		let query = supabase
			.from('posts')
			.select(select)
			.order(orderBy, { ascending })
			.limit(limit);

		// Apply filters
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				query = query.eq(key, value);
			}
		});

		const { data: posts, error } = await query;

		if (error) {
			console.error('Error fetching posts:', error);
			return [];
		}

		if (!posts || posts.length === 0) {
			return [];
		}

		// Calculate real-time vote counts for each post
		const postsWithVoteCounts = await Promise.all(
			posts.map(async (post) => {
				// Get upvote count
				const { count: upvoteCount } = await supabase
					.from('votes')
					.select('*', { count: 'exact', head: true })
					.eq('post_id', post.id)
					.eq('vote_type', 'up');

				// Get downvote count
				const { count: downvoteCount } = await supabase
					.from('votes')
					.select('*', { count: 'exact', head: true })
					.eq('post_id', post.id)
					.eq('vote_type', 'down');

				return {
					...post,
					upvotes: upvoteCount || 0,
					downvotes: downvoteCount || 0
				};
			})
		);

		return postsWithVoteCounts;
	} catch (error) {
		console.error('Error in fetchPostsWithVotes:', error);
		return [];
	}
}

/**
 * Fetch categories with post counts
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of categories to fetch (default: 20)
 * @returns {Promise<Array>} Categories with post counts
 */
export async function fetchCategoriesWithCounts(options = {}) {
	const { limit = 20 } = options;

	try {
		// Get all categories first
		const { data: allCategories, error: categoriesError } = await supabase
			.from('categories')
			.select('*');

		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
			return [];
		}

		if (!allCategories || allCategories.length === 0) {
			return [];
		}

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
		
		// Sort by actual post count and limit
		return categoriesWithCounts
			.sort((a, b) => b.actual_post_count - a.actual_post_count)
			.slice(0, limit);
	} catch (error) {
		console.error('Error in fetchCategoriesWithCounts:', error);
		return [];
	}
}

/**
 * Fetch a single post with vote counts
 * @param {string} postId - The post ID
 * @returns {Promise<Object|null>} Post with vote counts or null if not found
 */
export async function fetchPostWithVotes(postId) {
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
			return null;
		}

		// Get vote counts
		const { count: upvoteCount } = await supabase
			.from('votes')
			.select('*', { count: 'exact', head: true })
			.eq('post_id', post.id)
			.eq('vote_type', 'up');

		const { count: downvoteCount } = await supabase
			.from('votes')
			.select('*', { count: 'exact', head: true })
			.eq('post_id', post.id)
			.eq('vote_type', 'down');

		return {
			...post,
			upvotes: upvoteCount || 0,
			downvotes: downvoteCount || 0
		};
	} catch (error) {
		console.error('Error in fetchPostWithVotes:', error);
		return null;
	}
}