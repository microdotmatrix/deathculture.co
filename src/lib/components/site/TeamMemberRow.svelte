<script lang="ts">
	import Logo from '@/lib/components/site/Logo.svelte';
	import { splitBioParagraphs } from '@/lib/team';

	interface TeamMemberCard {
		id: string;
		name: string;
		intro: string;
		bio: string;
		portraitUrl: string | null;
	}

	interface Props {
		member: TeamMemberCard;
		/** Reverses the column order so the roster alternates down the page. */
		flip?: boolean;
		/** The first row sits near the fold — load its portrait eagerly. */
		eager?: boolean;
	}

	let { member, flip = false, eager = false }: Props = $props();

	const paragraphs = $derived(splitBioParagraphs(member.bio));
</script>

<article class={['member grid items-center gap-8 md:grid-cols-2 md:gap-12', flip && 'flip']}>
	<figure class="portrait">
		{#if member.portraitUrl}
			<img
				src={member.portraitUrl}
				alt={`Portrait of ${member.name}`}
				width="800"
				height="1000"
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : undefined}
			/>
		{:else}
			<div class="portrait-placeholder" aria-hidden="true">
				<Logo size={56} />
			</div>
			<!-- Without a portrait the name appears nowhere else on the card. -->
			<figcaption class="sr-only">{member.name}</figcaption>
		{/if}
	</figure>

	<div class="panel">
		<h2>{member.intro || member.name}</h2>
		{#each paragraphs as paragraph, index (index)}
			<p>{paragraph}</p>
		{/each}
	</div>
</article>

<style>
	.member {
		padding-block: clamp(2.5rem, 2rem + 2.5vw, 4.5rem);
	}

	.portrait {
		max-width: 26rem;
		margin-inline: auto;
		overflow: clip;
		border-radius: var(--radius-lg);
		box-shadow: 0 20px 40px -24px oklch(from var(--base-950) l c h / 0.35);
	}

	.portrait img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		filter: grayscale(0.85) contrast(1.02);
		transform: scale(1.01);
		transition:
			filter 0.6s ease,
			transform 1.2s var(--ease-out-expo, ease);
	}

	.member:hover .portrait img {
		filter: grayscale(0.2) contrast(1.02);
		transform: scale(1.04);
	}

	.portrait-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 4 / 5;
		background:
			radial-gradient(
				ellipse at 30% 20%,
				oklch(from var(--primary-200) l c h / 0.35),
				transparent 60%
			),
			var(--muted);
	}

	.portrait-placeholder :global(.logo-mark) {
		opacity: 0.5;
	}

	@media (min-width: 768px) {
		.flip .portrait {
			order: 2;
		}
	}

	h2 {
		font-size: clamp(1.4rem, 1.1rem + 1.4vw, 2.1rem);
		line-height: 1.2;
		color: var(--foreground);
		text-wrap: balance;
	}

	.panel p {
		margin-top: 0.9rem;
		max-width: 34rem;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		.portrait img {
			transition: filter 0.6s ease;
			transform: none;
		}

		.member:hover .portrait img {
			transform: none;
		}
	}
</style>
