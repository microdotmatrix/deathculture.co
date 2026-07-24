<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CommentModerationRow from '@/lib/components/dashboard/CommentModerationRow.svelte';
	import { EmptyState, Field, Select } from '@/lib/components/ui';
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
	<Field label="Status" orientation="inline">
		<Select
			value={data.filters.status}
			onchange={(event) => applyFilter('status', event.currentTarget.value)}
		>
			<option value="all">All</option>
			<option value="published">Published</option>
			<option value="pending">Pending</option>
		</Select>
	</Field>

	<Field label="Post" orientation="inline">
		<Select
			value={data.filters.postId}
			onchange={(event) => applyFilter('post', event.currentTarget.value)}
		>
			<option value="">All posts</option>
			{#each data.posts as item (item.id)}
				<option value={item.id}>{item.title}</option>
			{/each}
		</Select>
	</Field>
</div>

{#if data.comments.length === 0}
	<div class="empty-wrap">
		<EmptyState>No comments match these filters.</EmptyState>
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

	.empty-wrap {
		margin-top: 1.5rem;
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
