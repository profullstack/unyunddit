import { error } from '@sveltejs/kit';
import { getCategoryBySlug } from '$lib/categories.js';
import { fetchPostsWithVotes } from '$lib/posts.js';
import { handleUpvote, handleDownvote } from '$lib/voting.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const categorySlug = params.category;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;
	const offset = (page - 1) * limit;

	try {
		// Get the category first
		const category = await getCategoryBySlug(categorySlug);
		if (!category) {
			throw error(404, 'Category not found');
		}

		// Fetch posts with vote counts for this category
		const posts = await fetchPostsWithVotes({
			filters: { category_id: category.id },
			orderBy: 'created_at',
			ascending: false,
			limit
		});

		// Apply pagination manually since we're using our utility
		const paginatedPosts = posts.slice(offset, offset + limit);

		return {
			posts: paginatedPosts,
			category,
			currentPage: page,
			hasMore: paginatedPosts.length === limit
		};
	} catch (err) {
		console.error('Error loading category page:', err);
		throw error(500, 'Failed to load category posts');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: handleUpvote,
	downvote: handleDownvote
};