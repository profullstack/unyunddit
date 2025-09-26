// Vitest configuration for onion-ssr-boilerplate
// Configured for testing SvelteKit components and server-side logic

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Test environment
		environment: 'jsdom',
		
		// Setup files
		setupFiles: ['./tests/setup.js'],
		
		// Include patterns
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		
		// Global test configuration
		globals: true,
		
		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'build/',
				'.svelte-kit/',
				'*.config.js',
				'*.config.ts'
			]
		},
		
		// Mock configuration
		deps: {
			inline: ['@testing-library/svelte']
		}
	}
});