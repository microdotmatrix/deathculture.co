<script lang="ts">
	interface FeatureImage {
		src: string;
		width: number;
		height: number;
		alt: string;
	}

	let {
		index,
		title,
		body,
		cta,
		href,
		image,
		flip = false
	}: {
		index: number;
		title: string;
		body: string;
		cta: string;
		href: string;
		image: FeatureImage;
		flip?: boolean;
	} = $props();

	const number = $derived(String(index).padStart(2, '0'));
</script>

<article class={['band grid md:grid-cols-2', flip && 'flip']}>
	<figure class="band-figure">
		<img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
	</figure>

	<div class="band-panel">
		<span class="ghost-number" aria-hidden="true">{number}</span>
		<h2>{title}</h2>
		<p>{body}</p>
		<a class="band-cta" {href}>
			{cta}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M5 12h14m0 0-6-6m6 6-6 6"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
	</div>
</article>

<style>
	.band {
		background: var(--base-1000);
	}

	.band-figure {
		position: relative;
		overflow: clip;
		min-height: clamp(16rem, 40vw, 48rem);
	}

	.band-figure img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transform: scale(1.02);
		transition:
			transform 1.2s var(--ease-out-expo, ease),
			filter 0.6s ease;
	}

	.band-figure::after {
		content: '';
		position: absolute;
		inset: 0;
		background: oklch(from var(--primary-900) l c h / 0.28);
		mix-blend-mode: multiply;
		transition: opacity 0.6s ease;
	}

	.band:hover .band-figure img {
		transform: scale(1.06);
		filter: grayscale(0.6) contrast(1.05);
	}

	.band:hover .band-figure::after {
		opacity: 0.5;
	}

	@media (min-width: 768px) {
		.flip .band-figure {
			order: 2;
		}
	}

	.band-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 1.1rem;
		padding: clamp(3rem, 3rem + 3vw, 6rem) clamp(1.5rem, 1rem + 4vw, 5rem);
		color: var(--base-300);
		overflow: clip;
	}

	.ghost-number {
		position: absolute;
		top: 50%;
		right: clamp(0.5rem, 4vw, 2.5rem);
		transform: translateY(-50%);
		font-family: var(--font-display);
		font-size: clamp(7rem, 6rem + 8vw, 14rem);
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1px oklch(from var(--base-50) l c h / 0.07);
		user-select: none;
		pointer-events: none;
	}

	h2 {
		font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
		color: var(--base-50);
	}

	p {
		max-width: 32rem;
		font-size: 0.95rem;
		line-height: 1.7;
	}

	.band-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.55rem 1.3rem;
		font-size: 0.85rem;
		letter-spacing: 0.03em;
		color: var(--base-950);
		background: var(--base-50);
		border-radius: var(--radius-sm);
		transition:
			background-color var(--duration-fast, 150ms) ease,
			gap var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.band-cta:hover,
	.band-cta:focus-visible {
		background: var(--secondary-300);
		gap: 0.8rem;
	}
</style>
