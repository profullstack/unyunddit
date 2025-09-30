import { supabase } from '$lib/supabase.js';
import { handleUpvote, handleDownvote } from '$lib/voting.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with categories, ordered by score (upvotes - downvotes) and then by creation time
		const { data: posts, error } = await supabase
			.from('posts')
			.select(`
				*,
				categories (
					id,
					name,
					slug,
					description
				)
			`)
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('Error fetching posts:', error);
		}

		// Calculate real-time vote counts for each post
		let postsWithVoteCounts = [];
		if (posts && posts.length > 0) {
			postsWithVoteCounts = await Promise.all(
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
		}

		// Get all categories first
		const { data: allCategories, error: categoriesError } = await supabase
			.from('categories')
			.select('*');
		
		let finalCategories = [];
		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
		} else if (allCategories) {
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
			
			// Sort by actual post count and limit to 20
			finalCategories = categoriesWithCounts
				.sort((a, b) => b.actual_post_count - a.actual_post_count)
				.slice(0, 20);
		}

		return {
			posts: postsWithVoteCounts || [],
			popularCategories: finalCategories || []
		};
	} catch (error) {
		console.error('Unexpected error in load function:', error);
		return {
			posts: [],
			popularCategories: []
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: handleUpvote,
	downvote: handleDownvote
};