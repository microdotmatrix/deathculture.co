<script lang="ts">
	import { page } from '$app/state';
	import { signOut } from '@/lib/auth.remote';
	import Logo from '@/lib/components/site/Logo.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const navItems = $derived(
		data.user.role === 'admin'
			? [
					{ href: '/dashboard', label: 'Posts' },
					{ href: '/dashboard/users', label: 'Users' },
					{ href: '/dashboard/comments', label: 'Comments' }
				]
			: []
	);

	function isCurrent(href: string): boolean {
		if (href === '/dashboard') return page.url.pathname === '/dashboard';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="studio min-h-svh">
	<header class="studio-bar">
		<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
			<a href="/" class="flex items-center gap-3" aria-label="Back to DeathCulture.co">
				<Logo size={34} />
				<span class="wordmark">Studio</span>
			</a>

			{#if navItems.length > 0}
				<nav aria-label="Studio">
					<ul class="studio-nav">
						{#each navItems as item (item.href)}
							<li>
								<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}

			<form {...signOut}>
				<button class="sign-out" disabled={!!signOut.pending} type="submit">Sign out</button>
			</form>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-5 py-10 sm:px-8">
		{@render children()}
	</main>
</div>

<style>
	.studio {
		background: var(--background);
	}

	.studio-bar {
		border-bottom: 1px solid var(--border);
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 0.9rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--foreground);
	}

	.studio-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.studio-nav a {
		display: inline-block;
		padding: 0.35rem 0.9rem;
		font-size: 0.82rem;
		color: var(--muted-foreground);
		border-radius: 999px;
		transition:
			color var(--duration-fast, 150ms) ease,
			background-color var(--duration-fast, 150ms) ease;
	}

	.studio-nav a:hover,
	.studio-nav a:focus-visible {
		color: var(--secondary-800);
	}

	.studio-nav a[aria-current='page'] {
		color: var(--secondary-900);
		background: var(--secondary-100);
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
</style>
