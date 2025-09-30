import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostsWithVotes } from '$lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with vote counts, ordered by creation time (newest first)
		const posts = await fetchPostsWithVotes({
			orderBy: 'created_at',
			ascending: false,
			limit: 50
		});

		return {
			posts
		};
	} catch (error) {
		console.error('Unexpected error in new page load function:', error);
		return {
			posts: []
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	upvote: handleUpvote,
	downvote: handleDownvote
};