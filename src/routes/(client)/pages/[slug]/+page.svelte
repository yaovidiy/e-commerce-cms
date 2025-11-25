<script lang="ts">
	import { getPageBySlug } from '$lib/remotes/page.remote';
	import { error } from '@sveltejs/kit';
	import {
		HeroBlock,
		TextBlock,
		ImageBlock,
		GalleryBlock,
		VideoBlock,
		HtmlBlock
	} from '$lib/components/client/features/page-blocks';

	let { params } = $props<{ params: { slug: string } }>();

	// Fetch page data
	const pageData = $derived(
		(async () => {
			try {
				const page = await getPageBySlug(params.slug);

				// Check if page is published
				if (page.status !== 'published') {
					error(404, 'Page not found');
				}

				return page;
			} catch (err) {
				error(404, 'Page not found');
			}
		})()
	);

	// Parse content blocks
	const contentBlocks = $derived(
		pageData.then((page) => {
			try {
				return JSON.parse(page.content || '[]');
			} catch {
				return [];
			}
		})
	);
</script>

<svelte:head>
	{#await pageData then page}
		<title>{page.seoTitle || page.title}</title>
		{#if page.seoDescription}
			<meta name="description" content={page.seoDescription} />
		{/if}
		<meta property="og:title" content={page.seoTitle || page.title} />
		{#if page.seoDescription}
			<meta property="og:description" content={page.seoDescription} />
		{/if}
		<meta property="og:type" content="website" />
	{/await}
</svelte:head>

{#await pageData}
	<div class="container py-12">
		<div class="flex items-center justify-center min-h-[400px]">
			<div class="text-center">
				<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
				<p class="mt-4 text-muted-foreground">Loading page...</p>
			</div>
		</div>
	</div>
{:then page}
	<article>
		{#await contentBlocks then blocks}
			{#each blocks as block}
				{#if block.type === 'hero'}
					<HeroBlock data={block.data} />
				{:else if block.type === 'text'}
					<TextBlock data={block.data} />
				{:else if block.type === 'image'}
					<ImageBlock data={block.data} />
				{:else if block.type === 'gallery'}
					<GalleryBlock data={block.data} />
				{:else if block.type === 'video'}
					<VideoBlock data={block.data} />
				{:else if block.type === 'html'}
					<HtmlBlock data={block.data} />
				{/if}
			{/each}

			{#if blocks.length === 0}
				<div class="container py-12">
					<div class="text-center">
						<h1 class="text-4xl font-bold mb-4">{page.title}</h1>
						<p class="text-muted-foreground">This page has no content yet.</p>
					</div>
				</div>
			{/if}
		{/await}
	</article>
{:catch err}
	<div class="container py-12">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">404 - Page Not Found</h1>
			<p class="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
			<a href="/" class="text-primary hover:underline">Return to home</a>
		</div>
	</div>
{/await}
