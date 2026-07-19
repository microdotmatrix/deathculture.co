<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Days%20One&display=swap" rel="stylesheet" />
	<link href="https://fonts.googleapis.com/css2?family=Questrial&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
