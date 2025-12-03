<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import AssetBrowser from '$lib/components/common/forms/asset-browser.svelte';
	import { X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	let showAssetBrowser = $state(false);
	let assetBrowserFor = $state<number | null>(null);

	// Initialize data with defaults
	$effect(() => {
		if (!data.products) data.products = [];
	});

	function handleAssetSelect(asset: Asset) {
		if (assetBrowserFor !== null) {
			if (data.products[assetBrowserFor]) {
				data.products[assetBrowserFor].image = asset.id;
			}
			data.products = [...data.products];
		}
		showAssetBrowser = false;
		assetBrowserFor = null;
	}

	function addProduct() {
		data.products = [
			...(data.products || []),
			{
				id: crypto.randomUUID(),
				title: '',
				price: 0,
				image: '',
				category: '',
				weight: '',
				url: '',
				categoryId: '',
				productId: '',
				salePrice: null,
				saleStart: null,
				saleEnd: null
			}
		];
	}

	function removeProduct(index: number) {
		data.products = data.products.filter((_: any, i: number) => i !== index);
	}

	function updateProductField(index: number, field: string, value: any) {
		if (data.products[index]) {
			data.products[index][field] = value;
			data.products = [...data.products];
		}
	}

	function selectProductImage(index: number) {
		assetBrowserFor = index;
		showAssetBrowser = true;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Product Cards</Label>
		<p class="text-muted-foreground text-sm">Add product cards with pricing, images, and sale information</p>
	</div>

	{#if data.products && data.products.length > 0}
		<div class="grid gap-4">
			{#each data.products as product, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Product {index + 1}</span>
						<Button
							size="icon-sm"
							variant="destructive"
							onclick={() => removeProduct(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>

					<div class="space-y-2">
						<Label class="text-sm">Image</Label>
						{#if product.image}
							<div class="space-y-2">
								<div class="bg-muted flex h-32 w-full items-center justify-center rounded-md">
									<span class="text-muted-foreground text-xs">Asset {product.image}</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onclick={() => selectProductImage(index)}
								>
									Change Image
								</Button>
							</div>
						{:else}
							<Button
								size="sm"
								variant="outline"
								onclick={() => selectProductImage(index)}
							>
								Select Image
							</Button>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for={`product-title-${index}`} class="text-sm">Title</Label>
						<Input
							id={`product-title-${index}`}
							type="text"
							value={product.title || ''}
							oninput={(e) => updateProductField(index, 'title', e.currentTarget.value)}
							placeholder="Product name"
							class="text-sm"
						/>
					</div>

					<div class="grid gap-2 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for={`product-price-${index}`} class="text-sm">Price</Label>
							<Input
								id={`product-price-${index}`}
								type="number"
								value={product.price || 0}
								oninput={(e) => updateProductField(index, 'price', parseInt(e.currentTarget.value))}
								placeholder="0"
								class="text-sm"
							/>
						</div>

						<div class="space-y-2">
							<Label for={`product-weight-${index}`} class="text-sm">Weight</Label>
							<Input
								id={`product-weight-${index}`}
								type="text"
								value={product.weight || ''}
								oninput={(e) => updateProductField(index, 'weight', e.currentTarget.value)}
								placeholder="100g"
								class="text-sm"
							/>
						</div>
					</div>

					<div class="grid gap-2 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for={`product-category-${index}`} class="text-sm">Category</Label>
							<Input
								id={`product-category-${index}`}
								type="text"
								value={product.category || ''}
								oninput={(e) => updateProductField(index, 'category', e.currentTarget.value)}
								placeholder="Category"
								class="text-sm"
							/>
						</div>

						<div class="space-y-2">
							<Label for={`product-url-${index}`} class="text-sm">URL</Label>
							<Input
								id={`product-url-${index}`}
								type="text"
								value={product.url || ''}
								oninput={(e) => updateProductField(index, 'url', e.currentTarget.value)}
								placeholder="/product/1"
								class="text-sm"
							/>
						</div>
					</div>

					<div class="space-y-3 border-t pt-3">
						<h4 class="text-sm font-medium">Sale Information (optional)</h4>

						<div class="grid gap-2 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for={`product-saleprice-${index}`} class="text-sm">Sale Price</Label>
								<Input
									id={`product-saleprice-${index}`}
									type="number"
									value={product.salePrice || ''}
									oninput={(e) => updateProductField(index, 'salePrice', e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
									placeholder="Leave empty if no sale"
									class="text-sm"
								/>
							</div>

							<div class="space-y-2">
								<Label for={`product-productid-${index}`} class="text-sm">Product ID (for linking)</Label>
								<Input
									id={`product-productid-${index}`}
									type="text"
									value={product.productId || ''}
									oninput={(e) => updateProductField(index, 'productId', e.currentTarget.value)}
									placeholder="Product UUID"
									class="text-sm"
								/>
							</div>
						</div>

						<div class="grid gap-2 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for={`product-salestart-${index}`} class="text-sm">Sale Start Date</Label>
								<Input
									id={`product-salestart-${index}`}
									type="datetime-local"
									value={product.saleStart ? product.saleStart.substring(0, 16) : ''}
									oninput={(e) => updateProductField(index, 'saleStart', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
									class="text-sm"
								/>
							</div>

							<div class="space-y-2">
								<Label for={`product-saleend-${index}`} class="text-sm">Sale End Date</Label>
								<Input
									id={`product-saleend-${index}`}
									type="datetime-local"
									value={product.saleEnd ? product.saleEnd.substring(0, 16) : ''}
									oninput={(e) => updateProductField(index, 'saleEnd', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
									class="text-sm"
								/>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={addProduct}>
		Add Product Card
	</Button>

	<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
</div>
