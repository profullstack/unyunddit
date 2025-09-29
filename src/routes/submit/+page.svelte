<script>
	import { suggestCategories } from '$lib/categories.js';
	
	/** @type {import('./$types').ActionData} */
	export let form;
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	let title = form?.title || '';
	let url = form?.url || '';
	let content = form?.content || '';
	let selectedCategoryId = form?.categoryId || '';
	let suggestedCategories = [];
	let showSuggestions = false;
	
	// Smart category suggestion
	function updateSuggestions() {
		const suggestions = suggestCategories({ url, title });
		if (suggestions.length > 0) {
			suggestedCategories = data.categories.filter(cat => 
				suggestions.includes(cat.slug)
			).slice(0, 5); // Limit to top 5 suggestions
			showSuggestions = true;
		} else {
			suggestedCategories = [];
			showSuggestions = false;
		}
	}
	
	// Update suggestions when title or URL changes
	$: if (title || url) {
		updateSuggestions();
	}
	
	function selectSuggestedCategory(categoryId) {
		selectedCategoryId = categoryId.toString();
		showSuggestions = false;
	}
</script>

<svelte:head>
	<title>Submit Post - Unyunddit</title>
	<meta name="description" content="Submit a new anonymous post to Unyunddit" />
</svelte:head>

<main>
	<header class="header">
		<h1>🧅 <a href="/">Unyunddit</a></h1>
		<nav class="nav">
			<a href="/" class="nav-link">Home</a>
			<a href="/submit" class="nav-link active">Submit Post</a>
			<a href="/new" class="nav-link">New</a>
		</nav>
	</header>

	<section class="content">
		<div class="submit-form">
			<h2>Submit a New Post</h2>
			<p class="info">Your post will be completely anonymous and will automatically delete after 36 hours.</p>

			{#if form?.error}
				<div class="error">
					{form.error}
				</div>
			{/if}

			<form method="POST" action="?/submit" class="form">
				<div class="form-group">
					<label for="title">Title *</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						maxlength="300"
						placeholder="Enter your post title..."
						bind:value={title}
					/>
					<small>Maximum 300 characters</small>
				</div>

				<div class="form-group">
					<label for="url">URL (optional)</label>
					<input
						type="url"
						id="url"
						name="url"
						maxlength="2000"
						placeholder="https://example.com"
						bind:value={url}
					/>
					<small>Link to external content (optional)</small>
				</div>

				<div class="form-group">
					<label for="category_id">Category (optional)</label>
					<select
						id="category_id"
						name="category_id"
						bind:value={selectedCategoryId}
					>
						<option value="">Select a category...</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
					<small>Choose a category for better discoverability</small>
					
					{#if showSuggestions && suggestedCategories.length > 0}
						<div class="suggestions">
							<p class="suggestions-label">💡 Suggested categories:</p>
							<div class="suggestion-buttons">
								{#each suggestedCategories as category}
									<button
										type="button"
										class="suggestion-btn"
										on:click={() => selectSuggestedCategory(category.id)}
									>
										{category.name}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="form-group">
					<label for="content">Text (optional)</label>
					<textarea
						id="content"
						name="content"
						maxlength="10000"
						rows="8"
						placeholder="Write your post content here..."
						bind:value={content}
					></textarea>
					<small>Maximum 10,000 characters</small>
				</div>

				<div class="form-actions">
					<button type="submit" class="submit-btn">Submit Post</button>
					<a href="/" class="cancel-btn">Cancel</a>
				</div>
			</form>

			<div class="guidelines">
				<h3>Posting Guidelines</h3>
				<ul>
					<li>Posts are completely anonymous - no registration required</li>
					<li>All posts automatically delete after 36 hours</li>
					<li>Be respectful and follow basic internet etiquette</li>
					<li>You can submit either a link, text, or both</li>
					<li>Voting is anonymous and based on IP address</li>
				</ul>
			</div>
		</div>
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

	.nav-link.active {
		background-color: #ff6b35;
		color: white;
	}

	.submit-form {
		background-color: #2a2a2a;
		border-radius: 8px;
		padding: 30px;
		border: 1px solid #333;
	}

	.submit-form h2 {
		margin: 0 0 10px;
		color: #ff6b35;
	}

	.info {
		color: #888;
		margin-bottom: 30px;
	}

	.error {
		background-color: #4a1a1a;
		color: #ff6b6b;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 20px;
		border: 1px solid #ff6b6b;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
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

	.form-group input,
	.form-group textarea,
	.form-group select {
		background-color: #1a1a1a;
		border: 1px solid #444;
		border-radius: 4px;
		padding: 12px;
		color: #e0e0e0;
		font-size: 1rem;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #ff6b35;
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
	}

	.form-group small {
		color: #888;
		font-size: 0.9rem;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 120px;
	}

	.suggestions {
		margin-top: 10px;
		padding: 15px;
		background-color: #333;
		border-radius: 4px;
		border: 1px solid #444;
	}

	.suggestions-label {
		margin: 0 0 10px;
		color: #ff6b35;
		font-size: 0.9rem;
		font-weight: bold;
	}

	.suggestion-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.suggestion-btn {
		background-color: #ff6b35;
		color: white;
		border: none;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.suggestion-btn:hover {
		background-color: #e55a2b;
	}

	.form-actions {
		display: flex;
		gap: 15px;
		margin-top: 10px;
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
	}

	.submit-btn:hover {
		background-color: #e55a2b;
	}

	.cancel-btn {
		color: #888;
		text-decoration: none;
		padding: 12px 24px;
		border: 1px solid #444;
		border-radius: 4px;
		transition: background-color 0.2s;
		display: inline-block;
		text-align: center;
	}

	.cancel-btn:hover {
		background-color: #333;
		color: #ccc;
	}

	.guidelines {
		margin-top: 40px;
		padding-top: 30px;
		border-top: 1px solid #333;
	}

	.guidelines h3 {
		color: #ff6b35;
		margin-bottom: 15px;
	}

	.guidelines ul {
		color: #ccc;
		padding-left: 20px;
	}

	.guidelines li {
		margin-bottom: 8px;
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

		.submit-form {
			padding: 20px;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>