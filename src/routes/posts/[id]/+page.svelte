<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	/** @type {import('./$types').ActionData} */
	export let form;
	
	let commentContent = '';
	/** @type {number | null} */
	let replyingTo = null;
	let replyContent = '';
	
	/**
	 * @param {number} commentId
	 */
	function startReply(commentId) {
		replyingTo = commentId;
		replyContent = '';
	}
	
	function cancelReply() {
		replyingTo = null;
		replyContent = '';
	}
	
	/**
	 * @param {number} depth
	 */
	function getIndentClass(depth) {
		return `indent-${Math.min(depth, 5)}`;
	}
	
	/**
	 * @param {string} dateString
	 */
	function formatDate(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);
		
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		
		return date.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>{data.post.title} - Unyunddit</title>
	<meta name="description" content={data.post.content ? data.post.content.substring(0, 160) : data.post.title} />
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
		<!-- Post Details -->
		<article class="post">
			<div class="post-header">
				<h2 class="post-title">{data.post.title}</h2>
				<div class="post-meta">
					{#if data.post.categories}
						<span class="category">
							<a href="/s/{data.post.categories.slug}">{data.post.categories.name}</a>
						</span>
					{/if}
					<span class="post-time">{formatDate(data.post.created_at)}</span>
					<span class="comment-count">{data.post.comment_count || 0} comments</span>
				</div>
			</div>

			{#if data.post.url}
				<div class="post-url">
					<a href={data.post.url} target="_blank" rel="noopener noreferrer" class="external-link">
						{data.post.url}
					</a>
				</div>
			{/if}

			{#if data.post.content}
				<div class="post-content">
					{data.post.content}
				</div>
			{/if}

			<!-- Voting -->
			<div class="post-actions">
				<form method="POST" action="?/vote" use:enhance>
					<input type="hidden" name="vote" value="up" />
					<button type="submit" class="vote-btn upvote">
						▲ {data.post.upvotes || 0}
					</button>
				</form>
				<form method="POST" action="?/vote" use:enhance>
					<input type="hidden" name="vote" value="down" />
					<button type="submit" class="vote-btn downvote">
						▼ {data.post.downvotes || 0}
					</button>
				</form>
			</div>
		</article>

		<!-- Comment Form -->
		<section class="comment-form-section">
			<h3>Add a Comment</h3>
			
			{#if form?.error}
				<div class="error">
					{form.error}
				</div>
			{/if}
			
			{#if form?.success}
				<div class="success">
					Comment posted successfully!
				</div>
			{/if}

			<form method="POST" action="?/comment" use:enhance class="comment-form">
				<textarea
					name="content"
					placeholder="Write your comment here..."
					required
					maxlength="10000"
					rows="4"
					bind:value={commentContent}
				></textarea>
				<div class="form-actions">
					<button type="submit" class="submit-btn">Post Comment</button>
					<small>{commentContent.length}/10,000 characters</small>
				</div>
			</form>
		</section>

		<!-- Comments -->
		<section class="comments-section">
			<h3>Comments ({data.comments.length})</h3>
			
			{#if data.comments.length === 0}
				<p class="no-comments">No comments yet. Be the first to comment!</p>
			{:else}
				<div class="comments">
					{#each data.comments as comment}
						<div class="comment {getIndentClass(comment.depth)}" id="comment-{comment.id}">
							<div class="comment-content">
								{comment.content}
							</div>
							<div class="comment-meta">
								<span class="comment-time">{formatDate(comment.created_at)}</span>
								<button 
									class="reply-btn" 
									on:click={() => startReply(comment.id)}
								>
									Reply
								</button>
							</div>
							
							<!-- Reply Form -->
							{#if replyingTo === comment.id}
								<div class="reply-form">
									<form method="POST" action="?/comment" use:enhance class="comment-form">
										<input type="hidden" name="parent_id" value={comment.id} />
										<textarea
											name="content"
											placeholder="Write your reply..."
											required
											maxlength="10000"
											rows="3"
											bind:value={replyContent}
										></textarea>
										<div class="form-actions">
											<button type="submit" class="submit-btn">Post Reply</button>
											<button type="button" class="cancel-btn" on:click={cancelReply}>Cancel</button>
											<small>{replyContent.length}/10,000 characters</small>
										</div>
									</form>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
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

	.post {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 30px;
		border: 1px solid #333;
	}

	.post-title {
		margin: 0 0 10px;
		color: #ff6b35;
		font-size: 1.5rem;
	}

	.post-meta {
		display: flex;
		gap: 15px;
		margin-bottom: 15px;
		font-size: 0.9rem;
		color: #888;
	}

	.category a {
		color: #ff6b35;
		text-decoration: none;
	}

	.category a:hover {
		text-decoration: underline;
	}

	.post-url {
		margin-bottom: 15px;
	}

	.external-link {
		color: #4a9eff;
		text-decoration: none;
		word-break: break-all;
	}

	.external-link:hover {
		text-decoration: underline;
	}

	.post-content {
		margin-bottom: 20px;
		white-space: pre-wrap;
	}

	.post-actions {
		display: flex;
		gap: 10px;
	}

	.vote-btn {
		background: none;
		border: 1px solid #444;
		color: #ccc;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.vote-btn:hover {
		background-color: #333;
	}

	.upvote:hover {
		color: #4a9eff;
		border-color: #4a9eff;
	}

	.downvote:hover {
		color: #ff6b6b;
		border-color: #ff6b6b;
	}

	.comment-form-section, .comments-section {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
		border: 1px solid #333;
	}

	.comment-form-section h3, .comments-section h3 {
		margin: 0 0 20px;
		color: #ff6b35;
	}

	.error {
		background-color: #4a1a1a;
		color: #ff6b6b;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 20px;
		border: 1px solid #ff6b6b;
	}

	.success {
		background-color: #1a4a1a;
		color: #6bff6b;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 20px;
		border: 1px solid #6bff6b;
	}

	.comment-form {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.comment-form textarea {
		background-color: #1a1a1a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 12px;
		color: #e0e0e0;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
	}

	.comment-form textarea:focus {
		outline: none;
		border-color: #ff6b35;
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
	}

	.form-actions {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.submit-btn {
		background-color: #ff6b35;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-btn:hover {
		background-color: #e55a2b;
	}

	.cancel-btn {
		background: none;
		border: 1px solid #444;
		color: #ccc;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn:hover {
		background-color: #333;
	}

	.form-actions small {
		color: #888;
		margin-left: auto;
	}

	.no-comments {
		color: #888;
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.comment {
		border-left: 2px solid #444;
		padding: 15px;
		margin-bottom: 15px;
		background-color: #1a1a1a;
		border-radius: 0 4px 4px 0;
	}

	.comment-content {
		margin-bottom: 10px;
		white-space: pre-wrap;
	}

	.comment-meta {
		display: flex;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
	}

	.reply-btn {
		background: none;
		border: none;
		color: #4a9eff;
		cursor: pointer;
		text-decoration: underline;
		font-size: 0.9rem;
	}

	.reply-btn:hover {
		color: #6bb3ff;
	}

	.reply-form {
		margin-top: 15px;
		padding-top: 15px;
		border-top: 1px solid #333;
	}

	/* Indentation for threaded comments */
	.indent-1 { margin-left: 20px; }
	.indent-2 { margin-left: 40px; }
	.indent-3 { margin-left: 60px; }
	.indent-4 { margin-left: 80px; }
	.indent-5 { margin-left: 100px; }

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

		.post, .comment-form-section, .comments-section {
			padding: 15px;
		}

		.post-meta {
			flex-direction: column;
			gap: 5px;
		}

		.form-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.form-actions small {
			margin-left: 0;
			text-align: center;
		}

		/* Reduce indentation on mobile */
		.indent-1 { margin-left: 10px; }
		.indent-2 { margin-left: 20px; }
		.indent-3 { margin-left: 30px; }
		.indent-4 { margin-left: 40px; }
		.indent-5 { margin-left: 50px; }
	}
</style>