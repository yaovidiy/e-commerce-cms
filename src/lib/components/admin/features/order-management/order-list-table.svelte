<script lang="ts">
	import { getAllOrders, updateOrderStatus } from '$lib/remotes/order.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import OrderDetailsDialog from './order-details-dialog.svelte';
	import SendEmailDialog from './send-email-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		MoreHorizontal,
		Eye,
		Mail,
		Search,
		ChevronLeft,
		ChevronRight,
		Package,
		Truck,
		CheckCircle,
		XCircle,
		Clock,
		RefreshCw
	} from '@lucide/svelte';

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>('all');
	let currentPage = $state(1);
	let pageSize = $state(10);

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

	// Track which order is being viewed/emailed
	let viewingOrder = $state<null | Order>(null);
	let emailingOrder = $state<null | Order>(null);
	let detailsDialogOpen = $state(false);
	let emailDialogOpen = $state(false);

	function openDetailsDialog(order: Order) {
		viewingOrder = order;
		detailsDialogOpen = true;
	}

	function openEmailDialog(order: Order) {
		emailingOrder = order;
		emailDialogOpen = true;
	}

	async function handleStatusChange(orderId: string, newStatus: Order['status']) {
		await updateOrderStatus({ id: orderId, status: newStatus });
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

	function getStatusIcon(status: Order['status']) {
		switch (status) {
			case 'pending':
				return Clock;
			case 'processing':
				return Package;
			case 'shipped':
				return Truck;
			case 'delivered':
				return CheckCircle;
			case 'cancelled':
				return XCircle;
			case 'refunded':
				return RefreshCw;
			default:
				return Clock;
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

	<div class="rounded-md border">
		<div class="w-full overflow-x-auto">
			<div class="bg-muted/50 border-b px-4 py-3">
				<div class="grid grid-cols-7 gap-4 font-medium min-w-[800px]">
					<div>{m.order_order_number?.() ?? 'Order #'}</div>
					<div>{m.order_customer?.() ?? 'Customer'}</div>
					<div>{m.order_email?.() ?? 'Email'}</div>
					<div>{m.common_status()}</div>
					<div>{m.order_total?.() ?? 'Total'}</div>
					<div>{m.order_date?.() ?? 'Date'}</div>
					<div class="text-right">{m.common_actions()}</div>
				</div>
			</div>
			<div>
				{#await getAllOrders({ 
					status: statusFilter, 
					customerEmail: searchQuery.includes('@') ? searchQuery : '', 
					orderNumber: !searchQuery.includes('@') ? searchQuery : '', 
					page: currentPage, 
					pageSize 
				})}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">{m.common_loading()}</div>
				{:then result}
					{#each result.orders as order (order.id)}
						{@const StatusIcon = getStatusIcon(order.status)}
						<div class="hover:bg-muted/50 border-b px-4 py-3 last:border-0 min-w-[800px]">
							<div class="grid grid-cols-7 items-center gap-4">
								<div class="font-mono text-sm font-medium">{order.orderNumber}</div>
								<div class="truncate">{order.customerFirstName} {order.customerLastName}</div>
								<div class="text-muted-foreground truncate text-sm">{order.customerEmail}</div>
								<div>
										<span
											class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset {getStatusColor(order.status)}"
										>
											<StatusIcon class="h-3 w-3" />
											{getStatusLabel(order.status)}
										</span>
								</div>
								<div class="font-medium">{formatCurrency(order.total)}</div>
								<div class="text-muted-foreground text-sm">
									{#if order.createdAt}
										{new Date(order.createdAt).toLocaleDateString()}
									{:else}
										-
									{/if}
								</div>
								<div class="flex items-center justify-end gap-2">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Button variant="ghost" size="icon">
												<MoreHorizontal class="h-4 w-4" />
												<span class="sr-only">{m.common_actions()}</span>
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => openDetailsDialog(order as Order)}>
												<Eye class="mr-2 h-4 w-4" />
												{m.order_view_details?.() ?? 'View Details'}
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => openEmailDialog(order as Order)}>
												<Mail class="mr-2 h-4 w-4" />
												{m.order_send_email?.() ?? 'Send Email'}
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Sub>
												<DropdownMenu.SubTrigger>
													<Package class="mr-2 h-4 w-4" />
													{m.order_update_status?.() ?? 'Update Status'}
												</DropdownMenu.SubTrigger>
												<DropdownMenu.SubContent>
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'pending')}
														disabled={order.status === 'pending'}
													>
														<Clock class="mr-2 h-4 w-4" />
														{m.order_status_pending?.() ?? 'Pending'}
													</DropdownMenu.Item>
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'processing')}
														disabled={order.status === 'processing'}
													>
														<Package class="mr-2 h-4 w-4" />
														{m.order_status_processing?.() ?? 'Processing'}
													</DropdownMenu.Item>
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'shipped')}
														disabled={order.status === 'shipped'}
													>
														<Truck class="mr-2 h-4 w-4" />
														{m.order_status_shipped?.() ?? 'Shipped'}
													</DropdownMenu.Item>
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'delivered')}
														disabled={order.status === 'delivered'}
													>
														<CheckCircle class="mr-2 h-4 w-4" />
														{m.order_status_delivered?.() ?? 'Delivered'}
													</DropdownMenu.Item>
													<DropdownMenu.Separator />
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'cancelled')}
														disabled={order.status === 'cancelled'}
														class="text-destructive"
													>
														<XCircle class="mr-2 h-4 w-4" />
														{m.order_status_cancelled?.() ?? 'Cancelled'}
													</DropdownMenu.Item>
													<DropdownMenu.Item 
														onclick={() => handleStatusChange(order.id, 'refunded')}
														disabled={order.status === 'refunded'}
													>
														<RefreshCw class="mr-2 h-4 w-4" />
														{m.order_status_refunded?.() ?? 'Refunded'}
													</DropdownMenu.Item>
												</DropdownMenu.SubContent>
											</DropdownMenu.Sub>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</div>
						</div>
					{:else}
						<div class="px-4 py-8 text-center text-sm text-muted-foreground">
							{m.order_no_orders?.() ?? 'No orders found'}
						</div>
					{/each}

					<!-- Pagination Controls -->
					{#if result.pagination.totalCount > 0}
						<div class="border-t px-4 py-3">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">
									{m.common_page?.() ?? 'Page'} {currentPage} {m.common_of?.() ?? 'of'} {result.pagination.totalPages} ({result.pagination.totalCount} {m.orders?.() ?? 'orders'})
								</p>

								<div class="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage <= 1}
										onclick={() => currentPage--}
									>
										<ChevronLeft class="h-4 w-4 mr-1" />
										{m.common_previous()}
									</Button>

									<Button
										variant="outline"
										size="sm"
										disabled={currentPage >= result.pagination.totalPages}
										onclick={() => currentPage++}
									>
										{m.common_next()}
										<ChevronRight class="h-4 w-4 ml-1" />
									</Button>
								</div>
							</div>
						</div>
					{/if}
				{:catch error}
					<div class="px-4 py-8 text-center text-sm text-destructive">
						{m.common_error()}: {error.message}
					</div>
				{/await}
			</div>
		</div>
	</div>
</div>

<OrderDetailsDialog order={viewingOrder} bind:open={detailsDialogOpen} />
<SendEmailDialog order={emailingOrder} bind:open={emailDialogOpen} />
