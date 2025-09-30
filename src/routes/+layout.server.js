import { getCurrentUser, getUserInfo } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const userId = getCurrentUser(cookies);
	
	// Debug: Log authentication state
	console.log('Layout load - userId:', userId);
	
	if (!userId) {
		console.log('Layout load - No user ID found');
		return {
			user: null,
			isAuthenticated: false
		};
	}

	// Get user information from database
	const userInfo = await getUserInfo(userId, supabase);
	
	console.log('Layout load - userInfo:', userInfo);
	
	if (userInfo.error) {
		// If there's an error getting user info, clear the invalid session
		console.log('Layout load - Error getting user info:', userInfo.error);
		cookies.delete('user_session', { path: '/' });
		return {
			user: null,
			isAuthenticated: false
		};
	}

	console.log('Layout load - User authenticated:', userInfo.username);
	return {
		user: {
			id: userId,
			username: userInfo.username,
			created_at: userInfo.created_at
		},
		isAuthenticated: true
	};
}