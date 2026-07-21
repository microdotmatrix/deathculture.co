import { command, form } from '$app/server';
import { resolveViewerIdentity } from '@/lib/server/comment-identity';
import { db } from '@/lib/server/db';
import { comment, commentLike, commenter, post } from '@/lib/server/db/schema';
import { sendCommentVerificationEmail } from '@/lib/server/email';
import { error, invalid } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';
import { randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
// $env/static/private: auth CLI cannot resolve $app/env/private yet (alias collision).
import { ORIGIN } from '$env/static/private';

const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const PENDING_WINDOW_MS = 1000 * 60 * 60; // 1 hour
const MAX_PENDING_PER_WINDOW = 3;

const commentSchema = z.object({
	postId: z.string(),
	/** Top-level comment being replied to; absent for top-level comments. */
	parentId: z.string().optional(),
	body: z
		.string()
		.min(2, 'Say a little more than that')
		.max(5000, 'Comments are limited to 5000 characters'),
	name: z.string().max(100).optional(),
	email: z.string().max(200).optional(),
	/** Honeypot — humans never see or fill this field. */
	website: z.string().optional()
});

export const submitComment = form(commentSchema, async (data, issue) => {
	// Bots that fill the honeypot get a quiet, convincing no-op.
	if (data.website) return { status: 'published' as const };

	const target = await db.query.post.findFirst({
		columns: { id: true, title: true, slug: true, commentsEnabled: true },
		where: and(eq(post.id, data.postId), eq(post.status, 'published'))
	});

	if (!target) error(404, 'Post not found');
	if (!target.commentsEnabled) error(403, 'Comments are closed on this post');

	const body = data.body.trim();
	const parentId = await resolveParentId(data.parentId, target.id);
	const viewer = await resolveViewerIdentity();

	// Members comment instantly — unless commenting was switched off for them.
	if (viewer.type === 'member') {
		if (!viewer.canComment) error(403, "You're not able to comment right now");

		await db.insert(comment).values({
			id: randomUUID(),
			postId: target.id,
			userId: viewer.userId,
			parentId,
			body,
			status: 'published'
		});

		return { status: 'published' as const };
	}

	// Guests who verified before carry a signed cookie.
	if (viewer.type === 'guest') {
		await db.insert(comment).values({
			id: randomUUID(),
			postId: target.id,
			commenterId: viewer.commenterId,
			parentId,
			body,
			status: 'published'
		});

		return { status: 'published' as const };
	}

	// First-time guest: hold the comment until the emailed link is clicked.
	const name = data.name?.trim() ?? '';
	const email = data.email?.trim().toLowerCase() ?? '';

	const guestIssues = [
		...(name.length < 2 ? [issue.name('Tell us your name')] : []),
		...(!z.email().safeParse(email).success ? [issue.email('Enter a valid email address')] : [])
	];
	if (guestIssues.length > 0) invalid(...guestIssues);

	let guest = await db.query.commenter.findFirst({
		columns: { id: true },
		where: eq(commenter.email, email)
	});

	if (!guest) {
		const id = randomUUID();
		await db.insert(commenter).values({ id, email, name });
		guest = { id };
	}

	// Caps verification emails per address so the endpoint can't be used to
	// email-bomb someone else's inbox.
	const recentPending = await db.$count(
		comment,
		and(
			eq(comment.commenterId, guest.id),
			eq(comment.status, 'pending'),
			gt(comment.createdAt, new Date(Date.now() - PENDING_WINDOW_MS))
		)
	);
	if (recentPending >= MAX_PENDING_PER_WINDOW) {
		error(429, 'Too many comment attempts for this email address — please try again later');
	}

	const token = randomBytes(32).toString('base64url');

	await db.insert(comment).values({
		id: randomUUID(),
		postId: target.id,
		commenterId: guest.id,
		parentId,
		body,
		status: 'pending',
		verifyToken: token,
		verifyTokenExpiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS)
	});

	await sendCommentVerificationEmail({
		to: email,
		name,
		postTitle: target.title,
		verifyUrl: `${ORIGIN}/api/comments/verify/${token}`
	});

	return { status: 'pending' as const };
});

/** One like per identity, toggled — members and verified guests only. */
export const toggleCommentLike = command(
	z.object({ commentId: z.string() }),
	async ({ commentId }) => {
		const viewer = await resolveViewerIdentity();
		if (viewer.type === 'anonymous') {
			error(401, 'Sign in or verify your email to like comments');
		}

		const target = await db.query.comment.findFirst({
			columns: { id: true },
			where: and(eq(comment.id, commentId), eq(comment.status, 'published'))
		});
		if (!target) error(404, 'Comment not found');

		const identityFilter =
			viewer.type === 'member'
				? and(eq(commentLike.commentId, commentId), eq(commentLike.userId, viewer.userId))
				: and(
						eq(commentLike.commentId, commentId),
						eq(commentLike.commenterId, viewer.commenterId)
					);

		const existing = await db.query.commentLike.findFirst({
			columns: { id: true },
			where: identityFilter
		});

		if (existing) {
			await db.delete(commentLike).where(eq(commentLike.id, existing.id));
			return { liked: false };
		}

		await db
			.insert(commentLike)
			.values({
				id: randomUUID(),
				commentId,
				userId: viewer.type === 'member' ? viewer.userId : null,
				commenterId: viewer.type === 'guest' ? viewer.commenterId : null
			})
			// The partial unique indexes make double-submits a no-op.
			.onConflictDoNothing();

		return { liked: true };
	}
);

/**
 * Validates a reply target and flattens reply-to-reply onto the top-level
 * comment, keeping threads a single level deep.
 */
async function resolveParentId(
	requestedParentId: string | undefined,
	postId: string
): Promise<string | null> {
	if (!requestedParentId) return null;

	const parent = await db.query.comment.findFirst({
		columns: { id: true, postId: true, parentId: true, status: true },
		where: eq(comment.id, requestedParentId)
	});

	if (!parent || parent.postId !== postId || parent.status !== 'published') {
		error(400, 'Comment not found');
	}

	return parent.parentId ?? parent.id;
}
