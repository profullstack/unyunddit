import { supabase } from '$lib/supabase.js';
import { fail, redirect } from '@sveltejs/kit';
import { getAllCategories, suggestCategories } from '$lib/categories.js';
import { getCurrentUser } from '$lib/auth.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url }) {
	const categories = await getAllCategories();
	const userId = getCurrentUser(cookies);
	const categorySlug = url.searchParams.get('category');
	
	// Find the category ID if a category slug is provided
	let preselectedCategoryId = null;
	if (categorySlug) {
		const category = categories.find(cat => cat.slug === categorySlug);
		if (category) {
			preselectedCategoryId = category.id.toString();
		}
	}
	
	return {
		categories,
		isAuthenticated: !!userId,
		preselectedCategoryId
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	fetchTitle: async ({ request }) => {
		// Read form data once at the start
		const data = await request.formData();
		const url = data.get('url')?.toString().trim();
		const title = data.get('title')?.toString().trim();
		const content = data.get('content')?.toString().trim();
		const categoryId = data.get('category_id')?.toString().trim();

		try {
			if (!url) {
				return fail(400, {
					error: 'URL is required to fetch title',
					title,
					url,
					content,
					categoryId
				});
			}

			// Validate URL format
			try {
				new URL(url);
			} catch {
				return fail(400, {
					error: 'Invalid URL format',
					title,
					url,
					content,
					categoryId
				});
			}

			// Import SOCKS proxy agent dynamically
			const { SocksProxyAgent } = await import('socks-proxy-agent');
			
			// Create SOCKS proxy agent with socks5h:// for DNS leak prevention
			const torProxy = process.env.TOR_PROXY_URL || 'socks5h://127.0.0.1:9050';
			const agent = new SocksProxyAgent(torProxy);

			// Fetch the page through Tor using native fetch with the agent
			const response = await fetch(url, {
				dispatcher: agent,
				signal: AbortSignal.timeout(15000),
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0'
				}
			});

			if (!response.ok) {
				return fail(502, {
					error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
					title,
					url,
					content,
					categoryId
				});
			}

			const html = await response.text();

			// Extract title using regex
			const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
			const fetchedTitle = titleMatch ? titleMatch[1].trim() : '';

			if (!fetchedTitle) {
				return fail(404, {
					error: 'No title found on the page',
					title,
					url,
					content,
					categoryId
				});
			}

			// Decode HTML entities
			const decodedTitle = fetchedTitle
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#039;/g, "'")
				.replace(/&nbsp;/g, ' ');

			// Return the fetched title along with other form data
			return {
				success: true,
				title: decodedTitle,
				url,
				content,
				categoryId
			};

		} catch (error) {
			console.error('Error fetching title:', error);

			if (error instanceof Error && error.name === 'AbortError') {
				return fail(504, {
					error: 'Request timeout - the page took too long to load',
					title,
					url,
					content,
					categoryId
				});
			}

			return fail(500, {
				error: 'Failed to fetch title. Please check the URL and try again.',
				title,
				url,
				content,
				categoryId
			});
		}
	},

	submit: async ({ request, cookies }) => {
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

			// Get current user ID if authenticated
			const userId = getCurrentUser(cookies);

			// Insert post into database
			const { data: post, error } = await supabase
				.from('posts')
				.insert({
					title,
					url: url || null,
					content: content || null,
					category_id: finalCategoryId,
					user_id: userId || null
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
			throw redirect(303, `/posts/${post.id}`);

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