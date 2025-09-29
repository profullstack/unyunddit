<script>
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
		<p class="tagline">Anonymous Reddit Clone - Posts disappear after 36 hours</p>
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
					<article class="post">
						<div class="post-votes">
							<form method="POST" action="/?/upvote" class="vote-form">
								<input type="hidden" name="postId" value={post.id} />
								<button type="submit" class="vote-btn upvote" title="Upvote">▲</button>
							</form>
							<span class="score">{post.upvotes - post.downvotes}</span>
							<form method="POST" action="/?/downvote" class="vote-form">
								<input type="hidden" name="postId" value={post.id} />
								<button type="submit" class="vote-btn downvote" title="Downvote">▼</button>
							</form>
						</div>
						
						<div class="post-content">
							<h2 class="post-title">
								{#if post.url}
									<a href={post.url} target="_blank" rel="noopener noreferrer" class="external-link">
										{post.title}
									</a>
									<span class="domain">({new URL(post.url).hostname})</span>
								{:else}
									<a href="/post/{post.id}" class="post-link">{post.title}</a>
								{/if}
							</h2>
							
							{#if post.content}
								<div class="post-text">
									{post.content}
								</div>
							{/if}
							
							<div class="post-meta">
								<span class="time">
									{new Date(post.created_at).toLocaleString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</span>
								<a href="/post/{post.id}" class="comments-link">
									{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
								</a>
								<span class="expires">
									Expires: {new Date(post.expires_at).toLocaleString('en-US', {
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</span>
							</div>
						</div>
					</article>
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

	.post {
		display: flex;
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 15px;
		border: 1px solid #333;
	}

	.post-votes {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 15px;
		min-width: 40px;
	}

	.vote-form {
		margin: 0;
	}

	.vote-btn {
		background: none;
		border: none;
		color: #888;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 2px;
		transition: color 0.2s;
	}

	.vote-btn:hover {
		background-color: #333;
	}

	.upvote:hover {
		color: #ff6b35;
	}

	.downvote:hover {
		color: #6b9eff;
	}

	.score {
		font-weight: bold;
		margin: 4px 0;
		color: #ccc;
	}

	.post-content {
		flex: 1;
	}

	.post-title {
		margin: 0 0 10px;
		font-size: 1.3rem;
		line-height: 1.3;
	}

	.post-link,
	.external-link {
		color: #e0e0e0;
		text-decoration: none;
	}

	.post-link:hover,
	.external-link:hover {
		color: #ff6b35;
	}

	.domain {
		color: #888;
		font-size: 0.9rem;
		margin-left: 8px;
	}

	.post-text {
		margin: 10px 0;
		color: #ccc;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.post-meta {
		display: flex;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
		margin-top: 10px;
	}

	.comments-link {
		color: #888;
		text-decoration: none;
	}

	.comments-link:hover {
		color: #ff6b35;
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

		.post {
			padding: 10px;
		}

		.post-meta {
			flex-direction: column;
			gap: 5px;
		}
	}
</style>