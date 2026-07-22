<script lang="ts">
	import InlineImageDialog from '@/lib/components/editor/InlineImageDialog.svelte';
	import { postExtensions } from '@/lib/editor/extensions';
	import {
		createSlashCommandItems,
		createSlashCommandsExtension,
		filterSlashCommandItems,
		nextSlashCommandIndex,
		slashCommandPluginKey,
		type SlashCommandContext,
		type SlashCommandItem
	} from '@/lib/editor/slash-commands';
	import { Editor, type JSONContent } from '@tiptap/core';
	import { BubbleMenu } from '@tiptap/extension-bubble-menu';
	import { Placeholder } from '@tiptap/extensions';
	import {
		exitSuggestion,
		type SuggestionKeyDownProps,
		type SuggestionProps
	} from '@tiptap/suggestion';
	import { tick } from 'svelte';

	interface Props {
		/** Initial TipTap document. Later changes to this prop are ignored. */
		initialContent: JSONContent | null;
		placeholder?: string;
		onUpdate: (doc: JSONContent) => void;
	}

	let {
		initialContent,
		placeholder = 'Begin writing your story… Type / for blocks.',
		onUpdate
	}: Props = $props();

	// Captured once so the editor attachment never re-runs on prop changes.
	// svelte-ignore state_referenced_locally
	const init = { content: initialContent, placeholder, onUpdate };

	let bubbleEl: HTMLDivElement | undefined = $state();
	let editorState = $state.raw<{ editor: Editor | null }>({ editor: null });
	let linkMode = $state(false);
	let linkValue = $state('');
	let slashMenuEl: HTMLDivElement | undefined = $state();
	let slashMenu = $state.raw<{
		items: SlashCommandItem[];
		command: (item: SlashCommandItem) => void;
	} | null>(null);
	let selectedSlashIndex = $state(0);
	let imageDialogOpen = $state(false);
	let imageEditor: Editor | null = null;
	let cleanupSlashMenu: (() => void) | null = null;
	let slashMenuSession = 0;

	type SlashSuggestionProps = SuggestionProps<SlashCommandItem, SlashCommandItem>;

	const slashItems = createSlashCommandItems(openImageDialog);

	function isActive(name: string, attrs?: Record<string, unknown>) {
		return editorState.editor?.isActive(name, attrs) ?? false;
	}

	function chain() {
		return editorState.editor?.chain().focus();
	}

	function openLinkInput() {
		linkValue = (editorState.editor?.getAttributes('link').href as string | undefined) ?? '';
		linkMode = true;
	}

	function applyLink(event: SubmitEvent) {
		event.preventDefault();
		const href = linkValue.trim();

		if (href) {
			chain()?.extendMarkRange('link').setLink({ href }).run();
		} else {
			chain()?.extendMarkRange('link').unsetLink().run();
		}

		linkMode = false;
	}

	function openImageDialog({ editor }: SlashCommandContext) {
		imageEditor = editor as Editor;
		imageDialogOpen = true;
	}

	function closeImageDialog() {
		imageDialogOpen = false;
		imageEditor?.commands.focus();
		imageEditor = null;
	}

	function insertImage(image: { src: string; alt: string }) {
		imageEditor?.chain().focus().setImage(image).run();
		imageDialogOpen = false;
		imageEditor = null;
	}

	function selectSlashItem(index: number) {
		const item = slashMenu?.items[index];
		if (item) slashMenu?.command(item);
	}

	function moveSlashSelection(offset: -1 | 1) {
		selectedSlashIndex = nextSlashCommandIndex(
			selectedSlashIndex,
			slashMenu?.items.length ?? 0,
			offset
		);
		void tick().then(() => {
			slashMenuEl
				?.querySelector<HTMLElement>(`[data-command-index="${selectedSlashIndex}"]`)
				?.scrollIntoView({ block: 'nearest' });
		});
	}

	function updateSlashMenu(props: SlashSuggestionProps) {
		slashMenu = { items: props.items, command: props.command };
		selectedSlashIndex = 0;
	}

	function renderSlashMenu() {
		return {
			onStart(props: SlashSuggestionProps) {
				const session = ++slashMenuSession;
				updateSlashMenu(props);

				void tick().then(() => {
					if (session !== slashMenuSession || !slashMenuEl) return;
					cleanupSlashMenu?.();
					cleanupSlashMenu = props.mount(slashMenuEl);
				});
			},
			onUpdate(props: SlashSuggestionProps) {
				updateSlashMenu(props);
			},
			onKeyDown({ event, view }: SuggestionKeyDownProps) {
				if (event.key === 'ArrowUp') {
					event.preventDefault();
					moveSlashSelection(-1);
					return true;
				}

				if (event.key === 'ArrowDown') {
					event.preventDefault();
					moveSlashSelection(1);
					return true;
				}

				if (event.key === 'Enter' && slashMenu?.items.length) {
					event.preventDefault();
					selectSlashItem(selectedSlashIndex);
					return true;
				}

				if (event.key === 'Tab') {
					exitSuggestion(view, slashCommandPluginKey);
					return false;
				}

				return false;
			},
			onExit() {
				slashMenuSession += 1;
				cleanupSlashMenu?.();
				cleanupSlashMenu = null;
				slashMenu = null;
			}
		};
	}

	function createEditor(element: HTMLElement) {
		const editor = new Editor({
			element,
			extensions: [
				...postExtensions,
				Placeholder.configure({ placeholder: init.placeholder }),
				createSlashCommandsExtension({
					allowedPrefixes: [' '],
					items: ({ query }) => filterSlashCommandItems(slashItems, query),
					floatingUi: { strategy: 'fixed' },
					render: renderSlashMenu
				}),
				...(bubbleEl ? [BubbleMenu.configure({ element: bubbleEl })] : [])
			],
			content: init.content ?? undefined,
			editorProps: { attributes: { class: 'dc-prose' } },
			onTransaction: ({ editor: current }) => {
				editorState = { editor: current };
			},
			onUpdate: ({ editor: current }) => init.onUpdate(current.getJSON())
		});

		return () => {
			editor.destroy();
			cleanupSlashMenu?.();
			cleanupSlashMenu = null;
		};
	}
</script>

<!-- Initial inline visibility is flipped by the BubbleMenu plugin. -->
<div class="bubble" style="visibility: hidden" bind:this={bubbleEl}>
	{#if linkMode}
		<form class="bubble-link" onsubmit={applyLink}>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="url"
				placeholder="https://…"
				bind:value={linkValue}
				autofocus
				onkeydown={(event) => {
					if (event.key === 'Escape') linkMode = false;
				}}
			/>
			<button type="submit" aria-label="Apply link">→</button>
		</form>
	{:else}
		<button
			type="button"
			class={['bubble-btn', isActive('bold') && 'active']}
			aria-label="Bold"
			aria-pressed={isActive('bold')}
			onclick={() => chain()?.toggleBold().run()}><strong>B</strong></button
		>
		<button
			type="button"
			class={['bubble-btn', isActive('italic') && 'active']}
			aria-label="Italic"
			aria-pressed={isActive('italic')}
			onclick={() => chain()?.toggleItalic().run()}><em>i</em></button
		>
		<span class="bubble-divider" aria-hidden="true"></span>
		<button
			type="button"
			class={['bubble-btn', isActive('heading', { level: 2 }) && 'active']}
			aria-label="Heading 2"
			aria-pressed={isActive('heading', { level: 2 })}
			onclick={() => chain()?.toggleHeading({ level: 2 }).run()}>H2</button
		>
		<button
			type="button"
			class={['bubble-btn', isActive('heading', { level: 3 }) && 'active']}
			aria-label="Heading 3"
			aria-pressed={isActive('heading', { level: 3 })}
			onclick={() => chain()?.toggleHeading({ level: 3 }).run()}>H3</button
		>
		<button
			type="button"
			class={['bubble-btn', isActive('blockquote') && 'active']}
			aria-label="Blockquote"
			aria-pressed={isActive('blockquote')}
			onclick={() => chain()?.toggleBlockquote().run()}>&ldquo;</button
		>
		<span class="bubble-divider" aria-hidden="true"></span>
		<button
			type="button"
			class={['bubble-btn', isActive('bulletList') && 'active']}
			aria-label="Bullet list"
			aria-pressed={isActive('bulletList')}
			onclick={() => chain()?.toggleBulletList().run()}>&bull;&mdash;</button
		>
		<button
			type="button"
			class={['bubble-btn', isActive('link') && 'active']}
			aria-label="Link"
			aria-pressed={isActive('link')}
			onclick={openLinkInput}>&#128279;</button
		>
	{/if}
</div>

<div
	bind:this={slashMenuEl}
	class={['slash-menu', slashMenu && 'open']}
	role="listbox"
	aria-label="Block commands"
	aria-hidden={!slashMenu}
	onpointerdown={(event) => event.preventDefault()}
>
	{#if slashMenu}
		{#if slashMenu.items.length}
			{#each slashMenu.items as item, index (item.id)}
				{#if index === 0 || slashMenu.items[index - 1]?.group !== item.group}
					<p class="slash-group">{item.group}</p>
				{/if}
				<button
					type="button"
					role="option"
					class={['slash-item', index === selectedSlashIndex && 'selected']}
					aria-selected={index === selectedSlashIndex}
					data-command-index={index}
					onmouseenter={() => (selectedSlashIndex = index)}
					onclick={() => selectSlashItem(index)}
				>
					<span class="slash-icon" aria-hidden="true">{item.icon}</span>
					<span class="slash-copy">
						<strong>{item.title}</strong>
						<small>{item.description}</small>
					</span>
				</button>
			{/each}
		{:else}
			<p class="slash-empty">No matching blocks</p>
		{/if}
	{/if}
</div>

<div class="editor-host" {@attach createEditor}></div>

{#if imageDialogOpen}
	<InlineImageDialog onInsert={insertImage} onCancel={closeImageDialog} />
{/if}

<style>
	.editor-host :global(.tiptap) {
		min-height: 50vh;
		outline: none;
		caret-color: var(--secondary-600);
	}

	.editor-host :global(.tiptap p.is-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		height: 0;
		color: var(--base-400);
		pointer-events: none;
	}

	.bubble {
		display: flex;
		align-items: center;
		gap: 0.15rem;
		padding: 0.3rem;
		background: var(--base-950);
		border-radius: 999px;
		box-shadow: 0 12px 32px -12px oklch(from var(--base-1000) l c h / 0.5);
	}

	.bubble-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding-inline: 0.4rem;
		font-size: 0.8rem;
		color: var(--base-200);
		border-radius: 999px;
		transition:
			color var(--duration-fast, 150ms) ease,
			background-color var(--duration-fast, 150ms) ease;
	}

	.bubble-btn:hover,
	.bubble-btn:focus-visible {
		color: var(--base-50);
		background: oklch(from var(--base-50) l c h / 0.12);
	}

	.bubble-btn.active {
		color: var(--base-950);
		background: var(--secondary-400);
	}

	.bubble-divider {
		width: 1px;
		height: 1.1rem;
		margin-inline: 0.2rem;
		background: oklch(from var(--base-50) l c h / 0.2);
	}

	.bubble-link {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.bubble-link input {
		width: 14rem;
		padding: 0.25rem 0.6rem;
		font-size: 0.8rem;
		color: var(--base-100);
		background: oklch(from var(--base-50) l c h / 0.08);
		border-radius: 999px;
	}

	.bubble-link input:focus {
		outline: 1px solid var(--secondary-500);
	}

	.bubble-link button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		color: var(--base-950);
		background: var(--secondary-400);
		border-radius: 999px;
	}

	.slash-menu {
		position: fixed;
		z-index: 60;
		display: grid;
		width: min(22rem, calc(100vw - 1rem));
		max-height: min(28rem, calc(100dvh - 2rem));
		padding: 0.4rem;
		overflow-y: auto;
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: 0 18px 48px -16px oklch(from var(--base-1000) l c h / 0.45);
		transition: opacity var(--duration-fast, 150ms) ease;
	}

	.slash-menu.open {
		visibility: visible;
		opacity: 1;
		pointer-events: auto;
	}

	.slash-group {
		padding: 0.5rem 0.6rem 0.25rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.slash-item {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		width: 100%;
		padding: 0.55rem 0.6rem;
		text-align: start;
		border-radius: var(--radius-md);
	}

	.slash-item:hover,
	.slash-item.selected {
		background: var(--muted);
	}

	.slash-item:focus-visible {
		outline: 2px solid var(--secondary-500);
		outline-offset: -2px;
	}

	.slash-icon {
		display: grid;
		flex: 0 0 2.15rem;
		width: 2.15rem;
		height: 2.15rem;
		place-items: center;
		font-family: var(--display-family);
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--secondary-800);
		background: var(--secondary-50);
		border: 1px solid var(--secondary-200);
		border-radius: var(--radius-sm);
	}

	.slash-copy {
		display: grid;
		min-width: 0;
	}

	.slash-copy strong {
		font-size: 0.82rem;
		font-weight: 650;
		color: var(--foreground);
	}

	.slash-copy small {
		overflow: hidden;
		font-size: 0.7rem;
		color: var(--muted-foreground);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.slash-empty {
		padding: 1rem;
		font-size: 0.8rem;
		text-align: center;
		color: var(--muted-foreground);
	}
</style>
