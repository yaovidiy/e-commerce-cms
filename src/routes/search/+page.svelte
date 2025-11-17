<script lang="ts">
	import { page } from '$app/stores';
	import { searchProducts } from '$lib/remotes/product.remote';
	import { SearchBar } from '$lib/components/client/features/search';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { Search } from '@lucide/svelte';

	// Get search query from URL
	const searchQuery = $derived($page.url.searchParams.get('q') || '');
	const limit = $derived(parseInt($page.url.searchParams.get('limit') || '20'));

	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price / 100);
	}
</script>

<svelte:head>
	<title>{searchQuery ? `Search: ${searchQuery}` : 'Search Products'} | Your Store</title>
	<meta name="description" content="Search our product catalog" />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Search Bar -->
	<div class="mb-8 flex justify-center">
		<SearchBar />
	</div>

	{#if searchQuery}
		<!-- Search Results -->
		<div class="mb-6">
			<h1 class="text-3xl font-bold mb-2">
				{m.search_results()}
			</h1>
			<p class="text-muted-foreground">
				{m.searching_for()}: <span class="font-medium">{searchQuery}</span>
			</p>
		</div>

		{#await searchProducts({ query: searchQuery, limit })}
			<div class="flex flex-col items-center justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
				<p class="text-muted-foreground">{m.loading()}</p>
			</div>
		{:then results}
			{#if results.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each results as product}
						{@const typedProduct = product as any}
						{@const images = typeof typedProduct.images === 'string' 
							? JSON.parse(typedProduct.images) 
							: typedProduct.images}
						<a
							href="/products/{typedProduct.slug}"
							class="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
						>
							{#if images && images.length > 0}
								<div class="aspect-square overflow-hidden bg-muted">
									<img
										src={images[0]}
										alt={typedProduct.name}
										class="w-full h-full object-cover group-hover:scale-105 transition-transform"
									/>
								</div>
							{:else}
								<div class="aspect-square bg-muted flex items-center justify-center">
									<Search class="h-12 w-12 text-muted-foreground" />
								</div>
							{/if}
							<div class="p-4">
								<h3 class="font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
									{typedProduct.name}
								</h3>
								{#if typedProduct.category_name}
									<p class="text-xs text-muted-foreground mb-2">
										{typedProduct.category_name}
									</p>
								{/if}
								<p class="text-lg font-bold">{formatPrice(typedProduct.price)}</p>
								{#if typedProduct.quantity <= 0}
									<p class="text-sm text-destructive mt-2">
										{m.out_of_stock()}
									</p>
								{/if}
							</div>
						</a>
					{/each}
				</div>

				<div class="mt-8 text-center text-sm text-muted-foreground">
					<p>
						{m.showing_results()} {results.length} {m.results()}
					</p>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12">
					<Search class="h-16 w-16 text-muted-foreground mb-4" />
					<h2 class="text-xl font-semibold mb-2">
						{m.no_results_found()}
					</h2>
					<p class="text-muted-foreground mb-6">
						{m.try_different_keywords()}
					</p>
					<Button href="/products">{m.browse_all_products()}</Button>
				</div>
			{/if}
		{:catch error}
			<div class="flex flex-col items-center justify-center py-12">
				<div class="rounded-lg border border-destructive p-6 text-center">
					<h2 class="text-xl font-semibold text-destructive mb-2">
						{m.search_error()}
					</h2>
					<p class="text-muted-foreground mb-4">
						{error.message}
					</p>
					<Button href="/products">{m.browse_all_products()}</Button>
				</div>
			</div>
		{/await}
	{:else}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-12">
			<Search class="h-16 w-16 text-muted-foreground mb-4" />
			<h2 class="text-xl font-semibold mb-2">
				{m.search_products()}
			</h2>
			<p class="text-muted-foreground">
				{m.enter_search_query()}
			</p>
		</div>
	{/if}
</div>
