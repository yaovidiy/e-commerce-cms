<script lang="ts">
	import { updateBanner, getAllBanners } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { AssetBrowser } from '$lib/components/common/forms';
	import * as m from '$lib/paraglide/messages';
	import { Image } from '@lucide/svelte/icons';
	import type { Asset } from '$lib/server/db/schema';

	type Banner = {
		id: string;
		title: string;
		imageId: string | null;
		imageUrl: string | null;
		link: string | null;
		linkText: string | null;
		position: 'home_hero' | 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer';
		displayOrder: number;
		startsAt: Date | null;
		endsAt: Date | null;
		isActive: boolean;
	};

	let { banner, open = $bindable(false) }: { banner: Banner | null; open?: boolean } = $props();
	let assetBrowserOpen = $state(false);
	let selectedAsset = $state<Asset | null>(null);

	$effect(() => {
		if (open && banner) {
			selectedAsset = null;
			updateBanner.fields.set({
				id: banner.id,
				title: banner.title,
				imageUrl: banner.imageUrl || '',
				link: banner.link || '',
				linkText: banner.linkText || '',
				position: banner.position,
				displayOrder: banner.displayOrder,
				startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : '',
				endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : '',
				isActive: banner.isActive
			});
		}
	});

	$effect(() => {
		if (updateBanner.result) {
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

	const PositionLabel = $derived.by(() => {
		const position = updateBanner.fields.position.value();
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

	function handleAssetSelect(asset: Asset) {
		selectedAsset = asset;
		updateBanner.fields.imageId.set(asset.id);
		updateBanner.fields.imageUrl.set('');
	}

	function clearImage() {
		selectedAsset = null;
		updateBanner.fields.imageId.set('');
		updateBanner.fields.imageUrl.set('');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{m.banner_edit_banner()}</Dialog.Title>
			<Dialog.Description>{m.banner_edit_banner_description()}</Dialog.Description>
		</Dialog.Header>
		<form {...updateBanner} class="space-y-4">
			<input {...updateBanner.fields.id.as('hidden', banner?.id || '')} />

			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_basic_information()}</h3>

				<div class="space-y-2">
					<Label>{m.banner_title()}</Label>
					<Input {...updateBanner.fields.title.as('text')} placeholder={m.banner_title_placeholder()} />
					{#each updateBanner.fields.title.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>{m.banner_image()}</Label>
					<div class="space-y-2">
						{#if selectedAsset || banner?.imageUrl || banner?.imageId}
							<div class="relative w-full h-32 border rounded-lg overflow-hidden">
								<img
									src={selectedAsset
										? selectedAsset.thumbnailUrl || selectedAsset.url
										: banner?.imageUrl || ''}
									alt={selectedAsset?.originalFilename || banner?.title}
									class="w-full h-full object-cover"
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
					{#if selectedAsset}
						<input type="hidden" name="imageId" value={selectedAsset.id} />
					{:else if banner?.imageId}
						<input type="hidden" name="imageId" value={banner.imageId} />
					{/if}
				</div>

				<div class="space-y-2">
					<Label>{m.banner_link()}</Label>
					<Input {...updateBanner.fields.link.as('text')} placeholder={m.banner_link_placeholder()} />
				</div>

				<div class="space-y-2">
					<Label>{m.banner_link_text()}</Label>
					<Input
						{...updateBanner.fields.linkText.as('text')}
						placeholder={m.banner_link_text_placeholder()}
					/>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_display_settings()}</h3>

				<div class="space-y-2">
					<Label>{m.banner_position()}</Label>
					<Select.Root
						type="single"
						value={updateBanner.fields.position.value()}
						onValueChange={(value) =>
							updateBanner.fields.position.set(
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
							<Select.Item value="product_sidebar">{m.banner_position_product_sidebar()}</Select.Item>
							<Select.Item value="footer">{m.banner_position_footer()}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label>{m.banner_display_order()}</Label>
					<Input {...updateBanner.fields.displayOrder.as('number')} type="number" min="0" />
				</div>

				<div class="flex items-center justify-between space-x-2">
					<Label class="text-sm font-normal">{m.banner_is_active()}</Label>
					<Switch
						checked={updateBanner.fields.isActive.value()}
						onCheckedChange={(checked) => updateBanner.fields.isActive.set(checked)}
					/>
					<input {...updateBanner.fields.isActive.as('checkbox')} hidden />
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium">{m.banner_scheduling()}</h3>

				<div class="space-y-2">
					<Label>{m.banner_starts_at()}</Label>
					<Input {...updateBanner.fields.startsAt.as('text')} type="datetime-local" />
				</div>

				<div class="space-y-2">
					<Label>{m.banner_ends_at()}</Label>
					<Input {...updateBanner.fields.endsAt.as('text')} type="datetime-local" />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!updateBanner.pending}>
					{updateBanner.pending ? m.common_saving() : m.common_save()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AssetBrowser bind:open={assetBrowserOpen} onSelect={handleAssetSelect} />
