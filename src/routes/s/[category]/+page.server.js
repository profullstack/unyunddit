import { error } from '@sveltejs/kit';
import { getPostsByCategory } from '$lib/categories.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const categorySlug = params.category;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;
	const offset = (page - 1) * limit;

	try {
		const { posts, category } = await getPostsByCategory(categorySlug, { limit, offset });
		
		if (!category) {
			throw error(404, 'Category not found');
		}

		return {
			posts,
			category,
			currentPage: page,
			hasMore: posts.length === limit
		};
	} catch (err) {
		console.error('Error loading category page:', err);
		throw error(500, 'Failed to load category posts');
	}
}