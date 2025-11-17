<script lang="ts">
	import { getWishlist, removeFromWishlist, clearWishlist, moveToCart } from '$lib/remotes/wishlist.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';
	import { Heart, ShoppingCart, Trash2, X } from '@lucide/svelte';

	let clearDialogOpen = $state(false);
	let movingProductId = $state<string | null>(null);
	let moveQuantity = $state(1);

	function handleRemove(productId: string) {
		removeFromWishlist({ productId });
	}

	function handleClearConfirm() {
		clearWishlist();
		clearDialogOpen = false;
	}

	function openMoveDialog(productId: string) {
		movingProductId = productId;
		moveQuantity = 1;
	}

	function handleMoveToCart() {
		if (movingProductId) {
			moveToCart({ productId: movingProductId, quantity: moveQuantity });
			movingProductId = null;
			moveQuantity = 1;
		}
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price / 100);
	}
</script>

<svelte:head>
	<title>{m.wishlist_title()}</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{m.wishlist_title()}</h1>
			<p class="text-muted-foreground">{m.wishlist_description()}</p>
		</div>

		{#await getWishlist()}
			<!-- Loading state handled below -->
		{:then wishlist}
			{#if wishlist.items.length > 0}
				<Button variant="outline" onclick={() => (clearDialogOpen = true)}>
					<Trash2 class="h-4 w-4 mr-2" />
					{m.wishlist_clear_wishlist()}
				</Button>
			{/if}
		{/await}
	</div>

	{#await getWishlist()}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each Array(4) as _}
				<Card.Root class="overflow-hidden">
					<Card.Content class="p-0">
						<div class="aspect-square bg-muted animate-pulse"></div>
						<div class="p-4 space-y-2">
							<div class="h-4 bg-muted rounded animate-pulse"></div>
							<div class="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:then wishlist}
		{#if wishlist.items.length === 0}
			<Card.Root class="border-dashed">
				<Card.Content class="flex flex-col items-center justify-center py-16 text-center">
					<div class="rounded-full bg-muted p-4 mb-4">
						<Heart class="h-8 w-8 text-muted-foreground" />
					</div>
					<h2 class="text-2xl font-semibold mb-2">{m.wishlist_empty_title()}</h2>
					<p class="text-muted-foreground mb-6 max-w-md">
						{m.wishlist_empty_description()}
					</p>
					<Button href="/products">
						{m.wishlist_continue_shopping()}
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each wishlist.items as item}
					{@const images = item.images ? JSON.parse(item.images) : []}
					<Card.Root class="overflow-hidden group">
						<Card.Content class="p-0">
							<div class="relative aspect-square bg-muted overflow-hidden">
								{#if images[0]}
									<img
										src={images[0]}
										alt={item.name}
										class="w-full h-full object-cover transition-transform group-hover:scale-105"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<Heart class="h-12 w-12 text-muted-foreground" />
									</div>
								{/if}

								<Button
									variant="destructive"
									size="icon"
									class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={() => handleRemove(item.id)}
								>
									<X class="h-4 w-4" />
								</Button>
							</div>

							<div class="p-4 space-y-3">
								<div>
									<h3 class="font-semibold text-lg line-clamp-2">
										{item.name}
									</h3>
									<p class="text-2xl font-bold text-primary mt-1">
										{formatPrice(item.price)}
									</p>
								</div>

								{#if item.status !== 'active'}
									<div class="flex items-center gap-2 text-sm text-destructive">
										<X class="h-4 w-4" />
										{m.wishlist_product_unavailable()}
									</div>
								{:else if item.quantity <= 0}
									<div class="flex items-center gap-2 text-sm text-destructive">
										<X class="h-4 w-4" />
										{m.shop_out_of_stock()}
									</div>
								{:else}
									<div class="flex gap-2">
										<Button
											class="flex-1"
											onclick={() => openMoveDialog(item.id)}
										>
											<ShoppingCart class="h-4 w-4 mr-2" />
											{m.shop_add_to_cart()}
										</Button>
										<Button
											variant="outline"
											href="/products/{item.slug}"
										>
											{m.shop_product_details()}
										</Button>
									</div>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<div class="flex justify-center">
				<p class="text-sm text-muted-foreground">
					{wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}
				</p>
			</div>
		{/if}
	{:catch error}
		<Card.Root class="border-destructive">
			<Card.Content class="py-8 text-center">
				<p class="text-destructive">{error.message}</p>
			</Card.Content>
		</Card.Root>
	{/await}
</div>

<!-- Clear Wishlist Confirmation Dialog -->
<Dialog.Root bind:open={clearDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.wishlist_clear_wishlist()}</Dialog.Title>
			<Dialog.Description>
				{m.wishlist_clear_confirmation()}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (clearDialogOpen = false)}>
				{m.common_cancel()}
			</Button>
			<Button variant="destructive" onclick={handleClearConfirm}>
				{m.wishlist_clear_wishlist()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Move to Cart Dialog -->
<Dialog.Root open={movingProductId !== null} onOpenChange={(open) => !open && (movingProductId = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.wishlist_move_to_cart()}</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="quantity">{m.common_quantity()}</Label>
				<Input
					id="quantity"
					type="number"
					min="1"
					bind:value={moveQuantity}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (movingProductId = null)}>
				{m.common_cancel()}
			</Button>
			<Button onclick={handleMoveToCart}>
				<ShoppingCart class="h-4 w-4 mr-2" />
				{m.wishlist_move_to_cart()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
