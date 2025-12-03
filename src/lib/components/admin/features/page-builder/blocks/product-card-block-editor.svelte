<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import ProductBrowser from '$lib/components/common/forms/product-browser.svelte';
	import { X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Product } from '$lib/server/db/schema';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	let showProductBrowser = $state(false);
	let editingProductIndex = $state<number | null>(null);

	// Initialize data with defaults
	$effect(() => {
		if (!data.products) data.products = [];
	});

	function handleProductSelect(product: Product) {
		const newProduct = {
			id: crypto.randomUUID(),
			title: product.name,
			price: product.price || 0,
			image: product.images ? JSON.parse(product.images)[0] : '',
			category: product.categoryId || '',
			weight: '',
			url: `/product/${product.slug}`,
			categoryId: product.categoryId || '',
			productId: product.id,
			salePrice: product.compareAtPrice || null,
			saleStart: null,
			saleEnd: null
		};

		if (editingProductIndex !== null) {
			data.products[editingProductIndex] = newProduct;
			data.products = [...data.products];
			editingProductIndex = null;
		} else {
			data.products = [...(data.products || []), newProduct];
		}

		showProductBrowser = false;
	}

	function addProduct() {
		editingProductIndex = null;
		showProductBrowser = true;
	}

	function editProduct(index: number) {
		editingProductIndex = index;
		showProductBrowser = true;
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
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Product Cards</Label>
		<p class="text-muted-foreground text-sm">Click "Add Product" to select products from your catalog. All product details will be automatically populated.</p>
	</div>

	{#if data.products && data.products.length > 0}
		<div class="grid gap-4">
			{#each data.products as product, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">{product.title || 'Product'}</p>
							<p class="text-xs text-muted-foreground">
								{product.price ? `${(product.price / 100).toFixed(2)} грн` : 'Price not set'}
							</p>
						</div>
						<div class="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onclick={() => editProduct(index)}
							>
								Change
							</Button>
							<Button
								size="icon-sm"
								variant="destructive"
								onclick={() => removeProduct(index)}
							>
								<X class="h-3 w-3" />
							</Button>
						</div>
					</div>

					{#if product.productId}
						<div class="text-xs text-muted-foreground space-y-1 p-2 bg-muted rounded">
							<p><strong>Product ID:</strong> {product.productId}</p>
							<p><strong>URL:</strong> {product.url}</p>
							{#if product.salePrice}
								<p><strong>Original Price:</strong> {(product.salePrice / 100).toFixed(2)} грн</p>
							{/if}
						</div>
					{/if}

					<!-- Optional: Allow manual override of derived fields -->
					<details class="text-sm">
						<summary class="cursor-pointer text-muted-foreground hover:text-foreground">
							Advanced options
						</summary>
						<div class="space-y-3 mt-3 pt-3 border-t">
							<div class="space-y-2">
								<Label for={`product-weight-${index}`} class="text-xs">Weight/Size (optional)</Label>
								<Input
									id={`product-weight-${index}`}
									type="text"
									value={product.weight || ''}
									oninput={(e) => updateProductField(index, 'weight', e.currentTarget.value)}
									placeholder="100g, 500ml, etc."
									class="text-xs"
								/>
							</div>

							<div class="space-y-2">
								<Label for={`product-salestart-${index}`} class="text-xs">Sale Start (optional)</Label>
								<Input
									id={`product-salestart-${index}`}
									type="datetime-local"
									value={product.saleStart ? product.saleStart.substring(0, 16) : ''}
									oninput={(e) => updateProductField(index, 'saleStart', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
									class="text-xs"
								/>
							</div>

							<div class="space-y-2">
								<Label for={`product-saleend-${index}`} class="text-xs">Sale End (optional)</Label>
								<Input
									id={`product-saleend-${index}`}
									type="datetime-local"
									value={product.saleEnd ? product.saleEnd.substring(0, 16) : ''}
									oninput={(e) => updateProductField(index, 'saleEnd', e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)}
									class="text-xs"
								/>
							</div>
						</div>
					</details>
				</div>
			{/each}
		</div>
	{/if}
	<Button size="sm" variant="outline" onclick={addProduct}>
		Add Product
	</Button>

	<ProductBrowser bind:open={showProductBrowser} onSelect={handleProductSelect} />
</div>
