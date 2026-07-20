<script lang="ts">
	import Logo from '#lib/components/site/Logo.svelte';
	import { signOut } from '#lib/auth.remote';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Studio — DeathCulture.co</title>
</svelte:head>

<div class="studio min-h-svh">
	<header class="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
		<a href="/" class="flex items-center gap-3" aria-label="Back to DeathCulture.co">
			<Logo size={34} />
			<span class="wordmark">Studio</span>
		</a>
		<form {...signOut}>
			<button class="sign-out" disabled={!!signOut.pending}>Sign out</button>
		</form>
	</header>

	<main class="mx-auto max-w-5xl px-5 py-10 sm:px-8">
		<p class="kicker">Welcome back</p>
		<h1>{data.user.name}</h1>

		<section class="placeholder" aria-label="Posts">
			<h2>Your posts</h2>
			<p>
				The writing desk is being built. Soon you'll draft, edit, and publish posts for
				DeathCulture.co from here.
			</p>
		</section>
	</main>
</div>

<style>
	.studio {
		background: var(--background);
	}

	.studio header {
		border-bottom: 1px solid var(--border);
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 0.9rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--foreground);
	}

	.sign-out {
		padding: 0.45rem 1.1rem;
		font-size: 0.85rem;
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 999px;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.sign-out:hover:not(:disabled),
	.sign-out:focus-visible {
		border-color: var(--secondary);
		color: var(--secondary-800);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	h1 {
		margin-top: 0.5rem;
		font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.6rem);
		color: var(--foreground);
	}

	.placeholder {
		margin-top: 2.5rem;
		padding: 2rem;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--muted);
	}

	.placeholder h2 {
		font-size: 1.1rem;
		color: var(--foreground);
	}

	.placeholder p {
		margin-top: 0.5rem;
		max-width: 36rem;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--muted-foreground);
	}
</style>
