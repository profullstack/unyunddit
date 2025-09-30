import { handleUpvote, handleDownvote } from '$lib/voting.js';
import { fetchPostsWithVotes } from '$lib/posts.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with vote counts, ordered by score (upvotes - downvotes)
		const allPosts = await fetchPostsWithVotes({
			orderBy: 'created_at',
			ascending: false,
			limit: 100 // Get more posts to sort by score
		});

		// Sort by score (upvotes - downvotes) in descending order
		const popularPosts = allPosts
			.map(post => ({
				...post,
				score: (post.upvotes || 0) - (post.downvotes || 0)
			}))
			.sort((a, b) => b.score - a.score)
			.slice(0, 50); // Take top 50

		return {
			posts: popularPosts
		};
	} catch (error) {
		console.error('Unexpected error in popular page load function:', error);
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