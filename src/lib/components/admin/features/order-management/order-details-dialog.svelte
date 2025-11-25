<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { getOrderById, updateOrderStatus, updateOrderNotes } from '$lib/remotes/order.remote';
	import * as m from '$lib/paraglide/messages';
	import {
		Package,
		Truck,
		CheckCircle,
		XCircle,
		Clock,
		RefreshCw,
		Mail,
		Phone,
		MapPin,
		CreditCard,
		FileText
	} from '@lucide/svelte';

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

	let { order, open = $bindable(false) }: { order: Order | null; open?: boolean } = $props();

	let notes = $state('');
	let savingNotes = $state(false);

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

	function formatCurrency(cents: number) {
		return new Intl.NumberFormat('uk-UA', {
			style: 'currency',
			currency: 'UAH'
		}).format(cents / 100);
	}

	function parseAddress(addressJson: string) {
		try {
			return JSON.parse(addressJson);
		} catch {
			return null;
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

	async function handleStatusChange(newStatus: Order['status']) {
		if (!order) return;
		await updateOrderStatus({ id: order.id, status: newStatus });
	}

	async function handleSaveNotes(orderNotes: string) {
		if (!order) return;
		savingNotes = true;
		try {
			await updateOrderNotes({ id: order.id, notes: orderNotes });
		} finally {
			savingNotes = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Package class="h-5 w-5" />
				{m.order_order_details?.() ?? 'Order Details'} - {order?.orderNumber}
			</Dialog.Title>
			<Dialog.Description>
				{m.order_details_description?.() ?? 'View and manage order information'}
			</Dialog.Description>
		</Dialog.Header>

		{#if order}
			{#await getOrderById({ id: order.id })}
				<div class="py-8 text-center text-muted-foreground">{m.common_loading()}</div>
			{:then orderData}
				{@const StatusIcon = getStatusIcon(orderData.status)}
				{@const shippingAddress = parseAddress(orderData.shippingAddress)}
				{@const billingAddress = parseAddress(orderData.billingAddress)}

				<Tabs.Root value="overview" class="mt-4">
					<Tabs.List class="grid w-full grid-cols-4">
						<Tabs.Trigger value="overview">{m.order_tab_overview?.() ?? 'Overview'}</Tabs.Trigger>
						<Tabs.Trigger value="items">{m.order_tab_items?.() ?? 'Items'}</Tabs.Trigger>
						<Tabs.Trigger value="customer">{m.order_tab_customer?.() ?? 'Customer'}</Tabs.Trigger>
						<Tabs.Trigger value="notes">{m.order_tab_notes?.() ?? 'Notes'}</Tabs.Trigger>
					</Tabs.List>

					<!-- Overview Tab -->
					<Tabs.Content value="overview" class="space-y-4 pt-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label>{m.common_status()}</Label>
								<div class="flex items-center gap-2">
									<span
										class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset {getStatusColor(orderData.status)}"
									>
										<StatusIcon class="h-4 w-4" />
										{getStatusLabel(orderData.status)}
									</span>
								</div>
							</div>
							<div class="space-y-2">
								<Label>{m.order_payment_status?.() ?? 'Payment Status'}</Label>
								<p class="text-sm capitalize">{orderData.paymentStatus}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label>{m.order_total?.() ?? 'Total'}</Label>
								<p class="text-2xl font-bold">{formatCurrency(orderData.total)}</p>
							</div>
							<div class="space-y-2">
								<Label>{m.order_date?.() ?? 'Order Date'}</Label>
								<p class="text-sm">
									{orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : '-'}
								</p>
							</div>
						</div>

						<div class="grid grid-cols-3 gap-4 text-sm">
							<div>
								<Label class="text-muted-foreground">{m.shop_subtotal?.() ?? 'Subtotal'}</Label>
								<p>{formatCurrency(orderData.subtotal)}</p>
							</div>
							<div>
								<Label class="text-muted-foreground">{m.shipping_cost?.() ?? 'Shipping'}</Label>
								<p>{formatCurrency(orderData.shippingCost)}</p>
							</div>
							<div>
								<Label class="text-muted-foreground">{m.order_tax?.() ?? 'Tax'}</Label>
								<p>{formatCurrency(orderData.tax)}</p>
							</div>
						</div>

						<div class="pt-4 border-t">
							<Label class="mb-2 block">{m.order_update_status?.() ?? 'Update Status'}</Label>
							<Select.Root 
								type="single" 
								value={orderData.status} 
								onValueChange={(v) => v && handleStatusChange(v as Order['status'])}
							>
								<Select.Trigger class="w-full">
									{getStatusLabel(orderData.status)}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="pending">{m.order_status_pending?.() ?? 'Pending'}</Select.Item>
									<Select.Item value="processing">{m.order_status_processing?.() ?? 'Processing'}</Select.Item>
									<Select.Item value="shipped">{m.order_status_shipped?.() ?? 'Shipped'}</Select.Item>
									<Select.Item value="delivered">{m.order_status_delivered?.() ?? 'Delivered'}</Select.Item>
									<Select.Item value="cancelled">{m.order_status_cancelled?.() ?? 'Cancelled'}</Select.Item>
									<Select.Item value="refunded">{m.order_status_refunded?.() ?? 'Refunded'}</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</Tabs.Content>

					<!-- Items Tab -->
					<Tabs.Content value="items" class="pt-4">
						<div class="space-y-3">
							{#each orderData.orderItems as item}
								<div class="flex items-center gap-4 p-3 border rounded-lg">
									{#if item.productImage}
										<img 
											src={item.productImage} 
											alt={item.productName} 
											class="w-16 h-16 object-cover rounded"
										/>
									{:else}
										<div class="w-16 h-16 bg-muted rounded flex items-center justify-center">
											<Package class="h-6 w-6 text-muted-foreground" />
										</div>
									{/if}
									<div class="flex-1">
										<p class="font-medium">{item.productName}</p>
										<p class="text-sm text-muted-foreground">
											{formatCurrency(item.price)} × {item.quantity}
										</p>
									</div>
									<div class="text-right">
										<p class="font-medium">{formatCurrency(item.subtotal)}</p>
									</div>
								</div>
							{:else}
								<p class="text-center text-muted-foreground py-4">
									{m.order_no_items?.() ?? 'No items in this order'}
								</p>
							{/each}
						</div>
					</Tabs.Content>

					<!-- Customer Tab -->
					<Tabs.Content value="customer" class="pt-4 space-y-4">
						<div class="grid grid-cols-2 gap-6">
							<!-- Customer Info -->
							<div class="space-y-4">
								<h4 class="font-medium flex items-center gap-2">
									<Mail class="h-4 w-4" />
									{m.order_customer_info?.() ?? 'Customer Information'}
								</h4>
								<div class="space-y-2 text-sm">
									<p><strong>{m.common_name?.() ?? 'Name'}:</strong> {orderData.customerFirstName} {orderData.customerLastName}</p>
									<p><strong>{m.auth_email?.() ?? 'Email'}:</strong> {orderData.customerEmail}</p>
									{#if orderData.customerPhone}
										<p><strong>{m.checkout_phone?.() ?? 'Phone'}:</strong> {orderData.customerPhone}</p>
									{/if}
								</div>
							</div>

							<!-- Payment Info -->
							<div class="space-y-4">
								<h4 class="font-medium flex items-center gap-2">
									<CreditCard class="h-4 w-4" />
									{m.order_payment_info?.() ?? 'Payment Information'}
								</h4>
								<div class="space-y-2 text-sm">
									<p><strong>{m.checkout_payment_method?.() ?? 'Payment Method'}:</strong> {orderData.paymentMethod || '-'}</p>
									<p><strong>{m.order_payment_status?.() ?? 'Status'}:</strong> {orderData.paymentStatus}</p>
								</div>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-6 pt-4 border-t">
							<!-- Shipping Address -->
							<div class="space-y-4">
								<h4 class="font-medium flex items-center gap-2">
									<MapPin class="h-4 w-4" />
									{m.checkout_shipping_address?.() ?? 'Shipping Address'}
								</h4>
								{#if shippingAddress}
									<div class="text-sm space-y-1">
										<p>{shippingAddress.address1}</p>
										{#if shippingAddress.address2}
											<p>{shippingAddress.address2}</p>
										{/if}
										<p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
										<p>{shippingAddress.country}</p>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">-</p>
								{/if}
							</div>

							<!-- Billing Address -->
							<div class="space-y-4">
								<h4 class="font-medium flex items-center gap-2">
									<FileText class="h-4 w-4" />
									{m.checkout_billing_address?.() ?? 'Billing Address'}
								</h4>
								{#if billingAddress}
									<div class="text-sm space-y-1">
										<p>{billingAddress.address1}</p>
										{#if billingAddress.address2}
											<p>{billingAddress.address2}</p>
										{/if}
										<p>{billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}</p>
										<p>{billingAddress.country}</p>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">-</p>
								{/if}
							</div>
						</div>
					</Tabs.Content>

					<!-- Notes Tab -->
					<Tabs.Content value="notes" class="pt-4">
						<div class="space-y-4">
							<div>
								<Label for="notes">{m.order_admin_notes?.() ?? 'Admin Notes'}</Label>
								<Textarea
									id="notes"
									value={orderData.notes || notes}
									onchange={(e) => notes = (e.target as HTMLTextAreaElement).value}
									placeholder={m.order_notes_placeholder?.() ?? 'Add notes about this order...'}
									rows={5}
									class="mt-2"
								/>
							</div>
							<Button 
								onclick={() => handleSaveNotes(notes || orderData.notes || '')}
								disabled={savingNotes}
							>
								{savingNotes ? m.common_saving() : m.common_save()}
							</Button>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			{:catch error}
				<div class="py-8 text-center text-destructive">
					{m.common_error()}: {error.message}
				</div>
			{/await}
		{/if}

		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={() => (open = false)}>
				{m.common_close()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
