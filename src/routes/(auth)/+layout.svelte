<script lang="ts">
	import Logo from '#lib/components/site/Logo.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="auth-shell">
	<a href="/" class="home-link" aria-label="Back to DeathCulture.co">
		<Logo size={42} />
	</a>

	<main class="w-full max-w-sm">
		<div class="card">
			{@render children()}
		</div>
	</main>

	<p class="motto" aria-hidden="true">Memento mori</p>
</div>

<style>
	.auth-shell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		min-height: 100svh;
		padding: 2rem 1.25rem;
		background:
			radial-gradient(
				60rem 40rem at 70% -10%,
				oklch(from var(--primary-900) l c h / 0.45),
				transparent 60%
			),
			radial-gradient(
				40rem 30rem at 10% 110%,
				oklch(from var(--secondary-950) l c h / 0.55),
				transparent 60%
			),
			var(--base-1000);
	}

	.home-link {
		transition: transform var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.home-link:hover {
		transform: translateY(-2px);
	}

	.card {
		padding: clamp(1.75rem, 1.5rem + 1.5vw, 2.75rem);
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		box-shadow: 0 30px 60px -30px oklch(from var(--base-1000) l c h / 0.8);
	}

	.motto {
		font-family: var(--font-display);
		font-size: 0.65rem;
		letter-spacing: 0.4em;
		text-transform: uppercase;
		color: var(--base-600);
	}
</style>
