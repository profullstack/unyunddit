<script>
	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	const { post, comments } = data;

	/**
	 * Build nested comment tree from flat array
	 * @param {Array} comments - Flat array of comments
	 * @param {number|null} parentId - Parent comment ID
	 * @returns {Array} Nested comment tree
	 */
	function buildCommentTree(comments, parentId = null) {
		return comments
			.filter(comment => comment.parent_id === parentId)
			.map(comment => ({
				...comment,
				children: buildCommentTree(comments, comment.id)
			}));
	}

	$: commentTree = buildCommentTree(comments || []);

	// Simple function to toggle reply forms (no client-side JS framework needed)
	function toggleReplyForm(commentId) {
		const form = document.getElementById(`reply-form-${commentId}`);
		if (form) {
			form.style.display = form.style.display === 'none' ? 'block' : 'none';
		}
	}
	
	// Make function globally available
	if (typeof window !== 'undefined') {
		window.toggleReplyForm = toggleReplyForm;
	}
</script>

<svelte:head>
	<title>{post?.title || 'Post'} - UnyundIt</title>
	<meta name="description" content={post?.content || post?.title || 'Anonymous post on UnyundIt'} />
</svelte:head>

<main>
	<header class="header">
		<h1>🧅 <a href="/">UnyundIt</a></h1>
		<nav class="nav">
			<a href="/" class="nav-link">Home</a>
			<a href="/submit" class="nav-link">Submit Post</a>
			<a href="/new" class="nav-link">New</a>
		</nav>
	</header>

	{#if post}
		<article class="post">
			<div class="post-votes">
				<form method="POST" action="?/upvote" class="vote-form">
					<input type="hidden" name="postId" value={post.id} />
					<button type="submit" class="vote-btn upvote" title="Upvote">▲</button>
				</form>
				<span class="score">{post.upvotes - post.downvotes}</span>
				<form method="POST" action="?/downvote" class="vote-form">
					<input type="hidden" name="postId" value={post.id} />
					<button type="submit" class="vote-btn downvote" title="Downvote">▼</button>
				</form>
			</div>
			
			<div class="post-content">
				<h1 class="post-title">
					{#if post.url}
						<a href={post.url} target="_blank" rel="noopener noreferrer" class="external-link">
							{post.title}
						</a>
						<span class="domain">({new URL(post.url).hostname})</span>
					{:else}
						{post.title}
					{/if}
				</h1>
				
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
					<span class="comments-count">
						{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
					</span>
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

		<section class="comments-section">
			<h2>Comments</h2>
			
			<div class="comment-form">
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

				<form method="POST" action="?/comment" class="form">
					<input type="hidden" name="postId" value={post.id} />
					<div class="form-group">
						<label for="content">Add a comment</label>
						<textarea
							id="content"
							name="content"
							required
							maxlength="5000"
							rows="4"
							placeholder="Write your comment here..."
							value={form?.content || ''}
						></textarea>
						<small>Maximum 5,000 characters</small>
					</div>
					<button type="submit" class="submit-btn">Post Comment</button>
				</form>
			</div>

			{#if commentTree.length > 0}
				<div class="comments">
					{#each commentTree as comment}
						<div class="comment" data-depth={comment.depth}>
							<div class="comment-votes">
								<form method="POST" action="?/upvoteComment" class="vote-form">
									<input type="hidden" name="commentId" value={comment.id} />
									<button type="submit" class="vote-btn upvote" title="Upvote">▲</button>
								</form>
								<span class="score">{comment.upvotes - comment.downvotes}</span>
								<form method="POST" action="?/downvoteComment" class="vote-form">
									<input type="hidden" name="commentId" value={comment.id} />
									<button type="submit" class="vote-btn downvote" title="Downvote">▼</button>
								</form>
							</div>
							
							<div class="comment-content">
								<div class="comment-text">
									{comment.content}
								</div>
								<div class="comment-meta">
									<span class="time">
										{new Date(comment.created_at).toLocaleString('en-US', {
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
									{#if comment.depth < 10}
										<button class="reply-btn" on:click={() => toggleReplyForm(comment.id)}>Reply</button>
									{/if}
								</div>
								
								<div id="reply-form-{comment.id}" class="reply-form" style="display: none;">
									<form method="POST" action="?/comment" class="form">
										<input type="hidden" name="postId" value={post.id} />
										<input type="hidden" name="parentId" value={comment.id} />
										<div class="form-group">
											<textarea
												name="content"
												required
												maxlength="5000"
												rows="3"
												placeholder="Write your reply here..."
											></textarea>
										</div>
										<div class="reply-actions">
											<button type="submit" class="submit-btn small">Reply</button>
											<button type="button" class="cancel-btn small" on:click={() => toggleReplyForm(comment.id)}>Cancel</button>
										</div>
									</form>
								</div>
							</div>
						</div>

						{#if comment.children.length > 0}
							{#each comment.children as childComment}
								<div class="comment nested" data-depth={childComment.depth}>
									<div class="comment-votes">
										<form method="POST" action="?/upvoteComment" class="vote-form">
											<input type="hidden" name="commentId" value={childComment.id} />
											<button type="submit" class="vote-btn upvote" title="Upvote">▲</button>
										</form>
										<span class="score">{childComment.upvotes - childComment.downvotes}</span>
										<form method="POST" action="?/downvoteComment" class="vote-form">
											<input type="hidden" name="commentId" value={childComment.id} />
											<button type="submit" class="vote-btn downvote" title="Downvote">▼</button>
										</form>
									</div>
									
									<div class="comment-content">
										<div class="comment-text">
											{childComment.content}
										</div>
										<div class="comment-meta">
											<span class="time">
												{new Date(childComment.created_at).toLocaleString('en-US', {
													month: 'short',
													day: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</span>
											{#if childComment.depth < 10}
												<button class="reply-btn" on:click={() => toggleReplyForm(childComment.id)}>Reply</button>
											{/if}
										</div>
										
										<div id="reply-form-{childComment.id}" class="reply-form" style="display: none;">
											<form method="POST" action="?/comment" class="form">
												<input type="hidden" name="postId" value={post.id} />
												<input type="hidden" name="parentId" value={childComment.id} />
												<div class="form-group">
													<textarea
														name="content"
														required
														maxlength="5000"
														rows="3"
														placeholder="Write your reply here..."
													></textarea>
												</div>
												<div class="reply-actions">
													<button type="submit" class="submit-btn small">Reply</button>
													<button type="button" class="cancel-btn small" on:click={() => toggleReplyForm(childComment.id)}>Cancel</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							{/each}
						{/if}
					{/each}
				</div>
			{:else}
				<div class="no-comments">
					<p>No comments yet. Be the first to comment!</p>
				</div>
			{/if}
		</section>
	{:else}
		<div class="error-state">
			<h2>Post not found</h2>
			<p>This post may have expired or been removed.</p>
			<a href="/" class="back-link">← Back to home</a>
		</div>
	{/if}
</main>


<style>
	/* Base styles similar to main page */
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

	/* Post styles */
	.post {
		display: flex;
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		border: 1px solid #333;
		margin-bottom: 30px;
	}

	.post-votes {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 20px;
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
		margin: 0 0 15px;
		font-size: 1.5rem;
		line-height: 1.3;
		color: #e0e0e0;
	}

	.external-link {
		color: #e0e0e0;
		text-decoration: none;
	}

	.external-link:hover {
		color: #ff6b35;
	}

	.domain {
		color: #888;
		font-size: 0.9rem;
		margin-left: 8px;
	}

	.post-text {
		margin: 15px 0;
		color: #ccc;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.post-meta {
		display: flex;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
		margin-top: 15px;
	}

	/* Comments section */
	.comments-section {
		margin-top: 30px;
	}

	.comments-section h2 {
		color: #ff6b35;
		margin-bottom: 20px;
	}

	.comment-form {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 20px;
		border: 1px solid #333;
		margin-bottom: 30px;
	}

	.error {
		background-color: #4a1a1a;
		color: #ff6b6b;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 15px;
		border: 1px solid #ff6b6b;
	}

	.success {
		background-color: #1a4a1a;
		color: #6bff6b;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 15px;
		border: 1px solid #6bff6b;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label {
		font-weight: bold;
		color: #ccc;
	}

	.form-group textarea {
		background-color: #1a1a1a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 12px;
		color: #e0e0e0;
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
	}

	.form-group textarea:focus {
		outline: none;
		border-color: #ff6b35;
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
	}

	.form-group small {
		color: #888;
		font-size: 0.9rem;
	}

	.submit-btn {
		background-color: #ff6b35;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
		align-self: flex-start;
	}

	.submit-btn:hover {
		background-color: #e55a2b;
	}

	.submit-btn.small {
		padding: 8px 16px;
		font-size: 0.9rem;
	}

	.cancel-btn {
		background: none;
		color: #888;
		border: 1px solid #444;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.cancel-btn:hover {
		background-color: #333;
		color: #ccc;
	}

	/* Comments */
	.comments {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.comment {
		display: flex;
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 15px;
		border: 1px solid #333;
	}

	.comment.nested {
		margin-left: 20px;
		background-color: #252525;
	}

	.comment-votes {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 15px;
		min-width: 30px;
	}

	.comment-content {
		flex: 1;
	}

	.comment-text {
		color: #ccc;
		white-space: pre-wrap;
		word-wrap: break-word;
		margin-bottom: 10px;
	}

	.comment-meta {
		display: flex;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
		align-items: center;
	}

	.reply-btn {
		background: none;
		border: none;
		color: #888;
		cursor: pointer;
		font-size: 0.9rem;
		padding: 4px 8px;
		border-radius: 2px;
		transition: color 0.2s;
	}

	.reply-btn:hover {
		color: #ff6b35;
		background-color: #333;
	}

	.reply-form {
		margin-top: 15px;
		padding: 15px;
		background-color: #1a1a1a;
		border-radius: 4px;
		border: 1px solid #444;
	}

	.reply-actions {
		display: flex;
		gap: 10px;
		margin-top: 10px;
	}

	.no-comments {
		text-align: center;
		padding: 40px 20px;
		color: #888;
		background-color: #2a2a2a;
		border-radius: 8px;
		border: 1px solid #333;
	}

	.error-state {
		text-align: center;
		padding: 60px 20px;
		color: #888;
	}

	.error-state h2 {
		color: #ccc;
		margin-bottom: 10px;
	}

	.back-link {
		color: #ff6b35;
		text-decoration: none;
		font-size: 1.1rem;
	}

	.back-link:hover {
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
			padding: 15px;
		}

		.comment {
			padding: 10px;
		}

		.comment.nested {
			margin-left: 10px;
		}

		.post-meta,
		.comment-meta {
			flex-direction: column;
			gap: 5px;
		}
	}
</style>