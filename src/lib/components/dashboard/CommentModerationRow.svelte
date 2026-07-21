<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deleteComment, togglePin, updateCommentBody } from '@/lib/comments-admin.remote';

	interface ModerationComment {
		id: string;
		postTitle: string;
		postSlug: string;
		authorName: string;
		isMember: boolean;
		status: 'pending' | 'published';
		pinned: boolean;
		isReply: boolean;
		parentSnippet: string | null;
		body: string;
		createdAt: Date;
	}

	interface Props {
		row: ModerationComment;
	}

	let { row }: Props = $props();

	let editing = $state(false);
	let draft = $state('');
	let busy = $state(false);
	let errorMessage = $state('');

	const dateFormat = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	async function run(action: () => Promise<unknown>) {
		if (busy) return;
		busy = true;
		errorMessage = '';

		try {
			await action();
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Something went wrong';
		} finally {
			busy = false;
		}
	}

	function startEditing() {
		draft = row.body;
		editing = true;
	}

	async function saveEdit() {
		await run(() => updateCommentBody({ id: row.id, body: draft }));
		if (!errorMessage) editing = false;
	}

	async function remove() {
		const message = row.isReply
			? 'Delete this reply permanently?'
			: 'Delete this comment and all its replies permanently?';
		if (!confirm(message)) return;
		await run(() => deleteComment(row.id));
	}
</script>

<article class="mod-row">
	<header class="mod-meta">
		<span class="author">{row.authorName}</span>
		{#if row.isMember}
			<span class="badge member">Member</span>
		{/if}
		<span class={['badge', row.status]}>{row.status}</span>
		{#if row.pinned}
			<span class="badge pinned">Pinned</span>
		{/if}
		<time datetime={row.createdAt.toISOString()}>{dateFormat.format(row.createdAt)}</time>
		<a class="post-link" href={`/posts/${row.postSlug}`} target="_blank" rel="noopener">
			{row.postTitle}
		</a>
	</header>

	{#if row.isReply && row.parentSnippet}
		<p class="parent-snippet">Reply to: “{row.parentSnippet}…”</p>
	{/if}

	{#if editing}
		<textarea class="edit-area" rows="4" maxlength="5000" bind:value={draft}></textarea>
	{:else}
		<p class="body">{row.body}</p>
	{/if}

	{#if errorMessage}
		<p class="error" role="alert">{errorMessage}</p>
	{/if}

	<div class="actions">
		{#if editing}
			<button type="button" class="action primary" disabled={busy} onclick={saveEdit}>
				{busy ? 'Saving…' : 'Save'}
			</button>
			<button type="button" class="action" disabled={busy} onclick={() => (editing = false)}>
				Cancel
			</button>
		{:else}
			<button type="button" class="action" disabled={busy} onclick={startEditing}>Edit</button>
			{#if !row.isReply}
				<button
					type="button"
					class="action"
					disabled={busy}
					onclick={() => run(() => togglePin(row.id))}
				>
					{row.pinned ? 'Unpin' : 'Pin'}
				</button>
			{/if}
			<button type="button" class="action danger" disabled={busy} onclick={remove}>Delete</button>
		{/if}
	</div>
</article>

<style>
	.mod-row {
		padding: 1rem 1.25rem;
	}

	.mod-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem;
	}

	.author {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--foreground);
	}

	.badge {
		padding: 0.1rem 0.5rem;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-radius: 999px;
	}

	.badge.member {
		color: var(--primary-900);
		background: var(--primary-100);
	}

	.badge.published {
		color: var(--primary-900);
		background: var(--primary-100);
	}

	.badge.pending {
		color: var(--secondary-900);
		background: var(--secondary-100);
	}

	.badge.pinned {
		color: var(--secondary-900);
		background: var(--secondary-100);
	}

	.mod-meta time {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.post-link {
		margin-left: auto;
		font-size: 0.75rem;
		color: var(--secondary-800);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.parent-snippet {
		margin-top: 0.4rem;
		font-size: 0.75rem;
		font-style: italic;
		color: var(--muted-foreground);
	}

	.body {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--foreground);
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	.edit-area {
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.6rem 0.85rem;
		font-size: 0.9rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
		resize: vertical;
	}

	.edit-area:focus {
		outline: 1px solid var(--ring);
	}

	.error {
		margin-top: 0.5rem;
		font-size: 0.78rem;
		color: var(--destructive);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.action {
		padding: 0.3rem 0.85rem;
		font-size: 0.78rem;
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 999px;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease,
			background-color var(--duration-fast, 150ms) ease;
	}

	.action:hover:not(:disabled),
	.action:focus-visible {
		border-color: var(--secondary);
		color: var(--secondary-800);
	}

	.action.primary {
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-color: var(--secondary);
	}

	.action.primary:hover:not(:disabled),
	.action.primary:focus-visible {
		background: var(--secondary-600);
		color: var(--secondary-foreground);
	}

	.action.danger {
		color: var(--destructive);
		border-color: oklch(from var(--destructive) l c h / 0.4);
	}

	.action.danger:hover:not(:disabled),
	.action.danger:focus-visible {
		background: oklch(from var(--destructive) l c h / 0.08);
		color: var(--destructive);
		border-color: oklch(from var(--destructive) l c h / 0.4);
	}

	.action:disabled {
		opacity: 0.6;
	}
</style>
