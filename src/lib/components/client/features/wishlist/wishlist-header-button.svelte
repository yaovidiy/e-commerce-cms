<script lang="ts">
	import { getWishlistCount } from '$lib/remotes/wishlist.remote';
	import { Button } from '$lib/components/ui/button';
	import { Heart } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<Button
	variant="ghost"
	size="icon"
	class="relative"
	href="/dashboard/wishlist"
	aria-label={m.wishlist()}
>
	<Heart class="h-5 w-5" />
	
	{#await getWishlistCount()}
		<!-- Loading -->
	{:then count}
		{#if count > 0}
			<span
				class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
			>
				{count > 99 ? '99+' : count}
			</span>
		{/if}
	{/await}
</Button>
