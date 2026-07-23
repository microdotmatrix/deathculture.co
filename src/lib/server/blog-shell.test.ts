import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toPublishedPostShell } from './blog-shell.ts';

describe('toPublishedPostShell', () => {
	it('maps published row fields without contentHtml', () => {
		const shell = toPublishedPostShell({
			id: 'p1',
			slug: 'hello',
			title: 'Hello',
			excerpt: 'A short summary.',
			featureImage: 'https://example.com/x.jpg',
			featureImageAlt: 'Alt',
			publishedAt: new Date('2026-01-15T12:00:00.000Z'),
			createdAt: new Date('2026-01-01T12:00:00.000Z'),
			commentsEnabled: true,
			contentHtml: '<p>SECRET</p>',
			author: { name: 'Ada', image: null },
			tags: [{ tag: { name: 'Grief', slug: 'grief' } }]
		});

		assert.equal(shell.slug, 'hello');
		assert.equal(shell.excerpt, 'A short summary.');
		assert.equal(shell.date, '15 Jan 2026');
		assert.deepEqual(shell.tags, [{ name: 'Grief', slug: 'grief' }]);
		assert.equal('contentHtml' in shell, false);
		assert.equal('readingTime' in shell, false);
	});
});
