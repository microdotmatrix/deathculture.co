<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: HTMLInputAttributes['value'];
		/** Compact padding for dense surfaces like table rows and toolbars. */
		dense?: boolean;
	}

	let { value = $bindable(), dense = false, class: className, ...rest }: Props = $props();
</script>

<input class={['input', dense && 'dense', className]} bind:value {...rest} />

<style>
	.input {
		width: 100%;
		padding: 0.6rem 0.85rem;
		font-size: 0.9rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	.input.dense {
		padding: 0.35rem 0.6rem;
		font-size: 0.88rem;
	}

	.input::placeholder {
		color: var(--base-400);
	}

	.input:focus {
		outline: none;
		border-color: var(--ring);
	}

	.input[aria-invalid='true'] {
		border-color: var(--destructive);
	}

	.input:disabled {
		cursor: not-allowed;
		background: var(--muted);
		opacity: 0.6;
	}
</style>
