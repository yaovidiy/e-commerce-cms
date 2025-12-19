<script lang="ts">
	import ProductCard from './product-card.svelte';
	let { products } = $props();
</script>

<div class="grid grid-cols-2 gap-6 md:grid-cols-4">
	{#each products as product}
		<ProductCard
			id={product.id}
			url={`/products/${product.code}`}
			image={product.images[0]}
			title={product.name}
			price={product.price}
			categoryId={product.categoryId}
		/>
	{/each}
</div>
