import { getPublishedPostBySlug, listPublishedComments } from '@/lib/server/blog';
import { readCommenterCookie } from '@/lib/server/commenter-cookie';
import { db } from '@/lib/server/db';
import { commenter } from '@/lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const post = await getPublishedPostBySlug(params.slug);
	if (!post) error(404, 'Post not found');

	const [comments, guestName] = await Promise.all([
		listPublishedComments(post.id),
		locals.user ? Promise.resolve(null) : lookupVerifiedGuestName(cookies)
	]);

	return {
		headerTone: 'light' as const,
		post,
		comments,
		memberName: locals.user?.name ?? null,
		guestName
	};
};

async function lookupVerifiedGuestName(
	cookies: Parameters<PageServerLoad>[0]['cookies']
): Promise<string | null> {
	const commenterId = readCommenterCookie(cookies);
	if (!commenterId) return null;

	const guest = await db.query.commenter.findFirst({
		columns: { name: true, verifiedAt: true },
		where: eq(commenter.id, commenterId)
	});

	return guest?.verifiedAt ? guest.name : null;
}
