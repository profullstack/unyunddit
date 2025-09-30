import { redirect } from '@sveltejs/kit';
import { getCurrentUser, getUserInfo } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const userId = getCurrentUser(cookies);
	
	// Redirect to auth page if not logged in
	if (!userId) {
		throw redirect(303, '/auth');
	}

	// Get user information from database
	const userInfo = await getUserInfo(userId, supabase);
	
	if (userInfo.error) {
		// If there's an error getting user info, clear the invalid session and redirect
		cookies.delete('user_session', { path: '/' });
		throw redirect(303, '/auth');
	}

	return {
		user: {
			id: userId,
			username: userInfo.username,
			created_at: userInfo.created_at
		}
	};
}