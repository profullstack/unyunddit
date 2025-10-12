import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostsWithVotes, fetchCategoriesWithCounts } from '$lib/posts.js';
import { redirect } from '@sveltejs/kit';

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
	downvote: handleDownvote,
	setTheme: ({ url, cookies }) => {
		const theme = url.searchParams.get('theme');
		if (theme) {
			cookies.set('colortheme', theme, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				sameSite: 'strict',
				secure: true
			});
		}
		throw redirect(303, url.pathname);
	}
};
