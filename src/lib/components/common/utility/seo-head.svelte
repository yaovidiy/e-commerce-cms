<script lang="ts">
	import { page } from '$app/stores';

	interface SeoProps {
		title?: string;
		description?: string;
		keywords?: string;
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article' | 'product';
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
		productBrand = ''
	}: SeoProps = $props();

	// Get current URL from page store
	const currentUrl = $derived(canonical || $page.url.href);
	const siteUrl = $derived($page.url.origin);

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
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	{#if author}
		<meta name="author" content={author} />
	{/if}

	<!-- Robots Meta -->
	<meta name="robots" content={robotsContent()} />

	<!-- Canonical URL -->
	<link rel="canonical" href={currentUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if fullImageUrl}
		<meta property="og:image" content={fullImageUrl} />
		{#if imageAlt}
			<meta property="og:image:alt" content={imageAlt} />
		{/if}
	{/if}
	<meta property="og:site_name" content="E-commerce CMS" />
	<meta property="og:locale" content="uk_UA" />
	<meta property="og:locale:alternate" content="en_US" />

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
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if fullImageUrl}
		<meta name="twitter:image" content={fullImageUrl} />
		{#if imageAlt}
			<meta name="twitter:image:alt" content={imageAlt} />
		{/if}
	{/if}
</svelte:head>
