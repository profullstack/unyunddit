<svelte:head>
	<title>Onion SSR Boilerplate</title>
	<meta name="description" content="A privacy-focused SvelteKit boilerplate for .onion websites with SSR-only mode and Supabase integration" />
</svelte:head>

<main>
	<header class="hero">
		<h1>🧅 Onion SSR Boilerplate</h1>
		<p class="tagline">Privacy-focused SvelteKit starter for .onion websites</p>
	</header>

	<section class="features">
		<h2>Features</h2>
		<div class="feature-grid">
			<div class="feature-card">
				<h3>🔒 SSR-Only Mode</h3>
				<p>100% server-side rendered with no client-side JavaScript. Perfect for Tor users who disable JS by default.</p>
			</div>
			
			<div class="feature-card">
				<h3>🗄️ Supabase Integration</h3>
				<p>Database-backed applications using Supabase's REST API directly from server-side code.</p>
			</div>
			
			<div class="feature-card">
				<h3>🛡️ Security Headers</h3>
				<p>Strict Content Security Policy and privacy headers configured for maximum security.</p>
			</div>
			
			<div class="feature-card">
				<h3>📝 Form Handling</h3>
				<p>Classic HTML form interactions with server-side validation and database persistence.</p>
			</div>
			
			<div class="feature-card">
				<h3>🐳 Docker Ready</h3>
				<p>Containerized deployment configuration for easy Tor hidden service hosting.</p>
			</div>
			
			<div class="feature-card">
				<h3>⚡ Node.js Adapter</h3>
				<p>Built with adapter-node for standalone server deployment behind Tor.</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Live Demo</h2>
		<p>Try out the example guestbook to see SSR-only form handling in action:</p>
		<a href="/guestbook" class="demo-button">📖 Visit Guestbook</a>
	</section>

	<section class="tech-stack">
		<h2>Technology Stack</h2>
		<ul class="tech-list">
			<li><strong>Frontend:</strong> SvelteKit (SSR-only, no hydration)</li>
			<li><strong>Backend:</strong> SvelteKit server-side modules</li>
			<li><strong>Database:</strong> Supabase (PostgreSQL + REST API)</li>
			<li><strong>Deployment:</strong> Node.js server behind Tor hidden service</li>
			<li><strong>Security:</strong> Strict CSP, no external dependencies</li>
		</ul>
	</section>

	<section class="getting-started">
		<h2>Getting Started</h2>
		<div class="steps">
			<div class="step">
				<h3>1. Clone & Install</h3>
				<code>git clone [repo-url]<br>cd onion-ssr-boilerplate<br>pnpm install</code>
			</div>
			
			<div class="step">
				<h3>2. Configure Supabase</h3>
				<code>cp .env.example .env<br># Add your Supabase credentials</code>
			</div>
			
			<div class="step">
				<h3>3. Run Development</h3>
				<code>pnpm run dev</code>
			</div>
			
			<div class="step">
				<h3>4. Deploy to .onion</h3>
				<code>pnpm run build<br>node build</code>
			</div>
		</div>
	</section>

	<footer class="footer">
		<p>Built for privacy-conscious developers creating .onion websites</p>
		<p>No tracking • No analytics • No external CDNs</p>
	</footer>
</main>

<style>
	/* Clean, professional styling with no external dependencies */
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		color: #333;
	}

	.hero {
		text-align: center;
		padding: 3rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.25rem;
		opacity: 0.9;
		margin: 0;
	}

	h2 {
		color: #2c3e50;
		font-size: 2rem;
		margin: 3rem 0 1.5rem 0;
		text-align: center;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #e1e8ed;
	}

	.feature-card h3 {
		color: #34495e;
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.feature-card p {
		color: #666;
		margin: 0;
	}

	.demo {
		text-align: center;
		padding: 3rem 0;
		background-color: #f8f9fa;
		border-radius: 8px;
		margin: 3rem 0;
	}

	.demo-button {
		display: inline-block;
		background-color: #3498db;
		color: white;
		padding: 1rem 2rem;
		text-decoration: none;
		border-radius: 6px;
		font-weight: bold;
		font-size: 1.1rem;
		margin-top: 1rem;
		transition: background-color 0.2s;
	}

	.demo-button:hover {
		background-color: #2980b9;
	}

	.tech-stack {
		background-color: #2c3e50;
		color: white;
		padding: 3rem;
		border-radius: 8px;
		margin: 3rem 0;
	}

	.tech-stack h2 {
		color: white;
	}

	.tech-list {
		list-style: none;
		padding: 0;
		max-width: 600px;
		margin: 0 auto;
	}

	.tech-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid #34495e;
	}

	.tech-list li:last-child {
		border-bottom: none;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.step {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #3498db;
	}

	.step h3 {
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	.step code {
		background-color: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		display: block;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9rem;
		line-height: 1.4;
		color: #2c3e50;
		border: 1px solid #e1e8ed;
	}

	.footer {
		text-align: center;
		padding: 3rem 0;
		color: #666;
		border-top: 1px solid #e1e8ed;
		margin-top: 4rem;
	}

	.footer p {
		margin: 0.5rem 0;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2rem;
		}
		
		.tagline {
			font-size: 1rem;
		}
		
		.feature-grid {
			grid-template-columns: 1fr;
		}
		
		.steps {
			grid-template-columns: 1fr;
		}
		
		main {
			padding: 1rem 0.5rem;
		}
	}
</style>
