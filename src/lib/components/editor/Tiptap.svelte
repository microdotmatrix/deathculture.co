<script lang="ts">
	import { postExtensions } from '@/lib/editor/extensions';
	import { Editor, type JSONContent } from '@tiptap/core';
	import { BubbleMenu } from '@tiptap/extension-bubble-menu';
	import { Placeholder } from '@tiptap/extensions';

	interface Props {
		/** Initial TipTap document. Later changes to this prop are ignored. */
		initialContent: JSONContent | null;
		placeholder?: string;
		onUpdate: (doc: JSONContent) => void;
	}

	let { initialContent, placeholder = 'Begin writing your story…', onUpdate }: Props = $props();

	// Captured once so the editor attachment never re-runs on prop changes.
	// svelte-ignore state_referenced_locally
	const init = { content: initialContent, placeholder, onUpdate };

	let bubbleEl: HTMLDivElement | undefined = $state();
	let editorState = $state.raw<{ editor: Editor | null }>({ editor: null });
	let linkMode = $state(false);
	let linkValue = $state('');

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

	function createEditor(element: HTMLElement) {
		const editor = new Editor({
			element,
			extensions: [
				...postExtensions,
				Placeholder.configure({ placeholder: init.placeholder }),
				...(bubbleEl ? [BubbleMenu.configure({ element: bubbleEl })] : [])
			],
			content: init.content ?? undefined,
			editorProps: { attributes: { class: 'dc-prose' } },
			onTransaction: ({ editor: current }) => {
				editorState = { editor: current };
			},
			onUpdate: ({ editor: current }) => init.onUpdate(current.getJSON())
		});

		return () => editor.destroy();
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

<div class="editor-host" {@attach createEditor}></div>

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
</style>
