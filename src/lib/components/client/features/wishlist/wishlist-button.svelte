<script lang="ts">
	import { getWishlist, addToWishlist, removeFromWishlist } from '$lib/remotes/wishlist.remote';
	import { Button } from '$lib/components/ui/button';
	import { Heart } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let {
		productId,
		variant = 'ghost',
		size = 'icon',
		showLabel = false,
		class: className = ''
	}: {
		productId: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		showLabel?: boolean;
		class?: string;
	} = $props();

	let isInWishlist = $state<boolean>(false);
	let isLoading = $state(true);

	// Check if product is in wishlist
	async function checkWishlist() {
		try {
			const wishlist = await getWishlist();
			isInWishlist = wishlist.items.some((item) => item.id === productId);
		} catch {
			isInWishlist = false;
		} finally {
			isLoading = false;
		}
	}

	// Run check on mount
	$effect(() => {
		checkWishlist();
	});

	async function handleToggle() {
		if (isInWishlist) {
			await removeFromWishlist({ productId });
		} else {
			await addToWishlist({ productId });
		}
		// Refresh wishlist state
		await checkWishlist();
	}
</script>

<Button
	{variant}
	{size}
	class={className}
	onclick={handleToggle}
	disabled={isLoading}
	title={showLabel ? undefined : (isInWishlist ? m.wishlist_remove_from_wishlist() : m.wishlist_add_to_wishlist())}
>
	{#if isLoading}
		<Heart class={size === 'icon' ? 'h-5 w-5' : 'h-4 w-4'} />
	{:else}
		<Heart class="{isInWishlist ? 'fill-current' : ''} {size === 'icon' ? 'h-5 w-5' : 'h-4 w-4'}" />
	{/if}
	{#if showLabel}
		<span class="ml-2">
			{isInWishlist ? m.wishlist_remove_from_wishlist() : m.wishlist_add_to_wishlist()}
		</span>
	{/if}
</Button>
