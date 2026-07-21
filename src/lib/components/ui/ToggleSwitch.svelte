<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		disabled?: boolean;
		onchange: (next: boolean) => void;
	}

	let { checked, label, disabled = false, onchange }: Props = $props();
</script>

<label class={['toggle-switch', disabled && 'disabled']}>
	<input
		type="checkbox"
		role="switch"
		{checked}
		{disabled}
		onchange={(event) => onchange(event.currentTarget.checked)}
	/>
	<span class="track" aria-hidden="true"><span class="thumb"></span></span>
	<span class="toggle-label">{label}</span>
</label>

<style>
	.toggle-switch {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		user-select: none;
	}

	.toggle-switch.disabled {
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

	.track {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		width: 2.35rem;
		height: 1.3rem;
		padding: 0.15rem;
		background: var(--border);
		border-radius: 999px;
		transition: background-color var(--duration-fast, 150ms) ease;
	}

	.thumb {
		width: 1rem;
		height: 1rem;
		background: var(--background);
		border-radius: 50%;
		box-shadow: 0 1px 2px oklch(from var(--base-950) l c h / 0.25);
		transition: transform var(--duration-fast, 150ms) var(--ease-out-expo, ease);
	}

	input:checked + .track {
		background: var(--secondary);
	}

	input:checked + .track .thumb {
		transform: translateX(1.05rem);
	}

	input:focus-visible + .track {
		outline: 1px solid var(--ring);
		outline-offset: 2px;
	}

	.toggle-label {
		font-size: 0.85rem;
		color: var(--foreground);
	}
</style>
