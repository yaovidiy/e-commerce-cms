<script lang="ts">
	import { browseProducts } from '$lib/remotes/product.remote';
	import { Input } from '$lib/components/ui/input';
	import * as m from '$lib/paraglide/messages';
	import { ShoppingCart } from '@lucide/svelte';

	let searchQuery = $state('');
	let sortBy = $state<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
	let currentPage = $state(1);

	// Helper to format price in cents to display format
	function formatPrice(cents: number) {
		return (cents / 100).toFixed(2);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">{m.product_products()}</h1>

	<!-- Search and filters -->
	<div class="flex flex-col md:flex-row gap-4 mb-8">
		<Input
			type="text"
			placeholder={m.shop_search_products()}
			bind:value={searchQuery}
			class="flex-1"
		/>
		
		<select
			bind:value={sortBy}
			class="px-4 py-2 border rounded-md bg-white"
		>
			<option value="newest">{m.shop_newest()}</option>
			<option value="price-asc">{m.shop_price_low_to_high()}</option>
			<option value="price-desc">{m.shop_price_high_to_low()}</option>
			<option value="name">{m.shop_name()}</option>
		</select>
	</div>

	<!-- Product grid -->
	{#await browseProducts({
		search: searchQuery,
		sortBy,
		page: currentPage,
		pageSize: 12
	})}
		<!-- Loading skeleton -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each Array(12) as _}
				<div class="border rounded-lg p-4 animate-pulse">
					<div class="bg-gray-200 h-48 mb-4 rounded"></div>
					<div class="bg-gray-200 h-4 mb-2 rounded"></div>
					<div class="bg-gray-200 h-4 w-2/3 rounded"></div>
				</div>
			{/each}
		</div>
	{:then products}
		{#if products.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">{m.shop_no_products_found()}</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each products as product}
					<a
						href="/products/{product.slug}"
						class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
					>
						<!-- Product image -->
						<div class="aspect-square bg-gray-100 relative overflow-hidden">
							{#if product.images}
								{@const imageIds = JSON.parse(product.images)}
								{#if imageIds.length > 0}
									<img
										src="/api/assets/{imageIds[0]}"
										alt={product.name}
										class="w-full h-full object-cover group-hover:scale-105 transition-transform"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<ShoppingCart class="w-16 h-16 text-gray-300" />
									</div>
								{/if}
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<ShoppingCart class="w-16 h-16 text-gray-300" />
								</div>
							{/if}

							<!-- Sale badge -->
							{#if product.compareAtPrice && product.compareAtPrice > product.price}
								<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
									{m.shop_sale()}
								</div>
							{/if}
						</div>

						<!-- Product info -->
						<div class="p-4">
							<h3 class="font-semibold text-lg mb-2 line-clamp-2">
								{product.name}
							</h3>
							
							{#if product.description}
								<p class="text-gray-600 text-sm mb-3 line-clamp-2">
									{product.description}
								</p>
							{/if}

							<!-- Price -->
							<div class="flex items-center gap-2">
								{#if product.compareAtPrice && product.compareAtPrice > product.price}
									<span class="text-lg font-bold text-red-600">
										${formatPrice(product.price)}
									</span>
									<span class="text-sm text-gray-500 line-through">
										${formatPrice(product.compareAtPrice)}
									</span>
								{:else}
									<span class="text-lg font-bold">
										${formatPrice(product.price)}
									</span>
								{/if}
							</div>

							<!-- Stock status -->
							{#if product.trackInventory}
								{#if product.quantity === 0 && !product.allowBackorders}
									<p class="text-sm text-red-600 mt-2">{m.shop_out_of_stock()}</p>
								{:else if product.quantity <= (product.lowStockThreshold || 10)}
									<p class="text-sm text-orange-600 mt-2">
										{m.shop_low_stock()} ({product.quantity} {m.shop_left()})
									</p>
								{/if}
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{:catch error}
		<div class="text-center py-12">
			<p class="text-red-500">{m.shop_error_loading_products()}: {error.message}</p>
		</div>
	{/await}
</div>
