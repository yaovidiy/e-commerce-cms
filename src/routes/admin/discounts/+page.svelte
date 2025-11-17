<script lang="ts">
	import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount } from '$lib/remotes/discount.remote';
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Pencil, Trash2, Search } from '@lucide/svelte/icons';
	import type { Discount } from '$lib/server/db/schema';

	type DiscountWithParsed = Discount & {
		applicableProducts: string[] | null;
		applicableCategories: string[] | null;
	};

	// State
	let searchQuery = $state('');
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let editingDiscount = $state<DiscountWithParsed | null>(null);
	let deletingDiscount = $state<DiscountWithParsed | null>(null);

	// Form states
	let newDiscountCode = $state('');
	let newDiscountType = $state<'percentage' | 'fixed' | 'free_shipping'>('percentage');
	let newDiscountValue = $state(0);
	let newDiscountMinOrder = $state<number | undefined>(undefined);
	let newDiscountMaxUsesTotal = $state<number | undefined>(undefined);
	let newDiscountMaxUsesPerCustomer = $state(1);
	let newDiscountStartsAt = $state('');
	let newDiscountEndsAt = $state('');
	let newDiscountIsActive = $state(true);
	let newDiscountDescription = $state('');

	// Filtered discounts
	let filteredDiscounts = $derived.by(() => {
		const query = searchQuery.toLowerCase();
		return getAllDiscounts().then((discounts: DiscountWithParsed[]) =>
			discounts.filter(
				(discount: DiscountWithParsed) =>
					discount.code.toLowerCase().includes(query) ||
					discount.description?.toLowerCase().includes(query)
			)
		);
	});

	// Format currency
	function formatCurrency(cents: number): string {
		return `₴${(cents / 100).toFixed(2)}`;
	}

	// Format date
	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('uk-UA');
	}

	// Open create dialog
	function openCreateDialog(): void {
		newDiscountCode = '';
		newDiscountType = 'percentage';
		newDiscountValue = 0;
		newDiscountMinOrder = undefined;
		newDiscountMaxUsesTotal = undefined;
		newDiscountMaxUsesPerCustomer = 1;
		newDiscountStartsAt = new Date().toISOString().slice(0, 16);
		newDiscountEndsAt = '';
		newDiscountIsActive = true;
		newDiscountDescription = '';
		createDialogOpen = true;
	}

	// Open edit dialog
	function openEditDialog(discount: DiscountWithParsed): void {
		editingDiscount = discount;
		newDiscountCode = discount.code;
		newDiscountType = discount.type;
		newDiscountValue = discount.value;
		newDiscountMinOrder = discount.minOrderAmount ?? undefined;
		newDiscountMaxUsesTotal = discount.maxUsesTotal ?? undefined;
		newDiscountMaxUsesPerCustomer = discount.maxUsesPerCustomer ?? 1;
		newDiscountStartsAt = new Date(discount.startsAt).toISOString().slice(0, 16);
		newDiscountEndsAt = discount.endsAt ? new Date(discount.endsAt).toISOString().slice(0, 16) : '';
		newDiscountIsActive = discount.isActive;
		newDiscountDescription = discount.description ?? '';
		editDialogOpen = true;
	}

	// Open delete dialog
	function openDeleteDialog(discount: DiscountWithParsed): void {
		deletingDiscount = discount;
		deleteDialogOpen = true;
	}

	// Handle create form submission
	$effect(() => {
		if (createDiscount.result) {
			createDialogOpen = false;
		}
	});

	// Handle update form submission
	$effect(() => {
		if (updateDiscount.result) {
			editDialogOpen = false;
			editingDiscount = null;
		}
	});

	// Handle delete form submission
	$effect(() => {
		if (deleteDiscount.result) {
			deleteDialogOpen = false;
			deletingDiscount = null;
		}
	});

	// Pre-populate edit form
	$effect(() => {
		if (editDialogOpen && editingDiscount) {
			updateDiscount.fields.set({
				id: editingDiscount.id,
				code: editingDiscount.code,
				type: editingDiscount.type,
				value: editingDiscount.value,
				minOrderAmount: editingDiscount.minOrderAmount ?? undefined,
				maxUsesTotal: editingDiscount.maxUsesTotal ?? undefined,
				maxUsesPerCustomer: editingDiscount.maxUsesPerCustomer ?? 1,
				startsAt: new Date(editingDiscount.startsAt).toISOString().slice(0, 16),
				endsAt: editingDiscount.endsAt ? new Date(editingDiscount.endsAt).toISOString().slice(0, 16) : '',
				isActive: editingDiscount.isActive,
				description: editingDiscount.description ?? ''
			});
		}
	});

	// Pre-populate create form
	$effect(() => {
		if (createDialogOpen) {
			createDiscount.fields.set({
				code: newDiscountCode,
				type: newDiscountType,
				value: newDiscountValue,
				minOrderAmount: newDiscountMinOrder,
				maxUsesTotal: newDiscountMaxUsesTotal,
				maxUsesPerCustomer: newDiscountMaxUsesPerCustomer,
				startsAt: newDiscountStartsAt,
				endsAt: newDiscountEndsAt,
				isActive: newDiscountIsActive,
				description: newDiscountDescription
			});
		}
	});
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{m.discounts()}</h1>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 size-4" />
			{m.discount_create()}
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{m.discount_codes()}</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="mb-4 flex items-center gap-2">
				<div class="relative flex-1">
					<Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder={m.common_search()}
						bind:value={searchQuery}
						class="pl-8"
					/>
				</div>
			</div>

			{#await filteredDiscounts}
				<p>{m.common_loading()}</p>
			{:then discounts}
				{#if discounts.length === 0}
					<p class="text-center text-muted-foreground">{m.discount_no_discounts()}</p>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.discount_code()}</Table.Head>
								<Table.Head>{m.discount_type()}</Table.Head>
								<Table.Head>{m.discount_value()}</Table.Head>
								<Table.Head>{m.discount_min_order_amount()}</Table.Head>
								<Table.Head>{m.discount_current_uses()}</Table.Head>
								<Table.Head>{m.discount_starts_at()}</Table.Head>
								<Table.Head>{m.discount_ends_at()}</Table.Head>
								<Table.Head>{m.common_status()}</Table.Head>
								<Table.Head>{m.common_actions()}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each discounts as discount}
								<Table.Row>
									<Table.Cell class="font-mono font-semibold">{discount.code}</Table.Cell>
									<Table.Cell>
										{#if discount.type === 'percentage'}
											{m.discount_percentage()}
										{:else if discount.type === 'fixed'}
											{m.discount_fixed()}
										{:else}
											{m.discount_free_shipping()}
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if discount.type === 'percentage'}
											{discount.value}%
										{:else if discount.type === 'fixed'}
											{formatCurrency(discount.value)}
										{:else}
											-
										{/if}
									</Table.Cell>
									<Table.Cell>
										{discount.minOrderAmount ? formatCurrency(discount.minOrderAmount) : '-'}
									</Table.Cell>
									<Table.Cell>
										{discount.currentUses}
										{#if discount.maxUsesTotal}
											/ {discount.maxUsesTotal}
										{/if}
									</Table.Cell>
									<Table.Cell>{formatDate(discount.startsAt)}</Table.Cell>
									<Table.Cell>
										{discount.endsAt ? formatDate(discount.endsAt) : '-'}
									</Table.Cell>
									<Table.Cell>
										{#if discount.isActive}
											<Badge variant="default">{m.common_active()}</Badge>
										{:else}
											<Badge variant="secondary">{m.common_inactive()}</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<div class="flex gap-2">
											<Button
												variant="ghost"
												size="icon"
												onclick={() => openEditDialog(discount)}
											>
												<Pencil class="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onclick={() => openDeleteDialog(discount)}
											>
												<Trash2 class="size-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			{:catch error}
				<p class="text-center text-destructive">{m.common_error()}: {error.message}</p>
			{/await}
		</Card.Content>
	</Card.Root>
</div>

<!-- Create Discount Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.discount_create()}</Dialog.Title>
		</Dialog.Header>

		<form {...createDiscount} class="space-y-4">
			<div class="space-y-2">
				<Label>{m.discount_code()}</Label>
				<Input
					{...createDiscount.fields.code.as('text')}
					placeholder={m.discount_code_placeholder()}
				/>
				<p class="text-xs text-muted-foreground">{m.discount_code_help()}</p>
				{#each createDiscount.fields.code.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.discount_type()}</Label>
				<Select.Root
					type="single"
					value={newDiscountType}
					onValueChange={(selected) => {
						if (selected) {
							const typedSelected = selected as 'percentage' | 'fixed' | 'free_shipping';
							newDiscountType = typedSelected;
							createDiscount.fields.type.set(typedSelected);
						}
					}}
				>
					<Select.Trigger>
						{newDiscountType === 'percentage'
							? m.discount_percentage()
							: newDiscountType === 'fixed'
								? m.discount_fixed()
								: newDiscountType === 'free_shipping'
									? m.discount_free_shipping()
									: m.discount_type()}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="percentage">{m.discount_percentage()}</Select.Item>
						<Select.Item value="fixed">{m.discount_fixed()}</Select.Item>
						<Select.Item value="free_shipping">{m.discount_free_shipping()}</Select.Item>
					</Select.Content>
				</Select.Root>
				{#each createDiscount.fields.type.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			{#if newDiscountType !== 'free_shipping'}
				<div class="space-y-2">
					<Label>{m.discount_value()}</Label>
					<Input
						{...createDiscount.fields.value.as('number')}
						placeholder={newDiscountType === 'percentage' ? '0-100' : '0'}
					/>
					<p class="text-xs text-muted-foreground">
						{newDiscountType === 'percentage'
							? m.discount_value_percentage_help()
							: m.discount_value_fixed_help()}
					</p>
					{#each createDiscount.fields.value.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			{/if}

			<div class="space-y-2">
				<Label>{m.discount_min_order_amount()}</Label>
				<Input
					{...createDiscount.fields.minOrderAmount.as('number')}
					placeholder="0"
				/>
				<p class="text-xs text-muted-foreground">{m.discount_min_order_help()}</p>
				{#each createDiscount.fields.minOrderAmount.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>{m.discount_max_uses_total()}</Label>
					<Input
						{...createDiscount.fields.maxUsesTotal.as('number')}
						placeholder={m.common_unlimited()}
					/>
					<p class="text-xs text-muted-foreground">{m.discount_max_uses_help()}</p>
					{#each createDiscount.fields.maxUsesTotal.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>{m.discount_max_uses_per_customer()}</Label>
					<Input
						{...createDiscount.fields.maxUsesPerCustomer.as('number')}
						placeholder="1"
					/>
					{#each createDiscount.fields.maxUsesPerCustomer.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>{m.discount_starts_at()}</Label>
					<Input {...createDiscount.fields.startsAt.as('datetime-local')} />
					{#each createDiscount.fields.startsAt.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>{m.discount_ends_at()}</Label>
					<Input {...createDiscount.fields.endsAt.as('datetime-local')} />
					{#each createDiscount.fields.endsAt.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>{m.discount_description()}</Label>
				<Input
					{...createDiscount.fields.description.as('text')}
					placeholder={m.discount_description()}
				/>
				{#each createDiscount.fields.description.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox checked={newDiscountIsActive} onCheckedChange={(checked) => {
					newDiscountIsActive = checked as boolean;
					createDiscount.fields.isActive.set(checked as boolean);
				}} id="create-is-active" />
				<Label for="create-is-active">{m.discount_is_active()}</Label>
				{#each createDiscount.fields.isActive.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!createDiscount.pending}>
					{createDiscount.pending ? m.common_creating() : m.common_create()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Discount Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.discount_edit()}</Dialog.Title>
		</Dialog.Header>

		<form {...updateDiscount} class="space-y-4">
			{#if editingDiscount}
				<input name="id" value={editingDiscount.id} type="hidden" />
			{/if}

			<div class="space-y-2">
				<Label>{m.discount_code()}</Label>
				<Input
					{...updateDiscount.fields.code.as('text')}
					placeholder={m.discount_code_placeholder()}
				/>
				<p class="text-xs text-muted-foreground">{m.discount_code_help()}</p>
				{#each updateDiscount.fields.code.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>{m.discount_type()}</Label>
				<Select.Root
					type="single"
					value={newDiscountType}
					onValueChange={(selected) => {
						if (selected) {
							const typedSelected = selected as 'percentage' | 'fixed' | 'free_shipping';
							updateDiscount.fields.type.set(typedSelected);
						}
					}}
				>
					<Select.Trigger>
						{newDiscountType === 'percentage'
							? m.discount_percentage()
							: newDiscountType === 'fixed'
								? m.discount_fixed()
								: newDiscountType === 'free_shipping'
									? m.discount_free_shipping()
									: m.discount_type()}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="percentage">{m.discount_percentage()}</Select.Item>
						<Select.Item value="fixed">{m.discount_fixed()}</Select.Item>
						<Select.Item value="free_shipping">{m.discount_free_shipping()}</Select.Item>
					</Select.Content>
				</Select.Root>
				{#each updateDiscount.fields.type.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			{#if newDiscountType !== 'free_shipping'}
				<div class="space-y-2">
					<Label>{m.discount_value()}</Label>
					<Input
						{...updateDiscount.fields.value.as('number')}
						placeholder={newDiscountType === 'percentage' ? '0-100' : '0'}
					/>
					<p class="text-xs text-muted-foreground">
						{newDiscountType === 'percentage'
							? m.discount_value_percentage_help()
							: m.discount_value_fixed_help()}
					</p>
					{#each updateDiscount.fields.value.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			{/if}

			<div class="space-y-2">
				<Label>{m.discount_min_order_amount()}</Label>
				<Input
					{...updateDiscount.fields.minOrderAmount.as('number')}
					placeholder="0"
				/>
				<p class="text-xs text-muted-foreground">{m.discount_min_order_help()}</p>
				{#each updateDiscount.fields.minOrderAmount.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>{m.discount_max_uses_total()}</Label>
					<Input
						{...updateDiscount.fields.maxUsesTotal.as('number')}
						placeholder={m.common_unlimited()}
					/>
					<p class="text-xs text-muted-foreground">{m.discount_max_uses_help()}</p>
					{#each updateDiscount.fields.maxUsesTotal.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>{m.discount_max_uses_per_customer()}</Label>
					<Input
						{...updateDiscount.fields.maxUsesPerCustomer.as('number')}
						placeholder="1"
					/>
					{#each updateDiscount.fields.maxUsesPerCustomer.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>{m.discount_starts_at()}</Label>
					<Input {...updateDiscount.fields.startsAt.as('datetime-local')} />
					{#each updateDiscount.fields.startsAt.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>{m.discount_ends_at()}</Label>
					<Input {...updateDiscount.fields.endsAt.as('datetime-local')} />
					{#each updateDiscount.fields.endsAt.issues() as issue}
						<p class="text-sm text-destructive">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>{m.discount_description()}</Label>
				<Input
					{...updateDiscount.fields.description.as('text')}
					placeholder={m.discount_description()}
				/>
				{#each updateDiscount.fields.description.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox checked={newDiscountIsActive} onCheckedChange={(checked) => {
					newDiscountIsActive = checked as boolean;
					updateDiscount.fields.isActive.set(checked as boolean);
				}} id="update-is-active" />
				<Label for="update-is-active">{m.discount_is_active()}</Label>
				{#each updateDiscount.fields.isActive.issues() as issue}
					<p class="text-sm text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (editDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!updateDiscount.pending}>
					{updateDiscount.pending ? m.common_saving() : m.common_save()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Discount Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.discount_delete()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.discount_delete_confirm()}
				{#if deletingDiscount}
					<strong class="font-mono">{deletingDiscount.code}</strong>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form {...deleteDiscount}>
				{#if deletingDiscount}
					<input name="id" value={deletingDiscount.id} type="hidden" />
				{/if}
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit" variant="destructive" disabled={!!deleteDiscount.pending}>
						{deleteDiscount.pending ? m.common_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
