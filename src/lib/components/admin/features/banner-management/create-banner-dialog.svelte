<script lang="ts">
	import { createBanner, getAllBanners } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { AssetBrowser } from '$lib/components/common/forms';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Image } from '@lucide/svelte/icons';
	import type { Asset } from '$lib/server/db/schema';

	let open = $state(false);
	let assetBrowserOpen = $state(false);
	let selectedAsset = $state<Asset | null>(null);

	const PositionLabel = $derived.by(() => {
		const position = createBanner.fields.position.value();
		switch (position) {
			case 'home_hero':
				return m.banner_position_home_hero();
			case 'home_secondary':
				return m.banner_position_home_secondary();
			case 'category_top':
				return m.banner_position_category_top();
			case 'product_sidebar':
				return m.banner_position_product_sidebar();
			case 'footer':
				return m.banner_position_footer();
			default:
				return m.banner_position();
		}
	});

	// Auto-refresh banners list when dialog closes after successful creation
	$effect(() => {
		if (createBanner.result && open) {
			open = false;
			getAllBanners({
				title: '',
				position: 'all',
				isActive: 'all',
				page: 1,
				pageSize: 10,
				sortField: 'displayOrder',
				sortDirection: 'asc'
			}).refresh();
		}
	});

	function handleAssetSelect(asset: Asset) {
		selectedAsset = asset;
		createBanner.fields.imageId.set(asset.id);
		createBanner.fields.imageUrl.set('');
	}

	function clearImage() {
		selectedAsset = null;
		createBanner.fields.imageId.set('');
		createBanner.fields.imageUrl.set('');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button>
			<Plus class="mr-2 h-4 w-4" />
			{m.banner_create_banner()}
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{m.banner_create_banner()}</Dialog.Title>
			<Dialog.Description>{m.banner_create_banner_description()}</Dialog.Description>
		</Dialog.Header>
		<form {...createBanner} class="space-y-4">
			<!-- Basic Information -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_basic_information()}</h3>

				<!-- Title -->
				<div class="space-y-2">
					<Label>{m.banner_title()}</Label>
					<Input
						{...createBanner.fields.title.as('text')}
						placeholder={m.banner_title_placeholder()}
					/>
					{#each createBanner.fields.title.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<!-- Image -->
				<div class="space-y-2">
					<Label>{m.banner_image()}</Label>
					<div class="space-y-2">
						{#if selectedAsset}
							<div class="relative h-32 w-full overflow-hidden rounded-lg border">
								<img
									src={selectedAsset.thumbnailUrl || selectedAsset.url}
									alt={selectedAsset.originalFilename}
									class="h-full w-full object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute top-2 right-2"
									onclick={clearImage}
								>
									{m.common_remove()}
								</Button>
							</div>
						{:else}
							<Button
								type="button"
								variant="outline"
								class="w-full"
								onclick={() => (assetBrowserOpen = true)}
							>
								<Image class="mr-2 h-4 w-4" />
								{m.asset_select_image()}
							</Button>
						{/if}
						<p class="text-muted-foreground text-xs">{m.banner_image_help()}</p>
					</div>
					<input type="hidden" name="imageId" value={selectedAsset?.id} />
				</div>

				<!-- Link -->
				<div class="space-y-2">
					<Label>{m.banner_link()}</Label>
					<Input
						{...createBanner.fields.link.as('text')}
						placeholder={m.banner_link_placeholder()}
					/>
					{#each createBanner.fields.link.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<!-- Link Text -->
				<div class="space-y-2">
					<Label>{m.banner_link_text()}</Label>
					<Input
						{...createBanner.fields.linkText.as('text')}
						placeholder={m.banner_link_text_placeholder()}
					/>
					{#each createBanner.fields.linkText.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<!-- Display Settings -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_display_settings()}</h3>

				<!-- Position -->
				<div class="space-y-2">
					<Label>{m.banner_position()}</Label>
					<Select.Root
						type="single"
						value={createBanner.fields.position.value()}
						onValueChange={(value) =>
							createBanner.fields.position.set(
								value as
									| 'home_hero'
									| 'home_secondary'
									| 'category_top'
									| 'product_sidebar'
									| 'footer'
							)}
					>
						<Select.Trigger>{PositionLabel}</Select.Trigger>
						<Select.Content>
							<Select.Item value="home_hero">{m.banner_position_home_hero()}</Select.Item>
							<Select.Item value="home_secondary">{m.banner_position_home_secondary()}</Select.Item>
							<Select.Item value="category_top">{m.banner_position_category_top()}</Select.Item>
							<Select.Item value="product_sidebar"
								>{m.banner_position_product_sidebar()}</Select.Item
							>
							<Select.Item value="footer">{m.banner_position_footer()}</Select.Item>
						</Select.Content>
					</Select.Root>
					<p class="text-muted-foreground text-xs">{m.banner_position_help()}</p>
				</div>

				<!-- Display Order -->
				<div class="space-y-2">
					<Label>{m.banner_display_order()}</Label>
					<Input
						{...createBanner.fields.displayOrder.as('number')}
						type="number"
						min="0"
						placeholder="0"
					/>
					<p class="text-muted-foreground text-xs">{m.banner_display_order_help()}</p>
				</div>

				<!-- Is Active -->
				<div class="flex items-center justify-between space-x-2">
					<Label class="text-sm font-normal">{m.banner_is_active()}</Label>
					<Switch onCheckedChange={(checked) => createBanner.fields.isActive.set(checked)} />
					<input {...createBanner.fields.isActive.as('checkbox')} hidden />
				</div>
			</div>

			<!-- Scheduling -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_scheduling()}</h3>

				<!-- Starts At -->
				<div class="space-y-2">
					<Label>{m.banner_starts_at()}</Label>
					<Input {...createBanner.fields.startsAt.as('text')} type="datetime-local" />
					<p class="text-muted-foreground text-xs">{m.banner_starts_at_help()}</p>
				</div>

				<!-- Ends At -->
				<div class="space-y-2">
					<Label>{m.banner_ends_at()}</Label>
					<Input {...createBanner.fields.endsAt.as('text')} type="datetime-local" />
					<p class="text-muted-foreground text-xs">{m.banner_ends_at_help()}</p>
				</div>
			</div>

			<!-- Form-level errors -->
			{#each createBanner.fields.allIssues() as issue}
				{#if !issue.path || issue.path.length === 0}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/if}
			{/each}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!createBanner.pending}>
					{createBanner.pending ? m.common_creating() : m.common_create()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleAssetSelect} />
