import { formatPostDate } from '@/lib/server/blog';
import { db } from '@/lib/server/db';
import { post } from '@/lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	if (locals.user.role !== 'admin') {
		return { user: locals.user, posts: null };
	}

	const rows = await db.query.post.findMany({
		columns: {
			id: true,
			title: true,
			slug: true,
			status: true,
			publishedAt: true,
			updatedAt: true
		},
		orderBy: desc(post.updatedAt)
	});

	return {
		user: locals.user,
		posts: rows.map((row) => ({
			id: row.id,
			title: row.title || 'Untitled',
			slug: row.slug,
			status: row.status,
			publishedDate: row.publishedAt ? formatPostDate(row.publishedAt) : null,
			updatedDate: formatPostDate(row.updatedAt)
		}))
	};
};
