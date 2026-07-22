<script lang="ts">
	import { listAdminPosts } from '@/lib/blog.remote';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const posts = $derived(data.user.role === 'admin' ? await listAdminPosts() : null);
</script>

<svelte:head>
	<title>Studio — DeathCulture.co</title>
</svelte:head>

<p class="kicker">Welcome back</p>
<h1>{data.user.name}</h1>

{#if posts}
	<section class="posts" aria-label="Posts">
		<header class="posts-header">
			<h2>Posts</h2>
			<a class="new-post" href="/dashboard/posts/new">New post</a>
		</header>

		{#if posts.length === 0}
			<div class="empty">
				<p>Nothing here yet. Write the first post for DeathCulture.co.</p>
			</div>
		{:else}
			<ul class="post-list">
				{#each posts as item (item.id)}
					<li>
						<a class="post-row" href={`/dashboard/posts/${item.id}`}>
							<div class="post-row-main">
								<h3>{item.title}</h3>
								<p class="post-row-meta">
									{#if item.status === 'published'}
										Published {item.publishedDate}
									{:else}
										Edited {item.updatedDate}
									{/if}
								</p>
							</div>
							<span class={['status-chip', item.status]}>
								{item.status === 'published' ? 'Published' : 'Draft'}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{:else}
	<section class="member" aria-label="Membership">
		<h2>You're a member</h2>
		<p>
			Thanks for being part of DeathCulture.co. You'll receive the newsletter at
			<strong>{data.user.email}</strong>, and you can comment on any post while signed in.
		</p>
		<a class="browse-link" href="/posts">Browse the journal &rarr;</a>
	</section>
{/if}

<style>
	.kicker {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.45em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	h1 {
		margin-top: 0.5rem;
		font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.6rem);
		color: var(--foreground);
	}

	.posts {
		margin-top: 2.5rem;
	}

	.posts-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.posts-header h2 {
		font-size: 1.1rem;
		color: var(--foreground);
	}

	.new-post {
		padding: 0.45rem 1.1rem;
		font-size: 0.85rem;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.new-post:hover,
	.new-post:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	.empty {
		padding: 2.5rem 2rem;
		text-align: center;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--muted);
	}

	.empty p {
		font-size: 0.9rem;
		color: var(--muted-foreground);
	}

	.post-list {
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: clip;
	}

	.post-list li + li {
		border-top: 1px solid var(--border);
	}

	.post-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		transition: background-color var(--duration-fast, 150ms) ease;
	}

	.post-row:hover,
	.post-row:focus-visible {
		background: var(--muted);
	}

	.post-row-main h3 {
		font-size: 1rem;
		color: var(--foreground);
	}

	.post-row-meta {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
	}

	.status-chip {
		flex-shrink: 0;
		padding: 0.2rem 0.65rem;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-radius: 999px;
	}

	.status-chip.draft {
		color: var(--secondary-900);
		background: var(--secondary-100);
	}

	.status-chip.published {
		color: var(--primary-900);
		background: var(--primary-100);
	}

	.member {
		margin-top: 2.5rem;
		padding: 2rem;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--muted);
	}

	.member h2 {
		font-size: 1.1rem;
		color: var(--foreground);
	}

	.member p {
		margin-top: 0.5rem;
		max-width: 36rem;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--muted-foreground);
	}

	.browse-link {
		display: inline-block;
		margin-top: 1rem;
		font-size: 0.85rem;
		color: var(--secondary-800);
	}
</style>
