<script lang="ts">
	import { page } from '$app/stores';

	interface WebSiteSchema {
		name: string;
		url?: string;
		description?: string;
		searchUrl?: string;
	}

	let {
		name,
		url = '',
		description = '',
		searchUrl = '/products?search={search_term_string}'
	}: WebSiteSchema = $props();

	const siteUrl = $derived($page.url.origin);
	const siteUrlFinal = $derived(url || siteUrl);

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name,
		url: siteUrlFinal,
		...(description && { description }),
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteUrlFinal}${searchUrl}`
			},
			'query-input': 'required name=search_term_string'
		}
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
</svelte:head>
