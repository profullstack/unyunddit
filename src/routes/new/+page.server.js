import { supabase } from '$lib/supabase.js';
import { handleUpvote, handleDownvote } from '$lib/voting.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts with categories, ordered by creation time (newest first)
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
			return {
				posts: []
			};
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

		return {
			posts: postsWithVoteCounts || []
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