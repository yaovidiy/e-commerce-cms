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
		if (!data.slides) data.slides = [];
	});

	function handleAssetSelect(asset: Asset) {
		if (assetBrowserFor === null) {
			const slides = data.slides || [];
			data.slides = [
				...slides,
				{
					id: crypto.randomUUID(),
					image: {
						assetId: asset.id
					},
					url: ''
				}
			];
		} else {
			if (data.slides[assetBrowserFor]) {
				data.slides[assetBrowserFor].image = {
					assetId: asset.id
				};
			}
		}
		data.slides = [...(data.slides || [])];
		showAssetBrowser = false;
		assetBrowserFor = null;
	}

	function removeSlide(index: number) {
		data.slides = data.slides.filter((_: any, i: number) => i !== index);
	}

	function updateSlideUrl(index: number, url: string) {
		if (data.slides[index]) {
			data.slides[index].url = url;
			data.slides = [...data.slides];
		}
	}

	function addSlide() {
		assetBrowserFor = null;
		showAssetBrowser = true;
	}

	function updateSlideImage(index: number) {
		assetBrowserFor = index;
		showAssetBrowser = true;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Slider Slides</Label>
		<p class="text-muted-foreground text-sm">Add slides with images and optional links</p>
	</div>

	{#if data.slides && data.slides.length > 0}
		<div class="grid gap-4">
			{#each data.slides as slide, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Slide {index + 1}</span>
						<Button
							size="icon-sm"
							variant="destructive"
							onclick={() => removeSlide(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>

					{#if slide.image?.assetId}
						<div class="relative">
							<!-- Note: In real implementation, you'd show the asset thumbnail -->
							<div class="bg-muted flex h-32 w-full items-center justify-center rounded-md">
								<span class="text-muted-foreground text-xs">Asset {slide.image.assetId}</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								class="mt-2"
								onclick={() => updateSlideImage(index)}
							>
								Change Image
							</Button>
						</div>
					{:else}
						<Button
							size="sm"
							variant="outline"
							onclick={() => updateSlideImage(index)}
						>
							Select Image
						</Button>
					{/if}

					<div class="space-y-2">
						<Label for={`slide-url-${index}`} class="text-sm">Link URL (optional)</Label>
						<Input
							id={`slide-url-${index}`}
							type="text"
							value={slide.url || ''}
							oninput={(e) => updateSlideUrl(index, e.currentTarget.value)}
							placeholder="/products"
							class="text-sm"
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={addSlide}>
		Add Slide
	</Button>

	<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
</div>
