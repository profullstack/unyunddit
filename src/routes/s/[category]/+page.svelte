<script>
	/** @type {import('./$types').PageData} */
	export let data;
	
	function formatTimeAgo(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);
		
		if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	}
	
	function getDomain(url) {
		if (!url) return '';
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return '';
		}
	}
</script>

<svelte:head>
	<title>{data.category.name} - Unyunddit</title>
	<meta name="description" content="Posts in {data.category.name} category on Unyunddit" />
</svelte:head>

<main>
	<header class="header">
		<h1>🧅 <a href="/">Unyunddit</a></h1>
		<nav class="nav">
			<a href="/" class="nav-link">Home</a>
			<a href="/submit" class="nav-link">Submit Post</a>
			<a href="/new" class="nav-link">New</a>
		</nav>
	</header>

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
					<article class="post">
						<div class="post-votes">
							<div class="vote-score">{post.upvotes - post.downvotes}</div>
						</div>
						
						<div class="post-content">
							<h3 class="post-title">
								{#if post.url}
									<a href={post.url} target="_blank" rel="noopener noreferrer">
										{post.title}
									</a>
									<span class="domain">({getDomain(post.url)})</span>
								{:else}
									<a href="/post/{post.id}">{post.title}</a>
								{/if}
							</h3>
							
							{#if post.content}
								<div class="post-text">
									{post.content.length > 200 
										? post.content.substring(0, 200) + '...' 
										: post.content}
								</div>
							{/if}
							
							<div class="post-meta">
								<span class="time">{formatTimeAgo(post.created_at)}</span>
								<span class="separator">•</span>
								<a href="/post/{post.id}" class="comments-link">
									{post.comment_count} comments
								</a>
							</div>
						</div>
					</article>
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

	.nav {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-top: 20px;
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

	.submit-link {
		color: #ff6b35;
		text-decoration: none;
		font-weight: bold;
		padding: 10px 20px;
		border: 1px solid #ff6b35;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.submit-link:hover {
		background-color: #ff6b35;
		color: white;
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.post {
		display: flex;
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 15px;
		border: 1px solid #333;
		transition: border-color 0.2s;
	}

	.post:hover {
		border-color: #444;
	}

	.post-votes {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 15px;
		min-width: 40px;
	}

	.vote-score {
		font-weight: bold;
		color: #ff6b35;
		font-size: 1.1rem;
	}

	.post-content {
		flex: 1;
	}

	.post-title {
		margin: 0 0 10px;
		font-size: 1.2rem;
		line-height: 1.4;
	}

	.post-title a {
		color: #e0e0e0;
		text-decoration: none;
	}

	.post-title a:hover {
		color: #ff6b35;
	}

	.domain {
		color: #888;
		font-size: 0.9rem;
		font-weight: normal;
		margin-left: 5px;
	}

	.post-text {
		color: #ccc;
		margin-bottom: 10px;
		line-height: 1.5;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #888;
		font-size: 0.9rem;
	}

	.separator {
		color: #555;
	}

	.comments-link {
		color: #888;
		text-decoration: none;
	}

	.comments-link:hover {
		color: #ff6b35;
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

		.header h1 {
			font-size: 2rem;
		}

		.nav {
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		.post {
			flex-direction: column;
		}

		.post-votes {
			flex-direction: row;
			margin-right: 0;
			margin-bottom: 10px;
		}
	}
</style>