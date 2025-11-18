<script lang="ts">
	import { getAllProducts, deleteProduct } from '$lib/remotes/product.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { DeleteProductDialog } from '$lib/components/admin/features/product-management';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte/icons';
	import type { Product } from '$lib/server/db/schema';

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'draft' | 'active' | 'archived'>('all');
	
	// Delete dialog state
	let deletingProduct = $state<Product | null>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(product: Product) {
		deletingProduct = product;
		deleteDialogOpen = true;
	}

	// Auto-refresh list after successful deletion
	$effect(() => {
		if (deleteProduct.result) {
			getAllProducts({ name: searchQuery, status: statusFilter, page: 1, pageSize: 20 }).refresh();
		}
	});

	// Helper to format price from cents
	function formatPrice(cents: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
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
			class="bg-white border-input ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm"
		>
			<option value="all">{m.product_all()}</option>
			<option value="draft">{m.product_status_draft()}</option>
			<option value="active">{m.product_status_active()}</option>
			<option value="archived">{m.product_status_archived()}</option>
		</select>
	</div>

	<!-- Products Table -->
	<div class="border-border rounded-lg border">
		{#await getAllProducts({ name: searchQuery, status: statusFilter, page: 1, pageSize: 20 })}
			<div class="flex items-center justify-center p-8">
				<p class="text-muted-foreground">{m.common_loading()}</p>
			</div>
		{:then products}
			{#if products.length === 0}
				<div class="flex flex-col items-center justify-center gap-2 p-8">
					<p class="text-muted-foreground">{m.product_no_products()}</p>
					<Button href="/admin/products/create" variant="outline" size="sm">
						<Plus class="mr-2 size-4" />
						{m.product_create_product()}
					</Button>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m.product_name()}</Table.Head>
							<Table.Head>{m.product_sku()}</Table.Head>
							<Table.Head>{m.product_price()}</Table.Head>
							<Table.Head>{m.product_quantity()}</Table.Head>
							<Table.Head>{m.product_status()}</Table.Head>
							<Table.Head>{m.product_created_at()}</Table.Head>
							<Table.Head class="text-right">{m.common_actions()}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each products as product}
							<Table.Row>
								<Table.Cell class="font-medium">{product.name}</Table.Cell>
								<Table.Cell class="text-muted-foreground">{product.sku || '-'}</Table.Cell>
								<Table.Cell>{formatPrice(product.price)}</Table.Cell>
								<Table.Cell>
									<span
										class:text-red-600={product.quantity === 0}
										class:text-yellow-600={product.quantity > 0 &&
											product.quantity <= (product.lowStockThreshold || 10)}
									>
										{product.quantity}
									</span>
								</Table.Cell>
								<Table.Cell>
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
										class:bg-gray-100={product.status === 'draft'}
										class:text-gray-800={product.status === 'draft'}
										class:bg-green-100={product.status === 'active'}
										class:text-green-800={product.status === 'active'}
										class:bg-yellow-100={product.status === 'archived'}
										class:text-yellow-800={product.status === 'archived'}
									>
										{product.status === 'draft'
											? m.product_status_draft()
											: product.status === 'active'
												? m.product_status_active()
												: m.product_status_archived()}
									</span>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{formatDate(product.createdAt)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/products/{product.id}/edit" variant="ghost" size="sm">
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="text-destructive"
											onclick={() => openDeleteDialog(product)}
										>
											<Trash2 class="size-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		{:catch error}
			<div class="flex items-center justify-center p-8">
				<p class="text-destructive">{m.common_error()}: {error.message}</p>
			</div>
		{/await}
	</div>
</div>

<!-- Delete Product Dialog -->
<DeleteProductDialog bind:product={deletingProduct} bind:open={deleteDialogOpen} />
