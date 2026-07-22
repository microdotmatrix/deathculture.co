import { Extension, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

export interface SlashCommandChain {
	focus(): SlashCommandChain;
	deleteRange(range: Range): SlashCommandChain;
	setParagraph(): SlashCommandChain;
	setHeading(options: { level: 2 | 3 | 4 }): SlashCommandChain;
	setBlockquote(): SlashCommandChain;
	toggleBulletList(): SlashCommandChain;
	toggleOrderedList(): SlashCommandChain;
	insertTable(options: { rows: number; cols: number; withHeaderRow: boolean }): SlashCommandChain;
	run(): boolean;
}

export interface SlashCommandEditor {
	chain(): SlashCommandChain;
}

export interface SlashCommandContext {
	editor: SlashCommandEditor;
	range: Range;
}

export interface SlashCommandItem {
	id:
		| 'paragraph'
		| 'heading-2'
		| 'heading-3'
		| 'heading-4'
		| 'blockquote'
		| 'bullet-list'
		| 'ordered-list'
		| 'image'
		| 'table';
	title: string;
	description: string;
	keywords: string[];
	group: 'Text' | 'Lists' | 'Media';
	icon: string;
	command: (context: SlashCommandContext) => void;
}

export const slashCommandPluginKey = new PluginKey('slashCommands');

export function createSlashCommandItems(
	requestImage: (context: SlashCommandContext) => void
): SlashCommandItem[] {
	return [
		{
			id: 'paragraph',
			title: 'Text',
			description: 'Start writing with plain body text',
			keywords: ['paragraph', 'body', 'plain'],
			group: 'Text',
			icon: 'T',
			command: ({ editor, range }) =>
				void editor.chain().focus().deleteRange(range).setParagraph().run()
		},
		...([2, 3, 4] as const).map((level): SlashCommandItem => ({
			id: `heading-${level}`,
			title: `Heading ${level}`,
			description: `Create a level ${level} section heading`,
			keywords: [`h${level}`, 'title', 'section'],
			group: 'Text',
			icon: `H${level}`,
			command: ({ editor, range }) =>
				void editor.chain().focus().deleteRange(range).setHeading({ level }).run()
		})),
		{
			id: 'blockquote',
			title: 'Quote',
			description: 'Call out a quotation or passage',
			keywords: ['blockquote', 'citation'],
			group: 'Text',
			icon: '“',
			command: ({ editor, range }) =>
				void editor.chain().focus().deleteRange(range).setBlockquote().run()
		},
		{
			id: 'bullet-list',
			title: 'Bulleted list',
			description: 'Create an unordered list',
			keywords: ['bullet', 'unordered', 'ul'],
			group: 'Lists',
			icon: '•',
			command: ({ editor, range }) =>
				void editor.chain().focus().deleteRange(range).toggleBulletList().run()
		},
		{
			id: 'ordered-list',
			title: 'Numbered list',
			description: 'Create an ordered list',
			keywords: ['number', 'ordered', 'ol'],
			group: 'Lists',
			icon: '1.',
			command: ({ editor, range }) =>
				void editor.chain().focus().deleteRange(range).toggleOrderedList().run()
		},
		{
			id: 'image',
			title: 'Image',
			description: 'Upload or embed an image',
			keywords: ['photo', 'picture', 'media', 'upload'],
			group: 'Media',
			icon: '▧',
			command: (context) => {
				context.editor.chain().focus().deleteRange(context.range).run();
				requestImage(context);
			}
		},
		{
			id: 'table',
			title: 'Table',
			description: 'Create a 3 × 3 grid with a header row',
			keywords: ['grid', 'rows', 'columns', 'header'],
			group: 'Media',
			icon: '▦',
			command: ({ editor, range }) =>
				void editor
					.chain()
					.focus()
					.deleteRange(range)
					.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
					.run()
		}
	];
}

export function filterSlashCommandItems(
	items: SlashCommandItem[],
	query: string
): SlashCommandItem[] {
	const search = query.trim().toLowerCase();
	if (!search) return items;

	return items
		.map((item, index) => {
			const title = item.title.toLowerCase();
			const description = item.description.toLowerCase();
			const keywords = item.keywords.map((keyword) => keyword.toLowerCase());
			const matches =
				title.includes(search) ||
				description.includes(search) ||
				keywords.some((keyword) => keyword.includes(search));
			const rank =
				title === search
					? 0
					: title.startsWith(search)
						? 1
						: keywords.some((keyword) => keyword.startsWith(search))
							? 2
							: 3;

			return { item, index, matches, rank };
		})
		.filter((entry) => entry.matches)
		.sort((left, right) => left.rank - right.rank || left.index - right.index)
		.map((entry) => entry.item);
}

export function nextSlashCommandIndex(current: number, itemCount: number, offset: -1 | 1) {
	if (itemCount === 0) return 0;
	return (current + offset + itemCount) % itemCount;
}

export function isSafeImageUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

type SlashSuggestionOptions = Omit<
	SuggestionOptions<SlashCommandItem, SlashCommandItem>,
	'char' | 'command' | 'editor'
>;

export function createSlashCommandsExtension(options: SlashSuggestionOptions) {
	return Extension.create({
		name: 'slashCommands',

		addProseMirrorPlugins() {
			return [
				Suggestion<SlashCommandItem, SlashCommandItem>({
					...options,
					editor: this.editor,
					char: '/',
					pluginKey: slashCommandPluginKey,
					command: ({ editor, range, props }) => props.command({ editor, range })
				})
			];
		}
	});
}
