<script>
	// Guestbook page - demonstrates SSR-only form handling
	// No client-side JavaScript - pure HTML forms
	
	export let data;
	export let form;
	
	// Format date for display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Guestbook - Onion SSR Boilerplate</title>
	<meta name="description" content="Leave a message in our anonymous guestbook" />
</svelte:head>

<main>
	<h1>Anonymous Guestbook</h1>
	<p>Leave a message for other visitors to this .onion site. No JavaScript required!</p>

	<!-- Form submission feedback -->
	{#if form?.success}
		<div class="success-message">
			<p>✅ {form.message}</p>
		</div>
	{/if}

	{#if form?.error}
		<div class="error-message">
			<p>❌ {form.error}</p>
		</div>
	{/if}

	<!-- Guestbook form -->
	<section class="form-section">
		<h2>Leave a Message</h2>
		<form method="POST" class="guestbook-form">
			<div class="form-group">
				<label for="name">Your Name:</label>
				<input 
					type="text" 
					id="name" 
					name="name" 
					maxlength="100" 
					required 
					value={form?.name || ''}
					placeholder="Enter your name or pseudonym"
				/>
			</div>

			<div class="form-group">
				<label for="message">Your Message:</label>
				<textarea 
					id="message" 
					name="message" 
					rows="4" 
					maxlength="1000" 
					required 
					placeholder="Share your thoughts..."
				>{form?.message || ''}</textarea>
			</div>

			<button type="submit" class="submit-btn">Post Message</button>
		</form>
	</section>

	<!-- Display existing messages -->
	<section class="messages-section">
		<h2>Recent Messages ({data.entries?.length || 0})</h2>
		
		{#if data.error}
			<div class="error-message">
				<p>❌ {data.error}</p>
			</div>
		{:else if data.entries && data.entries.length > 0}
			<div class="messages-list">
				{#each data.entries as entry (entry.id)}
					<article class="message-card">
						<header class="message-header">
							<strong class="author">{entry.name}</strong>
							<time class="timestamp">{formatDate(entry.created_at)}</time>
						</header>
						<div class="message-content">
							<p>{entry.message}</p>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<p class="no-messages">No messages yet. Be the first to leave one!</p>
		{/if}
	</section>
</main>

<style>
	/* CSS-only styling for .onion sites - no external dependencies */
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		color: #333;
	}

	h1 {
		color: #2c3e50;
		border-bottom: 3px solid #3498db;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	h2 {
		color: #34495e;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.success-message, .error-message {
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 4px;
		font-weight: bold;
	}

	.success-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.error-message {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.form-section {
		background-color: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		margin: 2rem 0;
		border: 1px solid #dee2e6;
	}

	.guestbook-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: bold;
		margin-bottom: 0.5rem;
		color: #495057;
	}

	input, textarea {
		padding: 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
	}

	.submit-btn {
		background-color: #3498db;
		color: white;
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		align-self: flex-start;
	}

	.submit-btn:hover {
		background-color: #2980b9;
	}

	.messages-section {
		margin-top: 3rem;
	}

	.messages-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.message-card {
		background-color: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.author {
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.timestamp {
		color: #6c757d;
		font-size: 0.9rem;
	}

	.message-content p {
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.no-messages {
		text-align: center;
		color: #6c757d;
		font-style: italic;
		padding: 2rem;
	}

	/* Responsive design */
	@media (max-width: 600px) {
		main {
			padding: 1rem 0.5rem;
		}
		
		.form-section {
			padding: 1rem;
		}
		
		.message-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>