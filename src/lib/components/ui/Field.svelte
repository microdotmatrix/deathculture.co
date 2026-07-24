<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Issue {
		message: string;
	}

	interface Props {
		label: string;
		/** Keeps the label for assistive tech but hides it visually. */
		hideLabel?: boolean;
		hint?: string;
		/** Validation issues, shaped like remote-function `fields.x.issues()`. */
		issues?: Issue[];
		/** `stack` for forms; `inline` for toolbar-style filter controls. */
		orientation?: 'stack' | 'inline';
		children: Snippet;
	}

	let {
		label,
		hideLabel = false,
		hint,
		issues = [],
		orientation = 'stack',
		children
	}: Props = $props();
</script>

<label class={['field', orientation]}>
	<span class={['field-label', hideLabel && 'sr-only']}>{label}</span>
	{@render children()}
	{#if hint}
		<span class="hint">{hint}</span>
	{/if}
	{#each issues as issue (issue.message)}
		<small role="alert">{issue.message}</small>
	{/each}
</label>

<style>
	.field {
		display: flex;
	}

	.field.stack {
		flex-direction: column;
		gap: 0.35rem;
	}

	.field.inline {
		align-items: center;
		gap: 0.5rem;
	}

	.field-label {
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--base-600);
	}

	/* Inline fields read as controls, so they get the display-font kicker treatment. */
	.inline .field-label {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		color: var(--secondary-700);
	}

	.field-label.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.hint {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	small {
		font-size: 0.78rem;
		color: var(--destructive);
	}
</style>
