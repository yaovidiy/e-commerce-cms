<script lang="ts">
	import { getAllAssets, deleteAsset } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Pagination from '$lib/components/ui/pagination';
	import { MoreHorizontal, Eye, Copy, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';
	import DeleteAssetDialog from './delete-asset-dialog.svelte';

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 16;

	let deletingAsset = $state<Asset | null>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(asset: Asset) {
		deletingAsset = asset;
		deleteDialogOpen = true;
	}

	function handleSearchChange() {
		currentPage = 1;
	}

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			// Could add a toast notification here
		} catch (error) {
			console.error('Failed to copy URL:', error);
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Search -->
	<Input
		type="text"
		placeholder={m.asset_search_placeholder()}
		bind:value={searchQuery}
		oninput={handleSearchChange}
	/>

	<!-- Assets Grid -->
	{#await getAllAssets({ filename: searchQuery, mimeType: '', page: currentPage, pageSize })}
		<div class="text-muted-foreground py-8 text-center">Loading...</div>
	{:then response}
		{#if response.data.length === 0}
			<div class="text-muted-foreground py-12 text-center">
				<p class="text-lg font-medium">{m.asset_no_assets()}</p>
			</div>
		{:else}
			<div
				class="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each response.data as asset}
					<div class="group bg-card relative overflow-hidden rounded-lg border">
						<!-- Image Preview -->
						<div class="bg-muted flex aspect-square items-center justify-center overflow-hidden">
							{#if asset.thumbnailUrl}
								<img
									src={asset.thumbnailUrl}
									alt={asset.originalFilename}
									class="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
							{:else}
								<img
									src={asset.url}
									alt={asset.originalFilename}
									class="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
							{/if}
						</div>

						<!-- Info -->
						<div class="space-y-2 p-3">
							<p class="truncate text-sm font-medium" title={asset.originalFilename}>
								{asset.originalFilename}
							</p>

							<div class="text-muted-foreground flex items-center justify-between text-xs">
								<span>{formatFileSize(asset.size)}</span>
								<span>{formatDate(asset.createdAt)}</span>
							</div>

							<!-- Actions -->
							<div class="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									class="flex-1"
									onclick={() => copyUrl(asset.url)}
								>
									<Copy class="mr-1 h-3 w-3" />
									{m.asset_copy_url()}
								</Button>

								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon">
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Item onclick={() => window.open(asset.url, '_blank')}>
											<Eye class="mr-2 h-4 w-4" />
											{m.asset_view_full()}
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => copyUrl(asset.url)}>
											<Copy class="mr-2 h-4 w-4" />
											{m.asset_copy_url()}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											onclick={() => openDeleteDialog(asset)}
											class="text-destructive"
										>
											<Trash2 class="mr-2 h-4 w-4" />
											{m.common_delete()}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if response.totalPages > 1}
				<Pagination.Root bind:page={currentPage} count={response.totalCount} perPage={pageSize}>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton />
							</Pagination.Item>
							{#each pages as page (page.key)}
								{#if page.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link {page} isActive={currentPage === page.value}>
											{page.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			{/if}
		{/if}
	{:catch error}
		<div class="text-destructive py-12 text-center">
			<p>Error loading assets: {error.message}</p>
		</div>
	{/await}
</div>

<DeleteAssetDialog asset={deletingAsset} bind:open={deleteDialogOpen} />
