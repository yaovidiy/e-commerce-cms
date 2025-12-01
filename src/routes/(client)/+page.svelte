<script lang="ts">
	import Slider from '$lib/components/homepage/Slider.svelte';
	import ApiRequest from '$lib/utils/api';
	import Image from '$lib/components/ui/image/Image.svelte';
	import type { components } from '$lib/types/schema';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import ProducyCard from '$lib/components/product/card/card.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import InstagrammItem from '$lib/components/homepage/InstagrammItem.svelte';
	import BlogCard from '$lib/components/layouts/blog/card/card.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Benifit from '$lib/components/homepage/benifit.svelte';
	import { Briefcase } from '@lucide/svelte';

	type AdsItem = components['schemas']['HomepageAdsItemComponent'];
	type AdsSingleImage = components['schemas']['HomepageAdsSingleImageComponent'];
	type InstagrammType = components['schemas']['HomepageInstagrammComponent'];
	type ProductList = components['schemas']['HomepageProductListComponent'];
	type SliderType = components['schemas']['HomepageSliderComponent'];
	type AdsGrid = components['schemas']['HomepageAdsGridComponent'];
	type Blogs = components['schemas']['HomepageBlogArticlesComponent'];

	const homepageData = ApiRequest.CommonPages.homepage.useQuery();
</script>

{#if $homepageData.isSuccess}
	{#each $homepageData?.data?.data?.attributes?.modules ?? [] as section}
		{#if section.__component === 'homepage.slider'}
			{@const slidesComponent = section as SliderType}
			<section class="-mx-8 mb-10 lg:mb-32">
				<Slider slides={slidesComponent.items} />
				<div class="grid grid-cols-1 md:grid-cols-3">
					{#each slidesComponent.features ?? [] as feature (feature.id)}
						<div class="p-4">
							<p class="text-1xl font-bold">{feature.title}</p>
						</div>
					{/each}
				</div>
			</section>
		{:else if section.__component === 'homepage.ads-grid'}
			{@const adsGridComponent = section as AdsGrid}
			<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
				<div class="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4 lg:gap-10">
					{#each adsGridComponent.items ?? [] as item (item.id)}
						<div class="relative {item.show_in_two_rows ? 'md:row-span-2' : ''}">
							<Image image={item.image?.data} />
							<div
								class="absolute top-1/2 flex max-h-full w-full max-w-full -translate-y-1/2 flex-col items-center text-center md:left-0 lg:left-12 lg:items-start"
							>
								<h3 class="text-milky mb-5 text-2xl whitespace-nowrap md:text-xl lg:mb-10">
									{item.title}
								</h3>
								<p class="text-body text-milky mb-5 lg:mb-12">{item.content}</p>
								<Button
									onclick={() => {
										if (item.button_link) {
											goto(item.button_link);
										}
									}}
									class="bg-primary text-primary-foreground">{item.button_label}</Button
								>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{:else if section.__component === 'homepage.product-list'}
			{@const productListComponent = section as ProductList}

			<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
				<h2 class="text-4xl font-bold">{productListComponent.header}</h2>

				<ScrollArea orientation="horizontal" class="h-fit w-full">
					<div class="flex gap-1">
						{#each productListComponent.products?.data ?? [] as product (product.id)}
							<ProducyCard
								title={product.attributes?.title}
								price={product.attributes?.price}
								image={product.attributes?.thumbnail?.data}
								category={product.attributes?.category?.data?.attributes?.title}
								weight={product.attributes?.units}
								url={`products/${product.attributes?.slug}`}
							/>
						{/each}
					</div>
				</ScrollArea>
			</section>
		{:else if section.__component === 'homepage.ads-single-image'}
			{@const adsSingleImageComponent = section as AdsSingleImage}

			<section class="relative -mx-8 mb-10 lg:mb-32">
				<Image
					directUrl={adsSingleImageComponent.image?.data?.attributes?.url}
					directAlt={adsSingleImageComponent.image?.data?.attributes?.alternativeText ??
						adsSingleImageComponent.image?.data?.attributes?.name}
				/>
				<Button
					onclick={() => {
						if (adsSingleImageComponent.button_link) {
							goto(adsSingleImageComponent.button_link);
						}
					}}
					class="bg-primary text-primary-foreground absolute bottom-4 left-1/2 -translate-x-1/2"
				>
					{adsSingleImageComponent.button_label}
				</Button>
			</section>
		{:else if section.__component === 'homepage.instagramm'}
			{@const instagrammComponent = section as InstagrammType}

			<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
				<h2 class="mb-4 text-4xl font-bold">{instagrammComponent.header}</h2>
				<p class="mb-4 text-gray-600">{@html instagrammComponent.description}</p>
				<ScrollArea orientation="horizontal" class="h-fit w-full">
					<div class="-gap-1 flex">
						{#each instagrammComponent.items ?? [] as item (item.id)}
							<InstagrammItem {item} />
						{/each}
					</div>
				</ScrollArea>
			</section>
		{:else if section.__component === 'homepage.blog-articles'}
			{@const blogsComponent = section as Blogs}
			<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
				<h2 class="mb-4 text-4xl font-bold">{blogsComponent.header}</h2>
				<ScrollArea orientation="horizontal" class="h-fit w-full">
					<div class="-gap-1 flex">
						{#each blogsComponent.blogs?.data ?? [] as article (article.id)}
							<BlogCard
								image={article.attributes?.main_image}
								category={article.attributes?.blog_category?.data?.attributes?.title}
								title={article.attributes?.title}
								description={article.attributes?.short_description}
								url={`blog/${article.attributes?.slug}`}
							/>
						{/each}
					</div>
				</ScrollArea>
			</section>
		{/if}
	{/each}

	<div
		class="mx-auto mb-10 grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:mb-32 lg:grid-cols-3 xl:grid-cols-4"
	>
		<Benifit
			title="Професійність"
			description="Ефективність моїх стратегій підтверджується кейсами клієнтів. І постійно проводжу маркетингові дослідження, тому добре знаю ваш ринок."
		>
			{#snippet icon()}
				<Briefcase size={32} />
			{/snippet}
		</Benifit>
		<Benifit
			title="Індивідуальний підхід"
			description="Кожен бізнес унікальний, тому я розробляю стратегії, які відповідають вашим конкретним цілям і потребам."
		>
			{#snippet icon()}
				<Briefcase size={32} />
			{/snippet}
		</Benifit>
		<Benifit
			title="Комплексні рішення"
			description="Від SEO до соціальних мереж і контент-маркетингу — я пропоную повний спектр послуг для всебічного розвитку вашого бізнесу."
		></Benifit>
		<Benifit
			title="Постійна підтримка"
			description="Я завжди на зв’язку, щоб відповісти на ваші запитання та надати консультації, допомагаючи вам адаптуватися до змін на ринку."
		>
			{#snippet icon()}
				<Briefcase size={32} />
			{/snippet}
		</Benifit>
	</div>
{:else if $homepageData.isError}
	<p class="text-red-500">Failed to load homepage data</p>
{:else}
	<section class="-mx-8 mb-10 lg:mb-32">
		<Skeleton class="h-[150px] w-full md:h-[450px] lg:h-[650px]" />
	</section>

	<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
		<div class="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4 lg:gap-10">
			{#each Array(3) as _, index (index)}
				<div class="relative {index === 1 ? 'md:row-span-2' : ''}">
					<Skeleton class="{index === 1 ? 'h-[320px] md:h-[250px]' : 'h-[250px]'} w-full" />
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
{/if}
