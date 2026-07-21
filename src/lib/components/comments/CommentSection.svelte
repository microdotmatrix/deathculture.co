<script lang="ts">
	import { page } from '$app/state';
	import CommentForm from '@/lib/components/comments/CommentForm.svelte';
	import type { CommentView } from '@/lib/types';

	interface Props {
		postId: string;
		comments: CommentView[];
		memberName: string | null;
		guestName: string | null;
		commentsEnabled: boolean;
		/** False when an admin has switched off commenting for this member. */
		canComment: boolean;
	}

	let { postId, comments, memberName, guestName, commentsEnabled, canComment }: Props = $props();

	const expiredVerifyLink = $derived(page.url.searchParams.get('comment') === 'expired');
	const disabledVerifyLink = $derived(page.url.searchParams.get('comment') === 'disabled');

	const dateFormat = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<section id="comments" class="comments" aria-labelledby="comments-heading">
	<header class="comments-header">
		<p class="kicker">Conversation</p>
		<h2 id="comments-heading">
			{comments.length === 0
				? 'No comments yet'
				: `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
		</h2>
	</header>

	{#if expiredVerifyLink}
		<p class="notice" role="alert">
			That confirmation link expired. Submit your comment again and we'll send a fresh one.
		</p>
	{/if}

	{#if disabledVerifyLink}
		<p class="notice" role="alert">
			Comments were closed on this post before your confirmation arrived, so your comment wasn't
			published.
		</p>
	{/if}

	{#if comments.length > 0}
		<ol class="comment-list">
			{#each comments as item (item.id)}
				<li class="comment" id={`comment-${item.id}`}>
					<div class="comment-avatar" aria-hidden="true">
						{item.authorName.slice(0, 1).toUpperCase()}
					</div>
					<div class="comment-content">
						<p class="comment-meta">
							<span class="comment-author">{item.authorName}</span>
							{#if item.isMember}
								<span class="member-badge">Member</span>
							{/if}
							<time datetime={item.createdAt.toISOString()}>
								{dateFormat.format(item.createdAt)}
							</time>
						</p>
						<p class="comment-body">{item.body}</p>
					</div>
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
			<CommentForm {postId} {memberName} {guestName} />
		</div>
	{/if}
</section>

<style>
	.comments {
		padding-top: clamp(2.5rem, 2rem + 2vw, 4rem);
		margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
		border-top: 1px dashed var(--border);
	}

	.comments-header {
		margin-bottom: 1.75rem;
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
		margin-bottom: 0.5rem;
	}

	.comments-header h2 {
		font-size: clamp(1.3rem, 1.1rem + 0.8vw, 1.7rem);
		color: var(--foreground);
	}

	.notice {
		margin-bottom: 1.5rem;
		padding: 0.9rem 1.25rem;
		font-size: 0.88rem;
		color: var(--secondary-900);
		background: var(--secondary-50);
		border: 1px solid var(--secondary-200);
		border-radius: var(--radius-md);
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

	.comment {
		display: flex;
		gap: 0.9rem;
		scroll-margin-top: 6rem;
	}

	.comment:target .comment-content {
		background: var(--secondary-50);
		outline: 1px solid var(--secondary-200);
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
</style>
