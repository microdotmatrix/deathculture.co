<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'primary' | 'secondary' | 'destructive' | 'outline';

	interface Props {
		tone?: Tone;
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();
</script>

<span class={['badge', tone]}>{@render children()}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.5rem;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: nowrap;
		border-radius: 999px;
	}

	.neutral {
		color: var(--base-700);
		background: var(--base-100);
	}

	.primary {
		color: var(--primary-900);
		background: var(--primary-100);
	}

	.secondary {
		color: var(--secondary-900);
		background: var(--secondary-100);
	}

	.destructive {
		color: var(--destructive);
		background: oklch(from var(--destructive) l c h / 0.1);
	}

	.outline {
		color: var(--muted-foreground);
		border: 1px solid var(--border);
	}

	:global(.dark) .neutral {
		color: var(--base-300);
		background: var(--base-800);
	}

	:global(.dark) .primary {
		color: var(--primary-300);
		background: oklch(from var(--primary-400) l c h / 0.15);
	}

	:global(.dark) .secondary {
		color: var(--secondary-300);
		background: oklch(from var(--secondary-400) l c h / 0.15);
	}
</style>
