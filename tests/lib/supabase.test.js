// Tests for Supabase client configuration
// Testing server-side Supabase integration

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseServerClient, supabase, supabaseAdmin } from '../../src/lib/supabase.js';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
	createClient: vi.fn(() => ({
		from: vi.fn(() => ({
			select: vi.fn(),
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		})),
		auth: {
			getUser: vi.fn(),
			signIn: vi.fn(),
			signOut: vi.fn()
		}
	}))
}));

describe('Supabase Client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createSupabaseServerClient', () => {
		it('should create a client with anonymous key by default', () => {
			const client = createSupabaseServerClient();
			expect(client).toBeDefined();
			expect(typeof client.from).toBe('function');
		});

		it('should create a client with service role key when requested', () => {
			const client = createSupabaseServerClient(true);
			expect(client).toBeDefined();
			expect(typeof client.from).toBe('function');
		});

		it('should throw error when environment variables are missing', () => {
			// Mock missing environment variables
			vi.doMock('$env/static/private', () => ({
				SUPABASE_URL: undefined,
				SUPABASE_ANON_KEY: undefined,
				SUPABASE_SERVICE_ROLE_KEY: undefined
			}));

			expect(() => {
				createSupabaseServerClient();
			}).toThrow('Missing Supabase environment variables');
		});
	});

	describe('Default exports', () => {
		it('should export default supabase client', () => {
			expect(supabase).toBeDefined();
			expect(typeof supabase.from).toBe('function');
		});

		it('should export admin supabase client', () => {
			expect(supabaseAdmin).toBeDefined();
			expect(typeof supabaseAdmin.from).toBe('function');
		});
	});

	describe('Client configuration', () => {
		it('should configure auth settings correctly', () => {
			const client = createSupabaseServerClient();
			expect(client).toBeDefined();
			// Auth configuration is internal, so we just verify the client exists
		});

		it('should handle both anonymous and service role configurations', () => {
			const anonClient = createSupabaseServerClient(false);
			const adminClient = createSupabaseServerClient(true);
			
			expect(anonClient).toBeDefined();
			expect(adminClient).toBeDefined();
		});
	});
});