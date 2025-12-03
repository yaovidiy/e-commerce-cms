<script lang="ts">
	import { getAllAssets } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ImageUploader } from '$lib/components/common/forms';
	import { Check, Upload } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';
	import * as Pagination from '$lib/components/ui/pagination/';

	let { open = $bindable(false), onSelect } = $props<{
		open?: boolean;
		onSelect: (asset: Asset) => void;
	}>();

	let searchQuery = $state('');
	let selectedAsset = $state<Asset | null>(null);
	let showUpload = $state(false);
	let currentPage = $state(1);

	function handleSelect(asset: Asset) {
		selectedAsset = asset;
		onSelect(asset);
		open = false;
		selectedAsset = null;
	}

	function handleUploadComplete() {
		showUpload = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{m.asset_browse()}</Dialog.Title>
			<Dialog.Description>{m.asset_select_image()}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Toggle Upload / Browse -->
			<div class="flex items-center gap-2">
				<Button
					type="button"
					variant={!showUpload ? 'default' : 'outline'}
					size="sm"
					onclick={() => (showUpload = false)}
				>
					{m.asset_browse()}
				</Button>
				<Button
					type="button"
					variant={showUpload ? 'default' : 'outline'}
					size="sm"
					onclick={() => (showUpload = true)}
				>
					<Upload class="mr-2 h-4 w-4" />
					{m.asset_upload_new()}
				</Button>
			</div>

			{#if showUpload}
				<!-- Upload View -->
				<ImageUploader onUploadComplete={handleUploadComplete} />
			{:else}
				<!-- Browse View -->
				<Input type="text" placeholder={m.asset_search_placeholder()} bind:value={searchQuery} />

				<div class="max-h-[50vh] overflow-y-auto">
					{#await getAllAssets({ filename: searchQuery, mimeType: '', page: currentPage, pageSize: 15 })}
						<div class="text-muted-foreground py-8 text-center">Loading...</div>
					{:then assets}
						{#if assets.data.length === 0}
							<div class="text-muted-foreground py-12 text-center">
								<p>{m.asset_no_assets()}</p>
							</div>
						{:else}
							<div class="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
								{#each assets.data as asset}
									<button
										type="button"
										class="group bg-muted hover:border-primary relative aspect-square overflow-hidden rounded-lg border transition-colors"
										onclick={() => handleSelect(asset)}
									>
										{#if asset.thumbnailUrl}
											<img
												src={asset.thumbnailUrl}
												alt={asset.originalFilename}
												class="h-full w-full object-cover"
											/>
										{:else}
											<img
												src={asset.url}
												alt={asset.originalFilename}
												class="h-full w-full object-cover"
											/>
										{/if}

										<div
											class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
										>
											<Check class="h-8 w-8 text-white" />
										</div>
									</button>
								{/each}
							</div>
							<div class="mt-3">
								<Pagination.Root bind:page={currentPage} count={assets.totalCount} perPage={assets.pageSize}>
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
							</div>
						{/if}
					{:catch error}
						<div class="text-destructive py-12 text-center">
							<p>Error loading assets: {error.message}</p>
						</div>
					{/await}
				</div>
			{/if}
		</div>

		<div class="flex justify-end">
			<Button type="button" variant="outline" onclick={() => (open = false)}>
				{m.common_close()}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
