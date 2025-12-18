<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';
	import {
		getProductTiers,
		createProductTier,
		updateProductTier,
		deleteProductTier
	} from '$lib/remotes/product.remote';
	import type { ProductTier } from '$lib/server/db/schema';

	interface Props {
		productId: string;
	}

	let { productId }: Props = $props();

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	// Form states
	let newMinQuantity = $state<number>(2);
	let newDiscount = $state<number>(0);
	let editingTier = $state<ProductTier | null>(null);
	let deletingTier = $state<ProductTier | null>(null);

	// Load tiers
	$effect(async () => {
		if (productId) {
			await getProductTiers({ productId }).refresh();
		}
	});

	function openCreateDialog() {
		newMinQuantity = 2;
		newDiscount = 0;
		createDialogOpen = true;
	}

	function openEditDialog(tier: ProductTier) {
		editingTier = tier;
		newMinQuantity = tier.minQuantity;
		newDiscount = tier.discount;
		editDialogOpen = true;
	}

	function openDeleteDialog(tier: ProductTier) {
		deletingTier = tier;
		deleteDialogOpen = true;
	}

	async function handleCreateTier() {
		if (newMinQuantity < 1 || newDiscount < 0 || newDiscount > 100) return;

		await createProductTier({
			productId,
			minQuantity: newMinQuantity,
			discount: newDiscount
		});

		createDialogOpen = false;
		newMinQuantity = 2;
		newDiscount = 0;
	}

	async function handleUpdateTier() {
		if (!editingTier || newMinQuantity < 1 || newDiscount < 0 || newDiscount > 100) return;

		await updateProductTier({
			id: editingTier.id,
			minQuantity: newMinQuantity,
			discount: newDiscount
		});

		editDialogOpen = false;
		editingTier = null;
	}

	async function handleDeleteTier() {
		if (!deletingTier) return;

		await deleteProductTier({ id: deletingTier.id });

		deleteDialogOpen = false;
		deletingTier = null;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="text-lg font-semibold">{m.product_tiers()}</h3>
			<p class="text-sm text-muted-foreground">{m.product_enable_tiered_pricing_help()}</p>
		</div>
		<Button onclick={openCreateDialog} size="sm">
			<Plus class="size-4 mr-2" />
			{m.product_add_tier()}
		</Button>
	</div>

	{#await getProductTiers({ productId }) then tiers}
		{#if tiers.length === 0}
			<div class="text-center py-8 text-muted-foreground">{m.product_no_tiers()}</div>
		{:else}
			<div class="border rounded-lg">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m.product_tier_min_quantity()}</Table.Head>
							<Table.Head>{m.product_tier_discount()}</Table.Head>
							<Table.Head class="w-20">{m.common_actions()}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each tiers as tier}
							<Table.Row>
								<Table.Cell>
									{tier.minQuantity}
									<Badge variant="outline" class="ml-2">
										{tier.minQuantity === 1 ? m.common_default?.() || 'Default' : m.common_discount?.() || 'Discount'}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="secondary">{tier.discount}% OFF</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex gap-2">
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openEditDialog(tier)}
										>
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openDeleteDialog(tier)}
										>
											<Trash2 class="size-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	{/await}
</div>

<!-- Create Tier Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.product_add_tier()}</Dialog.Title>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleCreateTier();
			}}
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="min-qty">{m.product_tier_min_quantity()}</Label>
					<Input
						id="min-qty"
						type="number"
						bind:value={newMinQuantity}
						min="1"
						step="1"
						placeholder="e.g., 5"
					/>
					<p class="text-xs text-muted-foreground">Minimum quantity needed to apply this discount</p>
				</div>

				<div class="space-y-2">
					<Label for="tier-discount">{m.product_tier_discount()}</Label>
					<div class="flex items-center gap-2">
						<Input
							id="tier-discount"
							type="number"
							bind:value={newDiscount}
							min="0"
							max="100"
							step="1"
							placeholder="e.g., 10"
							class="flex-1"
						/>
						<span class="text-sm font-medium">%</span>
					</div>
					<p class="text-xs text-muted-foreground">Discount percentage applied to the base price (0-100%)</p>
				</div>
			</div>

			<div class="flex justify-end gap-2 mt-6">
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit">{m.common_save()}</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Tier Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Discount Tier</Dialog.Title>
		</Dialog.Header>

		{#if editingTier}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleUpdateTier();
				}}
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="edit-min-qty">{m.product_tier_min_quantity()}</Label>
						<Input
							id="edit-min-qty"
							type="number"
							bind:value={newMinQuantity}
							min="1"
							step="1"
						/>
						<p class="text-xs text-muted-foreground">Minimum quantity needed to apply this discount</p>
					</div>

					<div class="space-y-2">
						<Label for="edit-tier-discount">{m.product_tier_discount()}</Label>
						<div class="flex items-center gap-2">
							<Input
								id="edit-tier-discount"
								type="number"
								bind:value={newDiscount}
								min="0"
								max="100"
								step="1"
								class="flex-1"
							/>
							<span class="text-sm font-medium">%</span>
						</div>
						<p class="text-xs text-muted-foreground">Discount percentage applied to the base price (0-100%)</p>
					</div>
				</div>

				<div class="flex justify-end gap-2 mt-6">
					<Button type="button" variant="outline" onclick={() => (editDialogOpen = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit">{m.common_save()}</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Tier Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.product_tier_delete()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.product_tier_delete_confirmation()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>
				{m.common_cancel()}
			</Button>
			<Button variant="destructive" onclick={handleDeleteTier}>
				{m.common_delete()}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
