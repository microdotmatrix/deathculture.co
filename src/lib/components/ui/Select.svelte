<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		value?: HTMLSelectAttributes['value'];
		/** `<option>` elements. */
		children: Snippet;
	}

	let { value = $bindable(), class: className, children, ...rest }: Props = $props();
</script>

<span class={['select-wrap', className]}>
	<select bind:value {...rest}>
		{@render children()}
	</select>
	<span class="chevron" aria-hidden="true"></span>
</span>

<style>
	.select-wrap {
		position: relative;
		display: inline-flex;
	}

	select {
		width: 100%;
		padding: 0.4rem 2.1rem 0.4rem 0.75rem;
		font-size: 0.85rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
		appearance: none;
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	select:focus {
		outline: none;
		border-color: var(--ring);
	}

	select[aria-invalid='true'] {
		border-color: var(--destructive);
	}

	select:disabled {
		cursor: not-allowed;
		background: var(--muted);
		opacity: 0.6;
	}

	.chevron {
		position: absolute;
		top: 50%;
		right: 0.85rem;
		width: 0.4rem;
		height: 0.4rem;
		color: var(--muted-foreground);
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: translateY(-70%) rotate(45deg);
		pointer-events: none;
	}
</style>
