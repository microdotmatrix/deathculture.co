<script lang="ts">
	import { submitComment } from '@/lib/comments.remote';

	interface Props {
		postId: string;
		/** Signed-in member name, when there is one. */
		memberName: string | null;
		/** Verified returning guest name, when the signed cookie is present. */
		guestName: string | null;
	}

	let { postId, memberName, guestName }: Props = $props();

	const identified = $derived(Boolean(memberName || guestName));
	const pending = $derived(submitComment.result?.status === 'pending');
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
	<form class="comment-form" {...submitComment}>
		<input {...submitComment.fields.postId.as('hidden', postId)} />

		<!-- Honeypot: hidden from humans, tempting to bots. -->
		<div class="hp" aria-hidden="true">
			<label>
				Website
				<input {...submitComment.fields.website.as('text')} tabindex="-1" autocomplete="off" />
			</label>
		</div>

		{#if identified}
			<p class="signed-in-as">
				Commenting as <strong>{memberName ?? guestName}</strong>
			</p>
		{:else}
			<div class="guest-fields">
				<div class="guest-field">
					{#each submitComment.fields.name.issues() ?? [] as issue (issue.message)}
						<p class="issue">{issue.message}</p>
					{/each}
					<input
						{...submitComment.fields.name.as('text')}
						placeholder="Your name"
						autocomplete="name"
						maxlength="100"
					/>
				</div>
				<div class="guest-field">
					{#each submitComment.fields.email.issues() ?? [] as issue (issue.message)}
						<p class="issue">{issue.message}</p>
					{/each}
					<input
						{...submitComment.fields.email.as('text')}
						placeholder="Email (never shown)"
						autocomplete="email"
						inputmode="email"
						maxlength="200"
					/>
				</div>
			</div>
		{/if}

		{#each submitComment.fields.body.issues() ?? [] as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
		<textarea
			{...submitComment.fields.body.as('text')}
			rows="4"
			maxlength="5000"
			placeholder="Join the conversation…"></textarea>

		<div class="form-footer">
			{#if !identified}
				<p class="hint">First comment? We'll email you a link to confirm you're human.</p>
			{:else}
				<span></span>
			{/if}
			<button type="submit" disabled={!!submitComment.pending}>
				{submitComment.pending ? 'Sending…' : 'Post comment'}
			</button>
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
