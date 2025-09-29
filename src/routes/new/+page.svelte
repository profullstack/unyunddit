<script>
	import PostCard from '$lib/components/PostCard.svelte';
	
	/** @type {import('./$types').PageData} */
	export let data;

	const { posts } = data;
</script>

<svelte:head>
	<title>New Posts - Unyunddit</title>
	<meta name="description" content="Latest anonymous posts on Unyunddit" />
</svelte:head>

<main>
	<header class="header">
		<h1>🧅 <a href="/">Unyunddit</a></h1>
		<p class="tagline">Anonymous Reddit Clone - Posts disappear after 72 hours</p>
		<nav class="nav">
			<a href="/" class="nav-link">Home</a>
			<a href="/submit" class="nav-link">Submit Post</a>
			<a href="/new" class="nav-link active">New</a>
		</nav>
	</header>

	<section class="content">
		{#if posts && posts.length > 0}
			<div class="posts">
				{#each posts as post}
					<PostCard {post} showVoting={true} votingAction="/" />
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<h2>No posts yet</h2>
				<p>Be the first to <a href="/submit">submit a post</a>!</p>
			</div>
		{/if}
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background-color: #1a1a1a;
		color: #e0e0e0;
		line-height: 1.6;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

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

	.posts {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #888;
	}

	.empty-state h2 {
		color: #ccc;
		margin-bottom: 10px;
	}

	.empty-state a {
		color: #ff6b35;
		text-decoration: none;
	}

	.empty-state a:hover {
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		main {
			padding: 10px;
		}

		.header h1 {
			font-size: 2rem;
		}

		.nav {
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		
	}
</style>