import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-node for deployment behind Tor hidden services
		// Outputs a standalone Node.js server
		adapter: adapter({
			// Output directory for the built application
			out: 'build',
			// Precompress files with gzip and brotli
			precompress: false,
			// Environment variable prefix
			envPrefix: ''
		})
	}
};

export default config;
