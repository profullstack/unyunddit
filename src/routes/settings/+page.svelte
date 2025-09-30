<script>
	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
	<title>Settings - Unyunddit</title>
</svelte:head>

<div class="settings-container">
	<div class="settings-card">
		<h1>Account Settings</h1>
		
		{#if data.user}
			<div class="user-info">
				<h2>Account Information</h2>
				<div class="info-row">
					<label>Username:</label>
					<span class="username">{data.user.username}</span>
				</div>
				<div class="info-row">
					<label>Member since:</label>
					<span class="date">{new Date(data.user.created_at).toLocaleDateString()}</span>
				</div>
			</div>

			<div class="settings-section">
				<h2>Account Benefits</h2>
				<ul class="benefits-list">
					<li>✅ Your posts persist indefinitely (no 72-hour deletion)</li>
					<li>✅ Manage your own content</li>
					<li>✅ Simple authentication without email</li>
				</ul>
			</div>

			<div class="settings-section">
				<h2>Account Actions</h2>
				<form method="POST" action="/logout" class="logout-form">
					<button type="submit" class="logout-button">
						Logout
					</button>
				</form>
			</div>
		{:else}
			<div class="not-logged-in">
				<p>You are not logged in.</p>
				<a href="/auth" class="login-link">Login or Register</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.settings-container {
		display: flex;
		justify-content: center;
		padding: 2rem;
	}

	.settings-card {
		background: #2a2a2a;
		border-radius: 8px;
		border: 1px solid #333;
		padding: 2rem;
		width: 100%;
		max-width: 600px;
	}

	h1 {
		color: #ff6b35;
		margin-bottom: 2rem;
		text-align: center;
	}

	h2 {
		color: #ccc;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.user-info {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background-color: #333;
		border-radius: 6px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #444;
	}

	.info-row:last-child {
		margin-bottom: 0;
		border-bottom: none;
	}

	.info-row label {
		color: #888;
		font-weight: 500;
	}

	.username {
		color: #ff6b35;
		font-weight: bold;
	}

	.date {
		color: #ccc;
	}

	.settings-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background-color: #333;
		border-radius: 6px;
	}

	.benefits-list {
		color: #ccc;
		padding-left: 1.5rem;
		margin: 0;
	}

	.benefits-list li {
		margin-bottom: 0.5rem;
	}

	.logout-form {
		margin: 0;
	}

	.logout-button {
		background-color: #ff6b35;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.logout-button:hover {
		background-color: #e55a2b;
	}

	.not-logged-in {
		text-align: center;
		padding: 2rem;
		color: #888;
	}

	.login-link {
		color: #ff6b35;
		text-decoration: none;
		font-weight: bold;
		padding: 12px 24px;
		border: 1px solid #ff6b35;
		border-radius: 4px;
		display: inline-block;
		margin-top: 1rem;
		transition: background-color 0.2s;
	}

	.login-link:hover {
		background-color: #ff6b35;
		color: white;
	}

	@media (max-width: 600px) {
		.settings-container {
			padding: 1rem;
		}

		.settings-card {
			padding: 1.5rem;
		}

		.info-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>