# Async loading boundaries for post pages — design

## Goal

Add perceived-performance loading states for dynamic post content using Svelte `<svelte:boundary>` and `pending` snippets, while keeping SEO strong for public post pages via a lightweight server `load` that returns metadata + excerpt.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope (v1) | Public `/posts/[slug]` only; nested boundaries for article body vs comments |
| SEO strategy | Shell (metadata + excerpt) via `+page.server.ts`; full HTML via remote + boundary |
| Pending UI | Dual-purpose: human-facing skeletons + SSR excerpt in the document for crawlers |
| Error UI | Pending only — no `failed` snippets this pass |
| Out of scope | Auto-generated excerpts, journal/landing/dashboard boundaries, `$effect.pending()` refresh UX, true streaming SSR |

## Architecture

```text
+page.server.ts                         +page.svelte
─────────────────                       ────────────
getPublishedPostShell(slug)  ──────►   data.post (SSR shell)
  title, excerpt, og fields              <svelte:head> from data
  author, tags, dates                    hero + rail from data
  featureImage, id,                      main-column excerpt (SSR / crawlers)
  commentsEnabled
                                        <svelte:boundary>  ← article body
                                          await getPublishedPostBody(slug)
                                          {#snippet pending()} skeleton {/snippet}
                                        </svelte:boundary>

                                        <svelte:boundary>  ← comments
                                          <CommentSection … />
                                            └ await getCommentThread(postId)
                                          {#snippet pending()} skeleton {/snippet}
                                        </svelte:boundary>
                                        (Conversation kicker stable; count heading inside boundary)
```

### Why this split

- Boundaries with `pending` render the pending snippet during SSR and skip async boundary content until resolution/streaming. Putting the full article inside a pending boundary alone would weaken body SEO.
- Load returns a cheap shell (no TipTap/`contentHtml`) so head tags, hero, and excerpt ship in the first HTML response.
- Nested boundaries let the article body resolve independently of the comment thread.

## Data contracts

### `getPublishedPostShell(slug)` — `src/lib/server/blog.ts`

Published-only lookup. Returns fields needed for head, hero, rail, and SEO excerpt. **Does not** include `contentHtml`.

Shape: `id`, `slug`, `title`, `excerpt`, `featureImage`, `featureImageAlt`, `publishedAt`, `commentsEnabled`, `date`, `author`, `tags`.

**`readingTime`:** omit from the shell. Today it is derived from `contentHtml`; pulling that column into load defeats the cheap-shell goal. The rail shows date (and author/tags) from the shell immediately; `readingTime` is returned from `getPublishedPostBody` and appears in the rail when the body resolves.

### Slug `load` — `src/routes/(site)/posts/[slug]/+page.server.ts`

- Call `getPublishedPostShell(params.slug)`.
- `error(404)` when missing.
- Keep existing `headerTone: 'light'`.
- Return `{ post: shell, headerTone }`.

### `getPublishedPostBody(slug)` — `src/lib/blog.remote.ts`

Remote `query` returning `{ contentHtml, readingTime }`. Throws `error(404)` if the post is missing/unpublished.

Replace slug-page use of `getPublishedPost` with this body query. If nothing else needs the full combined remote, keep `getPublishedPost` only as a thin internal helper or remove it once unused. Avoid fetching full HTML in both load and the body remote.

### Comments

`CommentSection` continues to `await getCommentThread(postId)`. Wrap the await-dependent block in `<svelte:boundary>` with a `pending` snippet (either inside `CommentSection` or from the page around the component) so comment loading does not block the article body.

Stable chrome: the “Conversation” kicker can render immediately. The count heading (`N comments`) depends on the thread, so it lives inside the boundary (or shows a neutral “Comments” label until the thread resolves).

## UI behavior

### Outside boundaries (always from `data.post`)

- `<svelte:head>`: title, description, OG (and article times) from shell.
- Hero: title, optional feature image, hero excerpt/lede as today.
- Rail: author, date, tags from shell; `readingTime` fills in when the body remote resolves.

### Main-column excerpt (SEO + dual-purpose)

- Render `data.post.excerpt` as a real prose paragraph in the main column so crawlers see article text in the initial HTML.
- While the body boundary is pending, humans see this excerpt plus the body skeleton.
- When the body resolves, **hide** the main-column SSR excerpt so readers do not see summary + full post stacked. Hero lede under the title remains as today.

### Article body boundary

- Content: `{@html contentHtml}` from `getPublishedPostBody`.
- `pending`: prose-shaped skeleton (`PostBodySkeleton`) with appropriate busy/status affordances.
- No `failed` snippet in v1; errors bubble to Kit error handling.

### Comments boundary

- “Conversation” kicker can stay outside (or above) the pending region; the numeric comments heading stays inside with the thread.
- `pending`: comment-row skeleton (`CommentThreadSkeleton`).
- Form submit / like / pin pending behavior unchanged.

### Shared styling

Skeletons use existing CSS variables and layout rhythm — muted blocks, not spinner-heavy chrome. Prefer small dedicated components under `src/lib/components/` (e.g. posts or site).

## Types

Add a `PublishedPostShell` type in `src/lib/types.ts` (or colocated with blog helpers). Body remote return type: `{ contentHtml: string; readingTime: string }`.

## Error handling

| Case | Behavior |
|------|----------|
| Unknown slug | `load` → `error(404)` before page render |
| Body remote 404 mid-flight | Bubbles (no `failed` UI in v1) |
| Comment thread failure | Bubbles from comments boundary (no `failed` in v1) |

## Out of scope (explicit)

- Auto-generating excerpt from the first paragraph (planned separately; use stored `excerpt` now).
- `failed` snippets and retry via `reset`.
- `$effect.pending()` for subsequent refreshes.
- Applying boundaries to `/posts` list, landing latest posts, or dashboard.
- Relying on future streaming SSR as a requirement for v1.

## Verification

1. Cold load `/posts/[slug]`: head + hero + rail + excerpt present immediately; body skeleton then full HTML; comments skeleton then thread.
2. View source / initial HTML includes excerpt text (and meta tags) even while body is behind a pending boundary.
3. After body loads, main-column SSR excerpt is hidden; hero lede still shows when present.
4. Missing slug still 404s via load.
5. Comment publish / reply / like / pin still work after the thread boundary resolves.
6. Run Svelte autofixer on touched `.svelte` files before merge.

## Relationship to prior work

Builds on `docs/superpowers/specs/2026-07-22-posts-remote-functions-design.md`, which moved fetching into remotes. This design **reintroduces a thin load** for SEO shell data only, without pulling rendered HTML into `load`.
