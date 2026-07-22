import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Window } from 'happy-dom';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { SlashCommandItem } from './slash-commands.ts';

function installBrowserGlobals() {
	const browser = new Window({ url: 'http://localhost' });
	const globals = {
		window: browser,
		document: browser.document,
		navigator: browser.navigator,
		Node: browser.Node,
		Element: browser.Element,
		HTMLElement: browser.HTMLElement,
		MutationObserver: browser.MutationObserver,
		DOMRect: browser.DOMRect,
		getComputedStyle: browser.getComputedStyle.bind(browser),
		requestAnimationFrame: browser.requestAnimationFrame.bind(browser),
		cancelAnimationFrame: browser.cancelAnimationFrame.bind(browser)
	};

	for (const [name, value] of Object.entries(globals)) {
		Object.defineProperty(globalThis, name, { configurable: true, value });
	}
}

describe('slash command Tiptap integration', () => {
	it('opens on slash and inserts the selected table into the document', async () => {
		installBrowserGlobals();
		const [{ Editor }, { postExtensions }, slashCommands] = await Promise.all([
			import('@tiptap/core'),
			import('./extensions.ts'),
			import('./slash-commands.ts')
		]);
		const state: { menu: SuggestionProps<SlashCommandItem, SlashCommandItem> | null } = {
			menu: null
		};
		const items = slashCommands.createSlashCommandItems(() => {});
		const slashExtension = slashCommands.createSlashCommandsExtension({
			items: ({ query }) => slashCommands.filterSlashCommandItems(items, query),
			render: () => ({
				onStart: (props) => (state.menu = props),
				onUpdate: (props) => (state.menu = props),
				onExit: () => (state.menu = null)
			})
		});
		const host = document.createElement('div');
		document.body.append(host);
		const editor = new Editor({
			element: host,
			extensions: [...postExtensions, slashExtension],
			content: { type: 'doc', content: [{ type: 'paragraph' }] }
		});

		editor.commands.focus('end');
		editor.commands.insertContent('/tab');
		await new Promise((resolve) => setTimeout(resolve, 0));

		const menu = state.menu;
		assert.ok(menu);
		assert.deepEqual(
			menu.items.map((item) => item.id),
			['table']
		);
		menu.command(menu.items[0]);
		assert.equal(editor.getJSON().content?.[0]?.type, 'table');

		editor.destroy();
	});
});
