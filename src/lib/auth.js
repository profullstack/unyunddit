/**
 * Authentication utilities for user registration, login, and session management
 * Uses simple username/password authentication with secure HTTP-only cookies
 */

/**
 * Register a new user
 * @param {string} username - Username (3-50 characters)
 * @param {string} password - Password (minimum 6 characters)
 * @param {object} supabase - Supabase client
 * @param {object} cookies - SvelteKit cookies object
 * @returns {Promise<{success: boolean, userId?: string, error?: string}>}
 */
export async function register(username, password, supabase, cookies) {
	try {
		// Validate input
		if (!username || username.length < 3 || username.length > 50) {
			return {
				success: false,
				error: 'Username must be between 3 and 50 characters'
			};
		}

		if (!password || password.length < 6) {
			return {
				success: false,
				error: 'Password must be at least 6 characters'
			};
		}

		// Call database function to create user
		const { data: userId, error } = await supabase.rpc('create_user', {
			p_username: username,
			p_password: password
		});

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		if (!userId) {
			return {
				success: false,
				error: 'Failed to create user'
			};
		}

		// Set session cookie
		cookies.set('user_session', userId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: true,
			secure: true,
			sameSite: 'strict'
		});

		return {
			success: true,
			userId
		};
	} catch (err) {
		console.error('Registration error:', err);
		return {
			success: false,
			error: 'Registration failed. Please try again.'
		};
	}
}

/**
 * Login user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {object} supabase - Supabase client
 * @param {object} cookies - SvelteKit cookies object
 * @returns {Promise<{success: boolean, userId?: string, error?: string}>}
 */
export async function login(username, password, supabase, cookies) {
	try {
		// Call database function to verify user
		const { data: userId, error } = await supabase.rpc('verify_user', {
			p_username: username,
			p_password: password
		});

		if (error) {
			return {
				success: false,
				error: error.message
			};
		}

		if (!userId) {
			return {
				success: false,
				error: 'Invalid username or password'
			};
		}

		// Set session cookie
		cookies.set('user_session', userId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: true,
			secure: true,
			sameSite: 'strict'
		});

		return {
			success: true,
			userId
		};
	} catch (err) {
		console.error('Login error:', err);
		return {
			success: false,
			error: 'Login failed. Please try again.'
		};
	}
}

/**
 * Logout user by clearing session cookie
 * @param {object} cookies - SvelteKit cookies object
 */
export function logout(cookies) {
	cookies.delete('user_session', { path: '/' });
}

/**
 * Get current user ID from session cookie
 * @param {object} cookies - SvelteKit cookies object
 * @returns {string|null} User ID or null if not authenticated
 */
export function getCurrentUser(cookies) {
	const userId = cookies.get('user_session');
	return userId || null;
}

/**
 * Check if user is authenticated
 * @param {object} cookies - SvelteKit cookies object
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated(cookies) {
	return !!cookies.get('user_session');
}

/**
 * Get user information from database
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<{username?: string, created_at?: string, error?: string}>}
 */
export async function getUserInfo(userId, supabase) {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('username, created_at')
			.eq('id', userId)
			.single();

		if (error) {
			return { error: error.message };
		}

		return data;
	} catch (err) {
		console.error('Get user info error:', err);
		return { error: 'Failed to get user information' };
	}
}

/**
 * Get current user object from session cookie
 * @param {object} cookies - SvelteKit cookies object
 * @param {object} supabase - Supabase client
 * @returns {Promise<{user?: object, isAuthenticated: boolean, error?: string}>}
 */
export async function getCurrentUserObject(cookies, supabase) {
	try {
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
			// Clear invalid session
			cookies.delete('user_session', { path: '/' });
			return {
				user: null,
				isAuthenticated: false,
				error: userInfo.error
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
	} catch (err) {
		console.error('Get current user object error:', err);
		return {
			user: null,
			isAuthenticated: false,
			error: 'Failed to get user information'
		};
	}
}