import { json } from '@sveltejs/kit';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { fetch as undiciFetch } from 'undici';

/**
 * Fetch the title of a webpage through Tor
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	try {
		const { url } = await request.json();

		if (!url) {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		// Validate URL format
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Create Tor SOCKS proxy agent
		const torProxy = process.env.TOR_PROXY_URL || 'socks5h://127.0.0.1:9050';
		const agent = new SocksProxyAgent(torProxy);

		// Fetch the page through Tor using undici which supports agents
		const response = await undiciFetch(url, {
			dispatcher: agent,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0'
			},
			signal: AbortSignal.timeout(15000) // 15 second timeout
		});

		if (!response.ok) {
			return json(
				{ error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
				{ status: 502 }
			);
		}

		const html = await response.text();

		// Extract title using regex
		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : '';

		if (!title) {
			return json({ error: 'No title found on the page' }, { status: 404 });
		}

		// Decode HTML entities
		const decodedTitle = title
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&nbsp;/g, ' ');

		return json({ title: decodedTitle });
	} catch (error) {
		console.error('Error fetching title:', error);
		
		if (error instanceof Error && error.name === 'AbortError') {
			return json({ error: 'Request timeout - the page took too long to load' }, { status: 504 });
		}

		return json(
			{ error: 'Failed to fetch title. Please check the URL and try again.' },
			{ status: 500 }
		);
	}
}