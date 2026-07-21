<script lang="ts">
	import { submitComment } from '@/lib/comments.remote';

	interface Props {
		postId: string;
		/** Signed-in member name, when there is one. */
		memberName: string | null;
		/** Verified returning guest name, when the signed cookie is present. */
		guestName: string | null;
		/** Top-level comment being replied to; absent for the main composer. */
		parentId?: string;
		/** Author name of the comment being replied to, for the placeholder. */
		replyingTo?: string;
		/** Called when a reply publishes, so the composer can close. */
		onDone?: () => void;
	}

	let { postId, memberName, guestName, parentId, replyingTo, onDone }: Props = $props();

	// Reply composers get isolated form state so they don't share issues,
	// results, or pending state with the main composer or each other.
	const commentForm = $derived(parentId ? submitComment.for(parentId) : submitComment);

	const identified = $derived(Boolean(memberName || guestName));
	const pending = $derived(commentForm.result?.status === 'pending');

	$effect(() => {
		if (commentForm.result?.status === 'published') onDone?.();
	});
</script>

{#if pending}
	<div class="pending-notice" role="status">
		<h3>One more step</h3>
		<p>
			We sent a confirmation link to your email. Open it to publish your comment — after that you
			can comment here freely.
		</p>
	</div>
{:else}
	<form class="comment-form" {...commentForm}>
		<input {...commentForm.fields.postId.as('hidden', postId)} />
		{#if parentId}
			<input {...commentForm.fields.parentId.as('hidden', parentId)} />
		{/if}

		<!-- Honeypot: hidden from humans, tempting to bots. -->
		<div class="hp" aria-hidden="true">
			<label>
				Website
				<input {...commentForm.fields.website.as('text')} tabindex="-1" autocomplete="off" />
			</label>
		</div>

		{#if identified}
			<p class="signed-in-as">
				Commenting as <strong>{memberName ?? guestName}</strong>
			</p>
		{:else}
			<div class="guest-fields">
				<div class="guest-field">
					{#each commentForm.fields.name.issues() ?? [] as issue (issue.message)}
						<p class="issue">{issue.message}</p>
					{/each}
					<input
						{...commentForm.fields.name.as('text')}
						placeholder="Your name"
						autocomplete="name"
						maxlength="100"
					/>
				</div>
				<div class="guest-field">
					{#each commentForm.fields.email.issues() ?? [] as issue (issue.message)}
						<p class="issue">{issue.message}</p>
					{/each}
					<input
						{...commentForm.fields.email.as('text')}
						placeholder="Email (never shown)"
						autocomplete="email"
						inputmode="email"
						maxlength="200"
					/>
				</div>
			</div>
		{/if}

		{#each commentForm.fields.body.issues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
		<textarea
			{...commentForm.fields.body.as('text')}
			rows="4"
			maxlength="5000"
			placeholder={replyingTo ? `Reply to ${replyingTo}…` : 'Join the conversation…'}></textarea>

		<div class="form-footer">
			{#if !identified}
				<p class="hint">First comment? We'll email you a link to confirm you're human.</p>
			{:else}
				<span></span>
			{/if}
			<div class="form-buttons">
				{#if onDone}
					<button type="button" class="cancel-btn" onclick={onDone}>Cancel</button>
				{/if}
				<button type="submit" disabled={!!commentForm.pending}>
					{commentForm.pending ? 'Sending…' : parentId ? 'Post reply' : 'Post comment'}
				</button>
			</div>
		</div>
	</form>
{/if}

<style>
	.pending-notice {
		padding: 1.5rem;
		border: 1px solid var(--secondary-200);
		border-radius: var(--radius-lg);
		background: var(--secondary-50);
	}

	.pending-notice h3 {
		font-size: 0.95rem;
		color: var(--secondary-900);
	}

	.pending-notice p {
		margin-top: 0.4rem;
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--secondary-800);
	}

	.comment-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.signed-in-as {
		font-size: 0.82rem;
		color: var(--muted-foreground);
	}

	.signed-in-as strong {
		color: var(--foreground);
	}

	.guest-fields {
		display: grid;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.guest-fields {
			grid-template-columns: 1fr 1fr;
		}
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.6rem 0.85rem;
		font-size: 0.9rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
	}

	input[type='text']:focus,
	textarea:focus {
		outline: 1px solid var(--ring);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--base-400);
	}

	textarea {
		resize: vertical;
	}

	.issue {
		font-size: 0.78rem;
		color: var(--destructive);
	}

	.form-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.hint {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.form-buttons {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
	}

	.cancel-btn {
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		color: var(--muted-foreground);
		border: 1px solid var(--border);
		border-radius: 999px;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.cancel-btn:hover,
	.cancel-btn:focus-visible {
		border-color: var(--secondary);
		color: var(--secondary-800);
	}

	button[type='submit'] {
		flex-shrink: 0;
		padding: 0.5rem 1.25rem;
		font-size: 0.85rem;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	button[type='submit']:hover:not(:disabled),
	button[type='submit']:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	button[type='submit']:disabled {
		opacity: 0.6;
	}
</style>
