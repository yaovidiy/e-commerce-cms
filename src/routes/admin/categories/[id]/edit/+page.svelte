<script lang="ts">
	import { updateCategory, getCategoryById, getAllCategories } from '$lib/remotes/category.remote';
	import { getAssetById } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { AssetBrowser } from '$lib/components/common/forms';
	import * as m from '$lib/paraglide/messages';
	import { ArrowLeft, Link, X } from '@lucide/svelte/icons';
	import { generateSlug } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Asset, Category } from '$lib/server/db/schema';

	const categoryId = $page.params.id;

	// Redirect if no ID provided
	if (!categoryId) {
		goto('/admin/categories');
	}

	let assetBrowserOpen = $state(false);
	let selectedImage = $state<Asset | null>(null);
	let isLoading = $state(true);
	let category = $state<Category | null>(null);

	// Load category data
	$effect(() => {
		if (categoryId) {
			isLoading = true;
			getCategoryById(categoryId)
				.then(async (loadedCategory) => {
					category = loadedCategory;

					// Pre-populate form
					updateCategory.fields.set({
						id: loadedCategory.id,
						name: loadedCategory.name,
						slug: loadedCategory.slug,
						description: loadedCategory.description || '',
						parentId: loadedCategory.parentId || '',
						image: loadedCategory.image || '',
						displayOrder: loadedCategory.displayOrder,
						isVisible: loadedCategory.isVisible,
						seoTitle: loadedCategory.seoTitle || '',
						seoDescription: loadedCategory.seoDescription || ''
					});

					// Load image if exists
					if (loadedCategory.image) {
						try {
							const asset = await getAssetById(loadedCategory.image);
							selectedImage = asset;
						} catch (error) {
							console.error('Failed to load image:', error);
						}
					}

					isLoading = false;
				})
				.catch((error) => {
					console.error('Failed to load category:', error);
					isLoading = false;
				});
		}
	});

	function handleGenerateSlug() {
		const name = updateCategory.fields.name.value();
		if (name) {
			updateCategory.fields.slug.set(generateSlug(name));
		}
	}

	function handleImageSelect(asset: Asset) {
		selectedImage = asset;
		updateCategory.fields.image.set(asset.id);
		assetBrowserOpen = false;
	}

	function handleRemoveImage() {
		selectedImage = null;
		updateCategory.fields.image.set('');
	}

	// Redirect to categories list after successful update
	$effect(() => {
		if (updateCategory.result) {
			goto('/admin/categories');
		}
	});
</script>

{#if isLoading}
	<div class="flex items-center justify-center p-8">
		<p class="text-muted-foreground">{m.common_loading()}</p>
	</div>
{:else if category}
	<div class="flex flex-col gap-6 p-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<Button href="/admin/categories" variant="ghost" size="icon">
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{m.category_edit_category()}</h1>
				<p class="text-muted-foreground">{m.category_edit_category_description()}</p>
			</div>
		</div>

		<!-- Form -->
		<form
			{...updateCategory.enhance(async ({ submit }) => {
				try {
					await submit();
				} catch (error) {
					console.error('Failed to update category:', error);
				}
			})}
			class="grid gap-6 lg:grid-cols-3"
		>
			<!-- Hidden ID field -->
			<input type="hidden" name="id" value={categoryId} />

			<!-- Main Content -->
			<div class="flex flex-col gap-6 lg:col-span-2">
				<!-- Basic Information -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_basic_information()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<!-- Name -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_name()}</Label>
							<Input
								{...updateCategory.fields.name.as('text')}
								placeholder={m.category_name()}
							/>
							{#each updateCategory.fields.name.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Slug -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_slug()}</Label>
							<div class="flex gap-2">
								<Input
									{...updateCategory.fields.slug.as('text')}
									placeholder={m.category_slug()}
								/>
								<Button type="button" variant="outline" onclick={handleGenerateSlug}>
									<Link class="size-4" />
								</Button>
							</div>
							{#each updateCategory.fields.slug.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Description -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_description()}</Label>
							<Textarea
								{...updateCategory.fields.description.as('text')}
								placeholder={m.category_description()}
								rows={4}
							/>
							{#each updateCategory.fields.description.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- SEO Settings -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_seo()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<!-- SEO Title -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_seo_title()}</Label>
							<Input
								{...updateCategory.fields.seoTitle.as('text')}
								placeholder={m.category_seo_title()}
							/>
							{#each updateCategory.fields.seoTitle.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- SEO Description -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_seo_description()}</Label>
							<Textarea
								{...updateCategory.fields.seoDescription.as('text')}
								placeholder={m.category_seo_description()}
								rows={3}
							/>
							{#each updateCategory.fields.seoDescription.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar -->
			<div class="flex flex-col gap-6">
				<!-- Organization -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.product_organization()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<!-- Parent Category -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_parent_category()}</Label>
							{#await getAllCategories()}
								<select
									disabled
									class="bg-white border-input ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm"
								>
									<option>{m.common_loading()}</option>
								</select>
							{:then categories}
								<select
									{...updateCategory.fields.parentId.as('select')}
									class="bg-white border-input ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm"
								>
									<option value="">{m.common_none()}</option>
									{#each categories.filter((c) => c.id !== categoryId) as cat}
										<option value={cat.id}>{cat.name}</option>
									{/each}
								</select>
							{:catch}
								<select
									disabled
									class="bg-white border-input ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm"
								>
									<option>{m.common_error()}</option>
								</select>
							{/await}
							{#each updateCategory.fields.parentId.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Display Order -->
						<div class="flex flex-col gap-2">
							<Label>{m.category_display_order()}</Label>
							<Input
								{...updateCategory.fields.displayOrder.as('number')}
								type="number"
								placeholder="0"
							/>
							{#each updateCategory.fields.displayOrder.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Image -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.category_image()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						{#if selectedImage}
							<div class="relative">
								<img
									src={selectedImage.url}
									alt={selectedImage.originalFilename}
									class="border-border h-48 w-full rounded-md border object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									class="absolute right-2 top-2"
									onclick={handleRemoveImage}
								>
									<X class="size-4" />
								</Button>
							</div>
						{:else}
							<div
								class="border-border bg-muted flex h-48 items-center justify-center rounded-md border border-dashed"
							>
								<p class="text-muted-foreground text-sm">{m.product_no_image()}</p>
							</div>
						{/if}

						<Button type="button" variant="outline" onclick={() => (assetBrowserOpen = true)}>
							{selectedImage ? m.product_change_image() : m.product_select_image()}
						</Button>

						<!-- Hidden input for form submission -->
						<input type="hidden" name="image" value={selectedImage?.id || ''} />
					</Card.Content>
				</Card.Root>

				<!-- Settings -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.common_settings()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<!-- Is Visible -->
						<div class="flex items-center justify-between">
							<Label>{m.category_is_visible()}</Label>
							<Switch
								checked={updateCategory.fields.isVisible.value()}
								onCheckedChange={(checked) => updateCategory.fields.isVisible.set(checked)}
							/>
							<input
								type="checkbox"
								name="isVisible"
								checked={updateCategory.fields.isVisible.value()}
								class="hidden"
							/>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Actions -->
				<Card.Root>
					<Card.Content class="flex flex-col gap-2 pt-6">
						<Button type="submit" disabled={!!updateCategory.pending} class="w-full">
							{updateCategory.pending ? m.common_saving() : m.common_save()}
						</Button>
						<Button type="button" variant="outline" href="/admin/categories" class="w-full">
							{m.common_cancel()}
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</form>
	</div>

	<!-- Asset Browser Dialog -->
	<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleImageSelect} />
{/if}
