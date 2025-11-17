<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import AssetBrowser from '$lib/components/common/forms/asset-browser.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	let selectedAsset = $state<Asset | null>(null);
	let showAssetBrowser = $state(false);

	function handleAssetSelect(asset: Asset) {
		selectedAsset = asset;
		data.imageId = asset.id;
		data.imageUrl = asset.url;
		showAssetBrowser = false;
	}

	function clearImage() {
		selectedAsset = null;
		data.imageId = undefined;
		data.imageUrl = undefined;
	}

	// Initialize data with defaults
	$effect(() => {
		if (!data.caption) data.caption = '';
		if (!data.altText) data.altText = '';
	});
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Image</Label>
		{#if selectedAsset || data.imageUrl}
			<div class="space-y-2">
				<img
					src={selectedAsset?.thumbnailUrl || selectedAsset?.url || data.imageUrl}
					alt={data.altText || 'Block image'}
					class="max-h-64 w-full rounded-md object-contain"
				/>
				<Button size="sm" variant="outline" onclick={clearImage}>
					{m.common_remove()}
				</Button>
			</div>
		{:else}
			<Button size="sm" variant="outline" onclick={() => (showAssetBrowser = true)}>
				Select Image
			</Button>
		{/if}
	</div>

	{#if showAssetBrowser}
		<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
	{/if}

	<div class="space-y-2">
		<Label for="altText">Alt Text</Label>
		<Input
			id="altText"
			type="text"
			bind:value={data.altText}
			placeholder="Describe the image for accessibility"
		/>
		<p class="text-muted-foreground text-xs">
			Important for SEO and accessibility. Describe what's in the image.
		</p>
	</div>

	<div class="space-y-2">
		<Label for="caption">Caption (Optional)</Label>
		<Input id="caption" type="text" bind:value={data.caption} placeholder="Image caption" />
	</div>
</div>
