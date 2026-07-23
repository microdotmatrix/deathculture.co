<script lang="ts">
	import PostEditor from '@/lib/components/editor/PostEditor.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
</script>

{#if params.id}
	{#key params.id}
		<PostEditor postId={params.id} />
	{/key}
{/if}
