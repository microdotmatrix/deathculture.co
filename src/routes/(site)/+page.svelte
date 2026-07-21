<script lang="ts">
	import ArticleRow from '@/lib/components/landing/ArticleRow.svelte';
	import FeatureBand from '@/lib/components/landing/FeatureBand.svelte';
	import Hero from '@/lib/components/landing/Hero.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const features = [
		{
			title: 'Informative Content',
			body: 'Our content resonates with readers looking for insightful information on mortality and funeral planning. Join our community to engage and share your perspectives.',
			cta: 'Join Now',
			href: '/register',
			image: {
				src: 'https://picsum.photos/seed/deathculture-feature-1/1200/900?grayscale',
				width: 1200,
				height: 900,
				alt: 'A figure gazing out over the sea from a quiet colonnade'
			}
		},
		{
			title: 'Interactive Platform',
			body: 'Engage with our platform to share feedback and suggestions. Your opinions matter, and your input helps us continuously improve and cater to your needs.',
			cta: 'Explore',
			href: '/about',
			image: {
				src: 'https://picsum.photos/seed/deathculture-feature-2/1200/900?grayscale',
				width: 1200,
				height: 900,
				alt: 'Mourners laying flowers at a graveside service'
			}
		},
		{
			title: 'Valuable Insights',
			body: 'Receive valuable insights from our content that make exploring mortality, funeral planning, and end-of-life aspects educational and enlightening.',
			cta: 'Learn More',
			href: '/podcast',
			image: {
				src: 'https://picsum.photos/seed/deathculture-feature-3/1200/900?grayscale',
				width: 1200,
				height: 900,
				alt: 'A reader seated among trees in dappled light'
			}
		}
	];
</script>

<svelte:head>
	<title>DeathCulture.co — Death positivity, funeral planning & end-of-life culture</title>
	<meta
		name="description"
		content="DeathCulture.co explores mortality, funeral planning, and end-of-life culture with openness and positivity. Subscribe for new posts and episodes of DeathChat."
	/>
</svelte:head>

<Hero />

<section aria-label="What we offer">
	{#each features as feature, i (feature.title)}
		<FeatureBand
			index={i + 1}
			title={feature.title}
			body={feature.body}
			cta={feature.cta}
			href={feature.href}
			image={feature.image}
			flip={i % 2 === 1}
		/>
	{/each}
</section>

{#if data.latestPosts.length > 0}
	<section class="journal" aria-labelledby="journal-heading">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<header class="journal-header">
				<p class="kicker">The Journal</p>
				<h2 id="journal-heading">Latest posts</h2>
			</header>

			<div class="article-list">
				{#each data.latestPosts as post (post.slug)}
					<ArticleRow {post} />
				{/each}
			</div>

			<p class="journal-more">
				<a href="/posts">All posts &rarr;</a>
			</p>
		</div>
	</section>
{/if}

<style>
	.journal {
		background: var(--background);
		padding-block: clamp(4rem, 3rem + 5vw, 8rem) clamp(2rem, 1.5rem + 2.5vw, 4rem);
	}

	.journal-header {
		margin-bottom: clamp(1rem, 0.5rem + 2vw, 2.5rem);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
		margin-bottom: 0.75rem;
	}

	.journal-header h2 {
		font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.8rem);
		color: var(--foreground);
	}

	.article-list :global(article + article) {
		border-top: 1px dashed var(--border);
	}

	.journal-more {
		padding-block: 1.5rem 0.5rem;
		border-top: 1px dashed var(--border);
	}

	.journal-more a {
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: var(--secondary-800);
		transition: color var(--duration-fast, 150ms) ease;
	}

	.journal-more a:hover,
	.journal-more a:focus-visible {
		color: var(--secondary-600);
	}
</style>
