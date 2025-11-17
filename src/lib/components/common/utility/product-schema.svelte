<script lang="ts">
	import { page } from '$app/stores';

	interface ProductSchema {
		name: string;
		description: string;
		image: string[];
		brand?: string;
		sku?: string;
		price: number;
		currency?: string;
		availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
		condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
		rating?: {
			value: number;
			count: number;
		};
	}

	let {
		name,
		description,
		image,
		brand = '',
		sku = '',
		price,
		currency = 'UAH',
		availability = 'InStock',
		condition = 'NewCondition',
		rating = undefined
	}: ProductSchema = $props();

	const siteUrl = $derived($page.url.origin);
	const currentUrl = $derived($page.url.href);

	const schema = $derived({
		'@context': 'https://schema.org/',
		'@type': 'Product',
		name,
		description,
		image: image.map((img) => (img.startsWith('http') ? img : `${siteUrl}${img}`)),
		...(brand && { brand: { '@type': 'Brand', name: brand } }),
		...(sku && { sku }),
		offers: {
			'@type': 'Offer',
			url: currentUrl,
			priceCurrency: currency,
			price: price.toString(),
			priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
			availability: `https://schema.org/${availability}`,
			itemCondition: `https://schema.org/${condition}`
		},
		...(rating && {
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: rating.value.toString(),
				reviewCount: rating.count.toString()
			}
		})
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
</svelte:head>
