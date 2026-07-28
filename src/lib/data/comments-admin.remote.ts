import { command, query } from '$app/server';
import { requireAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/db';
import { comment, post } from '@/lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const moderationFiltersSchema = z
	.object({
		status: z.enum(['pending', 'published']).optional(),
		postId: z.string().min(1).optional()
	})
	.optional();

/** Filtered moderation queue for the studio comments page. */
export const listModerationComments = query(moderationFiltersSchema, async (filters) => {
	requireAdmin();

	const rows = await db.query.comment.findMany({
		where: and(
			filters?.status ? eq(comment.status, filters.status) : undefined,
			filters?.postId ? eq(comment.postId, filters.postId) : undefined
		),
		orderBy: desc(comment.createdAt),
		with: {
			user: { columns: { name: true } },
			commenter: { columns: { name: true } },
			post: { columns: { title: true, slug: true } },
			parent: { columns: { body: true } }
		}
	});

	return rows.map((row) => ({
		id: row.id,
		postTitle: row.post.title || 'Untitled',
		postSlug: row.post.slug,
		authorName: row.user?.name ?? row.commenter?.name ?? 'Anonymous',
		isMember: !!row.user,
		status: row.status,
		pinned: row.pinnedAt !== null,
		isReply: row.parentId !== null,
		parentSnippet: row.parent?.body.slice(0, 80) ?? null,
		body: row.body,
		createdAt: row.createdAt
	}));
});

/** Post titles for the moderation filter dropdown. */
export const listAdminPostOptions = query(async () => {
	requireAdmin();

	const rows = await db.query.post.findMany({
		columns: { id: true, title: true },
		orderBy: desc(post.updatedAt)
	});

	return rows.map((row) => ({ id: row.id, title: row.title || 'Untitled' }));
});

/** Pins/unpins a top-level comment; pinned comments sort to the top. */
export const togglePin = command(z.string(), async (commentId) => {
	requireAdmin();

	const target = await db.query.comment.findFirst({
		columns: { id: true, parentId: true, pinnedAt: true },
		where: eq(comment.id, commentId)
	});

	if (!target) error(404, 'Comment not found');
	if (target.parentId) error(400, 'Only top-level comments can be pinned');

	await db
		.update(comment)
		.set({ pinnedAt: target.pinnedAt ? null : new Date() })
		.where(eq(comment.id, commentId));

	return { pinned: !target.pinnedAt };
});

const updateCommentBodySchema = z.object({
	id: z.string(),
	body: z.string().min(1).max(5000)
});

export const updateCommentBody = command(updateCommentBodySchema, async ({ id, body }) => {
	requireAdmin();

	const trimmed = body.trim();
	if (!trimmed) error(400, 'Comment cannot be empty');

	await db.update(comment).set({ body: trimmed }).where(eq(comment.id, id));
	return { updated: true };
});

/** Also removes replies (cascade on parentId) and likes (cascade). */
export const deleteComment = command(z.string(), async (id) => {
	requireAdmin();
	await db.delete(comment).where(eq(comment.id, id));
	return { deleted: true };
});
