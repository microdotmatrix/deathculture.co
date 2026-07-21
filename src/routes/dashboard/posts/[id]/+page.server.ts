import { db } from '@/lib/server/db';
import { post } from '@/lib/server/db/schema';
import type { EditorPost } from '@/lib/types';
import type { JSONContent } from '@tiptap/core';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(303, '/login');
	if (locals.user.role !== 'admin') redirect(303, '/dashboard');

	const row = await db.query.post.findFirst({
		where: eq(post.id, params.id),
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
		tags: row.tags.map(({ tag }) => tag.name)
	};

	return { post: editorPost };
};
