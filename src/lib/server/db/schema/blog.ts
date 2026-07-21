import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	index,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const post = pgTable(
	'post',
	{
		id: text('id').primaryKey(),
		title: text('title').default('').notNull(),
		slug: text('slug').notNull().unique(),
		excerpt: text('excerpt').default('').notNull(),
		/** TipTap document as JSON — the canonical source of the post body. */
		content: jsonb('content'),
		/** HTML rendered server-side from `content` with the shared extension set. */
		contentHtml: text('content_html').default('').notNull(),
		featureImage: text('feature_image'),
		featureImageAlt: text('feature_image_alt'),
		status: text('status', { enum: ['draft', 'published'] })
			.default('draft')
			.notNull(),
		publishedAt: timestamp('published_at'),
		commentsEnabled: boolean('comments_enabled').default(true).notNull(),
		authorId: text('author_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('post_status_published_at_idx').on(table.status, table.publishedAt),
		index('post_author_idx').on(table.authorId)
	]
);

export const tag = pgTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const postTag = pgTable(
	'post_tag',
	{
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		tagId: text('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

/** Guest commenters — identified by email, verified once via emailed link. */
export const commenter = pgTable('commenter', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	verifiedAt: timestamp('verified_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const comment = pgTable(
	'comment',
	{
		id: text('id').primaryKey(),
		postId: text('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		/** Set when the comment was left by a registered member. */
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		/** Set when the comment was left by a guest. */
		commenterId: text('commenter_id').references(() => commenter.id, { onDelete: 'cascade' }),
		/** Always the top-level comment's id — replies to replies are flattened in app logic. */
		parentId: text('parent_id').references((): AnyPgColumn => comment.id, {
			onDelete: 'cascade'
		}),
		body: text('body').notNull(),
		status: text('status', { enum: ['pending', 'published'] })
			.default('pending')
			.notNull(),
		/** Non-null = pinned; doubles as the pin timestamp. Top-level comments only. */
		pinnedAt: timestamp('pinned_at'),
		/** One-shot email verification token for guest comments. */
		verifyToken: text('verify_token').unique(),
		verifyTokenExpiresAt: timestamp('verify_token_expires_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('comment_post_status_idx').on(table.postId, table.status),
		index('comment_parent_idx').on(table.parentId)
	]
);

/** One like per identity — a member (userId) or a verified guest (commenterId). */
export const commentLike = pgTable(
	'comment_like',
	{
		id: text('id').primaryKey(),
		commentId: text('comment_id')
			.notNull()
			.references(() => comment.id, { onDelete: 'cascade' }),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		commenterId: text('commenter_id').references(() => commenter.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('comment_like_comment_idx').on(table.commentId),
		uniqueIndex('comment_like_user_unique')
			.on(table.commentId, table.userId)
			.where(sql`${table.userId} is not null`),
		uniqueIndex('comment_like_commenter_unique')
			.on(table.commentId, table.commenterId)
			.where(sql`${table.commenterId} is not null`)
	]
);

export const postRelations = relations(post, ({ one, many }) => ({
	author: one(user, { fields: [post.authorId], references: [user.id] }),
	tags: many(postTag),
	comments: many(comment)
}));

export const tagRelations = relations(tag, ({ many }) => ({
	posts: many(postTag)
}));

export const postTagRelations = relations(postTag, ({ one }) => ({
	post: one(post, { fields: [postTag.postId], references: [post.id] }),
	tag: one(tag, { fields: [postTag.tagId], references: [tag.id] })
}));

export const commenterRelations = relations(commenter, ({ many }) => ({
	comments: many(comment)
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
	post: one(post, { fields: [comment.postId], references: [post.id] }),
	user: one(user, { fields: [comment.userId], references: [user.id] }),
	commenter: one(commenter, { fields: [comment.commenterId], references: [commenter.id] }),
	parent: one(comment, {
		fields: [comment.parentId],
		references: [comment.id],
		relationName: 'commentReplies'
	}),
	replies: many(comment, { relationName: 'commentReplies' }),
	likes: many(commentLike)
}));

export const commentLikeRelations = relations(commentLike, ({ one }) => ({
	comment: one(comment, { fields: [commentLike.commentId], references: [comment.id] }),
	user: one(user, { fields: [commentLike.userId], references: [user.id] }),
	commenter: one(commenter, { fields: [commentLike.commenterId], references: [commenter.id] })
}));
