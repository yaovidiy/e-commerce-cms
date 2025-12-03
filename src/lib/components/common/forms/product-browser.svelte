<script lang="ts">
	import { getAllProducts } from '$lib/remotes/product.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Check } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Product } from '$lib/server/db/schema';
	import * as Pagination from '$lib/components/ui/pagination/';
	import { Badge } from '$lib/components/ui/badge';

	let { open = $bindable(false), onSelect } = $props<{
		open?: boolean;
		onSelect: (product: Product) => void;
	}>();

	let searchQuery = $state('');
	let selectedProduct = $state<Product | null>(null);
	let currentPage = $state(1);
	const pageSize = 20;

	function handleSelect(product: Product) {
		selectedProduct = product;
		onSelect(product);
		open = false;
		selectedProduct = null;
	}

	function handleSearch() {
		currentPage = 1;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>Select Product</Dialog.Title>
			<Dialog.Description>Search and select a product to add to the block</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Search -->
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder="Search products by name..."
					bind:value={searchQuery}
					class="flex-1"
				/>
				<Button size="sm" onclick={handleSearch}>Search</Button>
			</div>

			<!-- Products List -->
			<div class="max-h-[50vh] overflow-y-auto rounded-lg border">
				{#await getAllProducts( { name: searchQuery, status: 'all', page: currentPage, pageSize } )}
					<div class="flex items-center justify-center p-8">
						<p class="text-muted-foreground">{m.common_loading()}</p>
					</div>
				{:then result}
					{#if result.data && result.data.length > 0}
						<div class="divide-y">
							{#each result.data as product (product.id)}
								<button
									class="hover:bg-accent flex w-full items-center justify-between px-4 py-3 text-left transition-colors relative"
									onclick={() => handleSelect(product)}
								>
                                    <Badge variant="outline" class="absolute top-2 right-2">
                                        {product.status}
                                    </Badge>
									<div class="flex-1">
										<p class="font-medium">{product.name}</p>
										<p class="text-muted-foreground text-sm">
											{product.price ? `${(product.price / 100).toFixed(2)} грн` : 'Price not set'} ·
											{product.quantity} in stock
										</p>
									</div>
									{#if selectedProduct?.id === product.id}
										<Check class="text-primary h-4 w-4" />
									{/if}
								</button>
							{/each}
						</div>
						<div class="mt-3">
							<Pagination.Root
								bind:page={currentPage}
								count={result.totalCount}
								perPage={result.pageSize}
							>
								{#snippet children({ pages, currentPage })}
									<Pagination.Content>
										<Pagination.Item>
											<Pagination.PrevButton />
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === 'ellipsis'}
												<Pagination.Item>
													<Pagination.Ellipsis />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link {page} isActive={currentPage === page.value}>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.NextButton />
										</Pagination.Item>
									</Pagination.Content>
								{/snippet}
							</Pagination.Root>
						</div>
					{:else}
						<div class="flex items-center justify-center p-8">
							<p class="text-muted-foreground">No products found</p>
						</div>
					{/if}
				{:catch error}
					<div class="flex items-center justify-center p-8">
						<p class="text-destructive">Error loading products: {error.message}</p>
					</div>
				{/await}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>
				{m.common_cancel()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
