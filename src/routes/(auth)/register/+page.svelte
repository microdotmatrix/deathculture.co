<script lang="ts">
	import { signUp } from '#lib/auth.remote';

	const formIssues = $derived(
		signUp.fields.allIssues()?.filter((issue) => !issue.path?.length) ?? []
	);
</script>

<svelte:head>
	<title>Create an account — DeathCulture.co</title>
</svelte:head>

<h1>Join DeathCulture.co</h1>
<p class="sub">Create an account to take part in the conversation.</p>

{#each formIssues as issue (issue.message)}
	<p class="form-issue" role="alert">{issue.message}</p>
{/each}

<form {...signUp} class="auth-form">
	<label>
		<span>Name</span>
		<input {...signUp.fields.name.as('text')} autocomplete="name" placeholder="Your name" />
		{#each signUp.fields.name.issues() ?? [] as issue (issue.message)}
			<small role="alert">{issue.message}</small>
		{/each}
	</label>

	<label>
		<span>Email</span>
		<input
			{...signUp.fields.email.as('email')}
			autocomplete="email"
			placeholder="you@example.com"
		/>
		{#each signUp.fields.email.issues() ?? [] as issue (issue.message)}
			<small role="alert">{issue.message}</small>
		{/each}
	</label>

	<label>
		<span>Password</span>
		<input {...signUp.fields._password.as('password')} autocomplete="new-password" />
		{#each signUp.fields._password.issues() ?? [] as issue (issue.message)}
			<small role="alert">{issue.message}</small>
		{/each}
	</label>

	<button disabled={!!signUp.pending}>
		{signUp.pending ? 'Creating account…' : 'Create account'}
	</button>
</form>

<p class="switch">
	Already have an account? <a href="/login">Sign in</a>
</p>

<style>
	h1 {
		font-size: 1.5rem;
		color: var(--foreground);
	}

	.sub {
		margin-top: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted-foreground);
	}

	.form-issue {
		margin-top: 1rem;
		padding: 0.6rem 0.9rem;
		font-size: 0.82rem;
		color: var(--destructive);
		background: oklch(from var(--destructive) l c h / 0.08);
		border: 1px solid oklch(from var(--destructive) l c h / 0.25);
		border-radius: var(--radius-sm);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		margin-top: 1.5rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	label span {
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--base-600);
	}

	input {
		padding: 0.6rem 0.85rem;
		font-size: 0.95rem;
		color: var(--foreground);
		background: var(--muted);
		border: 1px solid var(--input);
		border-radius: var(--radius-sm);
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	input:focus {
		outline: none;
		border-color: var(--ring);
	}

	input[aria-invalid='true'] {
		border-color: var(--destructive);
	}

	small {
		font-size: 0.78rem;
		color: var(--destructive);
	}

	button {
		margin-top: 0.4rem;
		padding: 0.7rem 1rem;
		font-size: 0.9rem;
		letter-spacing: 0.02em;
		color: var(--primary-foreground);
		background: var(--primary);
		border-radius: var(--radius-sm);
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	button:hover:not(:disabled),
	button:focus-visible {
		background: var(--primary-900);
		transform: translateY(-1px);
	}

	button:disabled {
		opacity: 0.7;
	}

	.switch {
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--muted-foreground);
	}

	.switch a {
		color: var(--secondary-800);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color var(--duration-fast, 150ms) ease;
	}

	.switch a:hover {
		color: var(--secondary);
	}
</style>
