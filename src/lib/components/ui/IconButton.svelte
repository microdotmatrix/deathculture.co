<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		/** Accessible name; also shown as the tooltip. */
		label: string;
		size?: 'sm' | 'md';
		variant?: 'ghost' | 'outline';
		/** The icon. */
		children: Snippet;
	}

	let {
		label,
		size = 'md',
		variant = 'ghost',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<button
	type="button"
	{...rest}
	class={['icon-btn', size, variant, className]}
	aria-label={label}
	title={label}
>
	{@render children()}
</button>

<style>
	.icon-btn {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		border: 1px solid transparent;
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.sm {
		width: 1.75rem;
		height: 1.75rem;
		font-size: 0.85rem;
	}

	.md {
		width: 2.25rem;
		height: 2.25rem;
		font-size: 1rem;
	}

	.outline {
		border-color: var(--border);
	}

	.icon-btn:hover:not(:disabled),
	.icon-btn:focus-visible {
		color: var(--secondary-800);
		background: var(--accent);
		border-color: var(--secondary);
	}

	.ghost:hover:not(:disabled),
	.ghost:focus-visible {
		border-color: transparent;
	}

	.icon-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	:global(.dark) .icon-btn:hover:not(:disabled),
	:global(.dark) .icon-btn:focus-visible {
		color: var(--secondary-400);
	}
</style>
