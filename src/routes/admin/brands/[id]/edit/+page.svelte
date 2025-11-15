<script lang="ts">
	import { updateBrand, getBrandById } from '$lib/remotes/brand.remote';
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
	import type { Asset, Brand } from '$lib/server/db/schema';

	const brandId = $page.params.id;

	// Redirect if no ID provided
	if (!brandId) {
		goto('/admin/brands');
	}

	let assetBrowserOpen = $state(false);
	let selectedLogo = $state<Asset | null>(null);
	let isLoading = $state(true);
	let brand = $state<Brand | null>(null);

	// Load brand data
	$effect(() => {
		if (brandId) {
			isLoading = true;
			getBrandById(brandId)
				.then(async (loadedBrand) => {
					brand = loadedBrand;

					// Pre-populate form
					updateBrand.fields.set({
						id: loadedBrand.id,
						name: loadedBrand.name,
						slug: loadedBrand.slug,
						description: loadedBrand.description || '',
						logo: loadedBrand.logo || '',
						isVisible: loadedBrand.isVisible
					});

					// Load logo if exists
					if (loadedBrand.logo) {
						try {
							const asset = await getAssetById(loadedBrand.logo);
							selectedLogo = asset;
						} catch (error) {
							console.error('Failed to load logo:', error);
						}
					}

					isLoading = false;
				})
				.catch((error) => {
					console.error('Failed to load brand:', error);
					isLoading = false;
				});
		}
	});

	function handleGenerateSlug() {
		const name = updateBrand.fields.name.value();
		if (name) {
			updateBrand.fields.slug.set(generateSlug(name));
		}
	}

	function handleLogoSelect(asset: Asset) {
		selectedLogo = asset;
		updateBrand.fields.logo.set(asset.id);
		assetBrowserOpen = false;
	}

	function handleRemoveLogo() {
		selectedLogo = null;
		updateBrand.fields.logo.set('');
	}

	// Redirect to brands list after successful update
	$effect(() => {
		if (updateBrand.result) {
			goto('/admin/brands');
		}
	});
</script>

{#if isLoading}
	<div class="flex items-center justify-center p-8">
		<p class="text-muted-foreground">{m.common_loading()}</p>
	</div>
{:else if brand}
	<div class="flex flex-col gap-6 p-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<Button href="/admin/brands" variant="ghost" size="icon">
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{m.brand_edit_brand()}</h1>
				<p class="text-muted-foreground">{m.brand_edit_brand_description()}</p>
			</div>
		</div>

		<!-- Form -->
		<form
			{...updateBrand.enhance(async ({ submit }) => {
				try {
					await submit();
				} catch (error) {
					console.error('Failed to update brand:', error);
				}
			})}
			class="grid gap-6 lg:grid-cols-3"
		>
			<!-- Hidden ID field -->
			<input type="hidden" name="id" value={brandId} />

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
							<Label>{m.brand_name()}</Label>
							<Input {...updateBrand.fields.name.as('text')} placeholder={m.brand_name()} />
							{#each updateBrand.fields.name.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Slug -->
						<div class="flex flex-col gap-2">
							<Label>{m.brand_slug()}</Label>
							<div class="flex gap-2">
								<Input {...updateBrand.fields.slug.as('text')} placeholder={m.brand_slug()} />
								<Button type="button" variant="outline" onclick={handleGenerateSlug}>
									<Link class="size-4" />
								</Button>
							</div>
							{#each updateBrand.fields.slug.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>

						<!-- Description -->
						<div class="flex flex-col gap-2">
							<Label>{m.brand_description()}</Label>
							<Textarea
								{...updateBrand.fields.description.as('text')}
								placeholder={m.brand_description()}
								rows={4}
							/>
							{#each updateBrand.fields.description.issues() as issue}
								<p class="text-destructive text-sm">{issue.message}</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Sidebar -->
			<div class="flex flex-col gap-6">
				<!-- Logo -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{m.brand_logo()}</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						{#if selectedLogo}
							<div class="relative">
								<img
									src={selectedLogo.url}
									alt={selectedLogo.originalFilename}
									class="border-border h-48 w-full rounded-md border object-contain bg-white"
								/>
								<Button
									type="button"
									variant="destructive"
									size="icon"
									class="absolute right-2 top-2"
									onclick={handleRemoveLogo}
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
							{selectedLogo ? m.product_change_image() : m.product_select_image()}
						</Button>

						<!-- Hidden input for form submission -->
						<input type="hidden" name="logo" value={selectedLogo?.id || ''} />
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
							<Label>{m.brand_is_visible()}</Label>
							<Switch
								checked={updateBrand.fields.isVisible.value()}
								onCheckedChange={(checked) => updateBrand.fields.isVisible.set(checked)}
							/>
						</div>
						<!-- Hidden checkbox for form submission -->
						<input {...updateBrand.fields.isVisible.as('checkbox')} class="hidden" />
					</Card.Content>
				</Card.Root>

				<!-- Actions -->
				<Card.Root>
					<Card.Content class="flex flex-col gap-2 pt-6">
						<Button type="submit" disabled={!!updateBrand.pending} class="w-full">
							{updateBrand.pending ? m.common_saving() : m.common_save()}
						</Button>
						<Button type="button" variant="outline" href="/admin/brands" class="w-full">
							{m.common_cancel()}
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</form>
	</div>

	<!-- Asset Browser Dialog -->
	<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleLogoSelect} />
{/if}
