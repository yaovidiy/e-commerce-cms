<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
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
		if (!data.heading) data.heading = '';
		if (!data.subheading) data.subheading = '';
		if (!data.ctaText) data.ctaText = '';
		if (!data.ctaLink) data.ctaLink = '';
	});
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="heading">{m.page_block_heading()}</Label>
		<Input
			id="heading"
			type="text"
			bind:value={data.heading}
			placeholder="Enter hero heading"
		/>
	</div>

	<div class="space-y-2">
		<Label for="subheading">Subheading</Label>
		<Textarea
			id="subheading"
			bind:value={data.subheading}
			placeholder="Enter hero subheading"
			rows={2}
		/>
	</div>

	<div class="space-y-2">
		<Label>Background Image</Label>
		{#if selectedAsset || data.imageUrl}
			<div class="space-y-2">
				<img
					src={selectedAsset?.thumbnailUrl || selectedAsset?.url || data.imageUrl}
					alt="Hero background"
					class="h-32 w-full rounded-md object-cover"
				/>
				<Button size="sm" variant="outline" onclick={clearImage}>
					{m.common_remove()}
				</Button>
			</div>
		{:else}
			<Button size="sm" variant="outline" onclick={() => (showAssetBrowser = true)}>
				Select Background Image
			</Button>
		{/if}
	</div>

	{#if showAssetBrowser}
		<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
	{/if}

	<div class="grid gap-4 sm:grid-cols-2">
		<div class="space-y-2">
			<Label for="ctaText">CTA Button Text</Label>
			<Input id="ctaText" type="text" bind:value={data.ctaText} placeholder="Get Started" />
		</div>

		<div class="space-y-2">
			<Label for="ctaLink">CTA Button Link</Label>
			<Input id="ctaLink" type="text" bind:value={data.ctaLink} placeholder="/products" />
		</div>
	</div>
</div>
