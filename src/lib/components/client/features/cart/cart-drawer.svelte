<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { getCart, removeFromCart } from '$lib/remotes/cart.remote';
	import { ShoppingCart, Trash } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import AssetImage from '$lib/components/common/data-display/asset-image.svelte';
	import * as m from '$lib/paraglide/messages';

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<div class="relative">
			<ShoppingCart />
			{#await getCart() then cartData}
				{#if cartData.items.length}
					<div
						class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
					>
						{cartData.items.length}
					</div>
				{/if}
			{/await}
		</div>
	</Popover.Trigger>
	<Popover.Content align="end" class="w-96 p-0">
		<div transition:fade class="md:top-15 flex min-w-96 flex-col shadow-sm">
			{#await getCart() then cartData}
				{#if cartData.items.length}
					{#each cartData.items as item}
						<a
							href={`/products/${item?.product?.slug}`}
							class="flex items-center justify-between gap-5 bg-milky p-5 shadow-sm"
						>
							<div class="img">
								<div class="h-20 w-20">
									{#if item.product?.images}
										{@const images = JSON.parse(item.product.images)}
										{#if images[0]}
											<AssetImage
												assetId={images[0]}
												alt={item.product.name}
												width={80}
												height={80}
												class="w-full h-full object-cover"
											/>
										{:else}
											<div class="w-full h-full bg-muted"></div>
										{/if}
									{:else}
										<div class="w-full h-full bg-muted"></div>
									{/if}
								</div>
							</div>
							<div class="product-content flex flex-1 flex-col justify-start">
								<div class="text-heading-6">
									{item.product?.name || item.name}
								</div>
								<div class="text-caption">
									{(item.price / 100).toFixed(2)}грн
								</div>
							</div>
							<div class="text-caption">
								{item.quantity}
							</div>
							<div class="icon cursor-pointer">
								<button
									aria-label="remove item"
									onclick={async (e) => {
										e.preventDefault();
										await removeFromCart({ productId: item.productId });
										await getCart().refresh();
									}}
								>
									<Trash />
								</button>
							</div>
						</a>
					{/each}

					<div class="bg-white p-5">
						<span class="text-caption text-light-gray font-normal">{m.shop_total()}:</span>
						<span class="text-base font-semibold text-dark-green">{(cartData.total / 100).toFixed(2)} грн</span>
					</div>
					<div class="flex justify-center gap-5 bg-white p-5">
						<a
							onclick={() => (open = false)}
							href="/cart"
							class="btn-outline text-caption flex w-36 items-center justify-center border-2 border-dark-green pb-4 pl-1 pr-1 pt-4 text-center text-dark-green transition-all"
						>
							{m.shop_view_cart()}
						</a>
						<a
							onclick={() => (open = false)}
							href="/payment-details"
							class="btn-primary text-caption flex w-36 items-center justify-center bg-dark-green pb-4 pl-1 pr-1 pt-4 text-white transition-all"
						>
							{m.shop_checkout()}
						</a>
					</div>
				{:else}
					<div class="text-heading-5 flex items-center justify-between gap-5 bg-milky p-5 shadow-sm">
						{m.shop_empty_cart()}
					</div>
				{/if}
			{/await}
		</div>
	</Popover.Content>
</Popover.Root>
