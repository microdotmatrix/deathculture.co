import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Public team-page profiles. Standalone by design: a member does not need a user
 * account on the site to appear on the roster, so the profile carries its own
 * name rather than borrowing one. The roster is admin-managed from the studio.
 */
export const teamMember = pgTable(
	'team_member',
	{
		id: text('id').primaryKey(),
		/** Display name, and the portrait's alt text. */
		name: text('name').notNull(),
		/** Card heading, in the member's own voice — e.g. "Hi, I'm Julia." */
		intro: text('intro').default('').notNull(),
		bio: text('bio').default('').notNull(),
		portraitUrl: text('portrait_url'),
		/** Curated order — the roster is neither alphabetical nor by join date. */
		sortOrder: integer('sort_order').default(0).notNull(),
		published: boolean('published').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('team_member_published_order_idx').on(table.published, table.sortOrder)]
);
