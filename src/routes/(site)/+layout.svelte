<script lang="ts">
	import { page } from '$app/state';
	import SiteFooter from '@/lib/components/site/SiteFooter.svelte';
	import SiteHeader from '@/lib/components/site/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const headerTone = $derived(page.data.headerTone === 'light' ? 'light' : 'dark');
</script>

<div class="root relative">
	<SiteHeader user={data.user} tone={headerTone} />
	<main>
		{@render children()}
	</main>
	<SiteFooter />
</div>
