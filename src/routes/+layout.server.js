import { getCurrentUserObject } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	// Get complete user object from session cookie
	const result = await getCurrentUserObject(cookies, supabase);
	
	// Debug: Log authentication state
	console.log('Layout load - result:', result);
	
	return {
		user: result.user,
		isAuthenticated: result.isAuthenticated
	};
}