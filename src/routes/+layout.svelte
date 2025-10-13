<script>
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app" data-theme={data.theme}>
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
	:global(html, body) {
		margin: 0;
		line-height: 1.6;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.app[data-theme='dark'] {
		background-color: #1a1a1a;
		color: #e0e0e0;
	}

	.app[data-theme='light'] {
		background-color: #e0e0e0;
		color: #1a1a1a;
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
