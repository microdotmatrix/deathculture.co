<script lang="ts">
	import { createUploadThing } from '@/lib/uploadthing';

	let { url = $bindable(), alt = $bindable() }: { url: string; alt: string } = $props();

	let uploadError = $state('');
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	const { startUpload, isUploading } = createUploadThing('postImage', {
		onClientUploadComplete: (files) => {
			const uploaded = files?.[0];
			if (uploaded) url = uploaded.ufsUrl;
		},
		onUploadError: (error) => {
			uploadError = error.message || 'Upload failed — try again';
		}
	});

	async function handleFiles(files: FileList | File[] | null) {
		const file = files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			uploadError = 'Choose an image file';
			return;
		}

		uploadError = '';
		await startUpload([file]);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		handleFiles(event.dataTransfer?.files ?? null);
	}
</script>

{#if url}
	<figure class="preview">
		<img src={url} alt={alt || 'Feature image preview'} width="1600" height="900" />
		<figcaption class="preview-actions">
			<button type="button" class="ghost-btn" onclick={() => fileInput?.click()}>Replace</button>
			<button type="button" class="ghost-btn danger" onclick={() => (url = '')}>Remove</button>
		</figcaption>
	</figure>
{:else}
	<button
		type="button"
		class={['dropzone', isDragging && 'dragging']}
		disabled={$isUploading}
		onclick={() => fileInput?.click()}
		ondragover={(event) => {
			event.preventDefault();
			isDragging = true;
		}}
		ondragleave={() => (isDragging = false)}
		ondrop={onDrop}
	>
		{#if $isUploading}
			Uploading…
		{:else}
			<span class="dropzone-title">Add a feature image</span>
			<span class="dropzone-hint">Drop an image here or click to browse</span>
		{/if}
	</button>
{/if}

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="sr-only"
	onchange={(event) => {
		// Copy the selection before resetting so picking the same file again re-fires.
		const files = Array.from(event.currentTarget.files ?? []);
		event.currentTarget.value = '';
		handleFiles(files);
	}}
/>

{#if uploadError}
	<p class="upload-error" role="alert">{uploadError}</p>
{/if}

<style>
	.preview {
		overflow: clip;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
	}

	.preview img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.preview-actions {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--muted);
	}

	.ghost-btn {
		padding: 0.3rem 0.75rem;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 999px;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.ghost-btn:hover,
	.ghost-btn:focus-visible {
		border-color: var(--secondary);
		color: var(--secondary-800);
	}

	.ghost-btn.danger:hover,
	.ghost-btn.danger:focus-visible {
		border-color: var(--destructive);
		color: var(--destructive);
	}

	.dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		width: 100%;
		padding: 2rem 1rem;
		text-align: center;
		border: 1px dashed var(--input);
		border-radius: var(--radius-md);
		background: var(--muted);
		transition:
			border-color var(--duration-fast, 150ms) ease,
			background-color var(--duration-fast, 150ms) ease;
	}

	.dropzone:hover,
	.dropzone:focus-visible,
	.dropzone.dragging {
		border-color: var(--secondary-500);
		background: var(--secondary-50);
	}

	.dropzone:disabled {
		opacity: 0.7;
	}

	.dropzone-title {
		font-size: 0.85rem;
		color: var(--foreground);
	}

	.dropzone-hint {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}

	.upload-error {
		margin-top: 0.4rem;
		font-size: 0.75rem;
		color: var(--destructive);
	}
</style>
