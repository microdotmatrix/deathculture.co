<script lang="ts">
	import { page } from '$app/state';
	import PostEditor from '@/lib/components/editor/PostEditor.svelte';
</script>

{#key page.params.id}
	<PostEditor postId={page.params.id} />
{/key}
