<script lang="ts">
	import { browseProducts } from '$lib/remotes/product.remote';
	import { Input } from '$lib/components/ui/input';
	import { WishlistButton } from '$lib/components/client/features/wishlist';
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

