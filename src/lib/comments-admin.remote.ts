import { command } from '$app/server';
import { requireAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/db';
import { comment } from '@/lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

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
