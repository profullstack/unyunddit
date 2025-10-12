<footer class="footer">
	<div class="footer-content">
		<form method="POST">
			<button formaction="/?/setTheme&theme=dark">Dark</button>
			<button formaction="/?/setTheme&theme=light">Light</button>
		</form>

		<p class="footer-text">🧅 Unyunddit - Anonymous posting on the Tor network</p>
		<p class="footer-links">
			<a href="/" class="footer-link">Home</a>
			<span class="separator">•</span>
			<a href="/submit" class="footer-link">Submit</a>
			<span class="separator">•</span>
			<a href="/new" class="footer-link">New Posts</a>
		</p>
		<p class="footer-disclaimer">
			Posts automatically delete after 72 hours. No registration required.
		</p>
	</div>
</footer>

<style>
	button {
		cursor: pointer;
		background-color: #ff6b35;
		border: none;
		font-weight: bold;
		padding: 5px 10px;
		outline: none;
		color: white;
	}

	.footer {
		margin-top: 50px;
		padding: 30px 20px;
		border-top: 1px solid #333;
		background-color: #1a1a1a;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.footer-text {
		color: #ff6b35;
		font-weight: bold;
		margin: 0 0 15px;
		font-size: 1.1rem;
	}

	.footer-links {
		margin: 0 0 15px;
		color: #888;
	}

	.footer-link {
		color: #ccc;
		text-decoration: none;
		transition: color 0.2s;
	}

	.footer-link:hover {
		color: #ff6b35;
	}

	.separator {
		margin: 0 10px;
		color: #555;
	}

	.footer-disclaimer {
		color: #666;
		font-size: 0.9rem;
		margin: 0;
	}

	@media (max-width: 600px) {
		.footer {
			padding: 20px 10px;
		}

		.footer-links {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.separator {
			display: none;
		}
	}
</style>
