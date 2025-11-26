<script lang="ts">
	import { getAllOrders, updateOrderStatus } from '$lib/remotes/order.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { renderComponent } from '$lib/components/ui/data-table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import OrderDetailsDialog from './order-details-dialog.svelte';
	import SendEmailDialog from './send-email-dialog.svelte';
	import OrderActionsCell from './order-actions-cell.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Search } from '@lucide/svelte';

	type Order = {
		id: string;
		orderNumber: string;
		customerEmail: string;
		customerFirstName: string;
		customerLastName: string;
		status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
		paymentStatus: string;
		total: number;
		createdAt: Date | null;
	};

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>('all');
	let currentPage = $state(1);
	const pageSize = 10;

	// Track which order is being viewed/emailed
	let viewingOrder = $state<null | Order>(null);
	let emailingOrder = $state<null | Order>(null);
	let detailsDialogOpen = $state(false);
	let emailDialogOpen = $state(false);

	function handlePageChange(pageIndex: any) {
		// DataTableWrapper sends 0-based index, convert to 1-based for API
		currentPage = pageIndex + 1;
	}

	function openDetailsDialog(order: Order) {
		viewingOrder = order;
		detailsDialogOpen = true;
	}

	function openEmailDialog(order: Order) {
		emailingOrder = order;
		emailDialogOpen = true;
	}

	async function handleStatusChange(orderId: string, newStatus: string) {
		await updateOrderStatus({ 
			id: orderId, 
			status: newStatus as Order['status']
		});
	}

	function handleSearchChange() {
		currentPage = 1;
	}

	function handleStatusFilterChange(value: string | undefined) {
		if (value) {
			statusFilter = value as typeof statusFilter;
			currentPage = 1;
		}
	}

	function getStatusLabel(status: Order['status']): string {
		switch (status) {
			case 'pending': return m.order_status_pending?.() ?? 'Pending';
			case 'processing': return m.order_status_processing?.() ?? 'Processing';
			case 'shipped': return m.order_status_shipped?.() ?? 'Shipped';
			case 'delivered': return m.order_status_delivered?.() ?? 'Delivered';
			case 'cancelled': return m.order_status_cancelled?.() ?? 'Cancelled';
			case 'refunded': return m.order_status_refunded?.() ?? 'Refunded';
			default: return status;
		}
	}

	function getStatusColor(status: Order['status']) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-50 text-yellow-700 ring-yellow-700/10';
			case 'processing':
				return 'bg-blue-50 text-blue-700 ring-blue-700/10';
			case 'shipped':
				return 'bg-purple-50 text-purple-700 ring-purple-700/10';
			case 'delivered':
				return 'bg-green-50 text-green-700 ring-green-700/10';
			case 'cancelled':
				return 'bg-red-50 text-red-700 ring-red-700/10';
			case 'refunded':
				return 'bg-gray-50 text-gray-700 ring-gray-700/10';
			default:
				return 'bg-gray-50 text-gray-700 ring-gray-700/10';
		}
	}

	function formatCurrency(cents: number) {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'UAH'
		}).format(cents / 100);
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center gap-4">
		<div class="relative flex-1 min-w-[200px] max-w-sm">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input
				type="text"
				placeholder={m.order_search_placeholder?.() ?? 'Search by order # or email...'}
				bind:value={searchQuery}
				oninput={handleSearchChange}
				class="pl-9"
			/>
		</div>
		<Select.Root type="single" value={statusFilter} onValueChange={handleStatusFilterChange}>
			<Select.Trigger class="w-[180px]">
				{statusFilter === 'all' ? m.common_all() : getStatusLabel(statusFilter)}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">{m.common_all()}</Select.Item>
				<Select.Item value="pending">{m.order_status_pending?.() ?? 'Pending'}</Select.Item>
				<Select.Item value="processing">{m.order_status_processing?.() ?? 'Processing'}</Select.Item>
				<Select.Item value="shipped">{m.order_status_shipped?.() ?? 'Shipped'}</Select.Item>
				<Select.Item value="delivered">{m.order_status_delivered?.() ?? 'Delivered'}</Select.Item>
				<Select.Item value="cancelled">{m.order_status_cancelled?.() ?? 'Cancelled'}</Select.Item>
				<Select.Item value="refunded">{m.order_status_refunded?.() ?? 'Refunded'}</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	{#await getAllOrders({ 
		status: statusFilter, 
		customerEmail: searchQuery.includes('@') ? searchQuery : '', 
		orderNumber: !searchQuery.includes('@') ? searchQuery : '', 
		page: currentPage, 
		pageSize 
	})}
		<div class="text-muted-foreground px-4 py-8 text-center text-sm">{m.common_loading()}</div>
	{:then response}
		<DataTableWrapper
			data={response.data}
			columns={[
				{
					accessorKey: 'orderNumber',
					header: () => m.order_order_number?.() ?? 'Order #',
					cell: (info: any) => {
						const value = info.getValue() as string;
						return `<div class="font-mono text-sm font-medium">${value}</div>`;
					}
				},
				{
					accessorKey: 'customerFirstName',
					header: () => m.order_customer?.() ?? 'Customer',
					cell: (info: any) => {
						const row = info.row.original;
						return `${row.customerFirstName} ${row.customerLastName}`;
					}
				},
				{
					accessorKey: 'customerEmail',
					header: () => m.order_email?.() ?? 'Email',
					cell: (info: any) => {
						const value = info.getValue() as string;
						return `<div class="text-muted-foreground truncate text-sm">${value}</div>`;
					}
				},
				{
					accessorKey: 'status',
					header: () => m.common_status(),
					cell: (info: any) => {
						const status = info.getValue() as Order['status'];
						const label = getStatusLabel(status);
						const color = getStatusColor(status);
						return `<span class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${color}">${label}</span>`;
					}
				},
				{
					accessorKey: 'total',
					header: () => m.order_total?.() ?? 'Total',
					cell: (info: any) => {
						const value = info.getValue() as number;
						return `<div class="font-medium">${formatCurrency(value)}</div>`;
					}
				},
				{
					accessorKey: 'createdAt',
					header: () => m.order_date?.() ?? 'Date',
					cell: (info: any) => {
						const date = info.getValue() as Date | null;
						if (date instanceof Date) {
							return date.toLocaleDateString();
						} else if (date) {
							return new Date(date as string | number).toLocaleDateString();
						}
						return '-';
					}
				},
				{
					id: 'actions',
					header: () => m.common_actions(),
					cell: ({ row }: any) =>
						renderComponent(OrderActionsCell, {
							order: row.original,
							onView: openDetailsDialog,
							onEmail: openEmailDialog,
							onStatusChange: handleStatusChange
						}),
					enableSorting: false,
					enableHiding: false
				}
			]}
			totalPages={response.totalPages}
			page={currentPage}
			pageSize={pageSize}
			hasNextPage={response.hasNextPage}
			hasPreviousPage={response.hasPreviousPage}
			onPageChange={handlePageChange}
			emptyMessage={m.order_no_orders?.() ?? 'No orders found'}
		/>
	{:catch error}
		<div class="px-4 py-8 text-center text-sm text-destructive">
			{m.common_error()}: {error.message}
		</div>
	{/await}
</div>

<OrderDetailsDialog order={viewingOrder} bind:open={detailsDialogOpen} />
<SendEmailDialog order={emailingOrder} bind:open={emailDialogOpen} />
