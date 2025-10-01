<script>
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<Header
		currentPage={data?.currentPage || ''}
		user={data?.user}
		isAuthenticated={data?.isAuthenticated || false}
	/>
	
	<main class="main-content">
		{@render children?.()}
	</main>
	
	<Footer />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background-color: #1a1a1a;
		color: #e0e0e0;
		line-height: 1.6;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		width: 100%;
		box-sizing: border-box;
	}

	@media (max-width: 600px) {
		.main-content {
			padding: 10px;
		}
	}
</style>
