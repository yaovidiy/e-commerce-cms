<script lang="ts">
	import { getMyOrders } from '$lib/remotes/order.remote';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';
	import { Package, Calendar, CreditCard, MapPin, ExternalLink } from '@lucide/svelte/icons';
	import { goto } from '$app/navigation';
	import type { Order } from '$lib/server/db/schema';

	// Helper to format status badge
	function getStatusBadgeVariant(status: Order['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'pending':
				return 'secondary';
			case 'processing':
				return 'default';
			case 'shipped':
				return 'default';
			case 'delivered':
				return 'default';
			case 'cancelled':
				return 'destructive';
			case 'refunded':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function formatStatus(status: Order['status']): string {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'UAH'
		}).format(amount / 100);
	}

	function viewOrder(orderId: string) {
		goto(`/order-confirmation/${orderId}`);
	}
</script>

<div class="mx-auto max-w-6xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">{m.orders_title()}</h1>
		<p class="text-muted-foreground mt-1">{m.orders_description()}</p>
	</div>

	{#await getMyOrders()}
		<div class="grid gap-4">
			{#each Array(3) as _}
				<Card>
					<CardContent class="py-8">
						<div class="flex items-center justify-center">
							<div class="text-muted-foreground">Loading...</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:then orders}
		{#if orders.length === 0}
			<Card>
				<CardContent class="py-12">
					<div class="flex flex-col items-center justify-center gap-4 text-center">
						<Package class="text-muted-foreground size-12" />
						<div>
							<h3 class="text-lg font-semibold">{m.orders_no_orders()}</h3>
							<p class="text-muted-foreground mt-1">You haven't placed any orders yet</p>
						</div>
						<Button onclick={() => goto('/products')}>
							Start Shopping
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4">
				{#each orders as order}
					{@const items = JSON.parse(order.items)}
					{@const shippingAddress = JSON.parse(order.shippingAddress)}
					<Card>
						<CardHeader>
							<div class="flex flex-wrap items-start justify-between gap-4">
								<div class="flex-1 space-y-1.5">
									<div class="flex items-center gap-2">
										<CardTitle class="text-lg">Order #{order.orderNumber}</CardTitle>
										<Badge variant={getStatusBadgeVariant(order.status)}>
											{formatStatus(order.status)}
										</Badge>
									</div>
									<CardDescription>
										<div class="flex items-center gap-4 text-sm">
											<div class="flex items-center gap-1">
												<Calendar class="size-3.5" />
												{new Date(order.createdAt).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric'
												})}
											</div>
											<div class="flex items-center gap-1">
												<Package class="size-3.5" />
												{items.length} {items.length === 1 ? 'item' : 'items'}
											</div>
										</div>
									</CardDescription>
								</div>
								<div class="text-right">
									<div class="text-2xl font-bold">{formatCurrency(order.total)}</div>
									<div class="text-muted-foreground text-xs">
										{order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Pending payment'}
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent class="space-y-4">
							<!-- Order Items -->
							<div class="space-y-2">
								<h4 class="text-sm font-semibold">Items</h4>
								<div class="divide-y rounded-lg border">
									{#each items.slice(0, 3) as item}
										<div class="flex justify-between gap-4 p-3">
											<div class="flex-1">
												<div class="font-medium">{item.name}</div>
												<div class="text-muted-foreground text-sm">
													Qty: {item.quantity}
												</div>
											</div>
											<div class="text-sm font-medium">
												{formatCurrency(item.price * item.quantity)}
											</div>
										</div>
									{/each}
									{#if items.length > 3}
										<div class="text-muted-foreground p-3 text-center text-sm">
											+{items.length - 3} more {items.length - 3 === 1 ? 'item' : 'items'}
										</div>
									{/if}
								</div>
							</div>

							<!-- Shipping Address -->
							<div class="grid gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<h4 class="flex items-center gap-1.5 text-sm font-semibold">
										<MapPin class="size-3.5" />
										Shipping Address
									</h4>
									<div class="text-muted-foreground text-sm">
										<div>{shippingAddress.address1}</div>
										{#if shippingAddress.address2}
											<div>{shippingAddress.address2}</div>
										{/if}
										<div>
											{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
										</div>
										<div>{shippingAddress.country}</div>
									</div>
								</div>

								<div class="space-y-2">
									<h4 class="flex items-center gap-1.5 text-sm font-semibold">
										<CreditCard class="size-3.5" />
										Payment
									</h4>
									<div class="text-muted-foreground text-sm">
										<div class="capitalize">
											{order.paymentMethod?.replace('_', ' ') || 'Not specified'}
										</div>
										<div class="capitalize">
											Status: {order.paymentStatus}
										</div>
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex justify-end gap-2 pt-2">
								<Button variant="outline" onclick={() => viewOrder(order.id)}>
									View Details
									<ExternalLink class="ml-2 size-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	{:catch error}
		<Card>
			<CardContent class="py-8">
				<div class="flex items-center justify-center">
					<div class="text-destructive">Error loading orders: {error.message}</div>
				</div>
			</CardContent>
		</Card>
	{/await}
</div>
