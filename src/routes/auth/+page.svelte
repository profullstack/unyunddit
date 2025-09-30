<script>
	import { page } from '$app/stores';

	/** @type {import('./$types').ActionData} */
	export let form;

	// Determine if we're in register mode based on URL parameter
	$: isLogin = $page.url.searchParams.get('mode') !== 'register';
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Register'} - Unyunddit</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>{isLogin ? 'Login' : 'Register'}</h1>
		
		{#if form?.error}
			<div class="error-message">
				{form.error}
			</div>
		{/if}

		<form 
			method="POST" 
			action="?/{isLogin ? 'login' : 'register'}"
		>
			<div class="form-group">
				<label for="username">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					minlength="3"
					maxlength="50"
					placeholder="Enter your username"
				/>
				<small>3-50 characters</small>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="6"
					placeholder="Enter your password"
				/>
				<small>Minimum 6 characters</small>
			</div>

			<button type="submit" class="auth-button">
				{isLogin ? 'Login' : 'Register'}
			</button>
		</form>

		<div class="auth-toggle">
			{#if isLogin}
				Don't have an account?
				<a href="/auth?mode=register" class="link-button">
					Register here
				</a>
			{:else}
				Already have an account?
				<a href="/auth" class="link-button">
					Login here
				</a>
			{/if}
		</div>

		<div class="auth-info">
			<h3>Why register?</h3>
			<ul>
				<li>Your posts will persist indefinitely (no 72-hour deletion)</li>
				<li>Simple username/password - no email required</li>
				<li>Manage your own content</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
		padding: 2rem;
	}

	.auth-card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
	}

	h1 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #333;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #555;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #ff6b35;
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.25);
	}

	small {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.875rem;
	}

	.auth-button {
		width: 100%;
		padding: 0.75rem;
		background-color: #ff6b35;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 1rem;
	}

	.auth-button:hover {
		background-color: #e55a2b;
	}

	.auth-toggle {
		text-align: center;
		margin-top: 1.5rem;
		color: #666;
	}

	.link-button {
		color: #ff6b35;
		text-decoration: underline;
		font-size: inherit;
	}

	.link-button:hover {
		color: #e55a2b;
	}

	.error-message {
		background-color: #f8d7da;
		color: #721c24;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #f5c6cb;
	}

	.auth-info {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #eee;
	}

	.auth-info h3 {
		margin-bottom: 0.5rem;
		color: #333;
		font-size: 1rem;
	}

	.auth-info ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #666;
		font-size: 0.875rem;
	}

	.auth-info li {
		margin-bottom: 0.25rem;
	}

	@media (max-width: 480px) {
		.auth-container {
			padding: 1rem;
		}

		.auth-card {
			padding: 1.5rem;
		}
	}
</style>