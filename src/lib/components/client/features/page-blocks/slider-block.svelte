<script lang="ts">
	import AssetImage from '$lib/components/common/data-display/asset-image.svelte';
	import * as Carousel from '$lib/components/ui/carousel';
	import { goto } from '$app/navigation';

	let {
		data
	}: {
		data: {
			slides?: Array<{
				id: string;
				image?: {
					assetId: string;
				};
				url?: string;
			}>;
		};
	} = $props();
</script>

<Carousel.Root>
	<Carousel.Content class="relative">
		{#if data.slides && data.slides.length > 1}
			<Carousel.Previous class="aboslute top-1/2 left-6 -translate-y-1/2" />
		{/if}
		{#each data.slides || [] as slide (slide.id)}
			<Carousel.Item
				onclick={() => {
					if (slide.url) {
						goto(slide.url);
					}
				}}
			>
				<AssetImage assetId={slide.image?.assetId ?? ''} thumbnail={false} />
			</Carousel.Item>
		{/each}
		{#if data.slides && data.slides.length > 1}
			<Carousel.Next class="aboslute top-1/2 right-4 -translate-y-1/2" />
		{/if}
	</Carousel.Content>
</Carousel.Root>
