import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, locals, getClientAddress }) {
	// Get all headers
	const headers = {};
	for (const [key, value] of request.headers.entries()) {
		headers[key] = value;
	}

	// Get IP information
	const directIP = getClientAddress?.();
	const detectedIP = locals.ip;

	// Create response object
	const response = {
		timestamp: new Date().toISOString(),
		method: request.method,
		url: request.url,
		ip_detection: {
			direct_connection: directIP,
			detected_ip: detectedIP,
			from_locals: locals.ip
		},
		headers: headers,
		environment: {
			node_env: process.env.NODE_ENV,
			port: process.env.PORT,
			nginx_port: process.env.NGINX_PORT
		}
	};

	// Also log to console for server-side debugging
	console.log('🔍 [RAW-ENDPOINT] Request details:', {
		ip_detection: response.ip_detection,
		all_headers: response.headers
	});

	return json(response, {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	return GET(event);
}

/** @type {import('./$types').RequestHandler} */
export async function PUT(event) {
	return GET(event);
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH(event) {
	return GET(event);
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE(event) {
	return GET(event);
}