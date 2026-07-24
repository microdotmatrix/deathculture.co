<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { deleteComment, togglePin, updateCommentBody } from '@/lib/comments-admin.remote';
	import { Badge, Button, Textarea } from '@/lib/components/ui';

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
			<Badge tone="primary">Member</Badge>
		{/if}
		<Badge tone={row.status === 'published' ? 'primary' : 'secondary'}>{row.status}</Badge>
		{#if row.pinned}
			<Badge tone="secondary">Pinned</Badge>
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
		<div class="edit-area">
			<Textarea rows={4} maxlength={5000} bind:value={draft} />
		</div>
	{:else}
		<p class="body">{row.body}</p>
	{/if}

	{#if errorMessage}
		<p class="error" role="alert">{errorMessage}</p>
	{/if}

	<div class="actions">
		{#if editing}
			<Button variant="secondary" size="sm" disabled={busy} onclick={saveEdit}>
				{busy ? 'Saving…' : 'Save'}
			</Button>
			<Button size="sm" disabled={busy} onclick={() => (editing = false)}>Cancel</Button>
		{:else}
			<Button size="sm" disabled={busy} onclick={startEditing}>Edit</Button>
			{#if !row.isReply}
				<Button size="sm" disabled={busy} onclick={() => run(() => togglePin(row.id))}>
					{row.pinned ? 'Unpin' : 'Pin'}
				</Button>
			{/if}
			<Button variant="danger" size="sm" disabled={busy} onclick={remove}>Delete</Button>
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
		margin-top: 0.5rem;
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
</style>
