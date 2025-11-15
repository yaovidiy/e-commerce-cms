<script lang="ts">
	import { createBrand } from '$lib/remotes/brand.remote';
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
	import type { Asset } from '$lib/server/db/schema';

	let assetBrowserOpen = $state(false);
	let selectedLogo = $state<Asset | null>(null);

	// Load initial logo if logo is set
	$effect(() => {
		const logoId = createBrand.fields.logo.value();
		if (logoId && !selectedLogo) {
			getAssetById(logoId)
				.then((asset) => {
					selectedLogo = asset;
				})
				.catch((error) => {
					console.error('Failed to load logo:', error);
				});
		}
	});

	function handleGenerateSlug() {
		const name = createBrand.fields.name.value();
		if (name) {
			createBrand.fields.slug.set(generateSlug(name));
		}
	}

	function handleLogoSelect(asset: Asset) {
		selectedLogo = asset;
		createBrand.fields.logo.set(asset.id);
		assetBrowserOpen = false;
	}

	function handleRemoveLogo() {
		selectedLogo = null;
		createBrand.fields.logo.set('');
	}

	// Redirect to brands list after successful creation
	$effect(() => {
		if (createBrand.result) {
			goto('/admin/brands');
		}
	});
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button href="/admin/brands" variant="ghost" size="icon">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.brand_create_new_brand()}</h1>
			<p class="text-muted-foreground">{m.brand_create_brand_description()}</p>
		</div>
	</div>

	<!-- Form -->
	<form
		{...createBrand.enhance(async ({ submit, data }) => {
			try {
                console.log('Submitting brand creation form', data);
				await submit();
			} catch (error) {
				console.error('Failed to create brand:', error);
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
						<Label>{m.brand_name()}</Label>
						<Input {...createBrand.fields.name.as('text')} placeholder={m.brand_name()} />
						{#each createBrand.fields.name.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Slug -->
					<div class="flex flex-col gap-2">
						<Label>{m.brand_slug()}</Label>
						<div class="flex gap-2">
							<Input {...createBrand.fields.slug.as('text')} placeholder={m.brand_slug()} />
							<Button type="button" variant="outline" onclick={handleGenerateSlug}>
								<Link class="size-4" />
							</Button>
						</div>
						{#each createBrand.fields.slug.issues() as issue}
							<p class="text-destructive text-sm">{issue.message}</p>
						{/each}
					</div>

					<!-- Description -->
					<div class="flex flex-col gap-2">
						<Label>{m.brand_description()}</Label>
						<Textarea
							{...createBrand.fields.description.as('text')}
							placeholder={m.brand_description()}
							rows={4}
						/>
						{#each createBrand.fields.description.issues() as issue}
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
							checked={createBrand.fields.isVisible.value()}
							onCheckedChange={(checked) => createBrand.fields.isVisible.set(checked)}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Actions -->
			<Card.Root>
				<Card.Content class="flex flex-col gap-2 pt-6">
					<Button type="submit" disabled={!!createBrand.pending} class="w-full">
						{createBrand.pending ? m.common_creating() : m.common_create()}
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
