<script lang="ts">
	import { page } from '$app/state';
	import CommentThread from '@/lib/components/comments/CommentThread.svelte';
	import CommentThreadSkeleton from '@/lib/components/comments/CommentThreadSkeleton.svelte';

	interface Props {
		postId: string;
		commentsEnabled: boolean;
	}

	let { postId, commentsEnabled }: Props = $props();

	const expiredVerifyLink = $derived(page.url.searchParams.get('comment') === 'expired');
	const disabledVerifyLink = $derived(page.url.searchParams.get('comment') === 'disabled');
</script>

<section id="comments" class="comments" aria-labelledby="comments-heading">
	<header class="comments-header">
		<p class="kicker">Conversation</p>
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

	<svelte:boundary>
		{#snippet pending()}
			<h2 id="comments-heading">Comments</h2>
			<CommentThreadSkeleton />
		{/snippet}

		<CommentThread {postId} {commentsEnabled} />
	</svelte:boundary>
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

	.notice {
		margin-bottom: 1.5rem;
		padding: 0.9rem 1.25rem;
		font-size: 0.88rem;
		color: var(--secondary-900);
		background: var(--secondary-50);
		border: 1px solid var(--secondary-200);
		border-radius: var(--radius-md);
	}
</style>
