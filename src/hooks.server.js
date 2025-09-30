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
	
	// Debug logging for development
	console.log(`🔍 [IP-DEBUG] Direct connection: ${direct}`);
	
	if (direct && direct !== '127.0.0.1' && direct !== '::1') {
		console.log(`✅ [IP-DEBUG] Using direct connection: ${direct}`);
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

	// Debug all headers
	const allHeaders = { xff, real, cf, ak, fly, xClient };
	const presentHeaders = Object.fromEntries(Object.entries(allHeaders).filter(([k, v]) => v));
	if (Object.keys(presentHeaders).length > 0) {
		console.log(`🔍 [IP-DEBUG] Found proxy headers:`, presentHeaders);
	} else {
		console.log(`🔍 [IP-DEBUG] No proxy headers found`);
	}

	// Check single-value headers first (more reliable)
	if (real) {
		console.log(`✅ [IP-DEBUG] Using x-real-ip: ${real}`);
		return real;
	}
	if (cf) {
		console.log(`✅ [IP-DEBUG] Using cf-connecting-ip: ${cf}`);
		return cf;
	}
	if (ak) {
		console.log(`✅ [IP-DEBUG] Using true-client-ip: ${ak}`);
		return ak;
	}
	if (fly) {
		console.log(`✅ [IP-DEBUG] Using fly-client-ip: ${fly}`);
		return fly;
	}
	if (xClient) {
		console.log(`✅ [IP-DEBUG] Using x-client-ip: ${xClient}`);
		return xClient;
	}

	// Handle x-forwarded-for (can contain multiple IPs)
	if (xff) {
		const firstIP = xff.split(',')[0]?.trim();
		if (firstIP) {
			console.log(`✅ [IP-DEBUG] Using x-forwarded-for first IP: ${firstIP}`);
			return firstIP;
		}
	}

	// Development fallback: Create a unique IP based on User-Agent + other headers
	// This allows testing different "users" in development
	if (direct === '127.0.0.1' || direct === '::1') {
		const userAgent = headers.get('user-agent') || '';
		const acceptLanguage = headers.get('accept-language') || '';
		const acceptEncoding = headers.get('accept-encoding') || '';
		
		// Create a simple hash from browser fingerprint for development
		const fingerprint = userAgent + acceptLanguage + acceptEncoding;
		const hash = fingerprint.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0);
		
		// Convert to a fake IP in the 192.168.x.x range for development
		const fakeIP = `192.168.${Math.abs(hash) % 255}.${Math.abs(hash >> 8) % 255}`;
		console.log(`🧪 [IP-DEBUG] Development mode: Generated fake IP ${fakeIP} from browser fingerprint`);
		return fakeIP;
	}

	// Fallback to direct connection
	console.log(`⚠️ [IP-DEBUG] Falling back to direct connection: ${direct ?? 'unknown'}`);
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