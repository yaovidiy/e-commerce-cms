<script lang="ts">
	import { createCategory } from '$lib/remotes/category.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { AssetBrowser } from '$lib/components/common/forms';
	import { getAssetById } from '$lib/remotes/asset.remote';
	import * as m from '$lib/paraglide/messages';
	import { ArrowLeft, Link, X } from '@lucide/svelte/icons';
	import { generateSlug } from '$lib/utils';
	import { goto } from '$app/navigation';
	import type { Asset } from '$lib/server/db/schema';

	let assetBrowserOpen = $state(false);
	let selectedImage = $state<Asset | null>(null);
	let isLoadingCategories = $state(true);

	// Load initial image if image is set
	$effect(() => {
		const imageId = createCategory.fields.image.value();
		if (imageId && !selectedImage) {
			getAssetById(imageId)
				.then((asset) => {
					selectedImage = asset;
				})
				.catch((error) => {
					console.error('Failed to load image:', error);
				});
		}
	});

	function handleGenerateSlug() {
		const name = createCategory.fields.name.value();
		if (name) {
			createCategory.fields.slug.set(generateSlug(name));
		}
	}

	function handleImageSelect(asset: Asset) {
		selectedImage = asset;
		createCategory.fields.image.set(asset.id);
		assetBrowserOpen = false;
	}

	function handleRemoveImage() {
		selectedImage = null;
		createCategory.fields.image.set('');
	}

	// Redirect to categories list after successful creation
	$effect(() => {
		if (createCategory.result) {
			goto('/admin/categories');
		}
	});
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button href="/admin/categories" variant="ghost" size="icon">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.category_create_new_category()}</h1>
			<p class="text-muted-foreground">{m.category_create_category_description()}</p>
		</div>
	</div>

	<!-- Form -->
	<form
		{...createCategory.enhance(async ({ submit }) => {
			try {
				await submit();
                goto(`/admin/categories`);
			} catch (error) {
				console.error('Failed to create category:', error);
			}
		})}
		class="grid gap-6 lg:grid-cols-3"
	>
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
						<Input {...createCategory.fields.name.as('text')} placeholder={m.category_name()} />
						{#each createCategory.fields.name.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Slug -->
					<div class="flex flex-col gap-2">
						<Label>{m.category_slug()}</Label>
						<div class="flex gap-2">
							<Input {...createCategory.fields.slug.as('text')} placeholder={m.category_slug()} />
							<Button type="button" variant="outline" onclick={handleGenerateSlug}>
								<Link class="size-4" />
							</Button>
						</div>
						{#each createCategory.fields.slug.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Description -->
					<div class="flex flex-col gap-2">
						<Label>{m.category_description()}</Label>
						<Textarea
							{...createCategory.fields.description.as('text')}
							placeholder={m.category_description()}
							rows={4}
						/>
						{#each createCategory.fields.description.issues() as issue}
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
							{...createCategory.fields.seoTitle.as('text')}
							placeholder={m.category_seo_title()}
						/>
						{#each createCategory.fields.seoTitle.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- SEO Description -->
					<div class="flex flex-col gap-2">
						<Label>{m.category_seo_description()}</Label>
						<Textarea
							{...createCategory.fields.seoDescription.as('text')}
							placeholder={m.category_seo_description()}
							rows={3}
						/>
						{#each createCategory.fields.seoDescription.issues() as issue}
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
								{...createCategory.fields.parentId.as('select')}
								class="bg-white border-input ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm"
							>
								<option value="">{m.common_none()}</option>
								{#each categories as category}
									<option value={category.id}>{category.name}</option>
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
						{#each createCategory.fields.parentId.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Display Order -->
					<div class="flex flex-col gap-2">
						<Label>{m.category_display_order()}</Label>
						<Input
							{...createCategory.fields.displayOrder.as('number')}
							type="number"
							placeholder="0"
						/>
						{#each createCategory.fields.displayOrder.issues() as issue}
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
							checked={createCategory.fields.isVisible.value()}
							onCheckedChange={(checked) => createCategory.fields.isVisible.set(checked)}
						/>
						<input
							type="checkbox"
							name="isVisible"
							checked={createCategory.fields.isVisible.value()}
							class="hidden"
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Actions -->
			<Card.Root>
				<Card.Content class="flex flex-col gap-2 pt-6">
					<Button type="submit" disabled={!!createCategory.pending} class="w-full">
						{createCategory.pending ? m.common_creating() : m.common_create()}
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
