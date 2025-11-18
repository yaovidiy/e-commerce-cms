<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import Image from '$lib/components/common/data-display/asset-image.svelte';
	import { Heart, ShoppingCart } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { addToCart } from '$lib/remotes/cart.remote';
	import { addToWishlist, removeFromWishlist, getWishlist } from '$lib/remotes/wishlist.remote';
	import { onMount } from 'svelte';

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
	let wishlist = $state<{ items: any[] }>({ items: [] });
	let wishlistLoading = $state(false);
	let wishlistError = $state('');
	let wishlistItem = $state(false);

	// Fetch wishlist on mount
	onMount( async () => {
		try {
			wishlistLoading = true;
			wishlist = await getWishlist();
			wishlistItem = wishlist.items.some((item) => item.id === id);
		} catch (e) {
			wishlistError = 'Error loading wishlist';
		} finally {
			wishlistLoading = false;
		}
	});

	function handleClick() {
		goto(url);
	}

	async function handleAddToCart(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		try {
			await addToCart({ productId: id, quantity: 1 });
			addedToCart = true;
			toast.success('Товар додано до кошика');
			setTimeout(() => {
				addedToCart = false;
			}, 500);
		} catch (err) {
			toast.error('Не вдалося додати товар до кошика');
		}
	}

	async function handleWishlist(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		try {
			if (!wishlistItem) {
				await addToWishlist({ productId: id });
				toast.success('Додано до бажаного');
			} else {
				await removeFromWishlist({ productId: id });
				toast.success('Видалено з бажаного');
			}
			// Refresh wishlist state
			wishlist = await getWishlist();
			wishlistItem = wishlist.items.some((item) => item.id === id);
		} catch (err) {
			toast.error('Не вдалося оновити бажане');
		}
	}

	const isOnSale = !!(salePrice && saleStart && saleEnd) && new Date(saleEnd) > new Date() && new Date(saleStart) < new Date();
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
				<Image assetId={image} alt={title} thumbnail={true} />
			{/if}
		</div>
		<div class="flex h-[125px] flex-col justify-between">
			<div class="mb-3 flex flex-wrap items-center justify-between">
				<span class="line-clamp-2 h-12 w-full text-base font-semibold">{title}</span>
				<span class="text-xs">
					{#if isOnSale}
						<span class="text-lg font-semibold text-gray-400 line-through">{price} грн</span>
						&nbsp;
						<span class="text-dark-green text-2xl font-semibold"
							>{salePrice}
							<span class="text-dark-green">грн</span>
							<span class="text-xs font-normal">- {weight}</span></span
						>
					{:else}
						<span class="text-2xl font-semibold"
							>{price}
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
						class="relative flex items-center gap-1 text-sm"
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
						class="flex items-center gap-1 text-sm"
						aria-label={wishlistItem ? 'Видалити з бажаного' : 'Додати до бажаного'}
						disabled={wishlistLoading}
					>
						<Heart size={24} class={wishlistItem ? 'text-primary' : ''} />
					</button>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
