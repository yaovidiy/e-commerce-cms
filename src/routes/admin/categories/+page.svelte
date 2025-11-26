<script lang="ts">
	import { getAllCategories, deleteCategory } from '$lib/remotes/category.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { renderComponent } from '$lib/components/ui/data-table';
	import CategoryActionsCell from '$lib/components/admin/features/category-management/category-actions-cell.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Search } from '@lucide/svelte';
	import type { Category } from '$lib/server/db/schema';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 5;

	// Delete dialog state
	let deletingCategory = $state<Category | null>(null);
	let deleteDialogOpen = $state(false);

	function handlePageChange(pageIndex: number) {
		// DataTableWrapper sends 0-based index, convert to 1-based for API
		currentPage = pageIndex;
	}

	function openEditDialog(category: Category) {
		// Navigate to edit page
		window.location.href = `/admin/categories/${category.id}/edit`;
	}

	function openDeleteDialog(category: Category) {
		deletingCategory = category;
		deleteDialogOpen = true;
	}

	// Auto-refresh list after successful deletion
	$effect(() => {
		if (deleteCategory.result) {
			getAllCategories({ search: searchQuery, page: currentPage, pageSize }).refresh();
		}
	});

	const columns: any[] = [
		{
			accessorKey: 'name',
			header: () => m.category_name()
		},
		{
			accessorKey: 'slug',
			header: () => m.category_slug(),
			cell: (info: any) => {
				const slug = info.getValue() as string;
				return `/${slug}`;
			}
		},
		{
			accessorKey: 'displayOrder',
			header: () => m.category_display_order(),
			cell: (info: any) => info.getValue() as number
		},
		{
			accessorKey: 'isVisible',
			header: () => m.category_is_visible(),
			cell: (info: any) => {
				const isVisible = info.getValue() as boolean;
				return isVisible ? m.common_yes() : m.common_no();
			}
		},
		{
			accessorKey: 'createdAt',
			header: () => m.category_created_at(),
			cell: (info: any) => {
				const date = info.getValue() as Date | null;
				if (!date) return '-';
				return new Date(date).toLocaleDateString();
			}
		},
		{
			id: 'actions',
			header: () => m.common_actions(),
			cell: ({ row }: any) =>
				renderComponent(CategoryActionsCell, {
					category: row.original,
					onEdit: openEditDialog,
					onDelete: openDeleteDialog
				}),
			enableSorting: false,
			enableHiding: false
		}
	];
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.category_categories()}</h1>
			<p class="text-muted-foreground">{m.category_create_category_description()}</p>
		</div>
		<Button href="/admin/categories/create">
			<Plus class="mr-2 size-4" />
			{m.category_create_category()}
		</Button>
	</div>

	<!-- Search -->
	<div class="relative max-w-sm">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input type="text" placeholder={m.common_search()} bind:value={searchQuery} class="pl-9" />
	</div>

	<!-- Categories Data Table -->
	{#await getAllCategories({ search: searchQuery, page: currentPage, pageSize })}
		<div class="flex items-center justify-center p-8">
			<p class="text-muted-foreground">{m.common_loading()}</p>
		</div>
	{:then response}
		<DataTableWrapper
			data={response.data}
			{columns}
			totalPages={response.totalPages}
			page={currentPage}
			{pageSize}
			hasNextPage={response.hasNextPage}
			hasPreviousPage={response.hasPreviousPage}
			onPageChange={handlePageChange}
			emptyMessage={m.category_no_categories()}
		/>
	{:catch error}
		<div class="flex items-center justify-center p-8">
			<p class="text-destructive">{m.common_error()}: {error.message}</p>
		</div>
	{/await}
</div>

<!-- Delete Category Dialog -->
{#if deletingCategory}
	{@const DeleteCategoryDialog = await import(
		'$lib/components/admin/features/category-management'
	).then((m) => m.DeleteCategoryDialog)}
	<DeleteCategoryDialog bind:category={deletingCategory} bind:open={deleteDialogOpen} />
{/if}
