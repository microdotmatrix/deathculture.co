<script lang="ts">
	import PostEditor from '@/lib/components/editor/PostEditor.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.post.id}
	<PostEditor post={data.post} />
{/key}
