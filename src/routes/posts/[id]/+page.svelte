<script>
	import { enhance } from '$app/forms';
	import PostCard from '$lib/components/PostCard.svelte';
	import { isAsciiOnly } from '$lib/sanitize.js';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	/** @type {import('./$types').ActionData} */
	export let form;
	
	let commentContent = '';
	let replyContent = '';
	
	/**
	 * @param {number} depth
	 */
	function getIndentClass(depth) {
		return depth > 0 ? `indent-${Math.min(depth, 5)}` : '';
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
	<title>{data.post.title} - Unyunddit</title>
	<meta name="description" content={data.post.content ? data.post.content.substring(0, 160) : data.post.title} />
</svelte:head>

<main>
	<section class="content">
		<!-- Post Details using PostCard for consistency -->
		<PostCard post={data.post} showVoting={true} linkToExternal={true} />
		
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
								{#if isAsciiOnly(comment.content)}
									<span class="ascii-flag" title="ASCII-only content">[x]</span>
								{/if}
								{@html linkifyUrls(comment.content)}
							</div>
							<div class="comment-meta">
								<span class="comment-time">{formatDate(comment.created_at)}</span>
								{#if data.replyTo === comment.id}
									<a href="/posts/{data.post.id}" class="reply-btn">Cancel Reply</a>
								{:else}
									<a href="/posts/{data.post.id}?reply_to={comment.id}" class="reply-btn">Reply</a>
								{/if}
							</div>

							<!-- Reply Form -->
							{#if data.replyTo === comment.id}
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
											<a href="/posts/{data.post.id}" class="cancel-btn">Cancel</a>
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
		color: #888;
		text-decoration: none;
		font-size: 12px;
		margin-left: 10px;
		padding: 4px 8px;
		border: 1px solid #444;
		border-radius: 4px;
		display: inline-block;
	}

	.cancel-btn:hover {
		color: #ff6b35;
		border-color: #ff6b35;
		text-decoration: none;
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
		word-break: break-word;
	}
	
	.comment-content :global(a) {
		color: #ff6b35;
		text-decoration: underline;
	}
	
	.comment-content :global(a:hover) {
		color: #e55a2b;
	}

	.ascii-flag {
		display: inline-block;
		background-color: #4a4a4a;
		color: #ff6b35;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 0.75rem;
		font-weight: bold;
		margin-right: 8px;
		vertical-align: middle;
	}

	.comment-meta {
		display: flex;
		gap: 15px;
		font-size: 0.9rem;
		color: #888;
	}

	.reply-btn {
		color: #ff6b35;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.reply-btn:hover {
		color: #e55a2b;
		text-decoration: underline;
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