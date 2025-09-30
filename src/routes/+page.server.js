import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostsWithVotes, fetchCategoriesWithCounts } from '$lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with vote counts
		const posts = await fetchPostsWithVotes({
			orderBy: 'created_at',
			ascending: false,
			limit: 50
		});

		// Fetch categories with post counts
		const popularCategories = await fetchCategoriesWithCounts({
			limit: 20
		});

		return {
			posts,
			popularCategories
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