<script lang="ts">
	import CommentSection from '@/lib/components/comments/CommentSection.svelte';
	import Logo from '@/lib/components/site/Logo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} — DeathCulture.co</title>
	<meta name="description" content={post.excerpt || post.title} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt || post.title} />
	{#if post.featureImage}
		<meta property="og:image" content={post.featureImage} />
	{/if}
	<meta property="article:published_time" content={post.publishedAt.toISOString()} />
</svelte:head>

<article class="post">
	<header class={['post-hero', !post.featureImage && 'no-media']}>
		{#if post.featureImage}
			<div class="hero-media" aria-hidden="true">
				<img
					src={post.featureImage}
					alt=""
					width="1600"
					height="900"
					loading="eager"
					fetchpriority="high"
				/>
			</div>
		{/if}

		<div class="hero-copy mx-auto max-w-6xl px-5 sm:px-8">
			<h1>{post.title}</h1>
			{#if post.excerpt}
				<p class="hero-excerpt">{post.excerpt}</p>
			{/if}
		</div>
	</header>

	<div class="post-layout mx-auto max-w-6xl px-5 sm:px-8">
		<aside class="post-rail" aria-label="Post information">
			<div class="author">
				{#if post.author.image}
					<img class="avatar" src={post.author.image} alt="" width="48" height="48" />
				{:else}
					<span class="avatar avatar-mark" aria-hidden="true"><Logo size={26} /></span>
				{/if}
				<div>
					<p class="author-name">{post.author.name}</p>
					<p class="post-date">
						<time datetime={post.publishedAt.toISOString()}>{post.date}</time>
						<span aria-hidden="true">&middot;</span>
						{post.readingTime}
					</p>
				</div>
			</div>

			{#if post.tags.length > 0}
				<ul class="tag-list" aria-label="Tags">
					{#each post.tags as tagItem (tagItem.slug)}
						<li><span class="tag-chip"><span aria-hidden="true">#</span>{tagItem.name}</span></li>
					{/each}
				</ul>
			{/if}
		</aside>

		<div class="post-main">
			<div class="dc-prose">
				<!-- eslint-disable-next-line svelte/no-at-html-tags — HTML is generated
				     server-side from schema-constrained TipTap JSON, admin-authored. -->
				{@html post.contentHtml}
			</div>

			<CommentSection
				postId={post.id}
				comments={data.comments}
				memberName={data.memberName}
				guestName={data.guestName}
			/>
		</div>
	</div>
</article>

<style>
	.post {
		background: var(--background);
		padding-bottom: clamp(4rem, 3rem + 4vw, 7rem);
	}

	.post-hero {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: clamp(24rem, 55vh, 34rem);
		overflow: clip;
	}

	.hero-media {
		position: absolute;
		inset-block: 0;
		right: 0;
		width: min(68%, 60rem);
	}

	.hero-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(0.35) contrast(1.02);
		opacity: 0.85;
		mask-image: linear-gradient(to left, black 55%, transparent 98%);
	}

	.hero-media::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			oklch(from var(--background) l c h / 0.85),
			transparent 45%
		);
	}

	.hero-copy {
		position: relative;
		z-index: 1;
		width: 100%;
		padding-top: clamp(7rem, 5rem + 6vw, 9rem);
		padding-bottom: clamp(2rem, 1.5rem + 2vw, 3.5rem);
	}

	.post-hero h1 {
		max-width: 24ch;
		font-size: clamp(2.1rem, 1.4rem + 3.4vw, 4.2rem);
		line-height: 1.08;
		color: var(--base-950);
		text-wrap: balance;
	}

	.hero-excerpt {
		margin-top: 1.25rem;
		max-width: 26rem;
		font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
		line-height: 1.6;
		color: var(--base-500);
	}

	.post-hero.no-media {
		min-height: clamp(18rem, 40vh, 24rem);
		background:
			radial-gradient(
				ellipse at 80% 10%,
				oklch(from var(--primary-200) l c h / 0.35),
				transparent 55%
			),
			var(--background);
	}

	.post-layout {
		display: grid;
		gap: 2rem;
		padding-top: clamp(1.5rem, 1rem + 2vw, 3rem);
	}

	@media (min-width: 1024px) {
		.post-layout {
			grid-template-columns: 1fr minmax(0, 42rem) 1fr;
			column-gap: 3rem;
		}

		.post-rail {
			grid-column: 1;
			position: sticky;
			top: 6rem;
			align-self: start;
		}

		.post-main {
			grid-column: 2;
		}
	}

	.post-rail {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.avatar {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-mark {
		background: var(--muted);
	}

	.author-name {
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--foreground);
	}

	.post-date {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.25rem;
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.25rem 0.7rem;
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		color: var(--base-700);
		border: 1px solid var(--border);
		border-radius: 999px;
	}

	.tag-chip [aria-hidden] {
		color: var(--secondary-600);
	}
</style>
