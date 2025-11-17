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

	// Initialize data with defaults
	$effect(() => {
		if (!data.images) data.images = [];
	});

	function handleAssetSelect(asset: Asset) {
		const images = data.images || [];
		data.images = [
			...images,
			{
				id: asset.id,
				url: asset.url,
				thumbnailUrl: asset.thumbnailUrl,
				altText: '' // Asset type doesn't have altText, initialize as empty
			}
		];
	}

	function removeImage(index: number) {
		data.images = data.images.filter((_: any, i: number) => i !== index);
	}

	function updateAltText(index: number, altText: string) {
		data.images[index].altText = altText;
		data.images = [...data.images];
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Gallery Images</Label>
		<p class="text-muted-foreground text-sm">Add multiple images to create a gallery</p>
	</div>

	{#if data.images && data.images.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.images as image, index}
				<div class="space-y-2 rounded-lg border p-3">
					<div class="relative">
						<img
							src={image.thumbnailUrl || image.url}
							alt={image.altText}
							class="h-32 w-full rounded-md object-cover"
						/>
						<Button
							size="icon-sm"
							variant="destructive"
							class="absolute right-2 top-2"
							onclick={() => removeImage(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>
					<Input
						type="text"
						value={image.altText}
						oninput={(e) => updateAltText(index, e.currentTarget.value)}
						placeholder="Alt text"
						class="text-xs"
					/>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={() => (showAssetBrowser = true)}>
		Add Image to Gallery
	</Button>

	{#if showAssetBrowser}
		<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
	{/if}
</div>
