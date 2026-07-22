<script lang="ts">
	import { createUploadThing } from '@/lib/uploadthing';
	import { isSafeImageUrl } from '@/lib/editor/slash-commands';

	interface Props {
		onInsert: (image: { src: string; alt: string }) => void;
		onCancel: () => void;
	}

	let { onInsert, onCancel }: Props = $props();

	let src = $state('');
	let alt = $state('');
	let errorMessage = $state('');
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	const { startUpload, isUploading } = createUploadThing('postImage', {
		onClientUploadComplete: (files) => {
			const uploaded = files?.[0];
			if (uploaded) src = uploaded.ufsUrl;
		},
		onUploadError: (error) => {
			errorMessage = error.message || 'Upload failed — try again';
		}
	});

	function showDialog(element: HTMLDialogElement) {
		element.showModal();
		return () => {
			if (element.open) element.close();
		};
	}

	async function handleFiles(files: FileList | File[] | null) {
		const file = files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			errorMessage = 'Choose an image file';
			return;
		}

		errorMessage = '';
		if (!alt) alt = file.name.replace(/\.[^.]+$/, '').replaceAll(/[-_]+/g, ' ');
		await startUpload([file]);
	}

	function insertImage(event: SubmitEvent) {
		event.preventDefault();
		const url = src.trim();

		if (!isSafeImageUrl(url)) {
			errorMessage = 'Enter a valid http or https image URL';
			return;
		}

		onInsert({ src: url, alt: alt.trim() });
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		void handleFiles(event.dataTransfer?.files ?? null);
	}
</script>

<dialog
	class="image-dialog"
	aria-labelledby="image-dialog-title"
	{@attach showDialog}
	oncancel={(event) => {
		event.preventDefault();
		onCancel();
	}}
	onclick={(event) => {
		if (event.target === event.currentTarget) onCancel();
	}}
>
	<form class="image-form" onsubmit={insertImage}>
		<header>
			<div>
				<p class="eyebrow">Insert block</p>
				<h2 id="image-dialog-title">Add an image</h2>
			</div>
			<button type="button" class="close-button" aria-label="Close image dialog" onclick={onCancel}
				>&times;</button
			>
		</header>

		<button
			type="button"
			class={['upload-zone', isDragging && 'dragging']}
			disabled={$isUploading}
			onclick={() => fileInput?.click()}
			ondragover={(event) => {
				event.preventDefault();
				isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={handleDrop}
		>
			<span class="upload-title">{$isUploading ? 'Uploading…' : 'Upload an image'}</span>
			<span class="upload-hint">Drop a file here or choose one from your device</span>
		</button>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="sr-only"
			onchange={(event) => {
				const files = Array.from(event.currentTarget.files ?? []);
				event.currentTarget.value = '';
				void handleFiles(files);
			}}
		/>

		<div class="separator"><span>or embed from the web</span></div>

		<label>
			<span>Image URL</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="url"
				placeholder="https://example.com/image.jpg"
				bind:value={src}
				autofocus
				oninput={() => (errorMessage = '')}
			/>
		</label>

		<label>
			<span>Alt text</span>
			<input
				type="text"
				placeholder="Describe the image for readers using assistive technology"
				maxlength="300"
				bind:value={alt}
			/>
		</label>

		{#if src && isSafeImageUrl(src)}
			<div class="preview">
				<img {src} alt={alt || 'Image preview'} />
			</div>
		{/if}

		{#if errorMessage}
			<p class="error" role="alert">{errorMessage}</p>
		{/if}

		<footer>
			<button type="button" class="secondary-button" onclick={onCancel}>Cancel</button>
			<button type="submit" class="primary-button" disabled={$isUploading || !src.trim()}>
				Insert image
			</button>
		</footer>
	</form>
</dialog>

<style>
	.image-dialog {
		position: fixed;
		inset: 0;
		width: min(34rem, calc(100vw - 2rem));
		max-height: calc(100dvh - 2rem);
		margin: auto;
		padding: 0;
		overflow: auto;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: 0 24px 80px -24px oklch(from var(--base-1000) l c h / 0.55);
	}

	.image-dialog::backdrop {
		background: oklch(from var(--base-1000) l c h / 0.55);
		backdrop-filter: blur(3px);
	}

	.image-form {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
	}

	header,
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.eyebrow {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--secondary-700);
	}

	h2 {
		font-family: var(--display-family);
		font-size: 1.35rem;
	}

	.close-button {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		font-size: 1.35rem;
		color: var(--muted-foreground);
		border-radius: 999px;
	}

	.close-button:hover,
	.close-button:focus-visible {
		color: var(--foreground);
		background: var(--muted);
	}

	.upload-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		padding: 1.5rem 1rem;
		border: 1px dashed var(--input);
		border-radius: var(--radius-md);
		background: var(--muted);
	}

	.upload-zone:hover,
	.upload-zone:focus-visible,
	.upload-zone.dragging {
		border-color: var(--secondary-500);
		background: var(--secondary-50);
	}

	.upload-title {
		font-size: 0.9rem;
		font-weight: 650;
	}

	.upload-hint {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.separator {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}

	.separator::before,
	.separator::after {
		flex: 1;
		height: 1px;
		content: '';
		background: var(--border);
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	label input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		font-size: 0.88rem;
		font-weight: 400;
		color: var(--foreground);
		background: var(--background);
		border: 1px solid var(--input);
		border-radius: var(--radius-md);
	}

	label input:focus {
		border-color: var(--secondary-500);
		outline: 2px solid oklch(from var(--secondary-500) l c h / 0.18);
	}

	.preview {
		max-height: 14rem;
		overflow: clip;
		background: var(--muted);
		border-radius: var(--radius-md);
	}

	.preview img {
		display: block;
		width: 100%;
		max-height: 14rem;
		object-fit: contain;
	}

	.error {
		font-size: 0.78rem;
		color: var(--destructive);
	}

	footer {
		justify-content: flex-end;
		padding-top: 0.25rem;
	}

	.secondary-button,
	.primary-button {
		padding: 0.55rem 0.9rem;
		font-size: 0.78rem;
		font-weight: 650;
		border-radius: 999px;
	}

	.secondary-button {
		border: 1px solid var(--border);
	}

	.primary-button {
		color: var(--base-950);
		background: var(--secondary-400);
	}

	.primary-button:disabled,
	.upload-zone:disabled {
		cursor: wait;
		opacity: 0.6;
	}
</style>
