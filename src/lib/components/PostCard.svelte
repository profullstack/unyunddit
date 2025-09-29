<script>
	/** @type {Object} */
	export let post;
	/** @type {boolean} */
	export let showVoting = false;

	function getDomain(url) {
		if (!url) return '';
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return '';
		}
	}

	function formatTimeAgo(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);
		
		if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	}
</script>

<article class="post">
	{#if showVoting}
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
	{:else}
		<div class="post-votes">
			<div class="vote-score">{post.upvotes - post.downvotes}</div>
		</div>
	{/if}
	
	<div class="post-content">
		<h3 class="post-title">
			<a href="/posts/{post.id}" class="post-link">{post.title}</a>
			{#if post.url}
				<a href={post.url} target="_blank" rel="noopener noreferrer" class="external-icon" title="Open external link">
					↗
				</a>
				<span class="domain">({getDomain(post.url)})</span>
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
			<span class="time">
				{showVoting 
					? new Date(post.created_at).toLocaleString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})
					: formatTimeAgo(post.created_at)
				}
			</span>
			{#if showVoting}
				<a href="/posts/{post.id}" class="comments-link">
					{post.comment_count || 0} comment{(post.comment_count || 0) !== 1 ? 's' : ''}
				</a>
				<span class="expires">
					Expires: {new Date(post.expires_at).toLocaleString('en-US', {
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					})}
				</span>
			{:else}
				<span class="separator">•</span>
				<a href="/posts/{post.id}" class="comments-link">
					{post.comment_count || 0} comments
				</a>
			{/if}
		</div>
	</div>
</article>

<style>
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
		line-height: 1.3;
	}

	.post-link {
		color: #e0e0e0;
		text-decoration: none;
	}

	.post-link:hover {
		color: #ff6b35;
	}

	.external-icon {
		color: #888;
		text-decoration: none;
		font-size: 0.8rem;
		margin-left: 6px;
		padding: 2px 4px;
		border-radius: 2px;
		transition: color 0.2s, background-color 0.2s;
	}

	.external-icon:hover {
		color: #ff6b35;
		background-color: #333;
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
		line-height: 1.5;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
		margin-top: 10px;
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

	@media (max-width: 600px) {
		.post {
			flex-direction: column;
		}

		.post-votes {
			flex-direction: row;
			margin-right: 0;
			margin-bottom: 10px;
		}

		.post-meta {
			flex-direction: column;
			gap: 5px;
			align-items: flex-start;
		}
	}
</style>