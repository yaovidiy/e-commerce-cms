<script lang="ts">
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table';
	import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, type ColumnDef, type SortingState } from '@tanstack/table-core';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	interface Props<TData> {
		data: TData[];
		columns: ColumnDef<TData>[];
		pageSize?: number;
		isLoading?: boolean;
		emptyMessage?: string;
	}

	let { data = [], columns = [], pageSize = 10, isLoading = false, emptyMessage = m.common_no_data?.() || 'No data' }: Props<any> = $props();

	let sorting: SortingState = $state([]);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			get sorting() {
				return sorting;
			},
			pagination: {
				pageIndex: 0,
				pageSize: pageSize
			}
		},
		onStateChange: () => {
			// State changes are handled automatically through the proxy
		}
	});
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup}
				<Table.Row>
					{#each headerGroup.headers as header}
						<Table.Head>
							<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="text-center py-8 text-muted-foreground">
						{m.common_loading?.() || 'Loading...'}
					</Table.Cell>
				</Table.Row>
			{:else if table.getRowModel().rows?.length === 0}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="text-center py-8 text-muted-foreground">
						{emptyMessage}
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row>
						{#each row.getVisibleCells() as cell}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>

{#if table.getRowModel().rows.length > 0}
	<div class="flex items-center justify-between px-2 py-4">
		<div class="text-sm text-muted-foreground">
			{m.common_page?.() || 'Page'} {table.getState().pagination.pageIndex + 1} {m.common_of?.() || 'of'} {table.getPageCount()}
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!table.getCanPreviousPage()}
				onclick={() => table.previousPage()}
			>
				<ChevronLeft class="h-4 w-4 mr-1" />
				{m.common_previous?.() || 'Previous'}
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!table.getCanNextPage()}
				onclick={() => table.nextPage()}
			>
				{m.common_next?.() || 'Next'}
				<ChevronRight class="h-4 w-4 ml-1" />
			</Button>
		</div>
	</div>
{/if}
