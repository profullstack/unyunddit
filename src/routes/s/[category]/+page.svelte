<script>
	import PostCard from '$lib/components/PostCard.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>{data.category.name} - Unyunddit</title>
	<meta name="description" content="Posts in {data.category.name} category on Unyunddit" />
</svelte:head>

<main>
	<section class="content">
		<div class="category-header">
			<h2>s/{data.category.slug}</h2>
			<p class="category-info">
				<strong>{data.category.name}</strong>
				{#if data.category.description}
					- {data.category.description}
				{/if}
			</p>
			<p class="post-count">{data.category.post_count} posts</p>
		</div>

		{#if data.posts.length === 0}
			<div class="no-posts">
				<p>No posts found in this category yet.</p>
				<a href="/submit" class="submit-link">Be the first to post!</a>
			</div>
		{:else}
			<div class="posts">
				{#each data.posts as post}
					<PostCard {post} showVoting={true} votingAction="/" />
				{/each}
			</div>

			{#if data.hasMore}
				<div class="pagination">
					<a href="/s/{data.category.slug}?page={data.currentPage + 1}" class="next-page">
						Load More Posts
					</a>
				</div>
			{/if}
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
	.category-header {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
		border: 1px solid #333;
	}

	.category-header h2 {
		margin: 0 0 10px;
		color: #ff6b35;
		font-size: 1.8rem;
	}

	.category-info {
		color: #ccc;
		margin: 0 0 10px;
	}

	.post-count {
		color: #888;
		margin: 0;
		font-size: 0.9rem;
	}

	.no-posts {
		text-align: center;
		padding: 40px 20px;
		background-color: #2a2a2a;
		border-radius: 8px;
		border: 1px solid #333;
	}

	.no-posts p {
		color: #888;
		margin-bottom: 20px;
	}

	.pagination {
		text-align: center;
		margin-top: 30px;
	}

	.next-page {
		color: #ff6b35;
		text-decoration: none;
		padding: 12px 24px;
		border: 1px solid #ff6b35;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.next-page:hover {
		background-color: #ff6b35;
		color: white;
	}

	@media (max-width: 600px) {
		main {
			padding: 10px;
		}
	}
</style>
