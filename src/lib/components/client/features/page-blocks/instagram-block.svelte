<script lang="ts">
	import InstagramItem from '$lib/components/client/features/homepage/instagram-item.svelte';
	import * as Carousel from '$lib/components/ui/carousel';

	let {
		data
	}: {
		data: {
			items?: Array<{
				id: string;
				image?: {
					assetId?: string;
				};
				url?: string;
			}>;
		};
	} = $props();
</script>

<div class="container py-12">
	<Carousel.Root>
		<Carousel.Content class="relative">
			{#each data.items || [] as item (item.id)}
				<Carousel.Item class="md:basis-1/3 lg:basis-1/4">
					<InstagramItem {item} />
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
