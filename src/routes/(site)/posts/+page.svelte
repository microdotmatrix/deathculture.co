<script lang="ts">
	import { page } from '$app/state';
	import { listPublishedPosts } from '@/lib/blog.remote';
	import ArticleRow from '@/lib/components/landing/ArticleRow.svelte';

	const posts = await listPublishedPosts();
	const invalidVerifyLink = $derived(page.url.searchParams.get('comment') === 'invalid');
</script>

<svelte:head>
	<title>The Journal — DeathCulture.co</title>
	<meta
		name="description"
		content="Essays and practical writing on mortality, funeral planning, and end-of-life culture from DeathCulture.co."
	/>
</svelte:head>

<div class="journal-page">
	<header class="journal-hero">
		<div class="mx-auto max-w-6xl px-5 sm:px-8">
			<p class="kicker">The Journal</p>
			<h1>Writing on death, openly</h1>
			<p class="lede">
				Essays and practical guides on mortality, funeral planning, and the culture that surrounds
				the end of life.
			</p>
		</div>
	</header>

	<section class="mx-auto max-w-6xl px-5 pb-20 sm:px-8" aria-label="All posts">
		{#if invalidVerifyLink}
			<p class="notice" role="alert">
				That confirmation link isn't valid any more. If your comment is still waiting, submit it
				again to get a fresh link.
			</p>
		{/if}

		{#if posts.length === 0}
			<p class="empty">Nothing published yet — check back soon.</p>
		{:else}
			<div class="article-list">
				{#each posts as post (post.slug)}
					<ArticleRow {post} />
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.journal-page {
		background: var(--background);
	}

	.journal-hero {
		padding-block: clamp(7rem, 5rem + 8vw, 11rem) clamp(2rem, 1.5rem + 2.5vw, 4rem);
	}

	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2.2rem, 1.6rem + 3vw, 4rem);
		line-height: 1.1;
		color: var(--foreground);
		text-wrap: balance;
	}

	.lede {
		margin-top: 1rem;
		max-width: 34rem;
		font-size: 1rem;
		line-height: 1.65;
		color: var(--muted-foreground);
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

	.empty {
		padding-block: 4rem;
		text-align: center;
		color: var(--muted-foreground);
	}

	.article-list :global(article + article) {
		border-top: 1px dashed var(--border);
	}
</style>
