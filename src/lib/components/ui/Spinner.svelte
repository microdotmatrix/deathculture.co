<script lang="ts">
	interface Props {
		/** Diameter in rem. */
		size?: number;
		/** Announced to assistive tech. */
		label?: string;
	}

	let { size = 1, label = 'Loading' }: Props = $props();
</script>

<span class="spinner" role="status" aria-label={label} style:--size="{size}rem"></span>

<style>
	.spinner {
		display: inline-block;
		flex-shrink: 0;
		width: var(--size);
		height: var(--size);
		border: 2px solid oklch(from currentColor l c h / 0.25);
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: 1.6s;
		}
	}
</style>
