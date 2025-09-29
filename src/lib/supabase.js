// Supabase client configuration for server-side usage
// This client is designed for use in .server.js files only

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Creates a Supabase client for server-side operations
 * Uses the service role key for elevated permissions when needed
 * @param {boolean} useServiceRole - Whether to use service role key for admin operations
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseServerClient(useServiceRole = false) {
	const supabaseUrl = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
	const supabaseKey = useServiceRole
		? env.SUPABASE_SERVICE_ROLE_KEY
		: (env.PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY);

	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Missing Supabase environment variables. Check your .env file.');
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			// Disable auth for server-side operations
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

/**
 * Default Supabase client for most server operations
 * Uses anonymous key with RLS policies
 */
export const supabase = createSupabaseServerClient();

/**
 * Admin Supabase client for operations that bypass RLS
 * Use with caution - only for trusted server operations
 */
export const supabaseAdmin = createSupabaseServerClient(true);