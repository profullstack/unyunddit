import { redirect } from '@sveltejs/kit';
import { getCurrentUserObject } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	// Get complete user object from session cookie
	const result = await getCurrentUserObject(cookies, supabase);
	
	// Redirect to auth page with reference if not logged in
	if (!result.isAuthenticated) {
		throw redirect(303, '/auth?ref=/settings');
	}

	return {
		user: result.user
	};
}