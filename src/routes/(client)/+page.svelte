<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { getPageByName } from '$lib/remotes/page.remote';
	import { PageContentRenderer } from '$lib/components/client/features/page-blocks';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import SeoHead from '$lib/components/common/utility/seo-head.svelte';

	let { data } = $props();

	// Use server-side SEO data
	const seo = data?.seo;
	const structuredData = data?.structuredData;
</script>

<SeoHead
	title={seo?.title}
	description={seo?.description}
	keywords={seo?.keywords}
	image={seo?.image}
	imageAlt={seo?.imageAlt}
	type={seo?.type}
	canonical={seo?.canonical}
	noindex={seo?.noindex}
	nofollow={seo?.nofollow}
	locale={seo?.locale}
	alternateLocales={seo?.alternateLocales}
	structuredData={structuredData?.website || structuredData?.organization}
	breadcrumbs={[{ name: 'Home', url: '/' }]}
/>{#await getPageByName('homepage')}
	<section class="-mx-8 mb-10 lg:mb-32">
		<Skeleton class="h-[150px] w-full md:h-[450px] lg:h-[650px]" />
	</section>

	<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
		<div class="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4 lg:gap-10">
			{#each Array(3) as _, index (index)}
				<div class="relative {index === 1 ? 'md:row-span-2' : ''}">
					<Skeleton class="{index === 1 ? 'h-80 md:h-[250px]' : 'h-[250px]'} w-full" />
				</div>
			{/each}
		</div>
	</section>

	{#each Array(3) as _, index (index)}
		<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
			<Skeleton class="h-10 w-40" />

			<ScrollArea orientation="horizontal" class="mt-6 h-fit w-full">
				<div class="flex gap-6">
					{#each Array(6) as _, index (index)}
						<Skeleton class="h-[485px] w-[230px]" />
					{/each}
				</div>
			</ScrollArea>
		</section>
	{/each}

	<section class="-mx-8 mb-10 lg:mb-32">
		<Skeleton class="h-[150px] w-full md:h-[450px] lg:h-[650px]" />
	</section>

	<section class="-mx-8 mb-10 lg:mb-32">
		<Skeleton class="h-[150px] w-full md:h-[450px] lg:h-[650px]" />
	</section>

	<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
		<Skeleton class="h-10 w-40" />

		<ScrollArea orientation="horizontal" class="mt-6 h-fit w-full">
			<div class="flex gap-1">
				{#each Array(6) as _, index (index)}
					<Skeleton class="h-[230px] w-[230px]" />
				{/each}
			</div>
		</ScrollArea>
	</section>

	<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
		<Skeleton class="h-10 w-40" />

		<ScrollArea orientation="horizontal" class="mt-6 h-fit w-full">
			<div class="flex gap-6">
				{#each Array(6) as _, index (index)}
					<Skeleton class="h-[230px] w-[230px]" />
				{/each}
			</div>
		</ScrollArea>
	</section>
{:then homepageData}
	<!-- Render dynamic content from page -->
	{#if homepageData && Array.isArray(homepageData.content)}
		<div class="mt-10 md:mt-20">
			<PageContentRenderer blocks={homepageData.content} />
		</div>
	{:else}
		<div class="mx-auto max-w-7xl py-12 text-center">
			<p class="text-gray-500">No content available</p>
		</div>
	{/if}
{:catch error}
	<!-- Error state -->
	<div class="mx-auto max-w-7xl py-12 text-center">
		<p class="text-red-500">Error loading page: {error.message}</p>
	</div>
{/await}
