<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** The message, e.g. "No comments match these filters." */
		children: Snippet;
		/** Optional call to action rendered under the message. */
		action?: Snippet;
	}

	let { children, action }: Props = $props();
</script>

<div class="empty">
	<p>{@render children()}</p>
	{#if action}
		<div class="empty-action">{@render action()}</div>
	{/if}
</div>

<style>
	.empty {
		padding: 2.5rem 2rem;
		text-align: center;
		background: var(--muted);
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
	}

	p {
		font-size: 0.9rem;
		color: var(--muted-foreground);
	}

	.empty-action {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}
</style>
