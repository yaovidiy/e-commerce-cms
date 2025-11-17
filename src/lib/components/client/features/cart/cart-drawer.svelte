<script lang="ts">
	import { getCart, removeFromCart, updateCartItem, clearCart } from '$lib/remotes/cart.remote';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Minus, Plus, ShoppingCart, Trash2, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { open = $bindable(false) } = $props();

	// Format price helper (cents to dollars)
	function formatPrice(cents: number): string {
		return `$${(cents / 100).toFixed(2)}`;
	}

	// Handle quantity change
	async function handleQuantityChange(productId: string, variantId: string | null, newQuantity: number) {
		try {
			await updateCartItem({ productId, variantId: variantId ?? undefined, quantity: newQuantity });
		} catch (error) {
			console.error('Failed to update cart:', error);
			alert('Failed to update cart. Please try again.');
		}
	}

	// Handle remove item
	async function handleRemoveItem(productId: string, variantId: string | null) {
		try {
			await removeFromCart({ productId, variantId: variantId ?? undefined });
		} catch (error) {
			console.error('Failed to remove item:', error);
			alert('Failed to remove item. Please try again.');
		}
	}

	// Handle clear cart
	async function handleClearCart() {
		if (!confirm('Are you sure you want to clear your cart?')) return;
		
		try {
			await clearCart({});
		} catch (error) {
			console.error('Failed to clear cart:', error);
			alert('Failed to clear cart. Please try again.');
		}
	}

	// Navigate to checkout
	function goToCheckout() {
		open = false;
		window.location.href = '/checkout';
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="w-full sm:max-w-lg">
		<Sheet.Header>
			<Sheet.Title class="flex items-center gap-2">
				<ShoppingCart class="h-5 w-5" />
				{m.shop_cart()}
			</Sheet.Title>
			<Sheet.Description>
				{m.shop_continue_shopping()}
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex flex-col h-full mt-6">
			{#await getCart()}
				<!-- Loading state -->
				<div class="flex-1 space-y-4">
					{#each Array(3) as _}
						<div class="flex gap-4 animate-pulse">
							<div class="w-20 h-20 bg-muted rounded-md"></div>
							<div class="flex-1 space-y-2">
								<div class="h-4 bg-muted rounded w-3/4"></div>
								<div class="h-3 bg-muted rounded w-1/2"></div>
								<div class="h-4 bg-muted rounded w-1/4"></div>
							</div>
						</div>
					{/each}
				</div>
			{:then cart}
				{#if cart.items.length === 0}
					<!-- Empty state -->
					<div class="flex-1 flex flex-col items-center justify-center text-center py-12">
						<ShoppingCart class="h-16 w-16 text-muted-foreground mb-4" />
						<h3 class="text-lg font-semibold mb-2">{m.shop_empty_cart()}</h3>
						<p class="text-sm text-muted-foreground mb-6">
							{m.shop_continue_shopping()}
						</p>
						<Button onclick={() => (open = false)}>
							{m.shop_continue_shopping()}
						</Button>
					</div>
				{:else}
					<!-- Cart items -->
					<div class="flex-1 overflow-y-auto space-y-4 pr-2">
						{#each cart.items as item}
							{@const product = item.product}
							<div class="flex gap-4 relative group">
								<!-- Product image -->
								<div class="w-20 h-20 shrink-0">
									{#if item.image}
										<img
											src={item.image}
											alt={item.name}
											class="w-full h-full object-cover rounded-md"
										/>
									{:else}
										<div class="w-full h-full bg-muted rounded-md flex items-center justify-center">
											<ShoppingCart class="h-8 w-8 text-muted-foreground" />
										</div>
									{/if}
								</div>

								<!-- Product details -->
								<div class="flex-1 min-w-0">
									<h4 class="font-medium text-sm truncate mb-1">
										{item.name}
									</h4>
									
									{#if product}
										{#if product.salePrice && product.salePrice < product.price}
											<div class="flex items-center gap-2 mb-2">
												<span class="text-sm font-semibold text-primary">
													{formatPrice(product.salePrice)}
												</span>
												<span class="text-xs text-muted-foreground line-through">
													{formatPrice(product.price)}
												</span>
											</div>
										{:else}
											<p class="text-sm font-semibold mb-2">
												{formatPrice(item.price)}
											</p>
										{/if}

										<!-- Stock warning -->
										{#if product.trackInventory}
											{#if product.quantity === 0}
												<p class="text-xs text-destructive mb-2">
													{m.shop_out_of_stock()}
												</p>
											{:else if product.quantity < 10}
												<p class="text-xs text-amber-600 mb-2">
													{m.shop_low_stock()}: {product.quantity}
												</p>
											{/if}
										{/if}
									{/if}

									<!-- Quantity controls -->
									<div class="flex items-center gap-2">
										<div class="flex items-center border rounded-md">
											<Button
												variant="ghost"
												size="icon"
												class="h-7 w-7"
												onclick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
												disabled={item.quantity <= 1}
											>
												<Minus class="h-3 w-3" />
											</Button>
											<span class="px-3 text-sm font-medium min-w-8 text-center">
												{item.quantity}
											</span>
											<Button
												variant="ghost"
												size="icon"
												class="h-7 w-7"
												onclick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
												disabled={product?.trackInventory && product.quantity <= item.quantity && !product.allowBackorders}
											>
												<Plus class="h-3 w-3" />
											</Button>
										</div>

										<!-- Remove button -->
										<Button
											variant="ghost"
											size="icon"
											class="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
											onclick={() => handleRemoveItem(item.productId, item.variantId)}
										>
											<Trash2 class="h-3 w-3" />
										</Button>
									</div>
								</div>

								<!-- Item total price -->
								<div class="text-sm font-semibold text-right">
									{formatPrice((product?.salePrice && product.salePrice < product.price ? product.salePrice : item.price) * item.quantity)}
								</div>
							</div>
							<Separator />
						{/each}
					</div>

					<!-- Cart footer -->
					<div class="pt-4 space-y-4 border-t mt-auto">
						<!-- Clear cart button -->
						<Button
							variant="outline"
							size="sm"
							class="w-full"
							onclick={handleClearCart}
						>
							<Trash2 class="h-4 w-4 mr-2" />
							{m.shop_clear_cart()}
						</Button>

						<!-- Totals -->
						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">{m.shop_subtotal()}</span>
								<span class="font-medium">{formatPrice(cart.subtotal)}</span>
							</div>
							<div class="flex justify-between text-base font-semibold">
								<span>{m.shop_total()}</span>
								<span>{formatPrice(cart.total)}</span>
							</div>
						</div>

						<!-- Checkout button -->
						<Button class="w-full" size="lg" onclick={goToCheckout}>
							{m.shop_proceed_to_checkout()}
						</Button>

						<Button
							variant="outline"
							class="w-full"
							onclick={() => (open = false)}
						>
							{m.shop_continue_shopping()}
						</Button>
					</div>
				{/if}
			{:catch error}
				<!-- Error state -->
				<div class="flex-1 flex flex-col items-center justify-center text-center py-12">
					<X class="h-16 w-16 text-destructive mb-4" />
					<h3 class="text-lg font-semibold mb-2">Error loading cart</h3>
					<p class="text-sm text-muted-foreground mb-6">
						{error.message}
					</p>
					<Button onclick={() => (open = false)}>Close</Button>
				</div>
			{/await}
		</div>
	</Sheet.Content>
</Sheet.Root>
