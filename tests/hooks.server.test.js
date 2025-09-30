import { describe, it, expect } from 'vitest';

// Mock the getClientIP function from hooks.server.js
function getClientIP(event) {
	// 1) Try direct connection first (no proxy)
	const direct = event.getClientAddress?.();
	if (direct && direct !== '127.0.0.1' && direct !== '::1') {
		return direct;
	}

	// 2) Check common proxy/CDN headers in order of preference
	const headers = event.request.headers;
	const xff = headers.get('x-forwarded-for');           // "client, proxy1, proxy2"
	const real = headers.get('x-real-ip');
	const cf = headers.get('cf-connecting-ip');           // Cloudflare
	const ak = headers.get('true-client-ip');             // Akamai
	const fly = headers.get('fly-client-ip');             // Fly.io
	const xClient = headers.get('x-client-ip');           // Generic proxy

	// Check single-value headers first (more reliable)
	if (real) return real;
	if (cf) return cf;
	if (ak) return ak;
	if (fly) return fly;
	if (xClient) return xClient;

	// Handle x-forwarded-for (can contain multiple IPs)
	if (xff) {
		const firstIP = xff.split(',')[0]?.trim();
		if (firstIP) return firstIP;
	}

	// Fallback to direct connection (even if localhost)
	return direct ?? '';
}

// Helper function to create mock event
function createMockEvent(headers = {}, directIP = null) {
	const mockHeaders = new Map(Object.entries(headers));
	
	return {
		request: {
			headers: {
				get: (key) => mockHeaders.get(key) || null
			}
		},
		getClientAddress: () => directIP,
		locals: {}
	};
}

describe('getClientIP function', () => {
	describe('direct connection (no proxy)', () => {
		it('should return direct IP when available and not localhost', () => {
			const event = createMockEvent({}, '192.168.1.100');
			const result = getClientIP(event);
			expect(result).toBe('192.168.1.100');
		});

		it('should not return 127.0.0.1 as direct IP', () => {
			const event = createMockEvent({
				'x-real-ip': '203.0.113.1'
			}, '127.0.0.1');
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});

		it('should not return ::1 (IPv6 localhost) as direct IP', () => {
			const event = createMockEvent({
				'x-real-ip': '203.0.113.1'
			}, '::1');
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});
	});

	describe('proxy headers priority', () => {
		it('should prioritize x-real-ip over other headers', () => {
			const event = createMockEvent({
				'x-real-ip': '203.0.113.1',
				'cf-connecting-ip': '203.0.113.2',
				'x-forwarded-for': '203.0.113.3, 10.0.0.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});

		it('should use cf-connecting-ip when x-real-ip is not available', () => {
			const event = createMockEvent({
				'cf-connecting-ip': '203.0.113.2',
				'true-client-ip': '203.0.113.3',
				'x-forwarded-for': '203.0.113.4, 10.0.0.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.2');
		});

		it('should use true-client-ip (Akamai) when higher priority headers are not available', () => {
			const event = createMockEvent({
				'true-client-ip': '203.0.113.3',
				'fly-client-ip': '203.0.113.4',
				'x-forwarded-for': '203.0.113.5, 10.0.0.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.3');
		});

		it('should use fly-client-ip when higher priority headers are not available', () => {
			const event = createMockEvent({
				'fly-client-ip': '203.0.113.4',
				'x-client-ip': '203.0.113.5',
				'x-forwarded-for': '203.0.113.6, 10.0.0.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.4');
		});

		it('should use x-client-ip when higher priority headers are not available', () => {
			const event = createMockEvent({
				'x-client-ip': '203.0.113.5',
				'x-forwarded-for': '203.0.113.6, 10.0.0.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.5');
		});
	});

	describe('x-forwarded-for header handling', () => {
		it('should extract first IP from x-forwarded-for when single-value headers are not available', () => {
			const event = createMockEvent({
				'x-forwarded-for': '203.0.113.1, 10.0.0.1, 192.168.1.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});

		it('should handle x-forwarded-for with spaces correctly', () => {
			const event = createMockEvent({
				'x-forwarded-for': '  203.0.113.1  , 10.0.0.1 ,192.168.1.1  '
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});

		it('should handle single IP in x-forwarded-for', () => {
			const event = createMockEvent({
				'x-forwarded-for': '203.0.113.1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.1');
		});

		it('should handle empty x-forwarded-for gracefully', () => {
			const event = createMockEvent({
				'x-forwarded-for': ''
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('127.0.0.1');
		});
	});

	describe('fallback scenarios', () => {
		it('should fallback to direct connection when no proxy headers are available', () => {
			const event = createMockEvent({}, '127.0.0.1');
			const result = getClientIP(event);
			expect(result).toBe('127.0.0.1');
		});

		it('should return empty string when no IP is available', () => {
			const event = createMockEvent({}, null);
			const result = getClientIP(event);
			expect(result).toBe('');
		});

		it('should handle missing getClientAddress function', () => {
			const event = {
				request: {
					headers: {
						get: () => null
					}
				},
				getClientAddress: undefined,
				locals: {}
			};
			
			const result = getClientIP(event);
			expect(result).toBe('');
		});
	});

	describe('cloud provider specific headers', () => {
		it('should handle Cloudflare cf-connecting-ip header', () => {
			const event = createMockEvent({
				'cf-connecting-ip': '203.0.113.100'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.100');
		});

		it('should handle Akamai true-client-ip header', () => {
			const event = createMockEvent({
				'true-client-ip': '203.0.113.200'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.200');
		});

		it('should handle Fly.io fly-client-ip header', () => {
			const event = createMockEvent({
				'fly-client-ip': '203.0.113.300'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('203.0.113.300');
		});
	});

	describe('edge cases', () => {
		it('should handle IPv6 addresses', () => {
			const event = createMockEvent({
				'x-real-ip': '2001:db8::1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('2001:db8::1');
		});

		it('should handle mixed IPv4 and IPv6 in x-forwarded-for', () => {
			const event = createMockEvent({
				'x-forwarded-for': '2001:db8::1, 192.168.1.1, ::1'
			}, '127.0.0.1');
			
			const result = getClientIP(event);
			expect(result).toBe('2001:db8::1');
		});

		it('should handle malformed x-forwarded-for gracefully', () => {
			const event = createMockEvent({
				'x-forwarded-for': ',,,,'
			}, '192.168.1.1');
			
			const result = getClientIP(event);
			expect(result).toBe('192.168.1.1');
		});
	});
});