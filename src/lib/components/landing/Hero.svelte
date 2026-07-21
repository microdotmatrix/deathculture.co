<script lang="ts">
	import { subscribe } from '@/lib/newsletter.remote';
</script>

<section class="hero" aria-labelledby="hero-heading">
	<img
		class="hero-image"
		src="https://picsum.photos/seed/deathculture-hero/1920/1280?grayscale"
		alt=""
		width="1920"
		height="1280"
		loading="eager"
		fetchpriority="high"
	/>
	<div class="scrim" aria-hidden="true"></div>

	<div class="mx-auto flex min-h-svh w-full max-w-6xl items-center px-5 sm:px-8">
		<div class="content">
			<p class="kicker reveal" style:--stagger="0">Memento mori</p>
			<h1 id="hero-heading" class="reveal" style:--stagger="1">
				Welcome to<br />DeathCulture.co
			</h1>
			<p class="lede reveal" style:--stagger="2">
				Subscribe below to receive updates about our latest posts, and new episodes of our upcoming
				podcast: <em>DeathChat</em>.
			</p>

			<div class="reveal" style:--stagger="3">
				{#if subscribe.result?.success}
					<p class="confirmation" role="status">
						You're on the list — we'll write to <strong>{subscribe.result.email}</strong> soon.
					</p>
				{:else}
					<form id="subscribe" {...subscribe} class="subscribe-form">
						<label class="sr-only" for="hero-email">Email address</label>
						<input
							id="hero-email"
							{...subscribe.fields.email.as('email')}
							placeholder="james@example.com"
							autocomplete="email"
						/>
						<button
							disabled={!!subscribe.pending}
							type="submit"
							aria-label="Subscribe to our newsletter"
						>
							{subscribe.pending ? 'Subscribing…' : 'Subscribe'}
						</button>
					</form>
					{#each subscribe.fields.email.issues() ?? [] as issue (issue.message)}
						<p class="issue" role="alert">{issue.message}</p>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<div class="scroll-hint" aria-hidden="true">
		<span>Scroll</span>
		<i></i>
	</div>
</section>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		background: var(--base-1000);
		color: var(--base-100);
		overflow: clip;
	}

	.hero-image {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Duotone treatment: keeps any photograph on-theme */
		filter: grayscale(1) contrast(1.05) brightness(0.9);
	}

	.scrim {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(
				105deg,
				oklch(from var(--base-1000) l c h / 0.82) 0%,
				oklch(from var(--base-1000) l c h / 0.45) 45%,
				oklch(from var(--primary-950) l c h / 0.35) 100%
			),
			linear-gradient(to top, oklch(from var(--base-1000) l c h / 1), transparent 45%);
	}

	.content {
		max-width: 34rem;
		padding-block: clamp(7rem, 16vh, 10rem);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-400);
		margin-bottom: 1.25rem;
	}

	h1 {
		font-size: clamp(1.8rem, 0.9rem + 3.9vw, 4rem);
		line-height: 1.08;
		color: var(--base-50);
		text-wrap: balance;
	}

	.lede {
		margin-top: 1.25rem;
		max-width: 26rem;
		font-size: clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem);
		line-height: 1.6;
		color: var(--base-300);
	}

	.lede em {
		font-style: normal;
		color: var(--primary-300);
	}

	.subscribe-form {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 2rem;
		max-width: 24rem;
		padding: 0.3rem 0.3rem 0.3rem 1.1rem;
		background: oklch(from var(--base-50) l c h / 0.08);
		border: 1px solid oklch(from var(--base-50) l c h / 0.2);
		border-radius: 999px;
		backdrop-filter: blur(8px);
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	.subscribe-form:focus-within {
		border-color: var(--secondary-500);
	}

	.subscribe-form input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.9rem;
		color: var(--base-100);
	}

	.subscribe-form input::placeholder {
		color: var(--base-500);
	}

	.subscribe-form button {
		flex-shrink: 0;
		padding: 0.55rem 1.35rem;
		font-size: 0.85rem;
		letter-spacing: 0.02em;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.subscribe-form button:hover:not(:disabled),
	.subscribe-form button:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	.subscribe-form button:disabled {
		opacity: 0.7;
	}

	.issue {
		margin-top: 0.6rem;
		padding-left: 1.1rem;
		font-size: 0.8rem;
		color: var(--secondary-300);
	}

	.confirmation {
		margin-top: 2rem;
		max-width: 24rem;
		padding: 0.9rem 1.25rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--base-100);
		background: oklch(from var(--primary-900) l c h / 0.45);
		border: 1px solid oklch(from var(--primary-400) l c h / 0.35);
		border-radius: var(--radius);
		backdrop-filter: blur(8px);
	}

	.scroll-hint {
		position: absolute;
		bottom: 1.75rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.65rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--base-400);
	}

	.scroll-hint i {
		width: 1px;
		height: 2.5rem;
		background: linear-gradient(to bottom, var(--base-400), transparent);
	}

	.reveal {
		opacity: 0;
		transform: translateY(14px);
		animation: hero-reveal 0.8s var(--ease-out-expo, ease) forwards;
		animation-delay: calc(var(--stagger) * 130ms + 100ms);
	}

	@keyframes hero-reveal {
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			transform: none;
			animation: none;
		}

		.scroll-hint {
			display: none;
		}
	}
</style>
