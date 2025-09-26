// Test setup for Vitest
// Configures testing environment for SvelteKit and Supabase

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for testing
vi.mock('$env/static/private', () => ({
	SUPABASE_URL: 'https://test.supabase.co',
	SUPABASE_ANON_KEY: 'test-anon-key',
	SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: '1.0.0'
}));

// Mock SvelteKit stores
vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn()
	},
	navigating: {
		subscribe: vi.fn()
	},
	updated: {
		subscribe: vi.fn()
	}
}));

// Global test utilities
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
	vi.clearAllMocks();
});