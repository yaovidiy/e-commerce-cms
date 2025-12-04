<script lang="ts">
	import { page } from '$app/state';

	interface SeoProps {
		title?: string;
		description?: string;
		keywords?: string;
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article' | 'product' | 'local_business';
		canonical?: string;
		noindex?: boolean;
		nofollow?: boolean;
		author?: string;
		publishedTime?: string;
		modifiedTime?: string;
		// Product-specific
		productPrice?: number;
		productCurrency?: string;
		productAvailability?: 'in stock' | 'out of stock' | 'preorder';
		productBrand?: string;
		// Additional properties
		locale?: string;
		alternateLocales?: string[];
		structuredData?: Record<string, unknown>;
		// SEO fields
		rating?: { value: number; count: number };
		breadcrumbs?: Array<{ name: string; url: string }>;
	}

	let {
		title = 'E-commerce CMS',
		description = '',
		keywords = '',
		image = '',
		imageAlt = '',
		type = 'website',
		canonical = '',
		noindex = false,
		nofollow = false,
		author = '',
		publishedTime = '',
		modifiedTime = '',
		productPrice = undefined,
		productCurrency = 'UAH',
		productAvailability = undefined,
		productBrand = '',
		locale = 'uk_UA',
		alternateLocales = ['en_US'],
		structuredData = undefined,
		rating = undefined,
		breadcrumbs = undefined
	}: SeoProps = $props();

	// Get current URL from page store
	const currentUrl = $derived(canonical || page.url.href);
	const siteUrl = $derived(page.url.origin);

	// Construct full image URL if relative
	const fullImageUrl = $derived(
		image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : ''
	);

	// Robots directive
	const robotsContent = $derived(() => {
		const directives = [];
		if (noindex) directives.push('noindex');
		if (nofollow) directives.push('nofollow');
		return directives.length > 0 ? directives.join(', ') : 'index, follow';
	});

	// Ensure title doesn't exceed 60 characters for SEO
	const truncatedTitle = $derived(title.length > 60 ? title.substring(0, 60).trim() + '...' : title);

	// Ensure description doesn't exceed 160 characters
	const truncatedDescription = $derived(
		description.length > 160 ? description.substring(0, 160).trim() + '...' : description
	);
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{truncatedTitle}</title>
	<meta name="description" content={truncatedDescription} />
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<!-- Viewport & Charset -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="utf-8" />

	<!-- Robots Meta -->
	<meta name="robots" content={robotsContent()} />

	<!-- Language & Locale -->
	<meta property="og:locale" content={locale} />
	{#each alternateLocales as altLocale}
		<meta property="og:locale:alternate" content={altLocale} />
	{/each}

	<!-- Canonical URL -->
	<link rel="canonical" href={currentUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={truncatedTitle} />
	<meta property="og:description" content={truncatedDescription} />
	{#if fullImageUrl}
		<meta property="og:image" content={fullImageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		{#if imageAlt}
			<meta property="og:image:alt" content={imageAlt} />
		{/if}
	{/if}
	<meta property="og:site_name" content="E-commerce CMS" />

	<!-- Article-specific -->
	{#if type === 'article'}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		{#if modifiedTime}
			<meta property="article:modified_time" content={modifiedTime} />
		{/if}
		{#if author}
			<meta property="article:author" content={author} />
		{/if}
	{/if}

	<!-- Product-specific -->
	{#if type === 'product'}
		{#if productPrice !== undefined}
			<meta property="product:price:amount" content={String(productPrice)} />
			<meta property="product:price:currency" content={productCurrency} />
		{/if}
		{#if productAvailability}
			<meta property="product:availability" content={productAvailability} />
		{/if}
		{#if productBrand}
			<meta property="product:brand" content={productBrand} />
		{/if}
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content={fullImageUrl ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content={truncatedTitle} />
	<meta name="twitter:description" content={truncatedDescription} />
	{#if fullImageUrl}
		<meta name="twitter:image" content={fullImageUrl} />
		{#if imageAlt}
			<meta name="twitter:image:alt" content={imageAlt} />
		{/if}
	{/if}

	<!-- Additional Best Practices -->
	<meta name="theme-color" content="#ffffff" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

	<!-- Structured Data (JSON-LD) -->
	{#if structuredData}
		<script type="application/ld+json">
			{JSON.stringify(structuredData)}
		</script>
	{/if}

	<!-- Breadcrumb Structured Data -->
	{#if breadcrumbs && breadcrumbs.length > 0}
		<script type="application/ld+json">
			{{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				"itemListElement": breadcrumbs.map((item, index) => ({
					"@type": "ListItem",
					"position": index + 1,
					"name": item.name,
					"item": `${siteUrl}${item.url}`
				}))
			}}
		</script>
	{/if}
</svelte:head>
