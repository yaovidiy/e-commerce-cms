<script lang="ts">
	import { getAllProducts, deleteProduct } from '$lib/remotes/product.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { DeleteProductDialog } from '$lib/components/admin/features/product-management';
	import ProductActionsCellComponent from './product-actions-cell.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Plus } from '@lucide/svelte/icons';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import { createRawSnippet } from 'svelte';
	import { watch } from 'runed';
	import type { Product } from '$lib/server/db/schema';
	import type { ColumnDef } from '@tanstack/table-core';

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'draft' | 'active' | 'archived'>('all');
	let currentPage = $state(0);
	const pageSize = 9;

	// Delete dialog state
	let deletingProduct = $state<Product | null>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(product: Product) {
		deletingProduct = product;
		deleteDialogOpen = true;
	}

	function handlePageChange(pageIndex: number) {
		// DataTableWrapper uses 0-based indexing, but our API uses 1-based
		currentPage = pageIndex;
	}

	// Watch for deletion success and refresh list
	watch(
		() => deleteProduct.result,
		(result) => {
			if (result) {
				getAllProducts({ name: searchQuery, status: statusFilter, page: 1, pageSize }).refresh();
				currentPage = 1;
			}
		}
	);

	// Watch for filter changes and reset to page 1
	watch(
		() => [searchQuery, statusFilter],
		() => {
			currentPage = 1;
		}
	);

	// Helper to format price from cents
	function formatPrice(cents: number) {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'UAH'
		}).format(cents / 100);
	}

	// Helper to format date
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}

	// Column definitions
	const columns: ColumnDef<Product>[] = [
		{
			accessorKey: 'name',
			header: () => m.product_name()
		},
		{
			accessorKey: 'sku',
			header: () => m.product_sku(),
			cell: (info: any) => info.getValue() || '-'
		},
		{
			accessorKey: 'price',
			header: () => m.product_price(),
			cell: (info: any) => formatPrice(info.getValue() as number)
		},
		{
			accessorKey: 'quantity',
			header: () => m.product_quantity(),
			cell: ({ row }: any) => {
				const lowStockThreshold = row.original.lowStockThreshold || 10;
				const quantitySnippet = createRawSnippet<[{ quantity: number; lowStockThreshold: number }]>(
					(getParams) => {
						const { quantity, lowStockThreshold } = getParams();
						let classes = '';
						if (quantity === 0) classes = 'text-red-600';
						else if (quantity > 0 && quantity <= lowStockThreshold) classes = 'text-yellow-600';
						return {
							render: () => `<span class="${classes}">${quantity}</span>`
						};
					}
				);

				return renderSnippet(quantitySnippet, {
					quantity: row.original.quantity,
					lowStockThreshold
				});
			}
		},
		{
			accessorKey: 'status',
			header: () => m.product_status(),
			cell: ({ row }: any) => {
				const statusSnippet = createRawSnippet<[{ status: string }]>((getStatus) => {
					const { status } = getStatus();
					let bgClass = 'bg-gray-100';
					let textClass = 'text-gray-800';
					if (status === 'active') {
						bgClass = 'bg-green-100';
						textClass = 'text-green-800';
					} else if (status === 'archived') {
						bgClass = 'bg-yellow-100';
						textClass = 'text-yellow-800';
					}
					const statusText =
						status === 'draft'
							? m.product_status_draft()
							: status === 'active'
								? m.product_status_active()
								: m.product_status_archived();
					return {
						render: () =>
							`<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${bgClass} ${textClass}">${statusText}</span>`
					};
				});

				return renderSnippet(statusSnippet, {
					status: row.original.status
				});
			}
		},
		{
			accessorKey: 'createdAt',
			header: () => m.product_created_at(),
			cell: (info: any) => formatDate(info.getValue() as Date)
		},
		{
			id: 'actions',
			header: () => m.common_actions(),
			cell: ({ row }: any) =>
				renderComponent(ProductActionsCellComponent, {
					product: row.original,
					onEdit: (product) => {
						// Navigate to edit page
						window.location.href = `/admin/products/${product.id}/edit`;
					},
					onDelete: openDeleteDialog
				}),
			enableSorting: false,
			enableHiding: false
		}
	];

	$inspect(currentPage, searchQuery, statusFilter);
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.product_products()}</h1>
			<p class="text-muted-foreground">{m.product_manage_description()}</p>
		</div>
		<Button href="/admin/products/create">
			<Plus class="mr-2 size-4" />
			{m.product_create_product()}
		</Button>
	</div>

	<!-- Filters -->
	<div class="flex gap-4">
		<Input
			type="text"
			placeholder={m.product_search_placeholder()}
			bind:value={searchQuery}
			class="max-w-sm"
		/>
		<select
			bind:value={statusFilter}
			class="border-input flex h-10 items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-white"
		>
			<option value="all">{m.product_all()}</option>
			<option value="draft">{m.product_status_draft()}</option>
			<option value="active">{m.product_status_active()}</option>
			<option value="archived">{m.product_status_archived()}</option>
		</select>
	</div>

	<!-- Products Table with Pagination -->
	<div class="flex flex-col gap-4">
		{#await getAllProducts( { name: searchQuery, status: statusFilter, page: currentPage, pageSize } )}
			<div class="flex items-center justify-center p-8">
				<p class="text-muted-foreground">{m.common_loading()}</p>
			</div>
		{:then products}
			<DataTableWrapper
				bind:data={products.data}
				{columns}
				{pageSize}
				isLoading={false}
				emptyMessage={m.product_no_products()}
				totalPages={products.totalPages}
				onPageChange={handlePageChange}
				hasNextPage={products.hasNextPage}
				page={currentPage}
			/>
		{:catch error}
			<div class="flex items-center justify-center p-8">
				<p class="text-destructive">{m.common_error()}: {error.message}</p>
			</div>
		{/await}
	</div>
</div>

<!-- Delete Product Dialog -->
<DeleteProductDialog bind:product={deletingProduct} bind:open={deleteDialogOpen} />
