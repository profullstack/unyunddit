<script>
	/** @type {string} */
	export let currentPage = '';
</script>

<nav class="nav">
	<a href="/" class="nav-link" class:active={currentPage === 'home'}>Home</a>
	<a href="/submit" class="nav-link" class:active={currentPage === 'submit'}>Submit Post</a>
	<a href="/new" class="nav-link" class:active={currentPage === 'new'}>New</a>
	<a href="/popular" class="nav-link" class:active={currentPage === 'popular'}>Popular</a>
</nav>

<style>
	.nav {
		display: flex;
		justify-content: center;
		gap: 20px;
	}

	.nav-link {
		color: #ccc;
		text-decoration: none;
		padding: 8px 16px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.nav-link:hover {
		background-color: #333;
	}

	.nav-link.active {
		background-color: #ff6b35;
		color: white;
	}

	@media (max-width: 600px) {
		.nav {
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}
	}
</style>
