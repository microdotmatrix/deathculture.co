import { form } from '$app/server';
import { db } from '@/lib/server/db';
import { subscriber } from '@/lib/server/db/schema';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const subscribe = form(
	z.object({ email: z.email('Enter a valid email address') }),
	async ({ email }) => {
		const normalized = email.trim().toLowerCase();
		// Re-subscribing after an unsubscribe flips the status back on.
		await db
			.insert(subscriber)
			.values({ id: randomUUID(), email: normalized, status: 'subscribed' })
			.onConflictDoUpdate({ target: subscriber.email, set: { status: 'subscribed' } });
		return { success: true, email: normalized };
	}
);
