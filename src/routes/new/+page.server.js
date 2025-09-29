import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		// Fetch posts ordered by creation time (newest first)
		const { data: posts, error } = await supabase
			.from('posts')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('Error fetching posts:', error);
			return {
				posts: []
			};
		}

		return {
			posts: posts || []
		};
	} catch (error) {
		console.error('Unexpected error in new page load function:', error);
		return {
			posts: []
		};
	}
}