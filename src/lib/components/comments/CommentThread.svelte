<script lang="ts">
	import { page } from '$app/state';
	import { togglePin } from '@/lib/comments-admin.remote';
	import { getCommentThread } from '@/lib/comments.remote';
	import CommentForm from '@/lib/components/comments/CommentForm.svelte';
	import CommentLikeButton from '@/lib/components/comments/CommentLikeButton.svelte';
	import type { CommentView } from '@/lib/types';

	interface Props {
		postId: string;
		commentsEnabled: boolean;
	}

	let { postId, commentsEnabled }: Props = $props();

	const thread = $derived(await getCommentThread(postId));
	const comments = $derived(thread.comments);
	const memberName = $derived(thread.memberName);
	const guestName = $derived(thread.guestName);
	const canComment = $derived(thread.canComment);
	const canLike = $derived(thread.canLike);

	/** The comment whose Reply button was clicked; replies attach to its thread. */
	let replying = $state<{ threadId: string; commentId: string; author: string } | null>(null);
	let pinBusy = $state(false);

	const isAdmin = $derived(page.data.user?.role === 'admin');

	async function refreshThread() {
		await getCommentThread(postId).refresh();
	}

	async function handleTogglePin(commentId: string) {
		if (pinBusy) return;
		pinBusy = true;
		try {
			await togglePin(commentId);
			await refreshThread();
		} finally {
			pinBusy = false;
		}
	}

	async function handlePublished() {
		replying = null;
		await refreshThread();
	}

	const canWrite = $derived(commentsEnabled && !(memberName !== null && !canComment));
	const totalCount = $derived(comments.reduce((count, item) => count + 1 + item.replies.length, 0));

	const dateFormat = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

{#snippet commentItem(item: CommentView, threadId: string)}
	<div class="comment-avatar" aria-hidden="true">
		{item.authorName.slice(0, 1).toUpperCase()}
	</div>
	<div class="comment-content">
		<p class="comment-meta">
			<span class="comment-author">{item.authorName}</span>
			{#if item.isMember}
				<span class="member-badge">Member</span>
			{/if}
			{#if item.pinned}
				<span class="pinned-badge">Pinned</span>
			{/if}
			<time datetime={item.createdAt.toISOString()}>
				{dateFormat.format(item.createdAt)}
			</time>
		</p>
		<p class="comment-body">{item.body}</p>
		<div class="comment-actions">
			<CommentLikeButton
				commentId={item.id}
				likeCount={item.likeCount}
				likedByMe={item.likedByMe}
				{canLike}
				onChanged={refreshThread}
			/>
			{#if canWrite}
				<button
					type="button"
					class="reply-btn"
					aria-expanded={replying?.commentId === item.id}
					onclick={() =>
						(replying =
							replying?.commentId === item.id
								? null
								: { threadId, commentId: item.id, author: item.authorName })}
				>
					Reply
				</button>
			{/if}
			{#if isAdmin && item.id === threadId}
				<button
					type="button"
					class="reply-btn"
					disabled={pinBusy}
					onclick={() => handleTogglePin(item.id)}
				>
					{item.pinned ? 'Unpin' : 'Pin'}
				</button>
			{/if}
		</div>
	</div>
{/snippet}

<h2 id="comments-heading">
	{totalCount === 0 ? 'No comments yet' : `${totalCount} comment${totalCount === 1 ? '' : 's'}`}
</h2>

{#if comments.length > 0}
	<ol class="comment-list">
		{#each comments as item (item.id)}
			<li class="comment-thread">
				<article class="comment" id={`comment-${item.id}`}>
					{@render commentItem(item, item.id)}
				</article>

				{#if item.replies.length > 0}
					<ol class="replies" aria-label={`Replies to ${item.authorName}`}>
						{#each item.replies as reply (reply.id)}
							<li>
								<article class="comment reply" id={`comment-${reply.id}`}>
									{@render commentItem(reply, item.id)}
								</article>
							</li>
						{/each}
					</ol>
				{/if}

				{#if replying?.threadId === item.id}
					<div class="reply-composer">
						<CommentForm
							{postId}
							{memberName}
							{guestName}
							parentId={item.id}
							replyingTo={replying.author}
							onDone={handlePublished}
						/>
					</div>
				{/if}
			</li>
		{/each}
	</ol>
{/if}

{#if !commentsEnabled}
	<p class="closed-notice" role="status">Comments are closed on this post.</p>
{:else if memberName && !canComment}
	<p class="closed-notice" role="status">You're currently not able to comment.</p>
{:else}
	<div class="comment-form-wrap">
		<CommentForm {postId} {memberName} {guestName} onDone={handlePublished} />
	</div>
{/if}

<style>
	#comments-heading {
		font-size: clamp(1.3rem, 1.1rem + 0.8vw, 1.7rem);
		color: var(--foreground);
		margin-bottom: 1.75rem;
	}

	.comment-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.closed-notice {
		padding: 0.9rem 1.25rem;
		font-size: 0.88rem;
		color: var(--muted-foreground);
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
	}

	.comment-thread {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.comment {
		display: flex;
		gap: 0.9rem;
		scroll-margin-top: 6rem;
	}

	.comment:target .comment-content {
		background: var(--secondary-50);
		outline: 1px solid var(--secondary-200);
	}

	.replies {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-left: clamp(1.6rem, 1rem + 3vw, 3.3rem);
		border-left: 1px solid var(--border);
		margin-left: 1.2rem;
	}

	.reply .comment-avatar {
		width: 2rem;
		height: 2rem;
		font-size: 0.78rem;
	}

	.reply-composer {
		padding-left: clamp(1.6rem, 1rem + 3vw, 3.3rem);
		margin-left: 1.2rem;
		border-left: 1px solid var(--secondary-300);
	}

	.comment-avatar {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 2.4rem;
		height: 2.4rem;
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--primary-100);
		background: var(--base-900);
		border-radius: 50%;
	}

	.comment-content {
		flex: 1;
		padding: 0.15rem 0.6rem 0.3rem;
		border-radius: var(--radius-md);
	}

	.comment-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem;
	}

	.comment-author {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--foreground);
	}

	.member-badge {
		padding: 0.1rem 0.5rem;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--primary-900);
		background: var(--primary-100);
		border-radius: 999px;
	}

	.pinned-badge {
		padding: 0.1rem 0.5rem;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--secondary-900);
		background: var(--secondary-100);
		border-radius: 999px;
	}

	.comment-meta time {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.comment-body {
		margin-top: 0.35rem;
		font-size: 0.92rem;
		line-height: 1.65;
		color: var(--foreground);
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	.comment-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.reply-btn {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		transition: color var(--duration-fast, 150ms) ease;
	}

	.reply-btn:hover,
	.reply-btn:focus-visible {
		color: var(--secondary-800);
	}
</style>
