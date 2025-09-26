// ESLint configuration for onion-ssr-boilerplate
// Modern flat config format for ESLint 9+

import js from '@eslint/js';
import sveltePlugin from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default [
	// Base JavaScript configuration
	js.configs.recommended,
	
	// Svelte plugin configuration
	...sveltePlugin.configs['flat/recommended'],
	
	// Prettier configuration (must be last)
	prettier,
	
	// Custom rules and overrides
	{
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
			globals: {
				// Node.js globals
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				global: 'readonly',
				// Browser globals (for Svelte components)
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly'
			}
		},
		rules: {
			// Enforce modern JavaScript practices
			'prefer-const': 'error',
			'no-var': 'error',
			'prefer-arrow-callback': 'error',
			'prefer-template': 'error',
			
			// Error handling
			'no-console': 'warn',
			'no-unused-vars': ['error', { 
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_' 
			}],
			
			// Code quality
			'eqeqeq': ['error', 'always'],
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			
			// Async/await best practices
			'require-await': 'error',
			'no-return-await': 'error',
			
			// Import/export
			'no-duplicate-imports': 'error'
		}
	},
	
	// File-specific configurations
	{
		files: ['**/*.server.js', '**/hooks.server.js'],
		rules: {
			// Allow console in server files
			'no-console': 'off'
		}
	},
	
	// Ignore patterns
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'supabase/functions/_shared/',
			'*.config.js'
		]
	}
];