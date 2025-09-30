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
	<section class="content">
		{#if posts && posts.length > 0}
			<div class="posts">
				{#each posts as post}
					<PostCard {post} showVoting={true} />
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
	}
</style>