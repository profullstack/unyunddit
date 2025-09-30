<script>
	import PostCard from '$lib/components/PostCard.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Popular Posts - Unyunddit</title>
	<meta name="description" content="Most popular posts ranked by votes on Unyunddit" />
</svelte:head>

<div class="container">
	<header class="page-header">
		<h1>🔥 Popular Posts</h1>
		<p class="subtitle">Highest ranked posts by community votes</p>
	</header>

	<main class="posts-container">
		{#if data.posts && data.posts.length > 0}
			{#each data.posts as post (post.id)}
				<PostCard {post} showVoting={true} linkToExternal={false} />
			{/each}
		{:else}
			<div class="empty-state">
				<h2>No posts yet</h2>
				<p>Be the first to submit a post!</p>
				<a href="/submit" class="submit-link">Submit a Post</a>
			</div>
		{/if}
	</main>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 1px solid #333;
	}

	.page-header h1 {
		color: #ff6b35;
		margin: 0 0 10px;
		font-size: 2.5rem;
	}

	.subtitle {
		color: #888;
		margin: 0;
		font-size: 1.1rem;
	}

	.posts-container {
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

	.empty-state p {
		margin-bottom: 20px;
	}

	.submit-link {
		display: inline-block;
		background-color: #ff6b35;
		color: white;
		padding: 12px 24px;
		text-decoration: none;
		border-radius: 6px;
		font-weight: bold;
		transition: background-color 0.2s;
	}

	.submit-link:hover {
		background-color: #e55a2b;
	}

	@media (max-width: 600px) {
		.container {
			padding: 15px;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.posts-container {
			gap: 10px;
		}
	}
</style>