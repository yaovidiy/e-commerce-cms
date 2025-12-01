<script lang="ts">
	import { sendTestNotification } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import OrdersBrowser from './orders-browser.svelte';
	import OrderItemsBrowser from './order-items-browser.svelte';
	import { AlertCircle, Send, Loader2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';
	import type { Order } from '$lib/server/db/schema';

	let {
		open = $bindable(false),
		templateId,
		templateName
	} = $props<{
		open?: boolean;
		templateId: string;
		templateName: string;
	}>();

	let step: 'order-selection' | 'items-selection' | 'sending' = $state('order-selection');
	let selectedOrder: Order | 'random' | null = $state(null);
	let selectedItemIds: string[] = $state([]);
	let showOrdersBrowser = $state(false);
	let showItemsBrowser = $state(false);
	let isSending = $state(false);

	function handleOrderSelected(order: Order | 'random') {
		selectedOrder = order;
		if (order === 'random') {
			// Skip item selection for random orders
			handleSendNotification();
		} else {
			// Move to item selection
			step = 'items-selection';
		}
	}

	function handleItemsSelected(itemIds: string[]) {
		selectedItemIds = itemIds;
	}

	async function handleSendNotification() {
		if (!selectedOrder) {
			toast.error('Please select an order');
			return;
		}

		if (selectedOrder !== 'random' && selectedItemIds.length === 0) {
			toast.error('Please select at least one item');
			return;
		}

		isSending = true;
		step = 'sending';

		try {
			const result = await sendTestNotification({
				templateId,
				orderId: selectedOrder === 'random' ? undefined : selectedOrder.id,
				orderItemIds: selectedItemIds,
				generateRandomOrder: selectedOrder === 'random'
			});

			if (result.success) {
				toast.success(result.message || 'Test notification sent successfully');
				handleClose();
			} else {
				toast.error(result.error || 'Failed to send notification');
				step = 'items-selection';
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
			step = 'items-selection';
		} finally {
			isSending = false;
		}
	}

	function handleClose() {
		open = false;
		step = 'order-selection';
		selectedOrder = null;
		selectedItemIds = [];
	}

	$effect(() => {
		if (!open) {
			step = 'order-selection';
			selectedOrder = null;
			selectedItemIds = [];
		}
	});
</script>

<Dialog.Root bind:open onOpenChange={(newOpen) => {
	if (!newOpen) handleClose();
}}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Test Notification - {templateName}</Dialog.Title>
			<Dialog.Description>
				Send a test notification to verify the template renders correctly
			</Dialog.Description>
		</Dialog.Header>

		{#if step === 'order-selection'}
			<div class="space-y-4">
				<div class="flex gap-3 rounded-lg bg-blue-50 p-3 text-blue-800 text-sm">
					<AlertCircle size={16} class="shrink-0 mt-0.5" />
					<p>Select an existing order or generate a random test order to preview the notification</p>
				</div>

				<div class="space-y-3">
					<div class="font-semibold text-sm">Order Source</div>

					{#if selectedOrder}
						<div class="p-3 rounded-lg border bg-accent">
							{#if selectedOrder === 'random'}
								<div class="font-semibold">Random Test Order</div>
								<p class="text-sm text-muted-foreground">
									A test order with generated data will be used
								</p>
							{:else}
								<div class="font-semibold">{selectedOrder.orderNumber}</div>
								<p class="text-sm text-muted-foreground">
									{selectedOrder.customerFirstName} {selectedOrder.customerLastName} • {selectedOrder.customerEmail}
								</p>
							{/if}
						</div>

						<Button
							type="button"
							variant="outline"
							onclick={() => (showOrdersBrowser = true)}
							class="w-full"
						>
							Change Selection
						</Button>
					{:else}
						<Button
							type="button"
							variant="outline"
							onclick={() => (showOrdersBrowser = true)}
							class="w-full"
						>
							Select Order
						</Button>
					{/if}
				</div>
			</div>
		{:else if step === 'items-selection'}
			<div class="space-y-4">
				<div class="font-semibold text-sm">Selected Order</div>
				{#if selectedOrder && selectedOrder !== 'random'}
					<div class="p-3 rounded-lg border bg-accent">
						<div class="font-semibold">{selectedOrder.orderNumber}</div>
						<p class="text-sm text-muted-foreground">
							{selectedOrder.customerFirstName} {selectedOrder.customerLastName}
						</p>
					</div>
				{/if}

				<div class="font-semibold text-sm">Select Items</div>
				<p class="text-sm text-muted-foreground">
					Choose which order items to include in the notification preview
				</p>

				{#if selectedItemIds.length > 0}
					<div class="p-3 rounded-lg border bg-accent">
						<p class="text-sm font-semibold">{selectedItemIds.length} item(s) selected</p>
					</div>
				{/if}

				<Button
					type="button"
					variant="outline"
					onclick={() => (showItemsBrowser = true)}
					class="w-full"
				>
					{selectedItemIds.length > 0 ? 'Change Selection' : 'Select Items'}
				</Button>
			</div>
		{:else if step === 'sending'}
			<div class="space-y-4 py-8 text-center">
				<Loader2 class="h-12 w-12 animate-spin mx-auto text-primary" />
				<div>
					<p class="font-semibold">Sending test notification...</p>
					<p class="text-sm text-muted-foreground">Please wait while we process your request</p>
				</div>
			</div>
		{/if}

		<Dialog.Footer class="gap-2">
			{#if step !== 'sending'}
				<Button
					type="button"
					variant="outline"
					onclick={handleClose}
				>
					Cancel
				</Button>

				{#if step === 'order-selection'}
					<Button
						type="button"
						onclick={() => step = 'items-selection'}
						disabled={!selectedOrder || selectedOrder === 'random'}
					>
						Next
					</Button>
				{:else if step === 'items-selection'}
					<Button
						type="button"
						variant="outline"
						onclick={() => step = 'order-selection'}
					>
						Back
					</Button>
					<Button
						type="button"
						onclick={handleSendNotification}
						disabled={selectedItemIds.length === 0 || isSending}
						class="gap-2"
					>
						<Send size={16} />
						Send Test
					</Button>
				{/if}
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Nested Dialogs -->
<OrdersBrowser
	bind:open={showOrdersBrowser}
	onSelect={handleOrderSelected}
/>

{#if selectedOrder && selectedOrder !== 'random'}
	<OrderItemsBrowser
		bind:open={showItemsBrowser}
		orderId={selectedOrder.id}
		bind:selectedItemIds
		onConfirm={handleItemsSelected}
	/>
{/if}
