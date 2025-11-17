<script lang="ts">
	import {
		getAllRates,
		getAllZones,
		createRate,
		updateRate,
		deleteRate
	} from '$lib/remotes/shipping.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import type { ShippingRate } from '$lib/server/db/schema';

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	// Selected rate for edit/delete
	let selectedRate = $state<ShippingRate | null>(null);

	// Form values for create/edit
	let selectedZoneId = $state<string>('');
	let rateIsActive = $state<boolean>(true);

	function openCreateDialog() {
		selectedZoneId = '';
		rateIsActive = true;
		createDialogOpen = true;
	}

	function openEditDialog(rate: ShippingRate) {
		selectedRate = rate;
		selectedZoneId = rate.zoneId;
		rateIsActive = rate.isActive;
		editDialogOpen = true;
	}

	function openDeleteDialog(rate: ShippingRate) {
		selectedRate = rate;
		deleteDialogOpen = true;
	}

	// Format price from cents to dollars
	function formatPrice(cents: number): string {
		return (cents / 100).toFixed(2);
	}

	// Parse price from dollars to cents
	function parsePrice(dollars: string): number {
		return Math.round(parseFloat(dollars || '0') * 100);
	}

	// Auto-refresh and close dialogs on success
	$effect(() => {
		if (createRate.result) {
			createDialogOpen = false;
			getAllRates().refresh();
		}
	});

	$effect(() => {
		if (updateRate.result) {
			editDialogOpen = false;
			getAllRates().refresh();
		}
	});

	$effect(() => {
		if (deleteRate.result) {
			deleteDialogOpen = false;
			getAllRates().refresh();
		}
	});

	// Pre-populate form when edit dialog opens
	$effect(() => {
		if (editDialogOpen && selectedRate) {
			updateRate.fields.set({
				id: selectedRate.id,
				zoneId: selectedRate.zoneId,
				name: selectedRate.name,
				description: selectedRate.description || '',
				price: selectedRate.price,
				minOrderAmount: selectedRate.minOrderAmount || undefined,
				maxOrderAmount: selectedRate.maxOrderAmount || undefined,
				estimatedDays: selectedRate.estimatedDays || '',
				isActive: selectedRate.isActive
			});
		}
	});
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{m.shipping_rates()}</h1>
			<p class="text-muted-foreground">Manage shipping rates for different zones</p>
		</div>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 h-4 w-4" />
			{m.shipping_create_rate()}
		</Button>
	</div>

	{#await Promise.all([getAllRates(), getAllZones()])}
		<Card.Root>
			<Card.Content class="p-6">
				<div class="flex items-center justify-center py-8">
					<p class="text-muted-foreground">Loading rates...</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:then [rates, zones]}
		{#if rates.length === 0}
			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<p class="text-muted-foreground">{m.shipping_no_rates()}</p>
						{#if zones.length === 0}
							<p class="text-muted-foreground mt-2 text-sm">Please create shipping zones first</p>
						{:else}
							<Button class="mt-4" onclick={openCreateDialog}>
								<Plus class="mr-2 h-4 w-4" />
								{m.shipping_create_rate()}
							</Button>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Content class="p-6">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.shipping_rate_name()}</Table.Head>
								<Table.Head>{m.shipping_rate_zone()}</Table.Head>
								<Table.Head>{m.shipping_rate_price()}</Table.Head>
								<Table.Head>{m.shipping_rate_estimated_days()}</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each rates as rate}
								<Table.Row>
									<Table.Cell>
										<div>
											<p class="font-medium">{rate.name}</p>
											{#if rate.description}
												<p class="text-muted-foreground text-sm">{rate.description}</p>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										{rate.zone?.name || 'Unknown'}
									</Table.Cell>
									<Table.Cell>
										<div>
											<p>${formatPrice(rate.price)}</p>
											{#if rate.minOrderAmount || rate.maxOrderAmount}
												<p class="text-muted-foreground text-xs">
													{#if rate.minOrderAmount && rate.maxOrderAmount}
														${formatPrice(rate.minOrderAmount)} - ${formatPrice(
															rate.maxOrderAmount
														)}
													{:else if rate.minOrderAmount}
														Min: ${formatPrice(rate.minOrderAmount)}
													{:else if rate.maxOrderAmount}
														Max: ${formatPrice(rate.maxOrderAmount)}
													{/if}
												</p>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										{rate.estimatedDays || '-'}
									</Table.Cell>
									<Table.Cell>
										{#if rate.isActive}
											<Badge variant="default">Active</Badge>
										{:else}
											<Badge variant="secondary">Inactive</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex justify-end gap-2">
											<Button size="sm" variant="outline" onclick={() => openEditDialog(rate)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => openDeleteDialog(rate)}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/if}
	{:catch error}
		<Card.Root>
			<Card.Content class="p-6">
				<div class="flex items-center justify-center py-8">
					<p class="text-destructive">Error: {error.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/await}
</div>

<!-- Create Rate Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.shipping_create_rate()}</Dialog.Title>
		</Dialog.Header>

		<form
			{...createRate}
			onsubmit={(e) => {
				e.preventDefault();
				const form = e.target as HTMLFormElement;
				const priceInput = form.querySelector('[name="price"]') as HTMLInputElement;
				const minOrderInput = form.querySelector('[name="minOrder"]') as HTMLInputElement;
				const maxOrderInput = form.querySelector('[name="maxOrder"]') as HTMLInputElement;

				createRate.fields.set({
					zoneId: selectedZoneId,
					name: createRate.fields.name.value(),
					description: createRate.fields.description.value(),
					price: parsePrice(priceInput.value),
					minOrderAmount: minOrderInput.value ? parsePrice(minOrderInput.value) : undefined,
					maxOrderAmount: maxOrderInput.value ? parsePrice(maxOrderInput.value) : undefined,
					estimatedDays: createRate.fields.estimatedDays.value(),
					isActive: rateIsActive
				});
				form.requestSubmit();
			}}
		>
			<div class="flex flex-col gap-4">
				{#await getAllZones() then zones}
					<div>
						<Label>{m.shipping_rate_zone()}</Label>
						<Select.Root
							type="single"
							onValueChange={(value) => {
								selectedZoneId = value || '';
							}}
						>
							<Select.Trigger>
								{zones.find((z) => z.id === selectedZoneId)?.name || m.shipping_zone_select()}
							</Select.Trigger>
							<Select.Content>
								{#each zones as zone}
									<Select.Item value={zone.id}>{zone.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if !selectedZoneId}
							<p class="text-destructive mt-1 text-sm">Please select a zone</p>
						{/if}
					</div>
				{/await}

				<div>
					<Label>{m.shipping_rate_name()}</Label>
					<Input
						{...createRate.fields.name.as('text')}
						placeholder="Standard Shipping, Express Delivery, etc."
					/>
					{#each createRate.fields.name.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div>
					<Label>{m.shipping_rate_description()}</Label>
					<Textarea
						{...createRate.fields.description.as('text')}
						placeholder="Delivery within 3-5 business days"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="price">{m.shipping_rate_price()}</Label>
						<Input type="number" name="price" step="0.01" min="0" placeholder="0.00" required />
					</div>

					<div>
						<Label>
							{m.shipping_rate_estimated_days()}
						</Label>
						<Input
							{...createRate.fields.estimatedDays.as('text')}
							placeholder={m.shipping_estimated_days_placeholder()}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="minOrder">{m.shipping_rate_min_order()}</Label>
						<Input type="number" name="minOrder" step="0.01" min="0" placeholder="Optional" />
						<p class="text-muted-foreground mt-1 text-xs">{m.shipping_min_order_help()}</p>
					</div>

					<div>
						<Label for="maxOrder">{m.shipping_rate_max_order()}</Label>
						<Input type="number" name="maxOrder" step="0.01" min="0" placeholder="Optional" />
						<p class="text-muted-foreground mt-1 text-xs">{m.shipping_max_order_help()}</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Checkbox bind:checked={rateIsActive} />
					<Label>{m.shipping_rate_is_active()}</Label>
				</div>

				<div class="mt-4 flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!!createRate.pending || !selectedZoneId}>
						{createRate.pending ? 'Creating...' : m.shipping_create_rate()}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Rate Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.shipping_edit_rate()}</Dialog.Title>
		</Dialog.Header>

		<form
			{...updateRate}
			onsubmit={(e) => {
				e.preventDefault();
				if (!selectedRate) return;
				
				const form = e.target as HTMLFormElement;
				const priceInput = form.querySelector('[name="price"]') as HTMLInputElement;
				const minOrderInput = form.querySelector('[name="minOrder"]') as HTMLInputElement;
				const maxOrderInput = form.querySelector('[name="maxOrder"]') as HTMLInputElement;

				updateRate.fields.set({
					id: selectedRate.id,
					zoneId: selectedZoneId,
					name: updateRate.fields.name.value(),
					description: updateRate.fields.description.value(),
					price: parsePrice(priceInput.value),
					minOrderAmount: minOrderInput.value ? parsePrice(minOrderInput.value) : undefined,
					maxOrderAmount: maxOrderInput.value ? parsePrice(maxOrderInput.value) : undefined,
					estimatedDays: updateRate.fields.estimatedDays.value(),
					isActive: rateIsActive
				});
				form.requestSubmit();
			}}
		>
			<div class="flex flex-col gap-4">
				{#await getAllZones() then zones}
					<div>
						<Label>{m.shipping_rate_zone()}</Label>
						<Select.Root
							type="single"
							onValueChange={(value) => {
								selectedZoneId = value || '';
							}}
						>
							<Select.Trigger>
								{zones.find((z) => z.id === selectedZoneId)?.name || m.shipping_zone_select()}
							</Select.Trigger>
							<Select.Content>
								{#each zones as zone}
									<Select.Item value={zone.id}>{zone.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/await}

				<div>
					<Label>{m.shipping_rate_name()}</Label>
					<Input {...updateRate.fields.name.as('text')} />
					{#each updateRate.fields.name.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div>
					<Label>{m.shipping_rate_description()}</Label>
					<Textarea {...updateRate.fields.description.as('text')} />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="price">{m.shipping_rate_price()}</Label>
						<Input
							type="number"
							name="price"
							step="0.01"
							min="0"
							value={selectedRate ? formatPrice(selectedRate.price) : '0.00'}
						/>
					</div>

					<div>
						<Label>
							{m.shipping_rate_estimated_days()}
						</Label>
						<Input
							{...updateRate.fields.estimatedDays.as('text')}
							placeholder={m.shipping_estimated_days_placeholder()}
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="minOrder">{m.shipping_rate_min_order()}</Label>
						<Input
							type="number"
							name="minOrder"
							step="0.01"
							min="0"
							value={selectedRate && selectedRate.minOrderAmount
								? formatPrice(selectedRate.minOrderAmount)
								: ''}
							placeholder="Optional"
						/>
						<p class="text-muted-foreground mt-1 text-xs">{m.shipping_min_order_help()}</p>
					</div>

					<div>
						<Label for="maxOrder">{m.shipping_rate_max_order()}</Label>
						<Input
							type="number"
							name="maxOrder"
							step="0.01"
							min="0"
							value={selectedRate && selectedRate.maxOrderAmount
								? formatPrice(selectedRate.maxOrderAmount)
								: ''}
							placeholder="Optional"
						/>
						<p class="text-muted-foreground mt-1 text-xs">{m.shipping_max_order_help()}</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Checkbox bind:checked={rateIsActive} />
					<Label>{m.shipping_rate_is_active()}</Label>
				</div>

				<div class="mt-4 flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (editDialogOpen = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!!updateRate.pending}>
						{updateRate.pending ? 'Saving...' : m.common_save()}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.shipping_delete_rate()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.shipping_delete_rate_confirm()}
				{#if selectedRate}
					<span class="font-semibold">{selectedRate.name}</span>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				{...deleteRate}
				onsubmit={(e) => {
					e.preventDefault();
					if (selectedRate) {
						deleteRate.fields.set({ id: selectedRate.id });
						const form = e.target as HTMLFormElement;
						form.requestSubmit();
					}
				}}
			>
				<AlertDialog.Action type="submit" disabled={!!deleteRate.pending}>
					{deleteRate.pending ? 'Deleting...' : 'Delete'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
