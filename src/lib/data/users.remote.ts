import { command } from '$app/server';
import { requireAdmin } from '@/lib/server/admin';
import { db } from '@/lib/server/db';
import { subscriber, user } from '@/lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const updateUserSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(200).optional(),
	role: z.enum(['admin', 'member']).optional(),
	canComment: z.boolean().optional(),
	subscribed: z.boolean().optional()
});

export const updateUser = command(updateUserSchema, async (data) => {
	const admin = requireAdmin();

	const target = await db.query.user.findFirst({
		columns: { id: true, email: true },
		where: eq(user.id, data.id)
	});
	if (!target) error(404, 'User not found');

	if (data.role && data.role !== 'admin' && target.id === admin.id) {
		error(400, 'You cannot remove your own admin role');
	}

	const patch = {
		...(data.name !== undefined ? { name: data.name.trim() } : {}),
		...(data.role !== undefined ? { role: data.role } : {}),
		...(data.canComment !== undefined ? { canComment: data.canComment } : {})
	};

	if (Object.keys(patch).length > 0) {
		await db.update(user).set(patch).where(eq(user.id, data.id));
	}

	// Newsletter status lives in the subscriber table, keyed by email.
	if (data.subscribed === true) {
		await db
			.insert(subscriber)
			.values({ id: randomUUID(), email: target.email, status: 'subscribed' })
			.onConflictDoUpdate({ target: subscriber.email, set: { status: 'subscribed' } });
	} else if (data.subscribed === false) {
		await db
			.update(subscriber)
			.set({ status: 'unsubscribed' })
			.where(eq(subscriber.email, target.email));
	}

	return { updated: true };
});

/**
 * Deletes the account (sessions/credentials cascade). Their comments are kept
 * and render as "Anonymous" — comment.userId is set-null on delete.
 */
export const removeUser = command(z.string(), async (id) => {
	const admin = requireAdmin();
	if (id === admin.id) error(400, 'You cannot remove your own account');

	await db.delete(user).where(eq(user.id, id));
	return { deleted: true };
});
