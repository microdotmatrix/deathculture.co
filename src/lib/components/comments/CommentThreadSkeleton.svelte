<div class="thread-skeleton" aria-busy="true" aria-live="polite" role="status">
	<span class="sr-only">Loading comments…</span>
	{#each [0, 1, 2] as i (i)}
		<div class="row">
			<div class="avatar"></div>
			<div class="copy">
				<div class="line short"></div>
				<div class="line"></div>
				<div class="line mid"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.thread-skeleton {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.row {
		display: flex;
		gap: 0.9rem;
	}

	.avatar {
		width: 2.4rem;
		height: 2.4rem;
		flex-shrink: 0;
		border-radius: 50%;
		background: color-mix(in oklch, var(--muted) 80%, transparent);
	}

	.copy {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.line {
		height: 0.7rem;
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--muted) 80%, transparent);
		width: 100%;
	}

	.line.short {
		width: 30%;
	}

	.line.mid {
		width: 70%;
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
