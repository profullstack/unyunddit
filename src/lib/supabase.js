// Supabase client configuration for server-side usage
// This client is designed for use in .server.js files only

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Creates a Supabase client for server-side operations
 * Uses the service role key for elevated permissions when needed
 * @param {boolean} useServiceRole - Whether to use service role key for admin operations
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createSupabaseServerClient(useServiceRole = false) {
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = useServiceRole
		? process.env.SUPABASE_SERVICE_ROLE_KEY
		: process.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		console.error('Missing Supabase environment variables:', {
			supabaseUrl: !!supabaseUrl,
			supabaseKey: !!supabaseKey,
			useServiceRole
		});
		throw new Error('Supabase environment variables are required');
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			// Disable auth for server-side operations
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

// Export the client directly - will work at runtime
export const supabase = createSupabaseServerClient();
export const supabaseAdmin = createSupabaseServerClient(true);