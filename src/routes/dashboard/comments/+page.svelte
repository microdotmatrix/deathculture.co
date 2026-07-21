<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CommentModerationRow from '@/lib/components/dashboard/CommentModerationRow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function applyFilter(key: 'status' | 'post', value: string) {
		const params = new URLSearchParams(page.url.searchParams.toString());
		if (value && value !== 'all') {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		goto(`/dashboard/comments${params.size ? `?${params}` : ''}`, {
			keepFocus: true,
			noScroll: true
		});
	}
</script>

<svelte:head>
	<title>Comments — Studio — DeathCulture.co</title>
</svelte:head>

<p class="kicker">Moderation</p>
<h1>Comments</h1>

<div class="filters">
	<label>
		<span class="filter-label">Status</span>
		<select
			value={data.filters.status}
			onchange={(event) => applyFilter('status', event.currentTarget.value)}
		>
			<option value="all">All</option>
			<option value="published">Published</option>
			<option value="pending">Pending</option>
		</select>
	</label>

	<label>
		<span class="filter-label">Post</span>
		<select
			value={data.filters.postId}
			onchange={(event) => applyFilter('post', event.currentTarget.value)}
		>
			<option value="">All posts</option>
			{#each data.posts as item (item.id)}
				<option value={item.id}>{item.title}</option>
			{/each}
		</select>
	</label>
</div>

{#if data.comments.length === 0}
	<div class="empty">
		<p>No comments match these filters.</p>
	</div>
{:else}
	<ul class="mod-list">
		{#each data.comments as row (row.id)}
			<li><CommentModerationRow {row} /></li>
		{/each}
	</ul>
{/if}

<style>
	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	h1 {
		margin-top: 0.5rem;
		font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.6rem);
		color: var(--foreground);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 2rem;
	}

	.filters label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-label {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	.filters select {
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
	}

	.filters select:focus {
		outline: 1px solid var(--ring);
	}

	.empty {
		margin-top: 1.5rem;
		padding: 2.5rem 2rem;
		text-align: center;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--muted);
	}

	.empty p {
		font-size: 0.9rem;
		color: var(--muted-foreground);
	}

	.mod-list {
		margin-top: 1.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: clip;
	}

	.mod-list li + li {
		border-top: 1px solid var(--border);
	}
</style>
