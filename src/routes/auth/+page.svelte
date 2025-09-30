<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	/** @type {import('./$types').ActionData} */
	export let form;

	let isLogin = true;
	let loading = false;

	// Switch between login and register modes
	function toggleMode() {
		isLogin = !isLogin;
		form = null; // Clear any previous form errors
	}

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ result, update }) => {
			loading = false;
			if (result.type === 'redirect') {
				goto(result.location);
			} else {
				await update();
			}
		};
	}
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

		{#if form?.success}
			<div class="success-message">
				{form.message}
			</div>
		{/if}

		<form 
			method="POST" 
			action="?/{isLogin ? 'login' : 'register'}"
			use:enhance={handleSubmit}
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
					disabled={loading}
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
					disabled={loading}
				/>
				<small>Minimum 6 characters</small>
			</div>

			<button type="submit" class="auth-button" disabled={loading}>
				{#if loading}
					{isLogin ? 'Logging in...' : 'Registering...'}
				{:else}
					{isLogin ? 'Login' : 'Register'}
				{/if}
			</button>
		</form>

		<div class="auth-toggle">
			{#if isLogin}
				Don't have an account?
				<button type="button" class="link-button" on:click={toggleMode}>
					Register here
				</button>
			{:else}
				Already have an account?
				<button type="button" class="link-button" on:click={toggleMode}>
					Login here
				</button>
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
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

	input:disabled {
		background-color: #f8f9fa;
		cursor: not-allowed;
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
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 1rem;
	}

	.auth-button:hover:not(:disabled) {
		background-color: #0056b3;
	}

	.auth-button:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.auth-toggle {
		text-align: center;
		margin-top: 1.5rem;
		color: #666;
	}

	.link-button {
		background: none;
		border: none;
		color: #007bff;
		cursor: pointer;
		text-decoration: underline;
		font-size: inherit;
	}

	.link-button:hover {
		color: #0056b3;
	}

	.error-message {
		background-color: #f8d7da;
		color: #721c24;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #f5c6cb;
	}

	.success-message {
		background-color: #d4edda;
		color: #155724;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #c3e6cb;
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