<script lang="ts">
	import ProductCard from '$lib/components/client/features/product-catalog/product-card.svelte';
	import * as Carousel from '$lib/components/ui/carousel';

	let {
		data
	}: {
		data: {
			products?: Array<{
				id: string;
				title?: string;
				price?: number;
				image?: string;
				category?: string;
				weight?: string;
				url?: string;
				categoryId?: string;
				productId?: string;
				salePrice?: number | null;
				saleStart?: string | null;
				saleEnd?: string | null;
			}>;
		};
	} = $props();
</script>

<div class="container py-12">
	<Carousel.Root>
		<Carousel.Content>
		{#each data.products ?? [] as product (product.id)}
			<Carousel.Item class="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
				<ProductCard
					id={product.productId}
					title={product.title}
					price={product.price}
					image={product.image}
					category={product.category}
					weight={product.weight}
					url={product.url}
					categoryId={product.categoryId}
					salePrice={product.salePrice}
					saleStart={product.saleStart}
					saleEnd={product.saleEnd}
				/>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
