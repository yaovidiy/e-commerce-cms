<script lang="ts">
	import { getOrderByNumber } from '$lib/remotes/order.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { OrderTimeline } from '$lib/components/common/data-display';
	import { Package, Search, MapPin, CreditCard } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Order } from '$lib/server/db/schema';

	let orderNumber = $state('');
	let email = $state('');
	let searchAttempted = $state(false);
	let order = $state<Order | null>(null);
	let error = $state<string | null>(null);

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

	async function handleSearch() {
		searchAttempted = true;
		error = null;
		order = null;

		if (!orderNumber || !email) {
			error = 'Please enter both order number and email';
			return;
		}

		try {
			const result = await getOrderByNumber({ orderNumber, email });
			order = result;
		} catch (err: any) {
			error = err?.message || 'Order not found. Please check your order number and email.';
		}
	}
</script>

<svelte:head>
	<title>Track Your Order</title>
</svelte:head>

<div class="container mx-auto py-8 max-w-4xl">
	<!-- Header -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
			<Package class="h-8 w-8 text-primary" />
		</div>
		<h1 class="text-3xl font-bold mb-2">Track Your Order</h1>
		<p class="text-muted-foreground">
			Enter your order number and email to view your order status
		</p>
	</div>

	<!-- Search Form -->
	<Card.Root class="mb-8">
		<Card.Content class="pt-6">
			<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }} class="space-y-4">
				<div class="grid md:grid-cols-2 gap-4">
					<div>
						<Label>Order Number</Label>
						<Input
							bind:value={orderNumber}
							placeholder="ORD-ABC123"
							required
						/>
					</div>

					<div>
						<Label>Email Address</Label>
						<Input
							bind:value={email}
							type="email"
							placeholder="your@email.com"
							required
						/>
					</div>
				</div>

				<Button type="submit" class="w-full md:w-auto">
					<Search class="h-4 w-4 mr-2" />
					Track Order
				</Button>

				{#if error}
					<div class="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
						{error}
					</div>
				{/if}
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Order Details -->
	{#if order}
		{@const shippingAddress = parseAddress(order.shippingAddress)}
		{@const items = parseItems(order.items)}

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Order Status & Items -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Order Header -->
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-center justify-between mb-4">
							<div>
								<h3 class="font-semibold text-lg">Order #{order.orderNumber}</h3>
								<p class="text-muted-foreground text-sm">
									Placed on {new Date(order.createdAt).toLocaleDateString()}
								</p>
							</div>
							<Button href={`/order-confirmation/${order.id}`} variant="outline">
								View Full Details
							</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Timeline -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Order Status</Card.Title>
					</Card.Header>
					<Card.Content>
						<OrderTimeline {order} />
					</Card.Content>
				</Card.Root>

				<!-- Items Summary -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Order Items ({items.length})</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-3">
							{#each items as item}
								<div class="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
									<div class="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
										<Package class="h-6 w-6 text-muted-foreground" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-medium text-sm truncate">
											{item.name || item.productName || 'Product'}
										</p>
										<p class="text-muted-foreground text-xs">Qty: {item.quantity}</p>
									</div>
									<div class="text-right">
										<p class="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
									</div>
								</div>
							{/each}

							<div class="flex justify-between font-bold pt-3 border-t">
								<span>Total</span>
								<span>{formatPrice(order.total)}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Shipping Address -->
				{#if shippingAddress}
					<Card.Root>
						<Card.Header>
							<Card.Title class="text-base">Shipping Address</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="flex items-start gap-2">
								<MapPin class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
								<div class="text-sm">
									<p class="font-medium">{order.customerFirstName} {order.customerLastName}</p>
									{#if shippingAddress.addressLine1}
										<p class="text-muted-foreground">{shippingAddress.addressLine1}</p>
									{/if}
									<p class="text-muted-foreground">
										{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/if}

				<!-- Payment Info -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Payment</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex items-start gap-2">
							<CreditCard class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<p class="text-sm font-medium capitalize">
									{order.paymentMethod?.replace('_', ' ') || 'N/A'}
								</p>
								<p class={`text-xs ${
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

				<!-- Help Card -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Need Help?</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-muted-foreground text-sm mb-4">
							If you have questions about your order, please contact our support team.
						</p>
						<Button href="/contact" variant="outline" class="w-full">
							Contact Support
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}

	<!-- Help Section -->
	{#if !order && !searchAttempted}
		<Card.Root>
			<Card.Header>
				<Card.Title>How to Find Your Order Number</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3 text-muted-foreground text-sm">
				<p>
					Your order number was sent to your email after completing your purchase. 
					It looks like: <strong class="text-foreground">ORD-ABC123-XYZ</strong>
				</p>
				<p>
					Can't find your order number? Check your spam folder or 
					<a href="/contact" class="text-primary hover:underline">contact our support team</a>.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
