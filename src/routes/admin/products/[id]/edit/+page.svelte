<script lang="ts">
	import { page } from '$app/stores';
	import { updateProduct, getProductById } from '$lib/remotes/product.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { getAllBrands } from '$lib/remotes/brand.remote';
	import { getAssetById } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { RichTextEditor, AssetBrowser } from '$lib/components/common/forms';
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import { ArrowLeft, Link, Plus, X } from '@lucide/svelte/icons';
	import { goto } from '$app/navigation';
	import { generateSlug } from '$lib/utils';
	import type { Asset } from '$lib/server/db/schema';

	const productId = $page.params.id;

	// Local state for rich text editor
	let descriptionValue = $state('');

	// Local state for images
	let selectedImages = $state<Asset[]>([]);
	let assetBrowserOpen = $state(false);

	// Local state for loading
	let isLoading = $state(true);

	// Load product data and pre-populate form
	$effect(() => {
		if (!productId) {
			goto('/admin/products');
			return;
		}

		(async () => {
			try {
				const product = await getProductById(productId);

				// Pre-populate basic fields
				updateProduct.fields.id.set(product.id);
				updateProduct.fields.name.set(product.name || '');
				updateProduct.fields.slug.set(product.slug || '');
				updateProduct.fields.price.set(product.price);
				updateProduct.fields.compareAtPrice.set(product.compareAtPrice || 0);
				updateProduct.fields.sku.set(product.sku || '');
				updateProduct.fields.barcode.set(product.barcode || '');
				updateProduct.fields.quantity.set(product.quantity);
				updateProduct.fields.trackInventory.set(product.trackInventory);
				updateProduct.fields.lowStockThreshold.set(product.lowStockThreshold || 10);
				updateProduct.fields.allowBackorders.set(product.allowBackorders);
				updateProduct.fields.status.set(product.status);
				updateProduct.fields.categoryId.set(product.categoryId || '');
				updateProduct.fields.brandId.set(product.brandId || '');
				updateProduct.fields.seoTitle.set(product.seoTitle || '');
				updateProduct.fields.seoDescription.set(product.seoDescription || '');

				// Set description for rich text editor
				descriptionValue = product.description || '';

				// Load images if available
				if (product.images) {
					try {
						const imageIds = JSON.parse(product.images) as string[];
						const images = await Promise.all(imageIds.map((id) => getAssetById(id)));
						selectedImages = images.filter((img) => img !== null) as Asset[];
					} catch (e) {
						console.error('Failed to load images:', e);
					}
				}

				isLoading = false;
			} catch (error) {
				console.error('Failed to load product:', error);
				isLoading = false;
			}
		})();
	});

	// Watch for description changes from RichTextEditor
	$effect(() => {
		updateProduct.fields.description.set(descriptionValue);
	});

	// Watch for images changes
	$effect(() => {
		const imageIds = selectedImages.map((img) => img.id);
		updateProduct.fields.images.set(JSON.stringify(imageIds));
	});

	// Manual slug generation handler
	function handleGenerateSlug() {
		const nameValue = updateProduct.fields.name.value();
		if (nameValue) {
			updateProduct.fields.slug.set(generateSlug(nameValue));
		}
	}

	// Handle asset selection from browser
	function handleAssetSelect(asset: Asset) {
		selectedImages = [...selectedImages, asset];
	}

	// Remove image from selection
	function removeImage(index: number) {
		selectedImages = selectedImages.filter((_, i) => i !== index);
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center min-h-screen">
		<p class="text-muted-foreground">Loading product...</p>
	</div>
{:else}
	<div class="flex flex-col gap-6 p-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<Button href="/admin/products" variant="ghost" size="sm">
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{m.product_edit_product()}</h1>
				<p class="text-muted-foreground">Update product information</p>
			</div>
		</div>

		<!-- Product Form -->
		<form
			{...updateProduct.enhance(async ({ submit, form }) => {
				try {
					await submit();

					form.reset();
					goto('/admin/products');
				} catch (e) {}
			})}
			class="grid gap-6 md:grid-cols-3"
		>
			<!-- Hidden ID field -->
			<input type="hidden" name="id" value={productId} />

			<!-- Main Content (Left Column - 2/3) -->
			<div class="space-y-6 md:col-span-2">
				<!-- Basic Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_product()}</Card.Title>
						<Card.Description>Basic product information</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<!-- Product Name -->
						<div class="space-y-2">
							<Label>{m.product_name()}</Label>
							<Input
								{...updateProduct.fields.name.as('text')}
								placeholder={m.product_name_placeholder()}
							/>
							{#each updateProduct.fields.name.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- URL Slug -->
						<div class="space-y-2">
							<Label>{m.product_slug()}</Label>
							<Input
								{...updateProduct.fields.slug.as('text')}
								placeholder={m.product_slug_placeholder()}
							/>
							<Button
								type="button"
								variant="link"
								size="sm"
								onclick={handleGenerateSlug}
								class="h-auto p-0"
							>
								<Link class="mr-1 size-3" />
								Generate slug
							</Button>
							{#each updateProduct.fields.slug.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Description -->
						<div class="space-y-2">
							<Label>{m.product_description()}</Label>
							<input type="hidden" name="description" value={descriptionValue} />
							<RichTextEditor
								bind:value={descriptionValue}
								placeholder={m.product_description_placeholder()}
							/>
							{#each updateProduct.fields.description.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Images -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_images()}</Card.Title>
						<Card.Description>Product images</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<input
							type="hidden"
							name="images"
							value={JSON.stringify(selectedImages.map((img) => img.id))}
						/>

						<!-- Selected Images Grid -->
						{#if selectedImages.length > 0}
							<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
								{#each selectedImages as image, index}
									<div class="group relative aspect-square rounded-lg border overflow-hidden">
										<img
											src={image.thumbnailUrl || image.url}
											alt={image.originalFilename}
											class="w-full h-full object-cover"
										/>
										<button
											type="button"
											onclick={() => removeImage(index)}
											class="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X class="h-4 w-4" />
										</button>
										{#if index === 0}
											<div
												class="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded"
											>
												Main
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<!-- Add Images Button -->
						<Button
							type="button"
							variant="outline"
							class="w-full"
							onclick={() => (assetBrowserOpen = true)}
						>
							<Plus class="mr-2 h-4 w-4" />
							Add Images
						</Button>

						{#each updateProduct.fields.images.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</Card.Content>
				</Card.Root>

				<!-- Pricing -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_pricing()}</Card.Title>
					</Card.Header>
					<Card.Content class="grid gap-4 md:grid-cols-2">
						<!-- Price -->
						<div class="space-y-2">
							<Label>{m.product_price()}</Label>
							<Input
								{...updateProduct.fields.price.as('number')}
								placeholder="1000"
								min="0"
								step="1"
							/>
							<p class="text-muted-foreground text-xs">{m.product_price_in_cents()}</p>
							{#each updateProduct.fields.price.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Compare At Price -->
						<div class="space-y-2">
							<Label>{m.product_compare_at_price()}</Label>
							<Input
								{...updateProduct.fields.compareAtPrice.as('number')}
								placeholder="1500"
								min="0"
								step="1"
							/>
							<p class="text-muted-foreground text-xs">{m.product_price_in_cents()}</p>
							{#each updateProduct.fields.compareAtPrice.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Inventory -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_inventory()}</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<!-- SKU -->
							<div class="space-y-2">
								<Label>{m.product_sku()}</Label>
								<Input {...updateProduct.fields.sku.as('text')} placeholder="PROD-001" />
								{#each updateProduct.fields.sku.issues() as issue}
									<p class="text-destructive text-sm">{issue.message}</p>
								{/each}
							</div>

							<!-- Barcode -->
							<div class="space-y-2">
								<Label>{m.product_barcode()}</Label>
								<Input {...updateProduct.fields.barcode.as('text')} placeholder="1234567890123" />
								{#each updateProduct.fields.barcode.issues() as issue}
									<p class="text-destructive text-sm">{issue.message}</p>
								{/each}
							</div>
						</div>

						<div class="grid gap-4 md:grid-cols-3">
							<!-- Quantity -->
							<div class="space-y-2">
								<Label>{m.product_quantity()}</Label>
								<Input
									{...updateProduct.fields.quantity.as('number')}
									placeholder="0"
									min="0"
									step="1"
								/>
								{#each updateProduct.fields.quantity.issues() as issue}
									<p class="text-destructive text-sm">{issue.message}</p>
								{/each}
							</div>

							<!-- Low Stock Threshold -->
							<div class="space-y-2">
								<Label>
									{m.product_low_stock_threshold()}
								</Label>
								<Input
									{...updateProduct.fields.lowStockThreshold.as('number')}
									placeholder="10"
									min="0"
									step="1"
								/>
								{#each updateProduct.fields.lowStockThreshold.issues() as issue}
									<p class="text-destructive text-sm">{issue.message}</p>
								{/each}
							</div>

							<!-- Track Inventory Switch -->
							<div class="flex items-end">
								<div class="flex items-center justify-between space-x-2">
									<Label class="text-sm font-normal">
										{m.product_track_inventory()}
									</Label>
									<Switch
										checked={updateProduct.fields.trackInventory.value()}
										onCheckedChange={(checked) => updateProduct.fields.trackInventory.set(checked)}
									/>
									<input {...updateProduct.fields.trackInventory.as('checkbox')} hidden />
								</div>
							</div>
						</div>

						<!-- Allow Backorders Switch -->
						<div class="flex items-center gap-2 space-x-2">
							<Label class="text-sm font-normal">
								{m.product_allow_backorders()}
							</Label>
							<Switch
								checked={updateProduct.fields.allowBackorders.value()}
								onCheckedChange={(checked) => updateProduct.fields.allowBackorders.set(checked)}
							/>
							<input {...updateProduct.fields.allowBackorders.as('checkbox')} hidden />
						</div>
					</Card.Content>
				</Card.Root>

				<!-- SEO -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_seo()}</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<!-- SEO Title -->
						<div class="space-y-2">
							<Label>{m.product_seo_title()}</Label>
							<Input {...updateProduct.fields.seoTitle.as('text')} placeholder="SEO Title" />
							{#each updateProduct.fields.seoTitle.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- SEO Description -->
						<div class="space-y-2">
							<Label>
								{m.product_seo_description()}
							</Label>
							<Textarea
								{...updateProduct.fields.seoDescription.as('text')}
								placeholder="SEO Description"
								rows={3}
							/>
							{#each updateProduct.fields.seoDescription.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar (Right Column - 1/3) -->
			<div class="space-y-6">
				<!-- Status -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_status()}</Card.Title>
					</Card.Header>
					<Card.Content>
						<select
							{...updateProduct.fields.status.as('select')}
							class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm"
						>
							<option value="draft">{m.product_status_draft()}</option>
							<option value="active">{m.product_status_active()}</option>
							<option value="archived">{m.product_status_archived()}</option>
						</select>
						{#each updateProduct.fields.status.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</Card.Content>
				</Card.Root>

				<!-- Organization -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_organization()}</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<!-- Category -->
						<div class="space-y-2">
							<Label>{m.product_category()}</Label>
							{#await getAllCategories()}
								<select
									disabled
									class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm opacity-50"
								>
									<option>{m.common_loading()}</option>
								</select>
							{:then categories}
								<select
									{...updateProduct.fields.categoryId.as('select')}
									class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm"
								>
									<option value="">{m.product_select_category()}</option>
									{#each categories as category}
										<option value={category.id}>{category.name}</option>
									{/each}
								</select>
							{:catch error}
								<p class="text-destructive text-sm">{error.message}</p>
							{/await}
							{#each updateProduct.fields.categoryId.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Brand -->
						<div class="space-y-2">
							<Label>{m.product_brand()}</Label>
							{#await getAllBrands()}
								<select
									disabled
									class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm opacity-50"
								>
									<option>{m.common_loading()}</option>
								</select>
							{:then brands}
								<select
									{...updateProduct.fields.brandId.as('select')}
									class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm"
								>
									<option value="">{m.product_select_brand()}</option>
									{#each brands as brand}
										<option value={brand.id}>{brand.name}</option>
									{/each}
								</select>
							{:catch error}
								<p class="text-destructive text-sm">{error.message}</p>
							{/await}
							{#each updateProduct.fields.brandId.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Submit Button -->
				<Card.Root>
					<Card.Content class="sticky bottom-0 pt-6 lg:top-0 lg:bottom-auto">
						<Button type="submit" class="w-full" disabled={!!updateProduct.pending}>
							{updateProduct.pending ? m.common_saving() : m.common_save()}
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</form>
	</div>
{/if}

<!-- Asset Browser Dialog -->
<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleAssetSelect} />
