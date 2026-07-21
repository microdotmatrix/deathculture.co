<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toggleCommentLike } from '@/lib/comments.remote';

	const HINT_TIMEOUT_MS = 3000;

	interface Props {
		commentId: string;
		likeCount: number;
		likedByMe: boolean;
		/** False for anonymous visitors — clicking shows a hint instead. */
		canLike: boolean;
	}

	let { commentId, likeCount, likedByMe, canLike }: Props = $props();

	let busy = $state(false);
	let showHint = $state(false);

	async function handleClick() {
		if (!canLike) {
			showHint = true;
			setTimeout(() => (showHint = false), HINT_TIMEOUT_MS);
			return;
		}
		if (busy) return;

		busy = true;
		try {
			await toggleCommentLike({ commentId });
			await invalidateAll();
		} finally {
			busy = false;
		}
	}
</script>

<span class="like-wrap">
	<button
		type="button"
		class={['like-btn', likedByMe && 'liked']}
		aria-pressed={likedByMe}
		aria-label={likedByMe ? 'Unlike this comment' : 'Like this comment'}
		aria-disabled={!canLike || busy}
		onclick={handleClick}
	>
		<span class="heart" aria-hidden="true">{likedByMe ? '♥' : '♡'}</span>
		{likeCount}
	</button>
	{#if showHint}
		<span class="like-hint" role="status">Sign in or verify your email to like comments.</span>
	{/if}
</span>

<style>
	.like-wrap {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		color: var(--muted-foreground);
		transition: color var(--duration-fast, 150ms) ease;
	}

	.like-btn:hover,
	.like-btn:focus-visible {
		color: var(--secondary-800);
	}

	.like-btn.liked {
		color: var(--secondary-700);
	}

	.heart {
		font-size: 0.95rem;
		line-height: 1;
	}

	.like-hint {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}
</style>
