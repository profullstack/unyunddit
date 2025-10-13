import { getCurrentUserObject } from '$lib/auth.js';
import { supabase } from '$lib/supabase.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies, url }) {
	// Debug: Check if cookie exists
	const sessionCookie = cookies.get('user_session');
	console.log('🔍 Layout load - Session cookie:', sessionCookie ? 'EXISTS' : 'MISSING');

	// Get complete user object from session cookie
	const result = await getCurrentUserObject(cookies, supabase);

	// Determine current page from URL pathname
	const pathname = url.pathname;
	let currentPage = '';

	if (pathname === '/') currentPage = 'home';
	else if (pathname === '/submit') currentPage = 'submit';
	else if (pathname === '/new') currentPage = 'new';
	else if (pathname === '/popular') currentPage = 'popular';
	else if (pathname === '/auth') currentPage = 'auth';
	else if (pathname === '/settings') currentPage = 'settings';

	// Debug: Log authentication state
	console.log(
		'🔍 Layout load - User:',
		result.user?.username,
		'isAuthenticated:',
		result.isAuthenticated,
		'currentPage:',
		currentPage
	);

	const theme = cookies.get('colortheme');

	return {
		user: result.user,
		isAuthenticated: result.isAuthenticated,
		currentPage,
		theme
	};
}
