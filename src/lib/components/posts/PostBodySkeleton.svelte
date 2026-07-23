<div class="body-skeleton" aria-busy="true" aria-live="polite" role="status">
	<span class="sr-only">Loading article…</span>
	<div class="line w-full"></div>
	<div class="line w-11/12"></div>
	<div class="line w-4/5"></div>
	<div class="line w-full"></div>
	<div class="line w-2/3"></div>
	<div class="block"></div>
	<div class="line w-full"></div>
	<div class="line w-5/6"></div>
	<div class="line w-3/4"></div>
</div>

<style>
	.body-skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-block: 0.25rem 1rem;
	}

	.line,
	.block {
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--muted) 80%, transparent);
	}

	.line {
		height: 0.85rem;
	}

	.block {
		height: 6rem;
		margin-block: 0.5rem;
	}

	.w-full {
		width: 100%;
	}
	.w-11\/12 {
		width: 91%;
	}
	.w-4\/5 {
		width: 80%;
	}
	.w-2\/3 {
		width: 66%;
	}
	.w-5\/6 {
		width: 83%;
	}
	.w-3\/4 {
		width: 75%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
