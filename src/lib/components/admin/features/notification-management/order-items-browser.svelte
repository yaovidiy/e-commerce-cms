<script lang="ts">
	import { getOrderItemsForTesting } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Check } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { OrderItem } from '$lib/server/db/schema';

	let {
		open = $bindable(false),
		orderId,
		selectedItemIds = $bindable([]),
		onConfirm
	} = $props<{
		open?: boolean;
		orderId: string;
		selectedItemIds?: string[];
		onConfirm: (itemIds: string[]) => void;
	}>();

	let searchQuery = $state('');
	let tempSelectedIds = $state<Set<string>>(new Set(selectedItemIds || []));

	function toggleItem(itemId: string) {
		if (tempSelectedIds.has(itemId)) {
			tempSelectedIds.delete(itemId);
		} else {
			tempSelectedIds.add(itemId);
		}
		tempSelectedIds = new Set(tempSelectedIds);
	}

	function handleConfirm() {
		const ids = Array.from(tempSelectedIds);
		selectedItemIds = ids;
		onConfirm(ids);
		open = false;
	}

	function handleSelectAll(items: OrderItem[]) {
		tempSelectedIds = new Set(items.map(item => item.id));
	}

	function handleDeselectAll() {
		tempSelectedIds = new Set();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl max-h-[80vh]">
		<Dialog.Header>
			<Dialog.Title>Select Order Items</Dialog.Title>
			<Dialog.Description>Choose which items to include in the test notification</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<Input
				type="text"
				placeholder="Search by product name..."
				bind:value={searchQuery}
			/>

			<div class="overflow-y-auto max-h-[50vh] space-y-2">
				{#await getOrderItemsForTesting({ orderId, search: searchQuery || '' })}
					<div class="text-center py-8 text-muted-foreground">Loading items...</div>
				{:then items}
					{#if items.length === 0}
						<div class="text-center py-12 text-muted-foreground">
							<p>No items found in this order</p>
						</div>
					{:else}
						<div class="space-y-1">
							{#each items as item}
								<label class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
									<Checkbox
										checked={tempSelectedIds.has(item.id)}
										onchange={() => toggleItem(item.id)}
									/>
									<div class="flex-1">
										<div class="font-semibold">{item.productName}</div>
										<div class="text-sm text-muted-foreground">
											Qty: {item.quantity} • Price: {(item.price / 100).toFixed(2)} грн.
										</div>
									</div>
								</label>
							{/each}

							<!-- Select/Deselect All -->
							<div class="flex gap-2 pt-2 border-t">
								<Button
									type="button"
									size="sm"
									variant="outline"
									onclick={() => handleSelectAll(items)}
									class="flex-1"
								>
									Select All
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onclick={handleDeselectAll}
									class="flex-1"
								>
									Deselect All
								</Button>
							</div>
						</div>
					{/if}
				{:catch error}
					<div class="text-center py-12 text-destructive">
						<p>Error loading items: {error.message}</p>
					</div>
				{/await}
			</div>

			<div class="text-sm text-muted-foreground">
				{tempSelectedIds.size} item(s) selected
			</div>
		</div>

		<Dialog.Footer class="gap-2">
			<Button type="button" variant="outline" onclick={() => (open = false)}>
				Cancel
			</Button>
			<Button
				type="button"
				onclick={handleConfirm}
				disabled={tempSelectedIds.size === 0}
				class="gap-2"
			>
				<Check size={16} />
				Confirm Selection
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
