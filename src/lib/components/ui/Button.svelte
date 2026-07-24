<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		/** Pill is the house shape for actions; `rounded` suits full-width form submits. */
		shape?: 'pill' | 'rounded';
		/** Shows a spinner and blocks interaction without collapsing the layout. */
		loading?: boolean;
		children: Snippet;
	} & (({ href: string } & HTMLAnchorAttributes) | ({ href?: undefined } & HTMLButtonAttributes));

	let {
		variant = 'outline',
		size = 'md',
		shape = 'pill',
		loading = false,
		href = undefined,
		children,
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived(['btn', variant, size, shape, className]);
</script>

{#if href !== undefined}
	<a {href} class={classes} {...rest as HTMLAnchorAttributes}>
		{@render children()}
	</a>
{:else}
	<!-- `type` before the spread so a passed type="submit" wins; `disabled` after it
	     so loading always blocks interaction. -->
	<button
		type="button"
		{...rest as HTMLButtonAttributes}
		class={classes}
		disabled={(rest as HTMLButtonAttributes).disabled || loading}
		aria-busy={loading || undefined}
	>
		{#if loading}
			<Spinner size={size === 'lg' ? 1 : 0.85} label="" />
		{/if}
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		letter-spacing: 0.02em;
		white-space: nowrap;
		text-decoration: none;
		border: 1px solid transparent;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.btn:disabled,
	.btn[aria-disabled='true'] {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Shape */
	.pill {
		border-radius: 999px;
	}

	.rounded {
		border-radius: var(--radius-sm);
	}

	/* Size */
	.sm {
		padding: 0.3rem 0.85rem;
		font-size: 0.78rem;
	}

	.md {
		padding: 0.5rem 1.25rem;
		font-size: 0.85rem;
	}

	.lg {
		padding: 0.7rem 1.5rem;
		font-size: 0.9rem;
	}

	/* Variants */
	.primary {
		color: var(--primary-foreground);
		background: var(--primary);
	}

	.primary:hover:not(:disabled),
	.primary:focus-visible {
		background: var(--primary-900);
		transform: translateY(-1px);
	}

	.secondary {
		color: var(--secondary-foreground);
		background: var(--secondary);
	}

	.secondary:hover:not(:disabled),
	.secondary:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	.outline {
		color: var(--foreground);
		border-color: var(--border);
	}

	.outline:hover:not(:disabled),
	.outline:focus-visible {
		color: var(--secondary-800);
		border-color: var(--secondary);
	}

	.ghost {
		color: var(--muted-foreground);
	}

	.ghost:hover:not(:disabled),
	.ghost:focus-visible {
		color: var(--foreground);
		background: var(--accent);
	}

	.danger {
		color: var(--destructive);
		border-color: oklch(from var(--destructive) l c h / 0.4);
	}

	.danger:hover:not(:disabled),
	.danger:focus-visible {
		background: oklch(from var(--destructive) l c h / 0.08);
	}

	.btn:disabled:hover {
		transform: none;
	}

	:global(.dark) .outline:hover:not(:disabled),
	:global(.dark) .outline:focus-visible {
		color: var(--secondary-400);
	}
</style>
