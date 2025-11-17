<script lang="ts">
	import { page } from '$app/stores';

	interface BreadcrumbItem {
		name: string;
		url: string;
	}

	let { items }: { items: BreadcrumbItem[] } = $props();

	const siteUrl = $derived($page.url.origin);

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
		}))
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
</svelte:head>
