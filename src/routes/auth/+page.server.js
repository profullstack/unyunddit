import { fail, redirect } from '@sveltejs/kit';
import { register, login } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').Actions} */
export const actions = {
	register: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			return fail(400, {
				error: 'Username and password are required'
			});
		}

		const result = await register(username, password, supabase, cookies);

		if (!result.success) {
			return fail(400, {
				error: result.error
			});
		}

		// Redirect to reference page or home page after successful registration
		const ref = url.searchParams.get('ref');
		throw redirect(303, ref || '/');
	},

	login: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			return fail(400, {
				error: 'Username and password are required'
			});
		}

		const result = await login(username, password, supabase, cookies);

		if (!result.success) {
			return fail(400, {
				error: result.error
			});
		}

		// Redirect to reference page or home page after successful login
		const ref = url.searchParams.get('ref');
		throw redirect(303, ref || '/');
	}
};