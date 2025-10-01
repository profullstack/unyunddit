<script>
	let { data } = $props();
	const { comments } = data;
	
	/**
	 * Convert URLs in text to clickable hyperlinks
	 * @param {string} text
	 */
	function linkifyUrls(text) {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
	}
</script>

<svelte:head>
	<title>Latest Comments - Unyunddit</title>
	<meta name="description" content="View the latest comments on Unyunddit" />
</svelte:head>

<div class="comments-page">
	<h1>💬 Latest Comments</h1>

	{#if comments.length === 0}
		<div class="empty-state">
			<p>No comments yet. Be the first to comment on a post!</p>
			<a href="/" class="button">Browse Posts</a>
		</div>
	{:else}
		<div class="comments-list">
			{#each comments as comment}
				<article class="comment-card">
					<div class="comment-header">
						<span class="comment-time">{comment.created_at}</span>
						{#if comment.post?.category}
							<span class="comment-category">
								in <a href="/s/{comment.post.category.slug}">{comment.post.category.name}</a>
							</span>
						{/if}
					</div>

					<div class="comment-content">
						<p>{@html linkifyUrls(comment.content)}</p>
					</div>

					{#if comment.post}
						<div class="comment-footer">
							<a href="/posts/{comment.post_id}#comment-{comment.id}" class="post-link">
								→ {comment.post.title}
							</a>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	.comments-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		color: #ff6b35;
		margin-bottom: 30px;
		font-size: 2rem;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		background-color: #2a2a2a;
		border-radius: 8px;
		margin-top: 40px;
	}

	.empty-state p {
		color: #888;
		font-size: 1.1rem;
		margin-bottom: 20px;
	}

	.button {
		display: inline-block;
		padding: 12px 24px;
		background-color: #ff6b35;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.button:hover {
		background-color: #e55a2b;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.comment-card {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		border-left: 3px solid #ff6b35;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.comment-card:hover {
		transform: translateX(5px);
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		flex-wrap: wrap;
		gap: 10px;
	}

	.comment-time {
		color: #888;
		font-size: 0.9rem;
	}

	.comment-category {
		color: #888;
		font-size: 0.9rem;
	}

	.comment-category a {
		color: #ff6b35;
		text-decoration: none;
	}

	.comment-category a:hover {
		text-decoration: underline;
	}

	.comment-content {
		margin-bottom: 15px;
	}

	.comment-content p {
		color: #e0e0e0;
		line-height: 1.6;
		margin: 0;
		word-wrap: break-word;
		white-space: pre-wrap;
	}
	
	.comment-content :global(a) {
		color: #ff6b35;
		text-decoration: underline;
	}
	
	.comment-content :global(a:hover) {
		color: #e55a2b;
	}

	.comment-footer {
		padding-top: 12px;
		border-top: 1px solid #333;
	}

	.post-link {
		color: #ff6b35;
		text-decoration: none;
		font-weight: 500;
		display: inline-block;
		transition: color 0.2s;
	}

	.post-link:hover {
		color: #e55a2b;
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		.comments-page {
			padding: 10px;
		}

		h1 {
			font-size: 1.5rem;
		}

		.comment-card {
			padding: 15px;
		}

		.comment-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>