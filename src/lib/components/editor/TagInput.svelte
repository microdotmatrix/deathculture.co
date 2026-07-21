<script lang="ts">
	const MAX_TAGS = 10;

	let { tags = $bindable() }: { tags: string[] } = $props();

	let draft = $state('');

	function addDraft() {
		const value = draft.trim().replace(/,+$/, '');
		draft = '';

		if (!value || tags.length >= MAX_TAGS) return;
		if (tags.some((existing) => existing.toLowerCase() === value.toLowerCase())) return;

		tags = [...tags, value];
	}

	function removeTag(value: string) {
		tags = tags.filter((existing) => existing !== value);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			addDraft();
		} else if (event.key === 'Backspace' && !draft && tags.length > 0) {
			tags = tags.slice(0, -1);
		}
	}
</script>

<div class="tag-input">
	{#each tags as tagName (tagName)}
		<span class="chip">
			{tagName}
			<button
				type="button"
				class="chip-remove hit-area-extend"
				aria-label={`Remove tag ${tagName}`}
				onclick={() => removeTag(tagName)}>&times;</button
			>
		</span>
	{/each}

	{#if tags.length < MAX_TAGS}
		<input
			type="text"
			placeholder={tags.length ? 'Add another…' : 'Add a tag…'}
			bind:value={draft}
			onkeydown={onKeydown}
			onblur={addDraft}
		/>
	{/if}
</div>

<style>
	.tag-input {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.45rem;
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
		background: var(--background);
	}

	.tag-input:focus-within {
		outline: 1px solid var(--ring);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.4rem 0.2rem 0.65rem;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		color: var(--secondary-900);
		background: var(--secondary-100);
		border-radius: 999px;
	}

	.chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		font-size: 0.8rem;
		line-height: 1;
		color: var(--secondary-800);
		border-radius: 50%;
		transition: background-color var(--duration-fast, 150ms) ease;
	}

	.chip-remove:hover,
	.chip-remove:focus-visible {
		background: var(--secondary-200);
	}

	.tag-input input {
		flex: 1;
		min-width: 7rem;
		padding: 0.2rem 0.3rem;
		font-size: 0.85rem;
		color: var(--foreground);
		background: transparent;
		outline: none;
	}

	.tag-input input::placeholder {
		color: var(--base-400);
	}
</style>
