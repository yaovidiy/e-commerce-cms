<script lang="ts">
	import { page } from '$app/stores';

	interface OrganizationSchema {
		name: string;
		logo?: string;
		url?: string;
		description?: string;
		email?: string;
		phone?: string;
		address?: {
			street: string;
			city: string;
			region: string;
			postalCode: string;
			country: string;
		};
		socialMedia?: {
			facebook?: string;
			instagram?: string;
			twitter?: string;
			youtube?: string;
			linkedin?: string;
		};
	}

	let {
		name,
		logo = '',
		url = '',
		description = '',
		email = '',
		phone = '',
		address = undefined,
		socialMedia = undefined
	}: OrganizationSchema = $props();

	const siteUrl = $derived($page.url.origin);
	const fullLogoUrl = $derived(logo ? (logo.startsWith('http') ? logo : `${siteUrl}${logo}`) : '');
	const siteUrlFinal = $derived(url || siteUrl);

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name,
		...(fullLogoUrl && { logo: fullLogoUrl }),
		url: siteUrlFinal,
		...(description && { description }),
		...(email && { email }),
		...(phone && { telephone: phone }),
		...(address && {
			address: {
				'@type': 'PostalAddress',
				streetAddress: address.street,
				addressLocality: address.city,
				addressRegion: address.region,
				postalCode: address.postalCode,
				addressCountry: address.country
			}
		}),
		...(socialMedia && {
			sameAs: Object.values(socialMedia).filter(Boolean)
		})
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
</svelte:head>
