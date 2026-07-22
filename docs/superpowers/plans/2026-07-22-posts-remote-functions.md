# Posts Remote Functions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move post and comment-thread fetching from route loads into remote queries owned by pages/components; keep loads for auth, redirects, and `headerTone`.

**Architecture:** Extend `blog.remote.ts` / `comments.remote.ts` with `query` wrappers around existing `src/lib/server/blog.ts` helpers. Pages and components `await` those queries (experimental async already enabled). Thin `+page.server.ts` files remain only where auth or `headerTone` is needed.

**Tech Stack:** SvelteKit remote functions (`query`/`command`), Zod, Drizzle, Svelte 5 runes + async await.

## Global Constraints

- Prefer `await query()` over `.current` / `.loading` unless a custom pending UI is required.
- Use keyed `{#each}` with stable ids/slugs.
- Do not put remotes under `src/lib/server/`.
- Auth redirects stay in load (or layout); remotes use `requireAdmin()` / `error()` for API-style guards.
- After comment mutations, prefer `getCommentThread(postId).refresh()` over `invalidateAll()` when the thread query owns the data.

---

### Task 1: Add post query remotes

**Files:**
- Modify: `src/lib/blog.remote.ts`
- Reuse: `src/lib/server/blog.ts` (`listPublishedPosts`, `getPublishedPostBySlug`, `formatPostDate`)

**Interfaces:**
- Produces:
  - `listPublishedPosts = query(z.number().int().positive().optional(), …)` or overload via optional schema — prefer `query(z.object({ limit: z.number().optional() }).optional(), …)` or two exports; simplest: `query(z.number().positive().optional(), async (limit) => listPublishedPosts(limit))` if Zod optional arg works; else `query(z.object({ limit: z.number().positive().optional() }), …)` with `listPublishedPosts()` for no-arg via default empty object.
  - Practical API matching current callers:
    - `listPublishedPosts = query(z.number().int().positive().optional(), async (limit) => …)` — call as `listPublishedPosts()` / `listPublishedPosts(3)` if Kit allows undefined; otherwise use `query` with no schema for unlimited and a second named query, OR always pass object `{ limit?: number }`.
  - **Chosen API:**
    - `listPublishedPosts = query(z.object({ limit: z.number().int().positive().optional() }).optional(), async (opts) => listPublishedPostsFromServer(opts?.limit))`
    - Call sites: `listPublishedPosts()` and `listPublishedPosts({ limit: 3 })`
    - `getPublishedPost = query(z.string().min(1), async (slug) => { const post = await getPublishedPostBySlug(slug); if (!post) error(404, 'Post not found'); return post; })`
    - `listAdminPosts = query(async () => { requireAdmin(); … same shape as dashboard load … })`
    - `getEditorPost = query(z.string().min(1), async (id) => { requireAdmin(); … EditorPost shape … })`

- [ ] **Step 1:** Import `query` and server helpers; add the four queries above (keep existing commands).
- [ ] **Step 2:** Run `pnpm check` and fix type errors in the remote file.

---

### Task 2: Add `getCommentThread` query

**Files:**
- Modify: `src/lib/comments.remote.ts`
- Reuse: `listPublishedComments`, `resolveViewerIdentity`

**Interfaces:**
- Produces: `getCommentThread = query(z.string().min(1), async (postId) => ({ comments, memberName, guestName, canComment, canLike }))`

- [ ] **Step 1:** Add query returning the same fields currently returned from the slug page load (minus post body).
- [ ] **Step 2:** Ensure post existence is not required here if parent already 404s — optional: verify post exists; parent page already loads published post first.

---

### Task 3: Wire public pages

**Files:**
- Modify: `src/routes/(site)/+page.svelte`
- Delete: `src/routes/(site)/+page.server.ts`
- Modify: `src/routes/(site)/posts/+page.svelte`
- Modify: `src/routes/(site)/posts/+page.server.ts` (headerTone only)
- Modify: `src/routes/(site)/posts/[slug]/+page.svelte`
- Modify: `src/routes/(site)/posts/[slug]/+page.server.ts` (headerTone only)

- [ ] **Step 1:** Landing: `const latestPosts = await listPublishedPosts({ limit: 3 })` (or equivalent); remove load file.
- [ ] **Step 2:** Journal: await list in page; strip posts from load.
- [ ] **Step 3:** Slug: `const post = await getPublishedPost(params.slug)`; pass only `postId` + `commentsEnabled` into `CommentSection`.
- [ ] **Step 4:** Validate Svelte with MCP `svelte-autofixer` on touched `.svelte` files.

---

### Task 4: Wire `CommentSection` + mutation refresh

**Files:**
- Modify: `src/lib/components/comments/CommentSection.svelte`
- Modify: `src/lib/components/comments/CommentLikeButton.svelte` (if it invalidateAlls)
- Related: form submit success paths that currently `invalidateAll`

- [ ] **Step 1:** Props → `postId`, `commentsEnabled` only; `const thread = await getCommentThread(postId)`.
- [ ] **Step 2:** Replace `invalidateAll()` with `getCommentThread(postId).refresh()` after pin/like/submit as applicable.
- [ ] **Step 3:** Autofix the component.

---

### Task 5: Wire dashboard + editor

**Files:**
- Modify: `src/routes/dashboard/+page.server.ts` (auth/role only; drop DB)
- Modify: `src/routes/dashboard/+page.svelte`
- Modify: `src/routes/dashboard/posts/[id]/+page.server.ts` (auth only)
- Modify: `src/routes/dashboard/posts/[id]/+page@.svelte`
- Modify: `src/lib/components/editor/PostEditor.svelte` (accept `postId` or fetch when id present)
- Keep: `src/routes/dashboard/posts/new/+page.server.ts` (auth only — already)

**Chosen PostEditor API:** pass `postId?: string | null` from the `[id]` page (`page.params.id`). Inside editor: if `postId`, `const loaded = await getEditorPost(postId)` then seed state from `loaded` (same snapshot pattern as today). New post route passes no id.

- [ ] **Step 1:** Thin dashboard load; page awaits `listAdminPosts()` when `data.user.role === 'admin'`.
- [ ] **Step 2:** Editor route auth-only; page renders `<PostEditor postId={params.id} />`.
- [ ] **Step 3:** Update `PostEditor` to load via remote when `postId` set.
- [ ] **Step 4:** Autofix touched Svelte; run `pnpm check`.

---

### Task 6: Verify

- [ ] **Step 1:** `pnpm check`
- [ ] **Step 2:** Smoke-test mentally / fix any leftover `data.posts` / `data.post` / `data.comments` references for migrated routes.
