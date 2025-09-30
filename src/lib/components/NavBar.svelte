<script>
	import { enhance } from '$app/forms';

	/** @type {string} */
	export let currentPage = '';
	
	/** @type {string|null} */
	export let username = null;
	
	/** @type {boolean} */
	export let isAuthenticated = false;

	let showUserMenu = false;

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}
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
			<div class="user-menu" class:open={showUserMenu}>
				<button class="user-button" on:click={toggleUserMenu}>
					👤 {username}
					<span class="dropdown-arrow">▼</span>
				</button>
				
				{#if showUserMenu}
					<div class="user-dropdown">
						<form method="POST" action="/logout" use:enhance on:submit={closeUserMenu}>
							<button type="submit" class="logout-button">Logout</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/auth" class="nav-link auth-link" class:active={currentPage === 'auth'}>
				Login / Register
			</a>
		{/if}
	</div>
</nav>

<!-- Click outside to close user menu -->
{#if showUserMenu}
	<div class="overlay" on:click={closeUserMenu} on:keydown={closeUserMenu}></div>
{/if}

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
		background-color: #007bff;
		color: white !important;
	}

	.auth-link:hover {
		background-color: #0056b3;
	}

	.user-menu {
		position: relative;
	}

	.user-button {
		background: none;
		border: none;
		color: #ccc;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: inherit;
	}

	.user-button:hover {
		background-color: #333;
	}

	.dropdown-arrow {
		font-size: 0.8em;
		transition: transform 0.2s;
	}

	.user-menu.open .dropdown-arrow {
		transform: rotate(180deg);
	}

	.user-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		background-color: #333;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		min-width: 120px;
		margin-top: 4px;
	}

	.logout-button {
		width: 100%;
		background: none;
		border: none;
		color: #ccc;
		padding: 12px 16px;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
		border-radius: 4px;
	}

	.logout-button:hover {
		background-color: #444;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background: transparent;
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

		.user-dropdown {
			right: auto;
			left: 50%;
			transform: translateX(-50%);
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
