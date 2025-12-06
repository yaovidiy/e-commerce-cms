<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { Filter } from '@lucide/svelte';
	// TODO: Import sidebar component when available
	// import Sidebar from '$lib/components/client/features/product-catalog/sidebar.svelte';
	// TODO: Import controls component when available
	// import Controls from '$lib/components/client/features/product-catalog/controls.svelte';
	import ProductList from '$lib/components/client/features/product-catalog/product-list.svelte';
	// TODO: Import ApiRequest when available
	// import ApiRequest from '$lib/utils/api';
	import { getAllPublicProducts } from '$lib/remotes/product.remote';
	// TODO: Import pagination component when available
	// import Pagination from '$lib/components/client/features/product-catalog/pagination.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { globalState } from '$lib/state/global.svelte';
	import { useSearchParams } from 'runed/kit';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { productSearchSchema, type SortOptions } from '$lib/schemas';
	import * as Pagination from '$lib/components/ui/pagination';

	// Create reactive search parameters using runed useSearchParams
	const searchParams = useSearchParams(productSearchSchema);

	let drawerOpened = $state(false);
	let listStart = $state<HTMLDivElement | null>(null);

	function handleSortChange(newSort: SortOptions) {
		searchParams.sortBy = newSort;
		searchParams.page = 1;
	}

	function handleCategoryChange(newCategoryId: string) {
		if (searchParams.category === newCategoryId) {
			searchParams.category = undefined;
			searchParams.page = 1;
			return;
		}
		searchParams.category = newCategoryId;
		searchParams.page = 1;
	}

	function handlePageChange(newPage: number) {
		searchParams.page = newPage;
	}
</script>

<section class="mx-auto max-w-7xl">
	<section class="flex w-full flex-col gap-6 px-8 py-8 md:flex-row md:gap-0">
		{#if !globalState.isMobile.current}
			<!-- TODO: Uncomment when Sidebar component is available -->
			<!-- <Sidebar onCategoryChange={handleCategoryChange} /> -->
		{/if}
		{#if globalState.isMobile.current}
			<section class="flex w-full flex-col justify-between gap-3">
				<Drawer.Root bind:open={drawerOpened}>
					<Drawer.Trigger
						class="flex items-center justify-center gap-3 rounded-full border px-6 py-3"
					>
						<Filter /> Фільтрувати
					</Drawer.Trigger>
					<Drawer.Content class="h-[60vh]">
						<Drawer.Header>
							<Drawer.Title>Фільтрувати за категоріями</Drawer.Title>
							<Drawer.Description>
								Категорії можна розкрити щоб побачити підкатегорії
							</Drawer.Description>
						</Drawer.Header>
						<ScrollArea.Root class="h-[calc(100%-4rem)] w-full">
							<!-- TODO: Uncomment when Sidebar component is available -->
							<!-- <Sidebar
								onCategoryChange={(newCategoryId) => {
									handleCategoryChange(newCategoryId);
									drawerOpened = false;
								}}
							/> -->
						</ScrollArea.Root>
						<Drawer.Footer>
							<Drawer.Close>Закрити</Drawer.Close>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Root>
			</section>
		{/if}
		<section class="mt-2 flex w-full flex-col gap-6 border-gray-200 pl-2 md:border-l">
			<div class="flex items-center justify-end">
				<!-- TODO: Uncomment when Controls component is available -->
				<!-- <Controls bind:sortBy onSortChange={handleSortChange} bind:amount /> -->
			</div>
			<div bind:this={listStart}></div>
			{#await getAllPublicProducts( { page: searchParams.page || 1, pageSize: 12, categoryId: searchParams.category || undefined, query: searchParams.query || undefined, sortBy: (searchParams.sortBy || 'createdAt:desc') as SortOptions } )}
				<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{#each Array.from({ length: 12 })}
						<Skeleton class="h-[400px] w-80" />
					{/each}
				</div>
			{:then result}
				{console.log(result)}
				{#if result.data.length > 0}
					<ProductList products={result.data} />
					<!-- TODO: Uncomment when Pagination component is available -->
					<Pagination.Root
						count={result.totalCount}
						perPage={result.pageSize}
						onPageChange={(page) => {
							handlePageChange(page);
						}}
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
					<!-- {#if result.meta.pagination.pageCount > 1}
						<div class="mx-auto max-w-[100vw]">
							<Pagination
								onPageChanged={handlePageChange}
								currentPage={searchParams.page || 1}
								count={result.meta.pagination.total}
								{listStart}
								perPage={result.meta.pagination.pageSize}
							/>
						</div>
					{/if} -->
				{:else}
					<div class="flex min-h-96 items-center justify-center">
						<p class="text-muted-foreground">No products found</p>
					</div>
				{/if}
			{:catch error}
				<div class="flex min-h-96 items-center justify-center">
					<p class="text-destructive">Error loading products: {error.message}</p>
				</div>
			{/await}
		</section>
	</section>
</section>
