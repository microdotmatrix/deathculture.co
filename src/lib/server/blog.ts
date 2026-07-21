import { postExtensions } from '@/lib/editor/extensions';
import type { CommentView, PostPreview } from '@/lib/types';
import { generateHTML } from '@tiptap/html';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import type { ViewerIdentity } from './comment-identity';
import { db } from './db';
import { comment, post } from './db/schema';

const WORDS_PER_MINUTE = 220;
const FEATURE_IMAGE_WIDTH = 1600;
const FEATURE_IMAGE_HEIGHT = 900;

/** Renders TipTap JSON with the shared, schema-constrained extension set. */
export function renderPostHtml(content: unknown): string {
	if (!content || typeof content !== 'object') return '';
	return generateHTML(content as Parameters<typeof generateHTML>[0], postExtensions);
}

export function slugify(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

/** Appends -2, -3, … until the slug is free (ignoring the post being edited). */
export async function uniquePostSlug(base: string, excludeId?: string): Promise<string> {
	const fallback = base || 'untitled';
	let candidate = fallback;

	for (let attempt = 2; ; attempt += 1) {
		const clash = await db.query.post.findFirst({
			columns: { id: true },
			where: excludeId
				? and(eq(post.slug, candidate), ne(post.id, excludeId))
				: eq(post.slug, candidate)
		});

		if (!clash) return candidate;
		candidate = `${fallback}-${attempt}`;
	}
}

export function readingTime(html: string): string {
	const words = html
		.replace(/<[^>]*>/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min read`;
}

export function formatPostDate(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

type PostWithTags = typeof post.$inferSelect & {
	tags: { tag: { name: string; slug: string } }[];
};

function toPreview(row: PostWithTags): PostPreview {
	return {
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		date: formatPostDate(row.publishedAt ?? row.createdAt),
		readingTime: readingTime(row.contentHtml),
		image: row.featureImage
			? {
					src: row.featureImage,
					width: FEATURE_IMAGE_WIDTH,
					height: FEATURE_IMAGE_HEIGHT,
					alt: row.featureImageAlt ?? row.title
				}
			: null
	};
}

export async function listPublishedPosts(limit?: number): Promise<PostPreview[]> {
	const rows = await db.query.post.findMany({
		where: eq(post.status, 'published'),
		orderBy: desc(post.publishedAt),
		with: { tags: { with: { tag: { columns: { name: true, slug: true } } } } },
		limit
	});

	return rows.map(toPreview);
}

export async function getPublishedPostBySlug(slug: string) {
	const row = await db.query.post.findFirst({
		where: and(eq(post.slug, slug), eq(post.status, 'published')),
		with: {
			author: { columns: { name: true, image: true } },
			tags: { with: { tag: { columns: { name: true, slug: true } } } }
		}
	});

	if (!row) return null;

	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		contentHtml: row.contentHtml,
		featureImage: row.featureImage,
		featureImageAlt: row.featureImageAlt ?? row.title,
		publishedAt: row.publishedAt ?? row.createdAt,
		commentsEnabled: row.commentsEnabled,
		date: formatPostDate(row.publishedAt ?? row.createdAt),
		readingTime: readingTime(row.contentHtml),
		author: { name: row.author.name, image: row.author.image },
		tags: row.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug }))
	};
}

/**
 * Published comments for a post as a two-level tree (pinned first, then
 * chronological) — never exposes email addresses.
 */
export async function listPublishedComments(
	postId: string,
	viewer: ViewerIdentity
): Promise<CommentView[]> {
	const rows = await db.query.comment.findMany({
		where: and(eq(comment.postId, postId), eq(comment.status, 'published')),
		orderBy: asc(comment.createdAt),
		with: {
			user: { columns: { name: true } },
			commenter: { columns: { name: true } },
			likes: { columns: { userId: true, commenterId: true } }
		}
	});

	const likedByViewer = (likes: { userId: string | null; commenterId: string | null }[]) => {
		if (viewer.type === 'member') return likes.some((like) => like.userId === viewer.userId);
		if (viewer.type === 'guest') {
			return likes.some((like) => like.commenterId === viewer.commenterId);
		}
		return false;
	};

	const toView = (row: (typeof rows)[number]): CommentView => ({
		id: row.id,
		authorName: row.user?.name ?? row.commenter?.name ?? 'Anonymous',
		isMember: !!row.user,
		body: row.body,
		createdAt: row.createdAt,
		pinned: row.pinnedAt !== null,
		likeCount: row.likes.length,
		likedByMe: likedByViewer(row.likes),
		parentId: row.parentId,
		replies: []
	});

	const topLevel = new Map(rows.filter((row) => !row.parentId).map((row) => [row.id, toView(row)]));

	for (const row of rows) {
		// Replies whose parent is missing/unpublished are silently dropped —
		// rare, since deletes cascade to replies.
		if (row.parentId) topLevel.get(row.parentId)?.replies.push(toView(row));
	}

	// Stable sort keeps chronological order within the pinned/unpinned groups.
	return [...topLevel.values()].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
}
