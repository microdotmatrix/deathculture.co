import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** Newsletter subscriptions — keyed by email so anonymous visitors can subscribe too. */
export const subscriber = pgTable('subscriber', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	status: text('status', { enum: ['subscribed', 'unsubscribed'] })
		.default('subscribed')
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});
