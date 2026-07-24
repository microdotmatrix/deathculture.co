<script lang="ts">
	interface Props {
		checked?: boolean;
		label: string;
		/** Keeps the label for assistive tech but hides it visually. */
		hideLabel?: boolean;
		disabled?: boolean;
		/** Form participation when used inside a plain `<form>`. */
		name?: string;
		value?: string;
		onchange?: (next: boolean) => void;
	}

	let {
		checked = $bindable(false),
		label,
		hideLabel = false,
		disabled = false,
		name,
		value,
		onchange
	}: Props = $props();
</script>

<label class={['checkbox', disabled && 'disabled']}>
	<input
		type="checkbox"
		{name}
		{value}
		{disabled}
		bind:checked
		onchange={(event) => onchange?.(event.currentTarget.checked)}
	/>
	<span class="box" aria-hidden="true">
		<svg viewBox="0 0 12 12">
			<path d="M2.5 6.5 5 9l4.5-6" />
		</svg>
	</span>
	<span class={['checkbox-label', hideLabel && 'sr-only']}>{label}</span>
</label>

<style>
	.checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		user-select: none;
	}

	.checkbox.disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	.box {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-sm);
		transition:
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	svg {
		width: 0.75rem;
		height: 0.75rem;
		fill: none;
		stroke: var(--secondary-foreground);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0;
		transform: scale(0.6);
		transition:
			opacity var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) var(--ease-out-expo, ease);
	}

	input:checked + .box {
		background: var(--secondary);
		border-color: var(--secondary);
	}

	input:checked + .box svg {
		opacity: 1;
		transform: scale(1);
	}

	input:focus-visible + .box {
		outline: 1px solid var(--ring);
		outline-offset: 2px;
	}

	.checkbox-label {
		font-size: 0.85rem;
		color: var(--foreground);
	}

	.checkbox-label.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
