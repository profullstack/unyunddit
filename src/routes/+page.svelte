<script>
	import PostCard from '$lib/components/PostCard.svelte';
	
	/** @type {import('./$types').PageData} */
	export let data;

	const { posts, popularCategories } = data;
</script>

<svelte:head>
	<title>Unyunddit - Anonymous Reddit Clone</title>
	<meta name="description" content="Anonymous Reddit clone for the Tor network. Posts auto-delete after 72 hours." />
</svelte:head>

<main>
	<section class="content">
		<!-- Popular Categories Section -->
		{#if popularCategories && popularCategories.length > 0}
			<div class="categories-section">
				<h2>Popular Categories</h2>
				<div class="categories-grid">
					{#each popularCategories.slice(0, 12) as category}
						<a href="/s/{category.slug}" class="category-card">
							<span class="category-name">{category.name}</span>
							<span class="category-count">{category.actual_post_count || category.post_count || 0} posts</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Posts Section -->
		{#if posts && posts.length > 0}
			<div class="posts-section">
				<h2>Recent Posts</h2>
				<div class="posts">
					{#each posts as post}
						<PostCard {post} showVoting={true} />
					{/each}
				</div>
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

	.content {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.categories-section h2,
	.posts-section h2 {
		color: #ff6b35;
		margin: 0 0 20px;
		font-size: 1.5rem;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 15px;
		margin-bottom: 20px;
	}

	.category-card {
		display: flex;
		flex-direction: column;
		background-color: #2a2a2a;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 15px;
		text-decoration: none;
		color: #e0e0e0;
		transition: border-color 0.2s, background-color 0.2s;
	}

	.category-card:hover {
		border-color: #ff6b35;
		background-color: #333;
	}

	.category-name {
		font-weight: bold;
		margin-bottom: 5px;
		color: #ff6b35;
	}

	.category-count {
		font-size: 0.9rem;
		color: #888;
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

		.categories-grid {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
			gap: 10px;
		}

		.category-card {
			padding: 12px;
		}

		
	}
</style>
