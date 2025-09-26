// Tests for server hooks
// Testing security headers and middleware functionality

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handle } from '../src/hooks.server.js';

describe('Server Hooks', () => {
	let mockEvent;
	let mockResolve;
	let mockResponse;

	beforeEach(() => {
		// Mock response object
		mockResponse = {
			headers: new Map(),
			set: vi.fn((key, value) => {
				mockResponse.headers.set(key, value);
			}),
			delete: vi.fn((key) => {
				mockResponse.headers.delete(key);
			})
		};

		// Mock resolve function
		mockResolve = vi.fn().mockResolvedValue(mockResponse);

		// Mock event object
		mockEvent = {
			request: {
				url: 'http://localhost:3000/',
				method: 'GET'
			}
		};
	});

	describe('handle function', () => {
		it('should set Content Security Policy header', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.get('Content-Security-Policy')).toBe(
				"default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'none'"
			);
		});

		it('should set privacy headers', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.get('Referrer-Policy')).toBe('no-referrer');
			expect(mockResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
			expect(mockResponse.headers.get('X-Frame-Options')).toBe('DENY');
			expect(mockResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
		});

		it('should set permissions policy', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.get('Permissions-Policy')).toBe(
				'geolocation=(), microphone=(), camera=()'
			);
		});

		it('should remove server identification headers', async () => {
			// Set initial headers that should be removed
			mockResponse.headers.set('Server', 'nginx/1.0');
			mockResponse.headers.set('X-Powered-By', 'Express');

			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.has('Server')).toBe(false);
			expect(mockResponse.headers.has('X-Powered-By')).toBe(false);
		});

		it('should call resolve with the event', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
		});

		it('should return the response', async () => {
			const result = await handle({ event: mockEvent, resolve: mockResolve });

			expect(result).toBe(mockResponse);
		});
	});

	describe('Security Headers Validation', () => {
		it('should block all JavaScript execution', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const csp = mockResponse.headers.get('Content-Security-Policy');
			expect(csp).toContain("script-src 'none'");
			expect(csp).toContain("default-src 'none'");
		});

		it('should allow only self-hosted styles', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const csp = mockResponse.headers.get('Content-Security-Policy');
			expect(csp).toContain("style-src 'self' 'unsafe-inline'");
		});

		it('should allow only self-hosted images and data URIs', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const csp = mockResponse.headers.get('Content-Security-Policy');
			expect(csp).toContain("img-src 'self' data:");
		});

		it('should restrict form actions to same origin', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const csp = mockResponse.headers.get('Content-Security-Policy');
			expect(csp).toContain("form-action 'self'");
		});

		it('should prevent embedding in frames', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const csp = mockResponse.headers.get('Content-Security-Policy');
			expect(csp).toContain("frame-ancestors 'none'");
			expect(mockResponse.headers.get('X-Frame-Options')).toBe('DENY');
		});
	});

	describe('Privacy Protection', () => {
		it('should prevent referrer leakage', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.get('Referrer-Policy')).toBe('no-referrer');
		});

		it('should prevent MIME type sniffing', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			expect(mockResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
		});

		it('should disable dangerous browser APIs', async () => {
			await handle({ event: mockEvent, resolve: mockResolve });

			const permissionsPolicy = mockResponse.headers.get('Permissions-Policy');
			expect(permissionsPolicy).toContain('geolocation=()');
			expect(permissionsPolicy).toContain('microphone=()');
			expect(permissionsPolicy).toContain('camera=()');
		});
	});
});