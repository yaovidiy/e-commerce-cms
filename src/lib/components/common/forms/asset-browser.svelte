<script lang="ts">
	import { getAllAssets } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ImageUploader } from '$lib/components/common/forms';
	import { Check, Upload } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let {
		open = $bindable(false),
		onSelect
	} = $props<{
		open?: boolean;
		onSelect: (asset: Asset) => void;
	}>();

	let searchQuery = $state('');
	let selectedAsset = $state<Asset | null>(null);
	let showUpload = $state(false);

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
	<Dialog.Content class="max-w-4xl max-h-[80vh]">
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

				<div class="overflow-y-auto max-h-[50vh]">
					{#await getAllAssets({ filename: searchQuery, mimeType: '' })}
						<div class="text-center py-8 text-muted-foreground">Loading...</div>
					{:then assets}
						{#if assets.length === 0}
							<div class="text-center py-12 text-muted-foreground">
								<p>{m.asset_no_assets()}</p>
							</div>
						{:else}
							<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
								{#each assets as asset}
									<button
										type="button"
										class="group relative aspect-square rounded-lg border bg-muted overflow-hidden hover:border-primary transition-colors"
										onclick={() => handleSelect(asset)}
									>
										{#if asset.thumbnailUrl}
											<img
												src={asset.thumbnailUrl}
												alt={asset.originalFilename}
												class="w-full h-full object-cover"
											/>
										{:else}
											<img
												src={asset.url}
												alt={asset.originalFilename}
												class="w-full h-full object-cover"
											/>
										{/if}

										<div
											class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<Check class="h-8 w-8 text-white" />
										</div>
									</button>
								{/each}
							</div>
						{/if}
					{:catch error}
						<div class="text-center py-12 text-destructive">
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
