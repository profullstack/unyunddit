import { supabase } from '$lib/supabase.js';
import { fail, redirect } from '@sveltejs/kit';
import { getAllCategories, suggestCategories } from '$lib/categories.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const categories = await getAllCategories();
	return {
		categories
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	submit: async ({ request }) => {
		try {
			const data = await request.formData();
			const title = data.get('title')?.toString().trim();
			const url = data.get('url')?.toString().trim();
			const content = data.get('content')?.toString().trim();
			const categoryId = data.get('category_id')?.toString().trim();

			// Validation
			if (!title) {
				return fail(400, {
					error: 'Title is required',
					title,
					url,
					content,
					categoryId
				});
			}

			if (title.length > 300) {
				return fail(400, {
					error: 'Title must be 300 characters or less',
					title,
					url,
					content,
					categoryId
				});
			}

			if (url && url.length > 2000) {
				return fail(400, {
					error: 'URL must be 2000 characters or less',
					title,
					url,
					content,
					categoryId
				});
			}

			if (content && content.length > 10000) {
				return fail(400, {
					error: 'Content must be 10,000 characters or less',
					title,
					url,
					content,
					categoryId
				});
			}

			// Validate URL format if provided
			if (url) {
				try {
					new URL(url);
				} catch {
					return fail(400, {
						error: 'Please enter a valid URL',
						title,
						url,
						content,
						categoryId
					});
				}
			}

			// Must have either URL or content (or both)
			if (!url && !content) {
				return fail(400, {
					error: 'Please provide either a URL or text content',
					title,
					url,
					content,
					categoryId
				});
			}

			// Validate category if provided
			let finalCategoryId = null;
			if (categoryId && categoryId !== '') {
				// Verify category exists
				const { data: category, error: categoryError } = await supabase
					.from('categories')
					.select('id')
					.eq('id', categoryId)
					.single();
				
				if (categoryError || !category) {
					return fail(400, {
						error: 'Invalid category selected',
						title,
						url,
						content,
						categoryId
					});
				}
				finalCategoryId = parseInt(categoryId);
			}

			// Insert post into database
			const { data: post, error } = await supabase
				.from('posts')
				.insert({
					title,
					url: url || null,
					content: content || null,
					category_id: finalCategoryId
				})
				.select()
				.single();

			if (error) {
				console.error('Error creating post:', error);
				return fail(500, {
					error: 'Failed to create post. Please try again.',
					title,
					url,
					content,
					categoryId
				});
			}

			// Redirect to the new post
			throw redirect(303, `/post/${post.id}`);

		} catch (error) {
			// Handle redirect
			if (error?.status === 303) {
				throw error;
			}

			console.error('Unexpected error in submit action:', error);
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				title: '',
				url: '',
				content: '',
				categoryId: ''
			});
		}
	}
};