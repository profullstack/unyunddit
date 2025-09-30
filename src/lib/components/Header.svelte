<script>
	import NavBar from '$lib/components/NavBar.svelte';
	
	/** @type {string} */
	export let currentPage = '';
	
	/** @type {object|null} */
	export let user = null;
	
	/** @type {boolean} */
	export let isAuthenticated = false;
</script>

<header class="header">
	<h1>🧅 <a href="/">Unyunddit</a></h1>
	<p class="tagline">
		Anonymous Reddit Clone - Posts disappear after 72 hours
		{#if isAuthenticated}
			<br><small>✅ Logged in as <strong>{user?.username}</strong> - your posts persist forever!</small>
		{/if}
	</p>
    
	<NavBar {currentPage} username={user?.username} {isAuthenticated} />
</header>

<style>
	.header {
		text-align: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		box-sizing: border-box;
		padding-left: 20px;
		padding-right: 20px;
	}

	.header h1 {
		margin: 0;
		font-size: 2.5rem;
		color: #ff6b35;
	}

	.header h1 a {
		color: inherit;
		text-decoration: none;
	}

	.tagline {
		margin: 10px 0 20px;
		color: #888;
		font-size: 1.1rem;
	}
	@media (max-width: 600px) {
		.header {
			padding-left: 10px;
			padding-right: 10px;
		}
		
		.header h1 {
			font-size: 2rem;
		}
	}
</style>
