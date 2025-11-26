<script lang="ts">
	import { getPublicSettings } from '$lib/remotes/settings.remote';
	import { onMount } from 'svelte';

	// Use $state to store settings once loaded
	let settings = $state<{
		storeFavicon: string;
		seoDefaultTitle: string;
		seoDefaultDescription: string;
		seoDefaultOgImage: string;
	} | null>(null);

	// Load settings on component init
	onMount(() => {
		getPublicSettings().then((data) => {
			settings = data;
		});
	});
</script>

<svelte:head>
	{#if settings?.storeFavicon}
		<link rel="icon" href={settings.storeFavicon} />
	{/if}
	{#if settings?.seoDefaultTitle}
		<title>{settings.seoDefaultTitle}</title>
	{/if}
	{#if settings?.seoDefaultDescription}
		<meta name="description" content={settings.seoDefaultDescription} />
	{/if}
	{#if settings?.seoDefaultOgImage}
		<meta property="og:image" content={settings.seoDefaultOgImage} />
	{/if}
</svelte:head>
