import type { PublishedPostShell } from '../types.ts';
import { formatPostDate } from './blog-format.ts';

export type PublishedPostShellRow = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	featureImage: string | null;
	featureImageAlt: string | null;
	publishedAt: Date | null;
	createdAt: Date;
	commentsEnabled: boolean;
	author: { name: string; image: string | null };
	tags: { tag: { name: string; slug: string } }[];
};

/** Maps a published post row to shell metadata — never includes contentHtml. */
export function toPublishedPostShell(row: PublishedPostShellRow): PublishedPostShell {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		featureImage: row.featureImage ?? '',
		featureImageAlt: row.featureImageAlt ?? row.title,
		publishedAt: row.publishedAt ?? row.createdAt,
		commentsEnabled: row.commentsEnabled,
		date: formatPostDate(row.publishedAt ?? row.createdAt),
		author: { name: row.author.name, image: row.author.image },
		tags: row.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug }))
	};
}
