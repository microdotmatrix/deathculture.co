# Posts remote functions — design

## Goal

Move post (and comment-thread) data fetching from route `load` functions into SvelteKit remote `query` functions, owned by the page or component that renders the data. Keep route `load` for auth, redirects, and thin route concerns (`headerTone`).

## Ownership rule

- **Route `load`:** authentication, redirects, globals, route/query params handling, layout chrome (`headerTone`).
- **Remote `query` in page/component:** any data previously fetched in `load` only to render in that page or to pass into a child.

## Remotes

### `src/lib/blog.remote.ts` (extend)

| Export | Kind | Auth | Purpose |
|--------|------|------|---------|
| `listPublishedPosts` | `query` | public | Journal + landing lists (`limit` optional) |
| `getPublishedPost` | `query(slug)` | public | Single published post; `error(404)` if missing |
| `listAdminPosts` | `query` | `requireAdmin()` | Dashboard post list |
| `getEditorPost` | `query(id)` | `requireAdmin()` | Editor document; `error(404)` if missing |
| `savePost` / `deletePost` | `command` | already exist | unchanged |

Implementation reuses helpers in `src/lib/server/blog.ts` where possible.

### `src/lib/comments.remote.ts` (extend)

| Export | Kind | Purpose |
|--------|------|---------|
| `getCommentThread` | `query(postId)` | Comments tree + viewer flags (`memberName`, `guestName`, `canComment`, `canLike`) |

After pin / like / submit, refresh via `getCommentThread(postId).refresh()` instead of `invalidateAll()` when the thread query is the source of truth.

## Consumers

| Surface | Change |
|---------|--------|
| `(site)/+page.svelte` | `await listPublishedPosts(3)`; delete `+page.server.ts` |
| `(site)/posts/+page.svelte` | `await listPublishedPosts()`; load keeps `headerTone` only |
| `(site)/posts/[slug]/+page.svelte` | `await getPublishedPost(slug)`; load keeps `headerTone` only |
| `CommentSection` | `await getCommentThread(postId)`; props shrink to `postId` + `commentsEnabled` |
| `dashboard/+page.svelte` | admin branch `await listAdminPosts()`; load keeps user/role gate (or rely on layout + role check in page) |
| `dashboard/posts/[id]` | auth-only load; `PostEditor` loads via `getEditorPost(id)` |
| `dashboard/posts/new` | auth-only load; `PostEditor` with no id (unchanged empty state) |

## Out of scope

- Dashboard comments moderation list / post filter dropdown (stays in load for now)
- Users / newsletter remotes
- Converting `savePost`/`deletePost` to `form` remotes
