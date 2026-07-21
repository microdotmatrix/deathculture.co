import { getRequestEvent } from '$app/server';
import { eq } from 'drizzle-orm';
import { readCommenterCookie } from './commenter-cookie';
import { db } from './db';
import { commenter } from './db/schema';

export type ViewerIdentity =
	| { type: 'member'; userId: string; name: string; canComment: boolean }
	| { type: 'guest'; commenterId: string; name: string }
	| { type: 'anonymous' };

/**
 * Resolves who is looking at / posting to a comment thread: a signed-in member,
 * a verified guest (signed `dc_commenter` cookie), or an anonymous visitor.
 * Works in both remote functions and server `load` functions.
 */
export async function resolveViewerIdentity(): Promise<ViewerIdentity> {
	const { locals, cookies } = getRequestEvent();

	if (locals.user) {
		return {
			type: 'member',
			userId: locals.user.id,
			name: locals.user.name,
			canComment: locals.user.canComment
		};
	}

	const cookieId = readCommenterCookie(cookies);
	if (!cookieId) return { type: 'anonymous' };

	const guest = await db.query.commenter.findFirst({
		columns: { id: true, name: true, verifiedAt: true },
		where: eq(commenter.id, cookieId)
	});

	if (!guest?.verifiedAt) return { type: 'anonymous' };
	return { type: 'guest', commenterId: guest.id, name: guest.name };
}
