<script lang="ts">
	import Logo from '@/lib/components/site/Logo.svelte';
	import type { PostPreview } from '@/lib/types';

	let { post }: { post: PostPreview } = $props();
</script>

<article class="row grid items-center gap-8 md:grid-cols-2 md:gap-12">
	<div class="row-copy flex h-full flex-col justify-between">
		<div class="my-auto">
			<h3>
				<a href="/posts/{post.slug}" aria-label={post.title}>{post.title}</a>
			</h3>
			<p class="excerpt">{post.excerpt}</p>
		</div>
		<p class="meta">
			<time datetime={post.date}>{post.date}</time>
			<span aria-hidden="true">·</span>
			<span>{post.readingTime}</span>
		</p>
	</div>

	<a
		class="row-figure"
		href="/posts/{post.slug}"
		tabindex="-1"
		aria-label={post.image?.alt ?? post.title}
	>
		{#if post.image}
			<img
				src={post.image.src}
				alt={post.image.alt}
				width={post.image.width}
				height={post.image.height}
				loading="lazy"
			/>
		{:else}
			<div class="row-figure-placeholder" aria-hidden="true">
				<Logo size={56} />
			</div>
		{/if}
	</a>
</article>

<style>
	.row {
		padding-block: clamp(2.5rem, 2rem + 2.5vw, 4.5rem);
	}

	h3 {
		font-size: clamp(1.4rem, 1.1rem + 1.4vw, 2.1rem);
		line-height: 1.2;
		color: var(--foreground);
		text-wrap: balance;
	}

	h3 a {
		background-image: linear-gradient(var(--secondary), var(--secondary));
		background-repeat: no-repeat;
		background-position: 0 100%;
		background-size: 0% 2px;
		transition:
			color var(--duration-fast, 150ms) ease,
			background-size var(--duration-normal, 300ms) var(--ease-out-expo, ease);
	}

	.row:hover h3 a,
	h3 a:focus-visible {
		color: var(--secondary-800);
		background-size: 100% 2px;
	}

	.excerpt {
		margin-top: 0.9rem;
		max-width: 30rem;
		font-size: 0.9rem;
		line-height: 1.65;
		color: var(--muted-foreground);
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.1rem;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--base-400);
	}

	.row-figure {
		display: block;
		overflow: clip;
		border-radius: var(--radius-lg);
		box-shadow: 0 20px 40px -24px oklch(from var(--base-950) l c h / 0.35);
	}

	.row-figure img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		filter: grayscale(0.85) contrast(1.02);
		transform: scale(1.01);
		transition:
			filter 0.6s ease,
			transform 1.2s var(--ease-out-expo, ease);
	}

	.row:hover .row-figure img {
		filter: grayscale(0.2) contrast(1.02);
		transform: scale(1.05);
	}

	.row-figure-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 3 / 2;
		background:
			radial-gradient(
				ellipse at 30% 20%,
				oklch(from var(--primary-200) l c h / 0.35),
				transparent 60%
			),
			var(--muted);
	}

	.row-figure-placeholder :global(.logo-mark) {
		opacity: 0.5;
	}
</style>
