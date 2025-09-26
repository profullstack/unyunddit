// Server-side logic for guestbook page
// Handles form submissions and data loading

import { supabase } from '$lib/supabase.js';
import { fail } from '@sveltejs/kit';

export async function load() {
	try {
		// Fetch recent guestbook entries (limit to 50 for performance)
		const { data: entries, error } = await supabase
			.from('guestbook')
			.select('id, name, message, created_at')
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) {
			console.error('Error loading guestbook entries:', error);
			return {
				entries: [],
				error: 'Failed to load guestbook entries'
			};
		}

		return {
			entries: entries || [],
			error: null
		};
	} catch (err) {
		console.error('Unexpected error loading guestbook:', err);
		return {
			entries: [],
			error: 'An unexpected error occurred'
		};
	}
}

export const actions = {
	// Handle guestbook form submission
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const name = data.get('name')?.toString()?.trim();
			const message = data.get('message')?.toString()?.trim();

			// Validate input
			if (!name || name.length === 0) {
				return fail(400, {
					error: 'Name is required',
					name: '',
					message: message || ''
				});
			}

			if (!message || message.length === 0) {
				return fail(400, {
					error: 'Message is required',
					name: name || '',
					message: ''
				});
			}

			if (name.length > 100) {
				return fail(400, {
					error: 'Name must be 100 characters or less',
					name: name || '',
					message: message || ''
				});
			}

			if (message.length > 1000) {
				return fail(400, {
					error: 'Message must be 1000 characters or less',
					name: name || '',
					message: message || ''
				});
			}

			// Insert into database
			const { error } = await supabase
				.from('guestbook')
				.insert([{ name, message }]);

			if (error) {
				console.error('Error inserting guestbook entry:', error);
				return fail(500, {
					error: 'Failed to save your message. Please try again.',
					name: name || '',
					message: message || ''
				});
			}

			// Success - return success message
			return {
				success: true,
				message: 'Thank you for your message!'
			};

		} catch (err) {
			console.error('Unexpected error in guestbook action:', err);
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				name: '',
				message: ''
			});
		}
	}
};