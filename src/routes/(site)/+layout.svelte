<script lang="ts">
	import SiteHeader from '#lib/components/site/SiteHeader.svelte';
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="root relative">
	<SiteHeader user={data.user} />
	<main>
		{@render children()}
	</main>
	<SiteFooter />
</div>
