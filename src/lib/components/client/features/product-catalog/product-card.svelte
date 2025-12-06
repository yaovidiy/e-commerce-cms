<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import Image from '$lib/components/common/data-display/asset-image.svelte';
	import { Heart, ShoppingCart } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { addToCart, getCart } from '$lib/remotes/cart.remote';
	import { addToWishlist, removeFromWishlist, getWishlist } from '$lib/remotes/wishlist.remote';

	let {
		title = 'long product title loooong',
		price = 100,
		image,
		category = 'Category',
		weight = '100',
		url = '/product/1',
		categoryId = '',
		id = '',
		salePrice,
		saleStart,
		saleEnd
	}: {
		title?: string;
		price?: number;
		image?: string;
		category?: string;
		weight?: string;
		url?: string;
		categoryId?: string;
		id?: string;
		salePrice?: number | null;
		saleStart?: string | null;
		saleEnd?: string | null;
	} = $props();

	let showPanel = $state(false);
	let addedToCart = $state(false);
	let wishlistLoading = $state(false);

	function handleClick() {
		goto(url);
	}

	async function handleAddToCart(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		try {
			console.log('Adding to cart:', id);
			await addToCart({ productId: id, quantity: 1 });
			addedToCart = true;
			toast.success('Товар додано до кошика');
			// Refresh cart query on server (addToCart command already does this)
			setTimeout(() => {
				addedToCart = false;
			}, 500);
		} catch (err) {
			console.error('Error adding to cart:', err);
			toast.error('Не вдалося додати товар до кошика');
		}
	}

	async function handleWishlist(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		wishlistLoading = true;
		try {
			const wishlistData = await getWishlist();
			
			// Check if user is logged in (wishlist.id will be null if not)
			if (wishlistData.id === null) {
				goto('/auth/login?redirect=' + encodeURIComponent(url));
				return;
			}
			
			const isInWishlist = wishlistData.items.some((item) => item.id === id);
			
			if (!isInWishlist) {
				await addToWishlist({ productId: id });
				toast.success('Додано до бажаного');
			} else {
				await removeFromWishlist({ productId: id });
				toast.success('Видалено з бажаного');
			}
		} catch (err) {
			toast.error('Не вдалося оновити бажане');
		} finally {
			wishlistLoading = false;
		}
	}

	const priceStr = $derived(
		Math.floor(price/100)
	)

	const isOnSale = !!(salePrice && saleStart && saleEnd) && new Date(saleEnd) > new Date() && new Date(saleStart) < new Date();

	// Check if product is in wishlist when needed (reactive)
	let isInWishlist = $state(false);
	
	$effect.pre(() => {
		// Re-check wishlist status when wishlist or id changes
		if (id) {
			checkWishlistStatus();
		}
	});

	async function checkWishlistStatus() {
		try {
			const wishlistData = await getWishlist();
			isInWishlist = wishlistData.items.some((item) => item.id === id);
		} catch (err) {
			// Guest user - wishlist not available
			isInWishlist = false;
		}
	}
</script>

<Card.Root
	class="min-h-[470px] w-full max-w-[280px] shrink-0 border-none p-0 shadow-none"
	role="button"
	onclick={handleClick}
	tabindex={0}
>
	<Card.Content class="h-full">
		<div
			role="figure"
			class="relative mb-3 h-[300px] w-full overflow-hidden"
			onmouseenter={() => (showPanel = true)}
			onmouseleave={() => (showPanel = false)}
		>
			{#if !image}
				<div class="bg-primary h-full w-full"></div>
			{:else}
				<Image assetId={image} alt={title} thumbnail={false} class="w-full" width={280} height={280} />
			{/if}
		</div>
		<div class="flex h-[125px] flex-col justify-between">
			<div class="mb-3 flex flex-wrap items-center justify-between">
				<span class="line-clamp-2 h-12 w-full text-base font-semibold">{title}</span>
				<span class="text-xs">
					{#if isOnSale}
						<span class="text-lg font-semibold text-gray-400 line-through">{priceStr} грн</span>
						&nbsp;
						<span class="text-dark-green text-2xl font-semibold"
							>{salePrice}
							<span class="text-dark-green">грн</span>
							<span class="text-xs font-normal">- {weight}</span></span
						>
					{:else}
						<span class="text-2xl font-semibold"
							>{priceStr}
							<span class="text-dark-green">грн</span>
							<span class="text-xs font-normal">- {weight}</span></span
						>
					{/if}
				</span>
			</div>
			<div class="flex items-center justify-between gap-2">
				<p class="text-gray-500">{category}</p>
				<div class="flex items-center gap-3">
					<button
						onclick={handleAddToCart}
						class="relative flex items-center gap-1 text-sm cursor-pointer"
						aria-label="Додати до кошика"
					>
						<ShoppingCart class={addedToCart ? 'text-primary' : ''} size={24} />
						{#if addedToCart}
							<span
								class="text-primary absolute -top-10 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-lg font-semibold"
								in:fly={{ x: 0, y: 100, duration: 500 }}
								out:fade
							>
								+1
							</span>
						{/if}
					</button>
					<button
						onclick={handleWishlist}
						class="flex items-center gap-1 text-sm cursor-pointer"
						aria-label={isInWishlist ? 'Видалити з бажаного' : 'Додати до бажаного'}
						disabled={wishlistLoading}
					>
						<Heart size={24} class={isInWishlist ? 'text-red-500' : 'text-yellow-500'} />
					</button>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
