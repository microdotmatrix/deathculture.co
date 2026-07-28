# About & Team pages, with a studio-managed roster

**Date:** 2026-07-24
**Status:** complete — public routes and studio route both built

## Goal

Add the `/about` and `/team` routes the site header already links to, porting the copy from
the old deathculture.co. Team cards become database-backed content managed from the studio,
rather than hardcoded markup.

## Decisions

| Question             | Decision                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who edits team cards | **Admin-only.** Walks back "edited by the team members themselves" from the original brief. The account link is kept anyway (below) so self-editing is a later guard change, not a migration. |
| Card fields          | Portrait, intro line, bio. **Display name derives from `user.name`** — no name column. Matches the old site, where the heading _is_ the intro line and no role/title is shown.                |
| About copy           | **Hardcoded** in the page. Brand voice that changes rarely; edits go through a commit. No page-content table.                                                                                 |
| Team layout          | **Editorial alternating rows**, not the old site's 3-up card grid — `DESIGN.md` and `PRODUCT.md` both name uniform rounded-card grids as an anti-reference.                                   |
| Studio shape         | **Single page with inline expanding row editors**, mirroring `/dashboard/users` + `UserRow.svelte`. Not a list + detail route.                                                                |

## Data model

`src/lib/server/db/schema/team.ts`, re-exported from `schema/index.ts`:

```
teamMember
  id          text pk
  userId      text not null unique → user.id (cascade)
  intro       text not null default ''   -- card heading, e.g. "Hi, I'm Julia."
  bio         text not null default ''
  portraitUrl text                       -- nullable
  sortOrder   integer not null default 0
  published   boolean not null default false
  createdAt / updatedAt
  index (published, sortOrder)
```

Rationale:

- **`userId` required + unique** is what makes name-from-account work, and it keeps the
  self-editing door open (relax `requireAdmin()` to "admin OR owns this row"). Consequence
  accepted: each team member needs a registered account before a profile can exist.
- **No `portraitAlt` column.** Alt text is generated as `Portrait of {name}` — accurate, and
  one less field to leave blank.
- **`published` defaults false** so a half-filled profile cannot leak onto the public page.
- **`sortOrder`** because the roster order is curated, neither alphabetical nor by join date.

## Server layer

`src/lib/team.remote.ts`, following the `blog.remote.ts` split of public query / admin query /
admin command:

| Function                      | Kind      | Guard            | Purpose                                                                                                                                 | Built |
| ----------------------------- | --------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `listTeamMembers`             | `query`   | public           | Published rows, `sortOrder` then `createdAt`; name joined from `user`.                                                                  | yes   |
| `listTeamMembersAdmin`        | `query`   | `requireAdmin()` | All rows including unpublished, plus userId/email.                                                                                      | yes   |
| `listUsersWithoutTeamProfile` | `query`   | `requireAdmin()` | Feeds the "add member" picker.                                                                                                          | yes   |
| `createTeamMember`            | `command` | `requireAdmin()` | Takes a userId. Pre-checks for an existing profile so a duplicate is a readable 400, not a raw unique violation. `sortOrder` = max + 1. | yes   |
| `updateTeamMember`            | `command` | `requireAdmin()` | Sparse patch of intro / bio / portraitUrl / published, like `updateUser`.                                                               | yes   |
| `moveTeamMember`              | `command` | `requireAdmin()` | Renumbers `sortOrder` across the roster from the new positions, in one `db.batch([...])` — the Neon HTTP driver has no transactions.    | yes   |
| `removeTeamMember`            | `command` | `requireAdmin()` | Deletes the profile; the user account is untouched.                                                                                     | yes   |

**Where the pure logic lives.** Helpers and zod schemas sit in `src/lib/team.ts`, _not_
`src/lib/server/team.ts`: nothing in them touches the database, and `src/lib/server/` is
SvelteKit-protected, so the studio component could not have imported the length limits from
there.

**Reorder is a renumber, not a swap.** Swapping two `sortOrder` values is inert when both rows
carry the same one — and every row inserted by hand defaults to `0`. `reorderIds` therefore
returns the new id _order_, and the command writes index-as-`sortOrder` across the whole
roster, repairing duplicates as a side effect.

**Uploads.** A `teamPortrait` endpoint joins the existing `fileRouter` (4MB, 1 file, same
admin-only middleware as `postImage`). `PostFileRouter` gets renamed to `AppFileRouter` once it
carries two endpoints.

**Shared upload component.** Extract `ui/ImageUpload.svelte` (bindable `url`, plus `endpoint`,
`aspect`, `title`, `hint`) from `FeatureImageUpload.svelte`, which becomes a thin wrapper
retaining its `alt` field. Two consumers is real repetition. Blast radius: the post editor.

## Public pages

Both get a `+page.server.ts` returning `headerTone: 'light' as const`, matching `(site)/posts`.
The header already links `/about` and `/team`, so no nav change.

**`/about`** — four movements rather than stacked cards:

1. Light hero — kicker, display H1 "Every human will die. That is inevitable.", lede "What
   isn't is the bullshit. It's the death culture."
2. Light prose — the isolation paragraph and the "we exist to challenge" paragraph, measure
   held to 38rem.
3. Full-bleed Void band — the mission quote in Days One at headline scale under a wide-tracked
   "Mors certa, hora incerta" label. Tonal separation, deliberately _not_ a `border-left`
   stripe, which the design system forbids.
4. Light closing — "What do we do?" plus the "Who are we? →" CTA to `/team`. This CTA is the
   page's single ember, per The One Ember Rule.

**`/team`** — hero (kicker, H1 "Who are we?" echoing the About CTA, lede), then the roster from
`await listTeamMembers()` rendered by `site/TeamMemberRow.svelte`:

- Two-column `md:grid-cols-2` with a `flip` prop on odd indices — same API as `FeatureBand`.
- Portrait 4:5, capped at 26rem and centred, explicit `width`/`height`, duotone
  `grayscale(0.85)` → `grayscale(0.2)` on hover with the Ambient Lift shadow. First row eager
  with `fetchpriority="high"`, the rest lazy. Transform suppressed under
  `prefers-reduced-motion`.
- Intro line as `h2` at title scale; bio split on blank lines into paragraphs, since it comes
  from a plain textarea.
- The name renders only in the portrait's alt text. When there is no portrait, an `sr-only`
  `figcaption` carries it instead — otherwise the name would be absent for everyone.
- Rows separated by vertical rhythm plus a dashed hairline, reusing the journal's
  `article + article` pattern. No cards.
- Empty roster omits the section; the hero still renders.

## Error handling

Zod bounds on every command (intro ≤ 120, bio ≤ 4000, `portraitUrl` as `z.url()` or `''`),
trimmed on write. Duplicate profile creation returns a readable 400. Upload failures render
inline with `role="alert"`. Errors are per-row via `UserRow`'s `run()` shape — a `busy` flag,
try/catch into local state, then `invalidateAll()` — so one failed save never blanks the roster.
Remove goes through a `confirm()` dialog.

## Testing, and a known limitation

The project has **no component or browser test harness** — no vitest, no
`@testing-library/svelte`, no Playwright. The only setup is `node --test` over plain `.ts` via
Node's type stripping, used for two editor helpers.

Delivered: 21 tests over the pure logic in `src/lib/team.ts` — `nextSortOrder(rows)` and
`reorderIds(ids, id, direction)` including both edge cases, the no-mutation guarantee, and the
duplicate-`sortOrder` repair — plus zod boundary tests on the sparse patch schema. Written first,
run red, then implemented. Wired as `test:team` alongside `test:editor`, with a combined `test`
script (31 tests total).

Out of reach with the current harness: Svelte component rendering, the remote functions' DB
paths, the upload middleware, and anything visual. Compilation of every route — including the
auth-gated studio pages — is covered by `pnpm build`. Behavioural checks on those pages need a
signed-in admin and are manual: `pnpm dev` on port 5173 (the Better Auth `ORIGIN` constraint)
across 320/768/1024/1440, plus keyboard navigation, focus visibility, and reduced-motion.

**The 80% coverage target in the global rules is not reachable for this feature as the project
stands.** Adding vitest + `@testing-library/svelte` + Playwright is a larger job than this
feature and should be scoped separately.

## Follow-ups

- `.kicker` is now duplicated across four page stylesheets (journal, users, about, team).
  Worth promoting to `layout.css`, but that touches every page, so not done mid-feature.
- Self-editing for team members: relax the guard to "admin OR owns this row" and add a
  `/dashboard/team` view scoped to the signed-in user's own profile.
