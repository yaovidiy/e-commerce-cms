<script lang="ts">
	import { getCartItemCount } from '$lib/remotes/cart.remote';
	import { Button } from '$lib/components/ui/button';
	import { ShoppingCart } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { onclick } = $props<{ onclick?: () => void }>();
</script>

<Button
	variant="ghost"
	size="icon"
	class="relative"
	{onclick}
	aria-label={m.shop_cart()}
>
	<ShoppingCart class="h-5 w-5" />
	
	{#await getCartItemCount()}
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
