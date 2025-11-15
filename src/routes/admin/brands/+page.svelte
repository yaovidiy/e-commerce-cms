<script lang="ts">
	import { getAllBrands, deleteBrand } from '$lib/remotes/brand.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { AssetImage } from '$lib/components/common/data-display';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte/icons';
	import type { Brand } from '$lib/server/db/schema';

	let searchQuery = $state('');

	// Delete dialog state
	let deletingBrand = $state<Brand | null>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(brand: Brand) {
		deletingBrand = brand;
		deleteDialogOpen = true;
	}

	// Auto-refresh list after successful deletion
	$effect(() => {
		if (deleteBrand.result) {
			getAllBrands().refresh();
		}
	});

	// Helper to format date
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.brand_brands()}</h1>
			<p class="text-muted-foreground">{m.brand_create_brand_description()}</p>
		</div>
		<Button href="/admin/brands/create">
			<Plus class="mr-2 size-4" />
			{m.brand_create_brand()}
		</Button>
	</div>

	<!-- Search -->
	<div class="flex gap-4">
		<Input
			type="text"
			placeholder={m.common_search()}
			bind:value={searchQuery}
			class="max-w-sm"
		/>
	</div>

	<!-- Brands Table -->
	<div class="border-border rounded-lg border">
		{#await getAllBrands()}
			<div class="flex items-center justify-center p-8">
				<p class="text-muted-foreground">{m.common_loading()}</p>
			</div>
		{:then brands}
			{@const filteredBrands = searchQuery
				? brands.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
				: brands}
			{#if filteredBrands.length === 0}
				<div class="flex flex-col items-center justify-center gap-2 p-8">
					<p class="text-muted-foreground">{m.brand_no_brands()}</p>
					<Button href="/admin/brands/create" variant="outline" size="sm">
						<Plus class="mr-2 size-4" />
						{m.brand_create_brand()}
					</Button>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m.brand_name()}</Table.Head>
							<Table.Head>{m.brand_slug()}</Table.Head>
							<Table.Head>{m.brand_is_visible()}</Table.Head>
							<Table.Head>{m.brand_created_at()}</Table.Head>
							<Table.Head class="text-right">{m.common_actions()}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filteredBrands as brand}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										{#if brand.logo}
											<AssetImage
												assetId={brand.logo}
												alt={brand.name}
												thumbnail={true}
												class="size-8 rounded object-contain"
											/>
										{/if}
										<span>{brand.name}</span>
									</div>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">{brand.slug}</Table.Cell>
								<Table.Cell>
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
										class:bg-green-100={brand.isVisible}
										class:text-green-800={brand.isVisible}
										class:bg-gray-100={!brand.isVisible}
										class:text-gray-800={!brand.isVisible}
									>
										{brand.isVisible ? m.common_yes() : m.common_no()}
									</span>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{formatDate(brand.createdAt)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/brands/{brand.id}/edit" variant="ghost" size="sm">
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="text-destructive"
											onclick={() => openDeleteDialog(brand)}
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
			<div class="flex items-center justify-center p-8">
				<p class="text-destructive">{m.common_error()}: {error.message}</p>
			</div>
		{/await}
	</div>
</div>

<!-- Delete Brand Dialog -->
{#if deletingBrand}
	{@const DeleteBrandDialog = await import('$lib/components/admin/features/brand-management').then(
		(m) => m.DeleteBrandDialog
	)}
	<DeleteBrandDialog bind:brand={deletingBrand} bind:open={deleteDialogOpen} />
{/if}
