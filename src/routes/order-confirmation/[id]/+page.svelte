<script lang="ts">
	import { page } from '$app/stores';
	import { getOrder } from '$lib/remotes/order.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { OrderTimeline } from '$lib/components/common/data-display';
	import { CheckCircle, Package, MapPin, CreditCard, Mail, Phone, Printer } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	const orderId = $page.params.id || '';

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'UAH'
		}).format(price);
	};

	const parseAddress = (address: string | null) => {
		if (!address) return null;
		try {
			return JSON.parse(address);
		} catch {
			return null;
		}
	};

	const parseItems = (items: string) => {
		try {
			return JSON.parse(items);
		} catch {
			return [];
		}
	};

	const handlePrint = () => {
		window.print();
	};
</script>

<svelte:head>
	<title>Order Confirmation</title>
</svelte:head>

<div class="container mx-auto py-8 print:py-4">
	{#await getOrder(orderId)}
		<div class="flex items-center justify-center min-h-[400px]">
			<div class="text-center">
				<Package class="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
				<p class="mt-4 text-muted-foreground">Loading order details...</p>
			</div>
		</div>
	{:then order}
		{@const shippingAddress = parseAddress(order.shippingAddress)}
		{@const billingAddress = parseAddress(order.billingAddress)}
		{@const items = parseItems(order.items)}

		<!-- Success Header -->
		<div class="text-center mb-8 print:mb-4">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4 print:hidden">
				<CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
			</div>
			<h1 class="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
			<p class="text-muted-foreground text-lg">
				Order #{order.orderNumber}
			</p>
			<p class="text-muted-foreground text-sm mt-2">
				A confirmation email has been sent to <strong>{order.customerEmail}</strong>
			</p>
		</div>

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Order Timeline -->
			<div class="lg:col-span-2 print:col-span-3">
				<Card.Root>
					<Card.Header>
						<Card.Title>Order Status</Card.Title>
						<Card.Description>Track your order progress</Card.Description>
					</Card.Header>
					<Card.Content>
						<OrderTimeline {order} />
					</Card.Content>
				</Card.Root>

				<!-- Order Items -->
				<Card.Root class="mt-6">
					<Card.Header>
						<Card.Title>Order Items</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="divide-y">
							{#each items as item}
								<div class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
									<div class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
										<Package class="h-8 w-8 text-muted-foreground" />
									</div>
									<div class="flex-1 min-w-0">
										<h4 class="font-medium truncate">{item.name || item.productName || 'Product'}</h4>
										<p class="text-muted-foreground text-sm">Quantity: {item.quantity}</p>
									</div>
									<div class="text-right">
										<p class="font-medium">{formatPrice(item.price * item.quantity)}</p>
										<p class="text-muted-foreground text-sm">{formatPrice(item.price)} each</p>
									</div>
								</div>
							{/each}
						</div>

						<!-- Order Summary -->
						<div class="border-t mt-4 pt-4 space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Subtotal</span>
								<span>{formatPrice(order.subtotal)}</span>
							</div>
							{#if order.shippingCost > 0}
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Shipping</span>
									<span>{formatPrice(order.shippingCost)}</span>
								</div>
							{/if}
							{#if order.discount > 0}
								<div class="flex justify-between text-sm text-green-600">
									<span>Discount</span>
									<span>-{formatPrice(order.discount)}</span>
								</div>
							{/if}
							{#if order.tax > 0}
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">Tax</span>
									<span>{formatPrice(order.tax)}</span>
								</div>
							{/if}
							<div class="flex justify-between font-bold text-lg pt-2 border-t">
								<span>Total</span>
								<span>{formatPrice(order.total)}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Customer Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Customer Information</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="flex items-start gap-3">
							<Mail class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<p class="text-sm font-medium">Email</p>
								<p class="text-sm text-muted-foreground">{order.customerEmail}</p>
							</div>
						</div>
						{#if order.customerPhone}
							<div class="flex items-start gap-3">
								<Phone class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
								<div>
									<p class="text-sm font-medium">Phone</p>
									<p class="text-sm text-muted-foreground">{order.customerPhone}</p>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Shipping Address -->
				{#if shippingAddress}
					<Card.Root>
						<Card.Header>
							<Card.Title>Shipping Address</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="flex items-start gap-3">
								<MapPin class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
								<div class="text-sm">
									<p class="font-medium">{order.customerFirstName} {order.customerLastName}</p>
									{#if shippingAddress.addressLine1}
										<p class="text-muted-foreground">{shippingAddress.addressLine1}</p>
									{/if}
									{#if shippingAddress.addressLine2}
										<p class="text-muted-foreground">{shippingAddress.addressLine2}</p>
									{/if}
									<p class="text-muted-foreground">
										{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
									</p>
									{#if shippingAddress.country}
										<p class="text-muted-foreground">{shippingAddress.country}</p>
									{/if}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Payment Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Payment Information</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex items-start gap-3">
							<CreditCard class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<p class="text-sm font-medium capitalize">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
								<p class={`text-sm ${
									order.paymentStatus === 'completed'
										? 'text-green-600'
										: order.paymentStatus === 'failed'
											? 'text-red-600'
											: 'text-yellow-600'
								}`}>
									{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Actions -->
				<div class="space-y-2 print:hidden">
					<Button onclick={handlePrint} variant="outline" class="w-full">
						<Printer class="h-4 w-4 mr-2" />
						Print Order
					</Button>
					<Button href="/track-order" variant="outline" class="w-full">
						Track Order
					</Button>
					<Button href="/products" class="w-full">
						Continue Shopping
					</Button>
				</div>
			</div>
		</div>
	{:catch error}
		<div class="text-center py-12">
			<Package class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
			<h1 class="text-2xl font-bold mb-2">Order Not Found</h1>
			<p class="text-muted-foreground mb-6">{error.message}</p>
			<Button href="/products">Continue Shopping</Button>
		</div>
	{/await}
</div>

<style>
	@media print {
		:global(body) {
			print-color-adjust: exact;
			-webkit-print-color-adjust: exact;
		}
	}
</style>
