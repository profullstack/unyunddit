import { getCurrentUser, getUserInfo } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const userId = getCurrentUser(cookies);
	
	if (!userId) {
		return {
			user: null,
			isAuthenticated: false
		};
	}

	// Get user information from database
	const userInfo = await getUserInfo(userId, supabase);
	
	if (userInfo.error) {
		// If there's an error getting user info, clear the invalid session
		cookies.delete('user_session', { path: '/' });
		return {
			user: null,
			isAuthenticated: false
		};
	}

	return {
		user: {
			id: userId,
			username: userInfo.username,
			created_at: userInfo.created_at
		},
		isAuthenticated: true
	};
}