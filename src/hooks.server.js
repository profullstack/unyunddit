// Security-focused server hooks for .onion websites
// Implements strict CSP and privacy headers

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Log incoming requests for Tor debugging
	const startTime = Date.now();
	const clientIP = event.getClientAddress();
	const userAgent = event.request.headers.get('user-agent') || 'Unknown';
	const method = event.request.method;
	const url = event.url.pathname + event.url.search;
	
	console.log(`🌐 [HTTP-REQUEST] ${method} ${url} - IP: ${clientIP} - UA: ${userAgent.substring(0, 50)}`);
	
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