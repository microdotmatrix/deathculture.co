import { db } from '@/lib/server/db';
import { comment, post } from '@/lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const STATUSES = ['pending', 'published'] as const;
type CommentStatus = (typeof STATUSES)[number];

function parseStatus(value: string | null): CommentStatus | null {
	return STATUSES.includes(value as CommentStatus) ? (value as CommentStatus) : null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.role !== 'admin') redirect(303, '/dashboard');

	const status = parseStatus(url.searchParams.get('status'));
	const postId = url.searchParams.get('post');

	const [rows, posts] = await Promise.all([
		db.query.comment.findMany({
			where: and(
				status ? eq(comment.status, status) : undefined,
				postId ? eq(comment.postId, postId) : undefined
			),
			orderBy: desc(comment.createdAt),
			with: {
				user: { columns: { name: true } },
				commenter: { columns: { name: true } },
				post: { columns: { title: true, slug: true } },
				parent: { columns: { body: true } }
			}
		}),
		db.query.post.findMany({
			columns: { id: true, title: true },
			orderBy: desc(post.updatedAt)
		})
	]);

	return {
		comments: rows.map((row) => ({
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
		})),
		posts: posts.map((row) => ({ id: row.id, title: row.title || 'Untitled' })),
		filters: { status: status ?? 'all', postId: postId ?? '' }
	};
};
