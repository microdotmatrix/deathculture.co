<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { deletePost, savePost } from '@/lib/blog.remote';
	import FeatureImageUpload from '@/lib/components/editor/FeatureImageUpload.svelte';
	import TagInput from '@/lib/components/editor/TagInput.svelte';
	import Tiptap from '@/lib/components/editor/Tiptap.svelte';
	import Logo from '@/lib/components/site/Logo.svelte';
	import ToggleSwitch from '@/lib/components/ui/ToggleSwitch.svelte';
	import type { EditorPost } from '@/lib/types';
	import type { JSONContent } from '@tiptap/core';

	let { post = null }: { post?: EditorPost | null } = $props();

	const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

	// The editor owns its state after mount; the route remounts it per post
	// (see the {#key} in the [id] page), so snapshotting the prop once is safe.
	// svelte-ignore state_referenced_locally
	const initial = post;

	let postId = $state(initial?.id ?? null);
	let title = $state(initial?.title ?? '');
	let doc = $state.raw<JSONContent>(initial?.content ?? EMPTY_DOC);
	let excerpt = $state(initial?.excerpt ?? '');
	let slug = $state(initial?.slug ?? '');
	let featureImage = $state(initial?.featureImage ?? '');
	let featureImageAlt = $state(initial?.featureImageAlt ?? '');
	let tags = $state(initial?.tags ?? []);
	let status = $state<'draft' | 'published'>(initial?.status ?? 'draft');
	let commentsEnabled = $state(initial?.commentsEnabled ?? true);

	let dirty = $state(false);
	let saving = $state(false);
	let savedFlash = $state(false);
	let errorMessage = $state('');
	let sidebarOpen = $state(false);

	async function save(nextStatus: 'draft' | 'published' = status) {
		if (saving) return;

		saving = true;
		errorMessage = '';

		try {
			const result = await savePost({
				id: postId ?? undefined,
				title,
				content: JSON.stringify(doc),
				excerpt,
				slug,
				featureImage,
				featureImageAlt,
				tags,
				status: nextStatus,
				commentsEnabled
			});

			status = result.status;
			slug = result.slug;
			dirty = false;
			savedFlash = true;
			setTimeout(() => (savedFlash = false), 2000);

			if (!postId) {
				postId = result.id;
				replaceState(`/dashboard/posts/${result.id}`, {});
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not save the post';
		} finally {
			saving = false;
		}
	}

	async function removePost() {
		if (!postId) return;
		if (!confirm('Delete this post permanently? This cannot be undone.')) return;

		try {
			await deletePost(postId);
			await goto('/dashboard');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not delete the post';
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			save();
		}
	}

	function autogrow(element: HTMLTextAreaElement) {
		const resize = () => {
			element.style.height = 'auto';
			element.style.height = `${element.scrollHeight}px`;
		};

		resize();
		element.addEventListener('input', resize);
		return () => element.removeEventListener('input', resize);
	}
</script>

<svelte:window
	onkeydown={onKeydown}
	onbeforeunload={(event) => {
		if (dirty) event.preventDefault();
	}}
/>

<svelte:head>
	<title>{title ? `${title} — Editor` : 'New post — Editor'} — DeathCulture.co</title>
</svelte:head>

<div class="editor-page min-h-svh">
	<header class="editor-bar">
		<div class="flex items-center gap-3">
			<a href="/dashboard" class="back-link" aria-label="Back to Studio">
				<Logo size={28} />
				<span>Studio</span>
			</a>
			<span class={['status-chip', status]}>
				{status === 'published' ? 'Published' : 'Draft'}{dirty ? ' — edited' : ''}
			</span>
		</div>

		<div class="flex items-center gap-2">
			{#if errorMessage}
				<p class="save-error" role="alert">{errorMessage}</p>
			{:else if savedFlash}
				<p class="save-flash" role="status">Saved</p>
			{/if}

			{#if status === 'published' && postId}
				<a class="quiet-action" href={`/posts/${slug}`} target="_blank" rel="noopener">View</a>
			{/if}

			<button type="button" class="quiet-action" disabled={saving} onclick={() => save()}>
				{saving ? 'Saving…' : 'Save'}
			</button>

			{#if status === 'draft'}
				<button
					type="button"
					class="publish-btn"
					disabled={saving}
					onclick={() => save('published')}
				>
					Publish
				</button>
			{:else}
				<button type="button" class="quiet-action" disabled={saving} onclick={() => save('draft')}>
					Unpublish
				</button>
			{/if}

			<button
				type="button"
				class="quiet-action"
				aria-expanded={sidebarOpen}
				aria-controls="post-settings"
				onclick={() => (sidebarOpen = !sidebarOpen)}
			>
				Settings
			</button>
		</div>
	</header>

	<main class="editor-canvas">
		<textarea
			class="title-input"
			rows="1"
			placeholder="Post title"
			maxlength="300"
			{@attach autogrow}
			bind:value={title}
			oninput={() => (dirty = true)}
			onkeydown={(event) => {
				if (event.key === 'Enter') event.preventDefault();
			}}></textarea>

		<Tiptap
			initialContent={initial?.content ?? null}
			onUpdate={(next) => {
				doc = next;
				dirty = true;
			}}
		/>
	</main>

	<aside id="post-settings" class={['settings', sidebarOpen && 'open']} aria-label="Post settings">
		<div class="settings-header">
			<h2>Post settings</h2>
			<button
				type="button"
				class="quiet-action"
				aria-label="Close settings"
				onclick={() => (sidebarOpen = false)}>&times;</button
			>
		</div>

		<div class="settings-body">
			<section class="field">
				<h3 class="field-label">Feature image</h3>
				<FeatureImageUpload
					bind:url={
						() => featureImage,
						(next) => {
							featureImage = next;
							dirty = true;
						}
					}
					bind:alt={
						() => featureImageAlt,
						(next) => {
							featureImageAlt = next;
							dirty = true;
						}
					}
				/>
				{#if featureImage}
					<input
						class="mt-2 text-input"
						type="text"
						placeholder="Describe the image (alt text)"
						bind:value={featureImageAlt}
						oninput={() => (dirty = true)}
					/>
				{/if}
			</section>

			<section class="field">
				<label class="field-label" for="post-excerpt">Excerpt</label>
				<textarea
					id="post-excerpt"
					class="text-input"
					rows="4"
					maxlength="1000"
					placeholder="A short summary shown in lists and previews"
					bind:value={excerpt}
					oninput={() => (dirty = true)}></textarea>
			</section>

			<section class="field">
				<label class="field-label" for="post-slug">Slug</label>
				<div class="slug-row">
					<span class="slug-prefix">/posts/</span>
					<input
						id="post-slug"
						class="text-input"
						type="text"
						placeholder="derived-from-title"
						bind:value={slug}
						oninput={() => (dirty = true)}
					/>
				</div>
			</section>

			<section class="field">
				<h3 class="field-label">Tags</h3>
				<TagInput
					bind:tags={
						() => tags,
						(next) => {
							tags = next;
							dirty = true;
						}
					}
				/>
			</section>

			<section class="field">
				<h3 class="field-label">Discussion</h3>
				<ToggleSwitch
					checked={commentsEnabled}
					label="Comments enabled"
					onchange={(next) => {
						commentsEnabled = next;
						dirty = true;
					}}
				/>
				<p class="field-hint">
					When off, the comment form is hidden and new comments are rejected. Existing comments stay
					visible.
				</p>
			</section>

			{#if postId}
				<section class="field danger-zone">
					<button type="button" class="delete-btn" onclick={removePost}>Delete post</button>
				</section>
			{/if}
		</div>
	</aside>

	{#if sidebarOpen}
		<button
			type="button"
			class="backdrop"
			aria-label="Close settings"
			onclick={() => (sidebarOpen = false)}
		></button>
	{/if}
</div>

<style>
	.editor-page {
		background: var(--background);
	}

	.editor-bar {
		position: sticky;
		top: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem clamp(1rem, 4vw, 2rem);
		background: oklch(from var(--background) l c h / 0.85);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-display);
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--foreground);
	}

	.status-chip {
		padding: 0.2rem 0.65rem;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-radius: 999px;
	}

	.status-chip.draft {
		color: var(--secondary-900);
		background: var(--secondary-100);
	}

	.status-chip.published {
		color: var(--primary-900);
		background: var(--primary-100);
	}

	.save-error {
		font-size: 0.78rem;
		color: var(--destructive);
	}

	.save-flash {
		font-size: 0.78rem;
		color: var(--primary-700);
	}

	.quiet-action {
		padding: 0.4rem 0.9rem;
		font-size: 0.82rem;
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 999px;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.quiet-action:hover:not(:disabled),
	.quiet-action:focus-visible {
		border-color: var(--secondary);
		color: var(--secondary-800);
	}

	.quiet-action:disabled {
		opacity: 0.6;
	}

	.publish-btn {
		padding: 0.4rem 1.1rem;
		font-size: 0.82rem;
		color: var(--secondary-foreground);
		background: var(--secondary);
		border-radius: 999px;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.publish-btn:hover:not(:disabled),
	.publish-btn:focus-visible {
		background: var(--secondary-600);
		transform: translateY(-1px);
	}

	.publish-btn:disabled {
		opacity: 0.6;
	}

	.editor-canvas {
		max-width: 46rem;
		margin-inline: auto;
		padding: clamp(2rem, 6vw, 4rem) 1.25rem 6rem;
	}

	.title-input {
		width: 100%;
		overflow: hidden;
		resize: none;
		margin-bottom: 1.5rem;
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 1.4rem + 2.4vw, 3rem);
		line-height: 1.15;
		color: var(--foreground);
		background: transparent;
		outline: none;
	}

	.title-input::placeholder {
		color: var(--base-300);
	}

	.settings {
		position: fixed;
		inset-block: 0;
		right: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		width: min(22rem, 100vw);
		background: var(--background);
		border-left: 1px solid var(--border);
		box-shadow: -24px 0 48px -32px oklch(from var(--base-950) l c h / 0.25);
		transform: translateX(100%);
		visibility: hidden;
		transition:
			transform var(--duration-normal, 300ms) var(--ease-out-expo, ease),
			visibility 0s var(--duration-normal, 300ms);
	}

	.settings.open {
		transform: translateX(0);
		visibility: visible;
		transition:
			transform var(--duration-normal, 300ms) var(--ease-out-expo, ease),
			visibility 0s;
	}

	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border);
	}

	.settings-header h2 {
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--foreground);
	}

	.settings-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}

	.field + .field {
		margin-top: 1.75rem;
	}

	.field-label {
		display: block;
		margin-bottom: 0.5rem;
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	.text-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.88rem;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
	}

	.text-input:focus {
		outline: 1px solid var(--ring);
	}

	.text-input::placeholder {
		color: var(--base-400);
	}

	textarea.text-input {
		resize: vertical;
	}

	.slug-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.slug-prefix {
		font-size: 0.8rem;
		color: var(--muted-foreground);
	}

	.field-hint {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--muted-foreground);
	}

	.danger-zone {
		padding-top: 1.5rem;
		border-top: 1px dashed var(--border);
	}

	.delete-btn {
		width: 100%;
		padding: 0.5rem;
		font-size: 0.82rem;
		color: var(--destructive);
		border: 1px solid oklch(from var(--destructive) l c h / 0.4);
		border-radius: var(--radius-md);
		transition: background-color var(--duration-fast, 150ms) ease;
	}

	.delete-btn:hover,
	.delete-btn:focus-visible {
		background: oklch(from var(--destructive) l c h / 0.08);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: oklch(from var(--base-950) l c h / 0.3);
	}

	@media (min-width: 1100px) {
		.backdrop {
			display: none;
		}
	}
</style>
