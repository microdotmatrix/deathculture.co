<script lang="ts">
	import { signOut } from '@/lib/auth.remote';
	import type { User } from 'better-auth';
	import Logo from './Logo.svelte';

	interface Props {
		user?: User | null;
		/** Tone of the surface behind the header: dark imagery (default) or light page. */
		tone?: 'dark' | 'light';
	}

	let { user = null, tone = 'dark' }: Props = $props();

	const navLinks = [
		{ label: 'Podcast', href: '/podcast' },
		{ label: 'About', href: '/about' },
		{ label: 'Team', href: '/team' },
		{ label: 'Partners', href: '/partners' },
		{ label: 'Contact Us', href: '/contact' }
	];
</script>

<header class={['site-header', tone === 'light' && 'on-light']}>
	<div class="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 pt-4 sm:px-8">
		<div class="flex justify-start">
			<a href="/search" class="icon-btn hit-area-extend" aria-label="Search">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />
					<path
						d="m20 20-3.8-3.8"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
			</a>
		</div>

		<a href="/" class="brand" aria-label="DeathCulture.co — home">
			<Logo size={38} />
		</a>

		<div class="flex items-center justify-end gap-3 sm:gap-5">
			{#if user}
				<a class="quiet-link" href="/dashboard">Studio</a>
				<form {...signOut}>
					<button class="pill" disabled={!!signOut.pending}>Sign out</button>
				</form>
			{:else}
				<a class="quiet-link" href="/login">Sign in</a>
				<a class="pill" href="#subscribe">Subscribe</a>
			{/if}
		</div>
	</div>

	<nav aria-label="Main navigation" class="mt-3 flex justify-center px-4 pb-3">
		<ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:gap-x-8">
			{#each navLinks as link (link.href)}
				<li><a class="nav-link" href={link.href}>{link.label}</a></li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.site-header {
		position: absolute;
		inset-inline: 0;
		top: 0;
		z-index: 40;
		color: var(--base-100);
		background: linear-gradient(
			to bottom,
			oklch(from var(--base-1000) l c h / 0.55),
			oklch(from var(--base-1000) l c h / 0.25) 60%,
			transparent
		);
	}

	.brand {
		display: inline-flex;
		transition: transform var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.brand:hover {
		transform: translateY(-2px);
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		color: var(--base-200);
		transition:
			color var(--duration-fast, 150ms) ease,
			background-color var(--duration-fast, 150ms) ease;
	}

	.icon-btn:hover,
	.icon-btn:focus-visible {
		color: var(--base-50);
		background: oklch(from var(--base-50) l c h / 0.12);
	}

	.quiet-link {
		font-size: 0.85rem;
		letter-spacing: 0.02em;
		white-space: nowrap;
		color: var(--base-200);
		transition: color var(--duration-fast, 150ms) ease;
	}

	.quiet-link:hover,
	.quiet-link:focus-visible {
		color: var(--base-50);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
		padding: 0.45rem 1.1rem;
		font-size: 0.85rem;
		letter-spacing: 0.02em;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.pill:hover,
	.pill:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	.pill:active {
		transform: translateY(0);
	}

	.nav-link {
		position: relative;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--base-300);
		padding-block: 0.25rem;
		transition: color var(--duration-fast, 150ms) ease;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		height: 1px;
		background: var(--secondary-500);
		transform: scaleX(0);
		transform-origin: center;
		transition: transform var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.nav-link:hover,
	.nav-link:focus-visible {
		color: var(--base-50);
	}

	.nav-link:hover::after,
	.nav-link:focus-visible::after {
		transform: scaleX(1);
	}

	/* Light-surface variant — dark text, no darkening gradient. */
	.site-header.on-light {
		color: var(--base-800);
		background: linear-gradient(
			to bottom,
			oklch(from var(--background) l c h / 0.9),
			oklch(from var(--background) l c h / 0.5) 60%,
			transparent
		);
	}

	.on-light .icon-btn {
		color: var(--base-600);
	}

	.on-light .icon-btn:hover,
	.on-light .icon-btn:focus-visible {
		color: var(--base-900);
		background: oklch(from var(--base-950) l c h / 0.08);
	}

	.on-light .quiet-link {
		color: var(--base-600);
	}

	.on-light .quiet-link:hover,
	.on-light .quiet-link:focus-visible {
		color: var(--base-900);
	}

	.on-light .nav-link {
		color: var(--base-500);
	}

	.on-light .nav-link:hover,
	.on-light .nav-link:focus-visible {
		color: var(--base-900);
	}
</style>
