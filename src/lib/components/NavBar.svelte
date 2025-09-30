<script>
	/** @type {string} */
	export let currentPage = '';
	
	/** @type {string|null} */
	export let username = null;
	
	/** @type {boolean} */
	export let isAuthenticated = false;
</script>

<nav class="nav">
	<div class="nav-left">
		<a href="/" class="nav-link" class:active={currentPage === 'home'}>Home</a>
		<a href="/submit" class="nav-link" class:active={currentPage === 'submit'}>Submit Post</a>
		<a href="/new" class="nav-link" class:active={currentPage === 'new'}>New</a>
		<a href="/popular" class="nav-link" class:active={currentPage === 'popular'}>Popular</a>
	</div>
	
	<div class="nav-right">
		<!-- Debug info (remove in production) -->
		<!-- Auth: {isAuthenticated}, User: {username} -->
		
		{#if isAuthenticated}
			<a href="/settings" class="nav-link settings-link" class:active={currentPage === 'settings'}>
				Settings ({username})
			</a>
		{:else}
			<a href="/auth" class="nav-link auth-link" class:active={currentPage === 'auth'}>
				Login / Register
			</a>
		{/if}
	</div>
</nav>

<style>
	.nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 15px;
		position: relative;
		flex-wrap: wrap;
	}

	.nav-left {
		display: flex;
		gap: 15px;
		flex-wrap: wrap;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.nav-link {
		color: #ccc;
		text-decoration: none;
		padding: 8px 16px;
		border-radius: 4px;
		transition: background-color 0.2s;
		white-space: nowrap;
	}

	.nav-link:hover {
		background-color: #333;
	}

	.nav-link.active {
		background-color: #ff6b35;
		color: white;
	}

	.auth-link,
	.settings-link {
		background-color: #ff6b35;
		color: white !important;
	}

	.auth-link:hover,
	.settings-link:hover {
		background-color: #e55a2b;
	}

	@media (max-width: 768px) {
		.nav {
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		.nav-left {
			gap: 10px;
		}

		.nav-right {
			gap: 8px;
		}

		/* No additional mobile styles needed for simplified layout */
	}

	@media (max-width: 600px) {
		.nav-left {
			flex-direction: column;
			align-items: center;
			gap: 8px;
		}

		.nav {
			gap: 8px;
		}

		.nav-link {
			padding: 6px 12px;
			font-size: 0.9rem;
		}
	}
</style>
