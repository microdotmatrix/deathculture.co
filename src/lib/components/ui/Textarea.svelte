<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		value?: HTMLTextareaAttributes['value'];
	}

	let { value = $bindable(), class: className, ...rest }: Props = $props();
</script>

<textarea class={['textarea', className]} bind:value {...rest}></textarea>

<style>
	.textarea {
		width: 100%;
		min-height: 5.5rem;
		padding: 0.6rem 0.85rem;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
		resize: vertical;
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	.textarea::placeholder {
		color: var(--base-400);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--ring);
	}

	.textarea[aria-invalid='true'] {
		border-color: var(--destructive);
	}

	.textarea:disabled {
		cursor: not-allowed;
		background: var(--muted);
		opacity: 0.6;
	}
</style>
