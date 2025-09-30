// Security-focused server hooks for .onion websites
// Implements strict CSP and privacy headers

/**
 * Get the real client IP address following SvelteKit 5 best practices
 * @param {import('@sveltejs/kit').RequestEvent} event - The SvelteKit event object
 * @returns {string} The client IP address
 */
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

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Log incoming requests for Tor debugging
	const startTime = Date.now();
	
	// Get real client IP using SvelteKit 5 best practices
	const clientIP = getClientIP(event);
	
	// Make IP available to routes via event.locals
	event.locals.ip = clientIP;
	
	const userAgent = event.request.headers.get('user-agent') || 'Unknown';
	const method = event.request.method;
	const url = event.url.pathname + event.url.search;
	
	// Log proxy headers for debugging in production
	const proxyHeaders = {
		'x-forwarded-for': event.request.headers.get('x-forwarded-for'),
		'x-real-ip': event.request.headers.get('x-real-ip'),
		'cf-connecting-ip': event.request.headers.get('cf-connecting-ip'),
		'true-client-ip': event.request.headers.get('true-client-ip'),
		'fly-client-ip': event.request.headers.get('fly-client-ip'),
		'x-client-ip': event.request.headers.get('x-client-ip')
	};
	const activeHeaders = Object.fromEntries(Object.entries(proxyHeaders).filter(([k, v]) => v));
	
	console.log(`🌐 [HTTP-REQUEST] ${method} ${url} - IP: ${clientIP} - UA: ${userAgent.substring(0, 50)}`);
	if (Object.keys(activeHeaders).length > 0) {
		console.log(`📡 [PROXY-HEADERS]`, activeHeaders);
	}
	
	// Resolve the request
	const response = await resolve(event);
	
	// Log response
	const duration = Date.now() - startTime;
	const statusEmoji = response.status >= 400 ? '❌' : response.status >= 300 ? '⚠️' : '✅';
	console.log(`${statusEmoji} [HTTP-RESPONSE] ${method} ${url} - ${response.status} - ${duration}ms`);

	// Set strict security headers for .onion websites
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'none'",           // Block all by default
			"style-src 'self' 'unsafe-inline'", // Allow self-hosted styles and inline styles
			"img-src 'self' data:",         // Allow self-hosted images and data URIs
			"form-action 'self'",           // Only allow forms to submit to same origin
			"base-uri 'self'",              // Restrict base URI
			"frame-ancestors 'none'",       // Prevent embedding in frames
			"object-src 'none'",            // Block plugins
			"script-src 'none'"             // Block all JavaScript (SSR-only)
		].join('; ')
	);

	// Additional privacy and security headers
	response.headers.set('Referrer-Policy', 'no-referrer');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	
	// Remove server identification headers
	response.headers.delete('Server');
	response.headers.delete('X-Powered-By');

	return response;
}