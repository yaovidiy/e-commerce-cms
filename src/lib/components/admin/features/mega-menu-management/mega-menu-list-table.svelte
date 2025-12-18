<script lang="ts">
	import { getAllMegaMenus } from '$lib/remotes/mega-menu.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import MegaMenuForm from './mega-menu-form.svelte';
	import DeleteMegaMenuDialog from './delete-mega-menu-dialog.svelte';
	import MegaMenuActionsCell from './mega-menu-actions-cell.svelte';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import { onMount, createRawSnippet } from 'svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { MegaMenu } from '$lib/server/db/schema';
	import MegaMenuCategoryItemsList from './mega-menu-category-items-list.svelte';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 20;

	let editingItem = $state<MegaMenu | null>(null);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let deletingItem = $state<MegaMenu | null>(null);

	let categoriesMap = $state<Map<string, string>>(new Map());

	function handlePageChange(pageIndex: number) {
		currentPage = pageIndex + 1;
	}

	function openEditDialog(item: MegaMenu) {
		editingItem = item;
		editDialogOpen = true;
	}

	function openDeleteDialog(item: MegaMenu) {
		deletingItem = item;
		deleteDialogOpen = true;
	}

	onMount(async () => {
		// Load all categories to build a map of id to name
		const result = await getAllCategories({ search: '', page: 1, pageSize: 1000 });
		const newMap = new Map<string, string>();
		result.data.forEach((cat) => {
			newMap.set(cat.id, cat.name);
		});
		categoriesMap = newMap;
	});

	const columns: ColumnDef<MegaMenu>[] = [
		{
			accessorKey: 'title',
			header: () => m.common_title()
		},
		{
			accessorKey: 'categoryId',
			header: () => m.mega_menu_main_category(),
			cell: (info) => {
				const categoryId = info.getValue() as string | null;

				if (!categoryId) return '-';

				return renderComponent(MegaMenuCategoryItemsList, {
					categoryIds: categoryId ? [categoryId] : []
				});
			}
		},
		{
			accessorKey: 'categories',
			header: () => m.common_categories(),
			cell: (info) => {
				const categoryIds = info.getValue() as string[];
				if (!categoryIds || categoryIds.length === 0) return '-';

				return renderComponent(MegaMenuCategoryItemsList, {
					categoryIds
				});
			}
		},
		{
			accessorKey: 'displayOrder',
			header: () => m.common_order(),
			cell: (info) => info.getValue()
		},
		{
			accessorKey: 'isVisible',
			header: () => m.common_visible(),
			cell: (info) => {
				const isVisible = info.getValue() as boolean;

				const snippet = createRawSnippet<[boolean]>((getIsVisible) => {
					const visible = getIsVisible();
					const variant = visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
					const text = visible ? m.common_visible() : m.common_hidden();

					return {
						render: () =>
							`<span class="inline-flex px-2 py-1 rounded text-sm ${variant}">${text}</span>`,
						setup() {}
					};
				});

				return renderSnippet(snippet, isVisible);
			}
		},
		{
			id: 'actions',
			header: () => m.common_actions(),
			cell: ({ row }) =>
				renderComponent(MegaMenuActionsCell, {
					item: row.original,
					onEdit: openEditDialog,
					onDelete: openDeleteDialog
				}),
			enableSorting: false,
			enableHiding: false
		}
	];
</script>

<div class="space-y-4">
	<!-- Search and Create -->
	<div class="flex gap-2">
		<Input
			type="text"
			placeholder={m.mega_menu_search_placeholder()}
			bind:value={searchQuery}
			class="flex-1"
		/>
		<Button
			variant="outline"
			onclick={() => {
				editingItem = null;
				editDialogOpen = true;
			}}
		>
			{m.common_create()}
		</Button>
	</div>

	<!-- Table with DataTableWrapper -->
	{#await getAllMegaMenus({ search: searchQuery, page: currentPage, pageSize })}
		<div class="flex items-center justify-center p-8">
			<p class="text-muted-foreground">{m.common_loading()}</p>
		</div>
	{:then result}
		{console.log('Mega Menus Result:', result)}
		<DataTableWrapper
			data={result.data}
			{columns}
			totalPages={result.totalPages}
			page={currentPage}
			{pageSize}
			onPageChange={handlePageChange}
			emptyMessage={m.mega_menu_no_items()}
		/>
	{:catch error}
		<div class="flex items-center justify-center p-8">
			<p class="text-destructive">{m.mega_menu_loading_error()}: {error.message}</p>
		</div>
	{/await}
</div>

<!-- Edit Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>
				{editingItem ? m.common_edit() : m.common_create()}
				{m.mega_menu()}
			</Dialog.Title>
		</Dialog.Header>
		<MegaMenuForm 
			item={editingItem}
			onSave={() => {
				editDialogOpen = false;
			}}
		/>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (editDialogOpen = false)}>
				{m.common_cancel()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<DeleteMegaMenuDialog item={deletingItem} bind:open={deleteDialogOpen} />
