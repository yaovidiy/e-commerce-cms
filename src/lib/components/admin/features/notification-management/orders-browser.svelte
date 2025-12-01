<script lang="ts">
	import { getOrdersForTesting } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';
	import type { Order } from '$lib/server/db/schema';

	let {
		open = $bindable(false),
		onSelect
	} = $props<{
		open?: boolean;
		onSelect: (order: Order | 'random') => void;
	}>();

	let searchQuery = $state('');
	let showOrderList = $state(true);

	function handleSelectOrder(order: Order) {
		onSelect(order);
		open = false;
	}

	function handleGenerateRandom() {
		onSelect('random');
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl max-h-[80vh]">
		<Dialog.Header>
			<Dialog.Title>Select Order for Test Notification</Dialog.Title>
			<Dialog.Description>Choose an existing order or generate a random one for testing</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Toggle Views -->
			<div class="flex items-center gap-2">
				<Button
					type="button"
					variant={showOrderList ? 'default' : 'outline'}
					size="sm"
					onclick={() => (showOrderList = true)}
				>
					Browse Orders
				</Button>
				<Button
					type="button"
					variant={!showOrderList ? 'default' : 'outline'}
					size="sm"
					onclick={() => (showOrderList = false)}
				>
					Generate Random
				</Button>
			</div>

			{#if showOrderList}
				<!-- Browse Orders -->
				<div class="space-y-3">
					<Input
						type="text"
						placeholder="Search by order number, email, or customer name..."
						bind:value={searchQuery}
					/>

					<div class="overflow-y-auto max-h-[50vh] space-y-2">
						{#await getOrdersForTesting({ search: searchQuery || '', limit: 50 })}
							<div class="text-center py-8 text-muted-foreground">Loading orders...</div>
						{:then orders}
							{#if orders.length === 0}
								<div class="text-center py-12 text-muted-foreground">
									<p>No orders found matching your search</p>
								</div>
							{:else}
								<div class="space-y-2">
									{#each orders as order}
										<button
											type="button"
											class="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
											onclick={() => handleSelectOrder(order)}
										>
											<div class="font-semibold">{order.orderNumber}</div>
											<div class="text-sm text-muted-foreground">
												{order.customerFirstName} {order.customerLastName} • {order.customerEmail}
											</div>
											<div class="text-xs text-muted-foreground mt-1">
												{new Date(order.createdAt).toLocaleDateString()} • Status: {order.status}
											</div>
										</button>
									{/each}
								</div>
							{/if}
						{:catch error}
							<div class="text-center py-12 text-destructive">
								<p>Error loading orders: {error.message}</p>
							</div>
						{/await}
					</div>
				</div>
			{:else}
				<!-- Generate Random Order -->
				<div class="space-y-4 py-8">
					<div class="text-center">
						<p class="text-lg font-semibold mb-2">Generate Random Test Order</p>
						<p class="text-sm text-muted-foreground mb-6">
							A random test order with fake customer data and random products will be created for testing the notification template
						</p>

						<Button
							type="button"
							size="lg"
							onclick={handleGenerateRandom}
							class="gap-2"
						>
							Generate Test Order
						</Button>

						<p class="text-xs text-muted-foreground mt-6">
							Note: The test order will only be used for this notification preview and will not be saved to the database
						</p>
					</div>
				</div>
			{/if}
		</div>

		<div class="flex justify-end">
			<Button type="button" variant="outline" onclick={() => (open = false)}>
				Cancel
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
