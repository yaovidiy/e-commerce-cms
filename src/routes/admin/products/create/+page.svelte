<script lang="ts">
	import { createProduct } from '$lib/remotes/product.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { getAllBrands } from '$lib/remotes/brand.remote';
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

	// Local state for rich text editor
	let descriptionValue = $state('');

	// Local state for images
	let selectedImages = $state<Asset[]>([]);
	let assetBrowserOpen = $state(false);

	// Watch for description changes from RichTextEditor
	$effect(() => {
		createProduct.fields.description.set(descriptionValue);
	});

	// Watch for images changes
	$effect(() => {
		const imageIds = selectedImages.map((img) => img.id);
		createProduct.fields.images.set(JSON.stringify(imageIds));
	});

	// Manual slug generation handler
	function handleGenerateSlug() {
		const nameValue = createProduct.fields.name.value();
		if (nameValue) {
			createProduct.fields.slug.set(generateSlug(nameValue));
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

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button href="/admin/products" variant="ghost" size="sm">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.product_create_product()}</h1>
			<p class="text-muted-foreground">{m.product_create_product_description()}</p>
		</div>
	</div>

	<!-- Product Form -->
	<form
		{...createProduct.enhance(async ({ submit, form }) => {
			try {
				await submit();

				form.reset();
				goto('/admin/products');
			} catch (e) {}
		})}
		class="grid gap-6 md:grid-cols-3"
	>
		<!-- Main Content (Left Column - 2/3) -->
		<div class="space-y-6 md:col-span-2">
			<!-- Basic Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{m.product_product()}</Card.Title>
					<Card.Description>{m.product_create_product_description()}</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Product Name -->
					<div class="space-y-2">
						<Label>{m.product_name()}</Label>
						<Input
							{...createProduct.fields.name.as('text')}
							placeholder={m.product_name_placeholder()}
						/>
						{#each createProduct.fields.name.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- URL Slug -->
					<div class="space-y-2">
						<Label>{m.product_slug()}</Label>
						<Input
							{...createProduct.fields.slug.as('text')}
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
						{#each createProduct.fields.slug.issues() as issue}
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
						{#each createProduct.fields.description.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Images -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{m.product_images()}</Card.Title>
					<Card.Description>Add product images</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<input type="hidden" name="images" value={JSON.stringify(selectedImages.map((img) => img.id))} />
					
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
										<div class="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
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

					{#each createProduct.fields.images.issues() as issue}
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
							{...createProduct.fields.price.as('number')}
							placeholder="1000"
							min="0"
							step="1"
						/>
						<p class="text-muted-foreground text-xs">{m.product_price_in_cents()}</p>
						{#each createProduct.fields.price.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Compare At Price -->
					<div class="space-y-2">
						<Label>{m.product_compare_at_price()}</Label>
						<Input
							{...createProduct.fields.compareAtPrice.as('number')}
							placeholder="1500"
							min="0"
							step="1"
						/>
						<p class="text-muted-foreground text-xs">{m.product_price_in_cents()}</p>
						{#each createProduct.fields.compareAtPrice.issues() as issue}
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
							<Input {...createProduct.fields.sku.as('text')} placeholder="PROD-001" />
							{#each createProduct.fields.sku.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Barcode -->
						<div class="space-y-2">
							<Label>{m.product_barcode()}</Label>
							<Input {...createProduct.fields.barcode.as('text')} placeholder="1234567890123" />
							{#each createProduct.fields.barcode.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</div>

					<div class="grid gap-4 md:grid-cols-3">
						<!-- Quantity -->
						<div class="space-y-2">
							<Label>{m.product_quantity()}</Label>
							<Input
								{...createProduct.fields.quantity.as('number')}
								placeholder="0"
								min="0"
								step="1"
							/>
							{#each createProduct.fields.quantity.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Low Stock Threshold -->
						<div class="space-y-2">
							<Label>
								{m.product_low_stock_threshold()}
							</Label>
							<Input
								{...createProduct.fields.lowStockThreshold.as('number')}
								placeholder="10"
								min="0"
								step="1"
							/>
							{#each createProduct.fields.lowStockThreshold.issues() as issue}
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
									onCheckedChange={(checked) => createProduct.fields.trackInventory.set(checked)}
								/>
								<input {...createProduct.fields.trackInventory.as('checkbox')} hidden />
							</div>
						</div>
					</div>

					<!-- Allow Backorders Switch -->
					<div class="flex items-center gap-2 space-x-2">
						<Label class="text-sm font-normal">
							{m.product_allow_backorders()}
						</Label>
						<Switch
							onCheckedChange={(checked) => createProduct.fields.allowBackorders.set(checked)}
						/>
						<input {...createProduct.fields.allowBackorders.as('checkbox')} hidden />
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
						<Input {...createProduct.fields.seoTitle.as('text')} placeholder="SEO Title" />
						{#each createProduct.fields.seoTitle.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- SEO Description -->
					<div class="space-y-2">
						<Label>
							{m.product_seo_description()}
						</Label>
						<Textarea
							{...createProduct.fields.seoDescription.as('text')}
							placeholder="SEO Description"
							rows={3}
						/>
						{#each createProduct.fields.seoDescription.issues() as issue}
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
						{...createProduct.fields.status.as('select')}
						class="bg-background border-input ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm"
					>
						<option value="draft">{m.product_status_draft()}</option>
						<option value="active">{m.product_status_active()}</option>
						<option value="archived">{m.product_status_archived()}</option>
					</select>
					{#each createProduct.fields.status.issues() as issue}
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
								{...createProduct.fields.categoryId.as('select')}
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
						{#each createProduct.fields.categoryId.issues() as issue}
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
								{...createProduct.fields.brandId.as('select')}
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
						{#each createProduct.fields.brandId.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Submit Button -->
			<Card.Root>
				<Card.Content class="sticky bottom-0 pt-6 lg:top-0 lg:bottom-auto">
					<Button type="submit" class="w-full" disabled={!!createProduct.pending}>
						{createProduct.pending ? m.common_creating() : m.common_create()}
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</form>
</div>

<!-- Asset Browser Dialog -->
<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleAssetSelect} />
