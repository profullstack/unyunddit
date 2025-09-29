<script>
	import NavBar from '$lib/components/NavBar.svelte';
	/** @type {string} */
	export let currentPage = '';
</script>

<header class="header">
	<h1>🧅 <a href="/">Unyunddit</a></h1>
	<p class="tagline">Anonymous Reddit Clone - Posts disappear after 72 hours</p>
    
	<NavBar {currentPage} />
</header>

<style>
	.header {
		text-align: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
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
		.header h1 {
			font-size: 2rem;
		}
	}
</style>
