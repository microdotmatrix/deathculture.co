import { setCommenterCookie } from '@/lib/server/commenter-cookie';
import { db } from '@/lib/server/db';
import { comment, commenter } from '@/lib/server/db/schema';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/**
 * Guest comment verification link target. Publishes the held comment, marks
 * the guest as verified, and sets the signed cookie that lets them keep
 * commenting without another round-trip through email.
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = params.token ?? '';

	const row = token
		? await db.query.comment.findFirst({
				where: eq(comment.verifyToken, token),
				with: { post: { columns: { slug: true } } }
			})
		: undefined;

	if (!row || !row.commenterId) {
		redirect(303, '/posts?comment=invalid');
	}

	if (!row.verifyTokenExpiresAt || row.verifyTokenExpiresAt < new Date()) {
		redirect(303, `/posts/${row.post.slug}?comment=expired#comments`);
	}

	await db.batch([
		db
			.update(comment)
			.set({ status: 'published', verifyToken: null, verifyTokenExpiresAt: null })
			.where(eq(comment.id, row.id)),
		db.update(commenter).set({ verifiedAt: new Date() }).where(eq(commenter.id, row.commenterId))
	]);

	setCommenterCookie(cookies, row.commenterId);

	redirect(303, `/posts/${row.post.slug}#comment-${row.id}`);
};
