import { createHash } from 'crypto';

/**
 * Generate a browser fingerprint from HTTP headers
 * This works for both clearnet and Tor users, providing unique identification
 * without relying on IP addresses
 * @param {Request} request - The HTTP request object
 * @returns {string} SHA256 hash of the browser fingerprint
 */
export function generateBrowserFingerprint(request) {
	const headers = request.headers;
	
	// Collect fingerprinting data from headers
	const fingerprintData = {
		userAgent: headers.get('user-agent') || '',
		acceptLanguage: headers.get('accept-language') || '',
		acceptEncoding: headers.get('accept-encoding') || '',
		accept: headers.get('accept') || '',
		secFetchDest: headers.get('sec-fetch-dest') || '',
		secFetchMode: headers.get('sec-fetch-mode') || '',
		secFetchSite: headers.get('sec-fetch-site') || '',
		secFetchUser: headers.get('sec-fetch-user') || '',
		secGpc: headers.get('sec-gpc') || '',
		dnt: headers.get('dnt') || '',
		upgradeInsecureRequests: headers.get('upgrade-insecure-requests') || '',
		te: headers.get('te') || '',
		priority: headers.get('priority') || ''
	};
	
	// Create a stable fingerprint string
	const fingerprintString = Object.entries(fingerprintData)
		.sort(([a], [b]) => a.localeCompare(b)) // Sort for consistency
		.map(([key, value]) => `${key}:${value}`)
		.join('|');
	
	// Generate SHA256 hash
	const fingerprint = createHash('sha256')
		.update(fingerprintString)
		.digest('hex');
	
	// Debug logging
	console.log(`🔍 [FINGERPRINT-DEBUG] Generated fingerprint: ${fingerprint.substring(0, 8)}...`);
	console.log(`🔍 [FINGERPRINT-DEBUG] Based on:`, {
		userAgent: fingerprintData.userAgent.substring(0, 50) + '...',
		acceptLanguage: fingerprintData.acceptLanguage,
		acceptEncoding: fingerprintData.acceptEncoding.substring(0, 30) + '...',
		secHeaders: {
			dest: fingerprintData.secFetchDest,
			mode: fingerprintData.secFetchMode,
			site: fingerprintData.secFetchSite,
			user: fingerprintData.secFetchUser
		}
	});
	
	return fingerprint;
}

/**
 * Add browser fingerprint to event.locals for use throughout the application
 * @param {import('@sveltejs/kit').RequestEvent} event - The SvelteKit event object
 */
export function addFingerprintToLocals(event) {
	const fingerprint = generateBrowserFingerprint(event.request);
	event.locals.fingerprint = fingerprint;
	
	console.log(`🔍 [FINGERPRINT] Set fingerprint in locals: ${fingerprint.substring(0, 8)}...`);
}

/**
 * Get browser fingerprint from event.locals
 * @param {Object} locals - The event.locals object
 * @returns {string} The browser fingerprint hash
 */
export function getFingerprint(locals) {
	return locals.fingerprint || '';
}