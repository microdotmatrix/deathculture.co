<script lang="ts">
	let { size = 36 }: { size?: number } = $props();
</script>

<svg
	class="logo-mark"
	width={size}
	height={size}
	viewBox="0 0 36 36"
	fill="none"
	aria-hidden="true"
>
	<rect x="0.5" y="0.5" width="35" height="35" rx="8" />
	<path class="stone" d="M18 7c-4.4 0-7 3.2-7 7.6V28h14V14.6C25 10.2 22.4 7 18 7Z" />
	<path class="cross" d="M18 12v9M14.5 15.5h7" />
</svg>

<style>
	.logo-mark rect {
		fill: var(--base-950);
		stroke: color-mix(in oklch, var(--base-50) 25%, transparent);
	}

	.logo-mark .stone {
		fill: none;
		stroke: var(--primary-300);
		stroke-width: 1.5;
	}

	.logo-mark .cross {
		stroke: var(--secondary-500);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
</style>
