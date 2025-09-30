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
		{#if isAuthenticated && username}
			<span class="user-info">👤 {username}</span>
			<form method="POST" action="/logout" class="logout-form">
				<button type="submit" class="logout-button">Logout</button>
			</form>
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
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		position: relative;
	}

	.nav-left {
		display: flex;
		gap: 20px;
	}

	.nav-right {
		display: flex;
		align-items: center;
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

	.auth-link {
		background-color: #ff6b35;
		color: white !important;
	}

	.auth-link:hover {
		background-color: #e55a2b;
	}

	.user-info {
		color: #ccc;
		padding: 8px 16px;
		border-radius: 4px;
		background-color: #333;
		margin-right: 10px;
	}

	.logout-form {
		display: inline;
	}

	.logout-button {
		background: #ff6b35;
		border: none;
		color: white;
		padding: 8px 16px;
		cursor: pointer;
		transition: background-color 0.2s;
		border-radius: 4px;
		font-size: inherit;
	}

	.logout-button:hover {
		background-color: #e55a2b;
	}

	@media (max-width: 768px) {
		.nav {
			flex-direction: column;
			align-items: center;
			gap: 15px;
		}

		.nav-left {
			gap: 15px;
		}

		.nav-right {
			margin-top: 10px;
		}

		.user-info {
			margin-right: 5px;
			margin-bottom: 5px;
		}
	}

	@media (max-width: 600px) {
		.nav-left {
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		.nav {
			gap: 10px;
		}
	}
</style>
