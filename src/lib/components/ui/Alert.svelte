<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'success' | 'warning' | 'destructive';

	interface Props {
		tone?: Tone;
		title?: string;
		children: Snippet;
	}

	let { tone = 'info', title, children }: Props = $props();
</script>

<div class={['alert', tone]} role={tone === 'destructive' ? 'alert' : 'status'}>
	{#if title}
		<strong class="alert-title">{title}</strong>
	{/if}
	<div class="alert-body">{@render children()}</div>
</div>

<style>
	.alert {
		--tone: var(--primary);

		padding: 0.9rem 1.1rem;
		background: oklch(from var(--tone) l c h / 0.08);
		border: 1px solid oklch(from var(--tone) l c h / 0.25);
		border-radius: var(--radius-md);
	}

	.info {
		--tone: var(--primary);
	}

	.success {
		--tone: oklch(0.55 0.13 155);
	}

	.warning {
		--tone: var(--secondary);
	}

	.destructive {
		--tone: var(--destructive);
	}

	.alert-title {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.9rem;
		color: oklch(from var(--tone) calc(l * 0.8) c h);
	}

	.alert-body {
		font-size: 0.85rem;
		line-height: 1.6;
		color: oklch(from var(--tone) calc(l * 0.85) c h);
	}

	:global(.dark) .alert-title {
		color: oklch(from var(--tone) calc(l * 1.35) calc(c * 0.8) h);
	}

	:global(.dark) .alert-body {
		color: oklch(from var(--tone) calc(l * 1.3) calc(c * 0.7) h);
	}
</style>
