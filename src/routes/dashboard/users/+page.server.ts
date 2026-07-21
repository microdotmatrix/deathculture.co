import { formatPostDate } from '@/lib/server/blog';
import { db } from '@/lib/server/db';
import { comment, subscriber, user } from '@/lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.role !== 'admin') redirect(303, '/dashboard');

	// No pagination yet — fine for a small blog; revisit past a few hundred users.
	const rows = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			canComment: user.canComment,
			createdAt: user.createdAt,
			subscriberStatus: subscriber.status,
			commentCount: sql<number>`count(${comment.id})`.mapWith(Number)
		})
		.from(user)
		.leftJoin(subscriber, eq(subscriber.email, user.email))
		.leftJoin(comment, eq(comment.userId, user.id))
		.groupBy(user.id, subscriber.status)
		.orderBy(desc(user.createdAt));

	return {
		users: rows.map((row) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			role: row.role,
			canComment: row.canComment,
			subscribed: row.subscriberStatus === 'subscribed',
			commentCount: row.commentCount,
			joined: formatPostDate(row.createdAt)
		}))
	};
};
