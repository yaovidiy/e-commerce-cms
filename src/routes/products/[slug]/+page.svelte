<script lang="ts">
	import { page } from '$app/stores';
	import { getProductBySlug } from '$lib/remotes/product.remote';
	import { addToCart, getCartItemCount } from '$lib/remotes/cart.remote';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { ShoppingCart, Minus, Plus } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let quantity = $state(1);
	let isAddingToCart = $state(false);
	let addedToCart = $state(false);

	const slug = $derived($page.params.slug);

	// Helper to format price
	function formatPrice(cents: number) {
		return (cents / 100).toFixed(2);
	}

	async function handleAddToCart(productId: string) {
		if (isAddingToCart) return;

		isAddingToCart = true;
		addedToCart = false;

		try {
			await addToCart({ productId, quantity });
			addedToCart = true;
			
			// Reset after 2 seconds
			setTimeout(() => {
				addedToCart = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to add to cart:', error);
			alert('Failed to add to cart. Please try again.');
		} finally {
			isAddingToCart = false;
		}
	}

	function increaseQuantity() {
		quantity += 1;
	}

	function decreaseQuantity() {
		if (quantity > 1) {
			quantity -= 1;
		}
	}
</script>

{#await getProductBySlug(slug)}
	<!-- Loading state -->
	<div class="container mx-auto px-4 py-8">
		<div class="animate-pulse">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div class="bg-gray-200 h-96 rounded-lg"></div>
				<div>
					<div class="bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
					<div class="bg-gray-200 h-6 w-1/4 mb-4 rounded"></div>
					<div class="bg-gray-200 h-24 mb-4 rounded"></div>
					<div class="bg-gray-200 h-12 w-1/3 rounded"></div>
				</div>
			</div>
		</div>
	</div>
{:then product}
	{#if !product}
		<div class="container mx-auto px-4 py-8 text-center">
			<h1 class="text-2xl font-bold mb-4">Product not found</h1>
			<Button href="/products">Back to Products</Button>
		</div>
	{:else}
		<div class="container mx-auto px-4 py-8">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Product images -->
				<div>
					{#if product.images}
						{@const imageIds = JSON.parse(product.images)}
						{#if imageIds.length > 0}
							<div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
								<img
									src="/api/assets/{imageIds[0]}"
									alt={product.name}
									class="w-full h-full object-cover"
								/>
							</div>
							
							<!-- Thumbnails if multiple images -->
							{#if imageIds.length > 1}
								<div class="grid grid-cols-4 gap-2 mt-4">
									{#each imageIds.slice(1, 5) as imageId}
										<div class="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-75">
											<img
												src="/api/assets/{imageId}"
												alt={product.name}
												class="w-full h-full object-cover"
											/>
										</div>
									{/each}
								</div>
							{/if}
						{:else}
							<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
								<ShoppingCart class="w-24 h-24 text-gray-300" />
							</div>
						{/if}
					{:else}
						<div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
							<ShoppingCart class="w-24 h-24 text-gray-300" />
						</div>
					{/if}
				</div>

				<!-- Product details -->
				<div>
					<h1 class="text-3xl font-bold mb-4">{product.name}</h1>

					<!-- Price -->
					<div class="flex items-center gap-3 mb-6">
						{#if product.compareAtPrice && product.compareAtPrice > product.price}
							<span class="text-3xl font-bold text-red-600">
								${formatPrice(product.price)}
							</span>
							<span class="text-xl text-gray-500 line-through">
								${formatPrice(product.compareAtPrice)}
							</span>
							<span class="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
								{m.shop_sale()}
							</span>
						{:else}
							<span class="text-3xl font-bold">
								${formatPrice(product.price)}
							</span>
						{/if}
					</div>

					<!-- Description -->
					{#if product.description}
						<div class="prose max-w-none mb-6">
							<p class="text-gray-700">{product.description}</p>
						</div>
					{/if}

					<!-- Stock status -->
					{#if product.trackInventory}
						{#if product.quantity === 0 && !product.allowBackorders}
							<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
								{m.shop_out_of_stock()}
							</div>
						{:else if product.quantity <= (product.lowStockThreshold || 10)}
							<div class="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded mb-6">
								{m.shop_low_stock()}: {product.quantity} {m.shop_left()}
							</div>
						{/if}
					{/if}

					<!-- Quantity selector -->
					{#if !product.trackInventory || product.quantity > 0 || product.allowBackorders}
						<div class="mb-6">
							<label class="block text-sm font-medium mb-2">{m.shop_quantity()}</label>
							<div class="flex items-center gap-3">
								<Button
									variant="outline"
									size="icon"
									onclick={decreaseQuantity}
									disabled={quantity <= 1}
								>
									<Minus class="w-4 h-4" />
								</Button>
								
								<span class="text-xl font-semibold w-12 text-center">{quantity}</span>
								
								<Button
									variant="outline"
									size="icon"
									onclick={increaseQuantity}
									disabled={product.trackInventory && quantity >= product.quantity}
								>
									<Plus class="w-4 h-4" />
								</Button>
							</div>
						</div>

						<!-- Add to cart button -->
						<div class="flex gap-4">
							<Button
								class="flex-1"
								size="lg"
								onclick={() => handleAddToCart(product.id)}
								disabled={isAddingToCart || addedToCart}
							>
								{#if addedToCart}
									✓ Added to Cart
								{:else if isAddingToCart}
									Adding...
								{:else}
									<ShoppingCart class="w-5 h-5 mr-2" />
									{m.shop_add_to_cart()}
								{/if}
							</Button>
						</div>
					{/if}

					<!-- Product metadata -->
					<div class="mt-8 border-t pt-6 space-y-2">
						{#if product.sku}
							<p class="text-sm text-gray-600">
								<span class="font-medium">SKU:</span> {product.sku}
							</p>
						{/if}
						{#if product.barcode}
							<p class="text-sm text-gray-600">
								<span class="font-medium">Barcode:</span> {product.barcode}
							</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
{:catch error}
	<div class="container mx-auto px-4 py-8 text-center">
		<p class="text-red-500">Error loading product: {error.message}</p>
		<Button href="/products" class="mt-4">Back to Products</Button>
	</div>
{/await}
