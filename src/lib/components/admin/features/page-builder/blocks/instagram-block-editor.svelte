<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import AssetBrowser from '$lib/components/common/forms/asset-browser.svelte';
	import { X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	let showAssetBrowser = $state(false);
	let assetBrowserFor = $state<number | null>(null);

	// Initialize data with defaults
	$effect(() => {
		if (!data.items) data.items = [];
	});

	function handleAssetSelect(asset: Asset) {
		if (assetBrowserFor === null) {
			const items = data.items || [];
			data.items = [
				...items,
				{
					id: crypto.randomUUID(),
					image: {
						assetId: asset.id
					},
					url: ''
				}
			];
		} else {
			if (data.items[assetBrowserFor]) {
				data.items[assetBrowserFor].image = {
					assetId: asset.id
				};
			}
		}
		data.items = [...(data.items || [])];
		showAssetBrowser = false;
		assetBrowserFor = null;
	}

	function removeItem(index: number) {
		data.items = data.items.filter((_: any, i: number) => i !== index);
	}

	function updateItemUrl(index: number, url: string) {
		if (data.items[index]) {
			data.items[index].url = url;
			data.items = [...data.items];
		}
	}

	function addItem() {
		assetBrowserFor = null;
		showAssetBrowser = true;
	}

	function updateItemImage(index: number) {
		assetBrowserFor = index;
		showAssetBrowser = true;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Instagram Items</Label>
		<p class="text-muted-foreground text-sm">Add Instagram feed items with images and links</p>
	</div>

	{#if data.items && data.items.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.items as item, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Item {index + 1}</span>
						<Button
							size="icon-sm"
							variant="destructive"
							onclick={() => removeItem(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>

					{#if item.image?.assetId}
						<div class="relative">
							<!-- Note: In real implementation, you'd show the asset thumbnail -->
							<div class="bg-muted flex h-40 w-full items-center justify-center rounded-md">
								<span class="text-muted-foreground text-xs">Asset {item.image.assetId}</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								class="mt-2"
								onclick={() => updateItemImage(index)}
							>
								Change Image
							</Button>
						</div>
					{:else}
						<Button
							size="sm"
							variant="outline"
							onclick={() => updateItemImage(index)}
						>
							Select Image
						</Button>
					{/if}

					<div class="space-y-2">
						<Label for={`item-url-${index}`} class="text-sm">Instagram URL (optional)</Label>
						<Input
							id={`item-url-${index}`}
							type="text"
							value={item.url || ''}
							oninput={(e) => updateItemUrl(index, e.currentTarget.value)}
							placeholder="https://instagram.com/..."
							class="text-sm"
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={addItem}>
		Add Instagram Item
	</Button>

	<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
</div>
