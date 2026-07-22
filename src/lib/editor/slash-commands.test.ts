import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	createSlashCommandItems,
	filterSlashCommandItems,
	isSafeImageUrl,
	nextSlashCommandIndex,
	type SlashCommandEditor
} from './slash-commands.ts';

function createEditorSpy() {
	const calls: Array<[string, unknown?]> = [];
	const chain = {
		focus() {
			calls.push(['focus']);
			return chain;
		},
		deleteRange(range: unknown) {
			calls.push(['deleteRange', range]);
			return chain;
		},
		setParagraph() {
			calls.push(['setParagraph']);
			return chain;
		},
		setHeading(options: unknown) {
			calls.push(['setHeading', options]);
			return chain;
		},
		setBlockquote() {
			calls.push(['setBlockquote']);
			return chain;
		},
		toggleBulletList() {
			calls.push(['toggleBulletList']);
			return chain;
		},
		toggleOrderedList() {
			calls.push(['toggleOrderedList']);
			return chain;
		},
		insertTable(options: unknown) {
			calls.push(['insertTable', options]);
			return chain;
		},
		run() {
			calls.push(['run']);
			return true;
		}
	};

	return { editor: { chain: () => chain } as SlashCommandEditor, calls };
}

describe('slash commands', () => {
	it('offers the requested block and media tools', () => {
		const items = createSlashCommandItems(() => {});

		assert.deepEqual(
			items.map((item) => item.id),
			[
				'paragraph',
				'heading-2',
				'heading-3',
				'heading-4',
				'blockquote',
				'bullet-list',
				'ordered-list',
				'image',
				'table'
			]
		);
	});

	it('filters case-insensitively across titles, descriptions, and keywords', () => {
		const items = createSlashCommandItems(() => {});

		assert.deepEqual(
			filterSlashCommandItems(items, 'GRID').map((item) => item.id),
			['table']
		);
		assert.deepEqual(
			filterSlashCommandItems(items, 'number').map((item) => item.id),
			['ordered-list']
		);
		assert.deepEqual(filterSlashCommandItems(items, 'missing'), []);
	});

	it('ranks title-prefix matches before looser keyword matches', () => {
		const items = createSlashCommandItems(() => {});
		const results = filterSlashCommandItems(items, 'head');

		assert.deepEqual(
			results.map((item) => item.id),
			['heading-2', 'heading-3', 'heading-4', 'table']
		);
	});

	it('deletes the slash query before inserting a table', () => {
		const { editor, calls } = createEditorSpy();
		const table = createSlashCommandItems(() => {}).find((item) => item.id === 'table');

		table?.command({ editor, range: { from: 4, to: 10 } });

		assert.deepEqual(calls, [
			['focus'],
			['deleteRange', { from: 4, to: 10 }],
			['insertTable', { rows: 3, cols: 3, withHeaderRow: true }],
			['run']
		]);
	});

	it('runs every text and list command through the editor chain', () => {
		const expected = new Map([
			['paragraph', 'setParagraph'],
			['heading-2', 'setHeading'],
			['heading-3', 'setHeading'],
			['heading-4', 'setHeading'],
			['blockquote', 'setBlockquote'],
			['bullet-list', 'toggleBulletList'],
			['ordered-list', 'toggleOrderedList']
		]);

		for (const item of createSlashCommandItems(() => {})) {
			const method = expected.get(item.id);
			if (!method) continue;
			const { editor, calls } = createEditorSpy();

			item.command({ editor, range: { from: 1, to: 2 } });

			assert.ok(
				calls.some(([name]) => name === method),
				`${item.id} should call ${method}`
			);
		}
	});

	it('deletes the slash query before requesting the image dialog', () => {
		const { editor, calls } = createEditorSpy();
		let requested = false;
		const image = createSlashCommandItems(() => (requested = true)).find(
			(item) => item.id === 'image'
		);

		image?.command({ editor, range: { from: 2, to: 8 } });

		assert.equal(requested, true);
		assert.deepEqual(calls.slice(0, 3), [['focus'], ['deleteRange', { from: 2, to: 8 }], ['run']]);
	});

	it('wraps keyboard selection at both ends of the menu', () => {
		assert.equal(nextSlashCommandIndex(0, 4, -1), 3);
		assert.equal(nextSlashCommandIndex(3, 4, 1), 0);
		assert.equal(nextSlashCommandIndex(2, 0, 1), 0);
	});

	it('accepts web image URLs and rejects unsafe or malformed sources', () => {
		assert.equal(isSafeImageUrl('https://cdn.example.com/image.jpg'), true);
		assert.equal(isSafeImageUrl('http://localhost:5173/image.png'), true);
		assert.equal(isSafeImageUrl('javascript:alert(1)'), false);
		assert.equal(isSafeImageUrl('not a url'), false);
	});
});
