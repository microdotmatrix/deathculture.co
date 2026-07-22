import { command, query } from '$app/server';
import { requireAdmin } from '@/lib/server/admin';
import {
	formatPostDate,
	getPublishedPostBySlug,
	listPublishedPosts as listPublishedPostsFromDb,
	renderPostHtml,
	slugify,
	uniquePostSlug
} from '@/lib/server/blog';
import { db } from '@/lib/server/db';
import { post, postTag, tag } from '@/lib/server/db/schema';
import type { EditorPost } from '@/lib/types';
import type { JSONContent } from '@tiptap/core';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const MAX_TAGS = 10;

const listPublishedPostsSchema = z
	.object({
		limit: z.number().int().positive().optional()
	})
	.optional();

/** Published post previews for the journal and landing page. */
export const listPublishedPosts = query(listPublishedPostsSchema, async (opts) => {
	return listPublishedPostsFromDb(opts?.limit);
});

/** Single published post by slug — throws 404 when missing. */
export const getPublishedPost = query(z.string().min(1), async (slug) => {
	const row = await getPublishedPostBySlug(slug);
	if (!row) error(404, 'Post not found');
	return row;
});

/** Admin dashboard post list (newest edits first). */
export const listAdminPosts = query(async () => {
	requireAdmin();

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

	return rows.map((row) => ({
		id: row.id,
		title: row.title || 'Untitled',
		slug: row.slug,
		status: row.status,
		publishedDate: row.publishedAt ? formatPostDate(row.publishedAt) : null,
		updatedDate: formatPostDate(row.updatedAt)
	}));
});

/** Full editor document for a post id. */
export const getEditorPost = query(z.string().min(1), async (id) => {
	requireAdmin();

	const row = await db.query.post.findFirst({
		where: eq(post.id, id),
		with: { tags: { with: { tag: { columns: { name: true } } } } }
	});

	if (!row) error(404, 'Post not found');

	const editorPost: EditorPost = {
		id: row.id,
		title: row.title,
		content: (row.content as JSONContent | null) ?? null,
		excerpt: row.excerpt,
		slug: row.slug,
		featureImage: row.featureImage ?? '',
		featureImageAlt: row.featureImageAlt ?? '',
		status: row.status,
		tags: row.tags.map(({ tag: t }) => t.name),
		commentsEnabled: row.commentsEnabled
	};

	return editorPost;
});

const savePostSchema = z.object({
	id: z.string().optional(),
	title: z.string().max(300),
	/** TipTap document, JSON-stringified by the editor. */
	content: z.string().max(500_000),
	excerpt: z.string().max(1000),
	slug: z.string().max(200),
	featureImage: z.union([z.url(), z.literal('')]),
	featureImageAlt: z.string().max(300),
	tags: z.array(z.string().min(1).max(50)).max(MAX_TAGS),
	status: z.enum(['draft', 'published']),
	commentsEnabled: z.boolean()
});

export const savePost = command(savePostSchema, async (data) => {
	const admin = requireAdmin();

	let content: unknown;
	try {
		content = JSON.parse(data.content);
	} catch {
		error(400, 'Post content is not valid JSON');
	}

	const contentHtml = renderPostHtml(content);
	const title = data.title.trim() || 'Untitled';
	const id = data.id ?? randomUUID();
	const slug = await uniquePostSlug(slugify(data.slug.trim() || title), data.id);

	const existing = data.id
		? await db.query.post.findFirst({
				columns: { id: true, publishedAt: true },
				where: eq(post.id, data.id)
			})
		: null;

	if (data.id && !existing) error(404, 'Post not found');

	const publishedAt =
		data.status === 'published' ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt;

	const values = {
		title,
		slug,
		excerpt: data.excerpt.trim(),
		content,
		contentHtml,
		featureImage: data.featureImage || null,
		featureImageAlt: data.featureImageAlt.trim() || null,
		status: data.status,
		publishedAt: publishedAt ?? null,
		commentsEnabled: data.commentsEnabled
	};

	if (existing) {
		await db.update(post).set(values).where(eq(post.id, id));
	} else {
		await db.insert(post).values({ ...values, id, authorId: admin.id });
	}

	await syncTags(id, data.tags);

	return { id, slug, status: data.status };
});

export const deletePost = command(z.string(), async (id) => {
	requireAdmin();
	await db.delete(post).where(eq(post.id, id));
	return { deleted: true };
});

async function syncTags(postId: string, names: string[]) {
	const unique = [...new Map(names.map((name) => [slugify(name), name.trim()])).entries()].filter(
		([slug, name]) => slug && name
	);

	await db.delete(postTag).where(eq(postTag.postId, postId));
	if (unique.length === 0) return;

	await db
		.insert(tag)
		.values(unique.map(([slug, name]) => ({ id: randomUUID(), slug, name })))
		.onConflictDoNothing({ target: tag.slug });

	const rows = await db.query.tag.findMany({
		columns: { id: true, slug: true },
		where: (table, { inArray }) =>
			inArray(
				table.slug,
				unique.map(([slug]) => slug)
			)
	});

	await db.insert(postTag).values(rows.map((row) => ({ postId, tagId: row.id })));
}
