<script lang="ts">
	import ImageUpload from '@/lib/components/ui/ImageUpload.svelte';

	/**
	 * `alt` is read for the preview only — the alt-text input itself lives in
	 * PostEditor, so this never writes back. Kept bindable for call-site parity.
	 */
	let { url = $bindable(), alt = $bindable() }: { url: string; alt: string } = $props();
</script>

<ImageUpload
	bind:url
	endpoint="postImage"
	title="Add a feature image"
	previewAlt={alt || 'Feature image preview'}
/>
