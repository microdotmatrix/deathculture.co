# Async Loading Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On `/posts/[slug]`, SSR a lightweight post shell (metadata + excerpt) from `load`, and load article HTML and comments behind separate `<svelte:boundary>` `pending` UIs via remote queries.

**Architecture:** `getPublishedPostShell` in `src/lib/server/blog.ts` feeds `+page.server.ts`. Page chrome and `<svelte:head>` render from `data.post`. `getPublishedPostBody` remote returns `{ contentHtml, readingTime }` inside an article boundary. `CommentSection` keeps `getCommentThread` but wraps await-dependent UI in its own boundary. Main-column excerpt lives in the article `pending` snippet so SSR still ships crawler text and the excerpt disappears when the body resolves.

**Tech Stack:** SvelteKit, Svelte 5 (`experimental.async` already on in `vite.config.ts`), remote `query`, Drizzle, Zod, `node:test` for pure helpers.

## Global Constraints

- Scope is **only** `src/routes/(site)/posts/[slug]/**` plus shared blog helpers/remotes/skeletons/CommentSection — do not add boundaries to journal list, landing, or dashboard.
- Shell **must not** return `contentHtml`.
- No `failed` snippets; no `$effect.pending()`; no auto-generated excerpts.
- Prefer keyed `{#each}`; runes-only event handlers (`onclick`, not `on:click`).
- Validate touched `.svelte` files with Svelte MCP `svelte-autofixer` before finishing UI tasks.
- Remotes stay in `src/lib/*.remote.ts`, not under `src/lib/server/`.

## File structure

| File | Responsibility |
|------|----------------|
| `src/lib/types.ts` | `PublishedPostShell` type |
| `src/lib/server/blog.ts` | `getPublishedPostShell`, slim body helper used by remote; keep or thin `getPublishedPostBySlug` |
| `src/lib/server/blog-shell.test.ts` | Unit tests for shell mapping / no-`contentHtml` guarantee |
| `src/lib/blog.remote.ts` | `getPublishedPostBody`; remove unused `getPublishedPost` if nothing else imports it |
| `src/lib/components/posts/PostBodySkeleton.svelte` | Article pending UI |
| `src/lib/components/comments/CommentThreadSkeleton.svelte` | Comments pending UI |
| `src/routes/(site)/posts/[slug]/+page.server.ts` | Load shell + `headerTone`; 404 |
| `src/routes/(site)/posts/[slug]/+page.svelte` | Shell UI + article boundary + CommentSection |
| `src/lib/components/comments/CommentSection.svelte` | Conversation kicker outside pending; thread behind boundary |

---

### Task 1: `PublishedPostShell` type + `getPublishedPostShell` + tests

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/server/blog.ts`
- Create: `src/lib/server/blog-shell.test.ts`

**Interfaces:**
- Produces:
  - `PublishedPostShell` with: `id`, `slug`, `title`, `excerpt`, `featureImage`, `featureImageAlt`, `publishedAt`, `commentsEnabled`, `date`, `author: { name, image }`, `tags: { name, slug }[]`
  - `getPublishedPostShell(slug: string): Promise<PublishedPostShell | null>`
  - `getPublishedPostBodyBySlug(slug: string): Promise<{ contentHtml: string; readingTime: string } | null>` (server helper for the remote)

- [ ] **Step 1: Add the type**

Append to `src/lib/types.ts`:

```ts
export interface PublishedPostShell {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	featureImage: string;
	featureImageAlt: string;
	publishedAt: Date;
	commentsEnabled: boolean;
	date: string;
	author: { name: string; image: string | null };
	tags: { name: string; slug: string }[];
}

export interface PublishedPostBody {
	contentHtml: string;
	readingTime: string;
}
```

- [ ] **Step 2: Write failing tests for shell mapping**

Create `src/lib/server/blog-shell.test.ts`. Export a pure mapper from `blog.ts` (e.g. `toPublishedPostShell`) so tests do not need the DB. If you prefer not to export the mapper, test via a small internal helper in the same file — the assertion that matters is **no `contentHtml` key** and correct field mapping.

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toPublishedPostShell } from './blog';

describe('toPublishedPostShell', () => {
	it('maps published row fields without contentHtml', () => {
		const shell = toPublishedPostShell({
			id: 'p1',
			slug: 'hello',
			title: 'Hello',
			excerpt: 'A short summary.',
			featureImage: 'https://example.com/x.jpg',
			featureImageAlt: 'Alt',
			publishedAt: new Date('2026-01-15T12:00:00.000Z'),
			createdAt: new Date('2026-01-01T12:00:00.000Z'),
			commentsEnabled: true,
			contentHtml: '<p>SECRET</p>',
			author: { name: 'Ada', image: null },
			tags: [{ tag: { name: 'Grief', slug: 'grief' } }]
		});

		assert.equal(shell.slug, 'hello');
		assert.equal(shell.excerpt, 'A short summary.');
		assert.equal(shell.date, '15 Jan 2026');
		assert.deepEqual(shell.tags, [{ name: 'Grief', slug: 'grief' }]);
		assert.equal('contentHtml' in shell, false);
		assert.equal('readingTime' in shell, false);
	});
});
```

Adjust the fixture to match whatever row shape `toPublishedPostShell` accepts (Drizzle-inferred or a narrow input type).

- [ ] **Step 3: Run test — expect fail**

Run: `node --test src/lib/server/blog-shell.test.ts`

Expected: FAIL (module export / function missing).

- [ ] **Step 4: Implement shell + body server helpers**

In `src/lib/server/blog.ts`:

1. Add `toPublishedPostShell(row)` returning `PublishedPostShell` (use `formatPostDate(row.publishedAt ?? row.createdAt)`; never copy `contentHtml`).
2. Add `getPublishedPostShell(slug)` — same `where` as `getPublishedPostBySlug`, but select only columns needed for the shell (`columns: { … }` excluding `content` / `contentHtml`), still `with: { author, tags }`. Return `toPublishedPostShell(row)` or `null`.
3. Add `getPublishedPostBodyBySlug(slug)` — published-only lookup selecting `{ contentHtml: true }` (and id if useful). Return `{ contentHtml, readingTime: readingTime(row.contentHtml) }` or `null`.
4. Refactor `getPublishedPostBySlug` to compose shell + body **or** leave it for now if still used; prefer composing so HTML is not duplicated in three places:

```ts
export async function getPublishedPostBySlug(slug: string) {
	const shell = await getPublishedPostShell(slug);
	if (!shell) return null;
	const body = await getPublishedPostBodyBySlug(slug);
	if (!body) return null;
	return { ...shell, ...body };
}
```

Note: composition hits the DB twice. Prefer a single query in `getPublishedPostBySlug` if you keep it, and keep `getPublishedPostShell` / `getPublishedPostBodyBySlug` as separate single queries for their call sites. Do **not** make the shell query select `contentHtml`.

- [ ] **Step 5: Run test — expect pass**

Run: `node --test src/lib/server/blog-shell.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/server/blog.ts src/lib/server/blog-shell.test.ts
git commit -m "$(cat <<'EOF'
feat: add published post shell helper without contentHtml

EOF
)"
```

---

### Task 2: `getPublishedPostBody` remote; retire slug use of `getPublishedPost`

**Files:**
- Modify: `src/lib/blog.remote.ts`
- Verify: `rg getPublishedPost src` — only remotes/docs should remain after Task 3

**Interfaces:**
- Consumes: `getPublishedPostBodyBySlug` from `@/lib/server/blog`
- Produces: `getPublishedPostBody = query(z.string().min(1), async (slug) => PublishedPostBody)` with `error(404)` when null
- Removes or keeps: `getPublishedPost` — **delete** once no runtime imports remain (after Task 3); in this task add the body query and leave `getPublishedPost` until the page migrates

- [ ] **Step 1: Add the body query**

In `src/lib/blog.remote.ts`:

```ts
import { getPublishedPostBodyBySlug } from '@/lib/server/blog';

/** Rendered HTML + reading time for a published slug (no metadata shell). */
export const getPublishedPostBody = query(z.string().min(1), async (slug) => {
	const row = await getPublishedPostBodyBySlug(slug);
	if (!row) error(404, 'Post not found');
	return row;
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`

Expected: PASS (or only pre-existing unrelated errors). Fix any errors introduced here.

- [ ] **Step 3: Commit**

```bash
git add src/lib/blog.remote.ts
git commit -m "$(cat <<'EOF'
feat: add getPublishedPostBody remote query

EOF
)"
```

---

### Task 3: Skeleton components

**Files:**
- Create: `src/lib/components/posts/PostBodySkeleton.svelte`
- Create: `src/lib/components/comments/CommentThreadSkeleton.svelte`

**Interfaces:**
- Produces: presentational components with no props (or optional `class` only if needed)

- [ ] **Step 1: Create `PostBodySkeleton.svelte`**

```svelte
<div class="body-skeleton" aria-busy="true" aria-live="polite" role="status">
	<span class="sr-only">Loading article…</span>
	<div class="line w-full"></div>
	<div class="line w-11/12"></div>
	<div class="line w-4/5"></div>
	<div class="line w-full"></div>
	<div class="line w-2/3"></div>
	<div class="block"></div>
	<div class="line w-full"></div>
	<div class="line w-5/6"></div>
	<div class="line w-3/4"></div>
</div>

<style>
	.body-skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-block: 0.25rem 1rem;
	}

	.line,
	.block {
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--muted) 80%, transparent);
	}

	.line {
		height: 0.85rem;
	}

	.block {
		height: 6rem;
		margin-block: 0.5rem;
	}

	.w-full {
		width: 100%;
	}
	.w-11\/12 {
		width: 91%;
	}
	.w-4\/5 {
		width: 80%;
	}
	.w-2\/3 {
		width: 66%;
	}
	.w-5\/6 {
		width: 83%;
	}
	.w-3\/4 {
		width: 75%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
```

If the project already has a `.sr-only` utility, drop the local copy and use that class.

Prefer Tailwind utility widths if that matches nearby components better — keep muted skeleton look and `role="status"` / `aria-busy="true"`.

- [ ] **Step 2: Create `CommentThreadSkeleton.svelte`**

```svelte
<div class="thread-skeleton" aria-busy="true" aria-live="polite" role="status">
	<span class="sr-only">Loading comments…</span>
	{#each [0, 1, 2] as i (i)}
		<div class="row">
			<div class="avatar"></div>
			<div class="copy">
				<div class="line short"></div>
				<div class="line"></div>
				<div class="line mid"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.thread-skeleton {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.row {
		display: flex;
		gap: 0.9rem;
	}

	.avatar {
		width: 2.4rem;
		height: 2.4rem;
		flex-shrink: 0;
		border-radius: 50%;
		background: color-mix(in oklch, var(--muted) 80%, transparent);
	}

	.copy {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.line {
		height: 0.7rem;
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--muted) 80%, transparent);
		width: 100%;
	}

	.line.short {
		width: 30%;
	}

	.line.mid {
		width: 70%;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
```

- [ ] **Step 3: Autofixer**

Run Svelte MCP `svelte-autofixer` on both files (`desired_svelte_version: 5`). Fix until clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/posts/PostBodySkeleton.svelte src/lib/components/comments/CommentThreadSkeleton.svelte
git commit -m "$(cat <<'EOF'
feat: add post body and comment thread skeletons

EOF
)"
```

---

### Task 4: Slug `load` returns shell

**Files:**
- Modify: `src/routes/(site)/posts/[slug]/+page.server.ts`

**Interfaces:**
- Consumes: `getPublishedPostShell`
- Produces: `{ post: PublishedPostShell; headerTone: 'light' }` or `error(404)`

- [ ] **Step 1: Replace load**

```ts
import { getPublishedPostShell } from '@/lib/server/blog';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostShell(params.slug);
	if (!post) error(404, 'Post not found');

	return {
		post,
		headerTone: 'light' as const
	};
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`

Expected: FAIL on `+page.svelte` still awaiting `getPublishedPost` / ignoring `data.post` — that is OK; fixed in Task 5. If load itself errors, fix now.

- [ ] **Step 3: Commit**

```bash
git add src/routes/\(site\)/posts/\[slug\]/+page.server.ts
git commit -m "$(cat <<'EOF'
feat: load published post shell for slug SEO metadata

EOF
)"
```

---

### Task 5: Refactor slug page — shell UI + article boundary

**Files:**
- Modify: `src/routes/(site)/posts/[slug]/+page.svelte`
- Modify: `src/lib/blog.remote.ts` (delete `getPublishedPost` if unused after this task)

**Interfaces:**
- Consumes: `PageProps` / `data.post`, `getPublishedPostBody`, `PostBodySkeleton`, `CommentSection`
- Produces: working slug page with pending article body

- [ ] **Step 1: Rewrite the page script and structure**

Use `data.post` for head, hero, rail. Await body **inside** the article boundary only. Put the main-column excerpt inside the `pending` snippet (SSR crawler text + auto-removed when body resolves). Hero lede stays as `data.post.excerpt` under the title.

`readingTime` in the rail: nest a tiny boundary that awaits the same `getPublishedPostBody(slug)` (remote queries with the same args share work) with an empty or minimal pending so the date shows immediately:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { getPublishedPostBody } from '@/lib/blog.remote';
	import CommentSection from '@/lib/components/comments/CommentSection.svelte';
	import PostBodySkeleton from '@/lib/components/posts/PostBodySkeleton.svelte';
	import Logo from '@/lib/components/site/Logo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
	const slug = $derived(page.params.slug!);
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
	<!-- hero from post shell: keep existing markup, use post.* from data -->

	<div class="post-layout mx-auto max-w-6xl px-5 sm:px-8">
		<aside class="post-rail" aria-label="Post information">
			<!-- author + tags from shell -->
			<p class="post-date">
				<time datetime={post.publishedAt.toISOString()}>{post.date}</time>
				<svelte:boundary>
					{#snippet pending()}{/snippet}
					{@const body = await getPublishedPostBody(slug)}
					<span aria-hidden="true">&middot;</span>
					{body.readingTime}
				</svelte:boundary>
			</p>
		</aside>

		<div class="post-main">
			<svelte:boundary>
				{#snippet pending()}
					{#if post.excerpt}
						<p class="seo-excerpt">{post.excerpt}</p>
					{/if}
					<PostBodySkeleton />
				{/snippet}

				{@const body = await getPublishedPostBody(slug)}
				<div class="dc-prose">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html body.contentHtml}
				</div>
			</svelte:boundary>

			<CommentSection postId={post.id} commentsEnabled={post.commentsEnabled} />
		</div>
	</div>
</article>
```

Preserve existing CSS classes from the current page for hero/rail/layout. Add:

```css
.seo-excerpt {
	margin-bottom: 1.25rem;
	font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
	line-height: 1.65;
	color: var(--base-500);
}
```

If `{@const body = await …}` is rejected by the compiler, use:

```svelte
{@html (await getPublishedPostBody(slug)).contentHtml}
```

and a second await in the rail boundary for `readingTime`.

- [ ] **Step 2: Remove dead `getPublishedPost` export**

Run: `rg "getPublishedPost" src --glob '!**/blog.remote.ts'`

If no consumers, delete `getPublishedPost` from `blog.remote.ts` (keep `getPublishedPostBody`).

- [ ] **Step 3: Autofixer + check**

- Svelte MCP `svelte-autofixer` on `+page.svelte` with `async: true`.
- Run: `pnpm check` — Expected: PASS for these files.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `pnpm dev`

Open a published post:

1. First paint / view-source: title meta + excerpt text present.
2. Body skeleton then full HTML.
3. Rail date immediate; reading time appears when body query resolves.
4. Hero lede still shows when excerpt exists.
5. Unknown slug → 404.

- [ ] **Step 5: Commit**

```bash
git add src/routes/\(site\)/posts/\[slug\]/+page.svelte src/lib/blog.remote.ts
git commit -m "$(cat <<'EOF'
feat: render slug page shell with pending post body boundary

EOF
)"
```

---

### Task 6: CommentSection pending boundary

**Files:**
- Modify: `src/lib/components/comments/CommentSection.svelte`
- Reuse: `src/lib/components/comments/CommentThreadSkeleton.svelte`

**Interfaces:**
- Consumes: existing `getCommentThread`, new skeleton
- Produces: kicker outside pending; count + thread + form behind boundary

- [ ] **Step 1: Restructure template**

Keep the script’s `const thread = $derived(await getCommentThread(postId))` **only if** that await sits inside the boundary in the template. Prefer moving the await into the boundary body so `pending` works:

Pattern:

```svelte
<section id="comments" class="comments" aria-labelledby="comments-heading">
	<header class="comments-header">
		<p class="kicker">Conversation</p>
		<!-- count heading moves inside boundary -->
	</header>

	<!-- verify notices that don't need thread can stay outside if they only use page URL -->

	<svelte:boundary>
		{#snippet pending()}
			<h2 id="comments-heading">Comments</h2>
			<CommentThreadSkeleton />
		{/snippet}

		{@const thread = await getCommentThread(postId)}
		<!-- derive local consts via {@const} or keep thin wrapper component -->

		<h2 id="comments-heading">
			{totalCount === 0 ? 'No comments yet' : `${totalCount} comment…`}
		</h2>
		<!-- existing list + form markup -->
	</svelte:boundary>
</section>
```

Because `totalCount`, `comments`, `memberName`, etc. currently come from script-level `$derived(await …)`, refactor to either:

**Option A (preferred):** extract an inner `CommentThread.svelte` that receives `postId` / flags and does the await + list/form; parent renders kicker + `<svelte:boundary><CommentThread …/><!-- pending --></svelte:boundary>`.

**Option B:** keep one file; put `await getCommentThread(postId)` in the template inside the boundary and use `{@const thread = await …}` then reference `thread.comments` in markup (move helpers that need thread into the boundary block).

Also move expired/disabled verify notices: they only need `page.url` — keep outside the boundary.

Refresh / pin / like handlers that call `getCommentThread(postId).refresh()` stay valid.

- [ ] **Step 2: Autofixer**

Svelte MCP `svelte-autofixer` on `CommentSection.svelte` (and `CommentThread.svelte` if created) with `async: true`. Fix until clean.

- [ ] **Step 3: Manual smoke**

On a post with comments:

1. Comments region shows skeleton (and “Comments” heading) while thread loads.
2. Thread + form appear; publish/reply/like/pin still work.
3. Article body can resolve while comments still pending (nested independence).

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/comments/CommentSection.svelte src/lib/components/comments/CommentThread.svelte
git commit -m "$(cat <<'EOF'
feat: wrap comment thread in svelte:boundary pending state

EOF
)"
```

(Omit `CommentThread.svelte` from `git add` if you used Option B.)

---

### Task 7: Final verification + docs pointer

**Files:**
- Optionally modify: `docs/superpowers/specs/2026-07-22-async-loading-boundaries-design.md` only if implementation diverged — prefer not rewriting; note divergences in the commit message if any.

- [ ] **Step 1: Run automated checks**

```bash
node --test src/lib/server/blog-shell.test.ts
pnpm check
```

Expected: both PASS.

- [ ] **Step 2: Spec checklist**

Confirm against the design spec:

1. Cold load: head + hero + rail + excerpt (in pending SSR) + skeletons.
2. View-source includes excerpt + meta.
3. Body resolve hides main-column excerpt (pending replaced); hero lede remains.
4. 404 via load.
5. Comment mutations work.
6. Autofixer clean on touched Svelte files.

- [ ] **Step 3: Commit only if docs/tests need a fixup**; otherwise done.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| `getPublishedPostShell` without `contentHtml` | Task 1 |
| Load returns shell + `headerTone` + 404 | Task 4 |
| `getPublishedPostBody` → `{ contentHtml, readingTime }` | Tasks 1–2 |
| Head/hero/rail from shell | Task 5 |
| Main-column excerpt in SSR + hide when body ready | Task 5 (`pending` snippet) |
| Article `<svelte:boundary>` + skeleton | Tasks 3, 5 |
| Comments nested boundary + skeleton | Tasks 3, 6 |
| `readingTime` after body | Task 5 |
| No `failed` / no list-landing-dashboard scope | Global constraints |
| Autofixer + verification | Tasks 5–7 |

## Placeholder / consistency notes

- Skeleton class names and exact CSS may use Tailwind instead of scoped CSS if that matches neighboring site components — behavior and a11y attributes are required either way.
- `{@const x = await …}` vs inline `await` — use whichever the current Svelte version accepts; both are specified above.
- Remote query dedupe for dual `getPublishedPostBody(slug)` awaits (rail + body) is assumed; if reading time flickers or double-fetches in practice, hoist a single inner `PostArticle.svelte` that awaits once and exposes reading time via a snippet/callback — only if needed.
