<script lang="ts">
	import { getAllBanners, toggleBannerStatus } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import EditBannerDialog from './edit-banner-dialog.svelte';
	import DeleteBannerDialog from './delete-banner-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		MoreHorizontal,
		Pencil,
		Trash2,
		Eye,
		EyeOff,
		Search,
		ChevronLeft,
		ChevronRight,
		Image as ImageIcon
	} from '@lucide/svelte';

	let searchQuery = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);
	let positionFilter = $state<'all' | 'home_hero' | 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer'>('all');
	let statusFilter = $state<'all' | 'true' | 'false'>('all');

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
		createdAt: Date;
		updatedAt: Date;
	};

	let editingBanner = $state<null | Banner>(null);
	let deletingBanner = $state<null | Banner>(null);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	function openEditDialog(banner: Banner) {
		if (!banner) return;
		editingBanner = banner;
		editDialogOpen = true;
	}

	function openDeleteDialog(banner: Banner) {
		if (!banner) return;
		deletingBanner = banner;
		deleteDialogOpen = true;
	}

	async function handleToggleStatus(banner: Banner) {
		await toggleBannerStatus({ id: banner.id });
	}

	function handleSearchChange() {
		currentPage = 1;
	}

	function getPositionLabel(position: string): string {
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
				return position;
		}
	}

	function getPositionBadgeVariant(position: string): 'default' | 'secondary' | 'outline' | 'destructive' {
		switch (position) {
			case 'home_hero':
				return 'default';
			case 'home_secondary':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function getBannerStatus(banner: Banner): { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' } {
		if (!banner.isActive) {
			return { label: m.banner_status_inactive(), variant: 'outline' };
		}

		const now = new Date();

		// Check if scheduled (starts in future)
		if (banner.startsAt && banner.startsAt > now) {
			return { label: m.banner_status_scheduled(), variant: 'secondary' };
		}

		// Check if expired (ended in past)
		if (banner.endsAt && banner.endsAt < now) {
			return { label: m.banner_status_expired(), variant: 'destructive' };
		}

		return { label: m.banner_status_active(), variant: 'default' };
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		if (date instanceof Date) {
			return date.toLocaleDateString();
		}
		return new Date(date as string | number).toLocaleDateString();
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Filters -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input
				type="text"
				placeholder={m.banner_search_placeholder()}
				bind:value={searchQuery}
				oninput={handleSearchChange}
				class="pl-9"
			/>
		</div>

		<Select.Root
			type="single"
			value={positionFilter}
			onValueChange={(value) => {
				if (value) {
					positionFilter = value as typeof positionFilter;
					currentPage = 1;
				}
			}}
		>
			<Select.Trigger class="w-[180px]">
				{positionFilter === 'all'
					? m.banner_all()
					: positionFilter === 'home_hero'
						? m.banner_position_home_hero()
						: positionFilter === 'home_secondary'
							? m.banner_position_home_secondary()
							: positionFilter === 'category_top'
								? m.banner_position_category_top()
								: positionFilter === 'product_sidebar'
									? m.banner_position_product_sidebar()
									: m.banner_position_footer()}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">{m.banner_all()}</Select.Item>
				<Select.Item value="home_hero">{m.banner_position_home_hero()}</Select.Item>
				<Select.Item value="home_secondary">{m.banner_position_home_secondary()}</Select.Item>
				<Select.Item value="category_top">{m.banner_position_category_top()}</Select.Item>
				<Select.Item value="product_sidebar">{m.banner_position_product_sidebar()}</Select.Item>
				<Select.Item value="footer">{m.banner_position_footer()}</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root
			type="single"
			value={statusFilter}
			onValueChange={(value) => {
				if (value) {
					statusFilter = value as typeof statusFilter;
					currentPage = 1;
				}
			}}
		>
			<Select.Trigger class="w-[150px]">
				{statusFilter === 'all'
					? m.common_all()
					: statusFilter === 'true'
						? m.banner_status_active()
						: m.banner_status_inactive()}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">{m.common_all()}</Select.Item>
				<Select.Item value="true">{m.banner_status_active()}</Select.Item>
				<Select.Item value="false">{m.banner_status_inactive()}</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Table -->
	<div class="rounded-md border">
		<div class="w-full">
			<div class="bg-muted/50 border-b px-4 py-3">
				<div class="grid grid-cols-8 gap-4 font-medium">
					<div class="col-span-2">{m.banner_title()}</div>
					<div>{m.banner_position()}</div>
					<div>{m.common_status()}</div>
					<div>{m.banner_display_order()}</div>
					<div>{m.banner_starts_at()}</div>
					<div>{m.banner_ends_at()}</div>
					<div class="text-right">{m.common_actions()}</div>
				</div>
			</div>
			<div>
				{#await getAllBanners({ title: searchQuery, position: positionFilter, isActive: statusFilter, page: currentPage, pageSize, sortField: 'displayOrder', sortDirection: 'asc' })}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">{m.common_loading()}</div>
				{:then result}
					{#each result.banners as banner (banner.id)}
						<div class="hover:bg-muted/50 border-b px-4 py-3 last:border-0">
							<div class="grid grid-cols-8 items-center gap-4">
								<!-- Title with image thumbnail -->
								<div class="col-span-2 flex items-center gap-2">
									<div class="bg-muted flex h-10 w-10 items-center justify-center rounded overflow-hidden">
										{#if banner.imageUrl || banner.imageId}
											<ImageIcon class="text-muted-foreground h-5 w-5" />
										{:else}
											<ImageIcon class="text-muted-foreground h-5 w-5" />
										{/if}
									</div>
									<div class="flex flex-col">
										<span class="font-medium text-sm">{banner.title}</span>
										{#if banner.link}
											<span class="text-muted-foreground text-xs truncate max-w-[200px]" title={banner.link}>
												{banner.link}
											</span>
										{/if}
									</div>
								</div>

								<!-- Position -->
								<div>
									<Badge variant={getPositionBadgeVariant(banner.position)}>
										{getPositionLabel(banner.position)}
									</Badge>
								</div>

								<!-- Status -->
								<div>
									{#each [getBannerStatus(banner)] as status}
										<Badge variant={status.variant}>
											{status.label}
										</Badge>
									{/each}
								</div>

								<!-- Display Order -->
								<div class="text-muted-foreground text-sm">
									{banner.displayOrder}
								</div>

								<!-- Starts At -->
								<div class="text-muted-foreground text-sm">
									{formatDate(banner.startsAt)}
								</div>

								<!-- Ends At -->
								<div class="text-muted-foreground text-sm">
									{formatDate(banner.endsAt)}
								</div>

								<!-- Actions -->
								<div class="flex items-center justify-end gap-2">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Button variant="ghost" size="icon">
												<MoreHorizontal class="h-4 w-4" />
												<span class="sr-only">{m.common_actions()}</span>
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => openEditDialog(banner)}>
												<Pencil class="mr-2 h-4 w-4" />
												{m.banner_edit_banner()}
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => handleToggleStatus(banner)}>
												{#if banner.isActive}
													<EyeOff class="mr-2 h-4 w-4" />
													{m.common_deactivate()}
												{:else}
													<Eye class="mr-2 h-4 w-4" />
													{m.common_activate()}
												{/if}
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												onclick={() => openDeleteDialog(banner)}
												class="text-destructive"
											>
												<Trash2 class="mr-2 h-4 w-4" />
												{m.banner_delete_banner()}
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</div>
						</div>
					{:else}
						<div class="px-4 py-8 text-center text-sm text-muted-foreground">
							{m.banner_no_banners()}
						</div>
					{/each}

					<!-- Pagination -->
					{#if result.pagination.totalCount > 0}
						<div class="border-t px-4 py-3">
							<div class="flex items-center justify-between">
								<p class="text-sm text-muted-foreground">
									Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(
										currentPage * pageSize,
										result.pagination.totalCount
									)} of {result.pagination.totalCount} banners
								</p>

								<div class="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={currentPage <= 1}
										onclick={() => currentPage--}
									>
										<ChevronLeft class="h-4 w-4 mr-1" />
										{m.common_previous()}
									</Button>

									<span class="text-sm text-muted-foreground px-2">
										{m.common_page()} {currentPage} {m.common_of()} {result.pagination.totalPages}
									</span>

									<Button
										variant="outline"
										size="sm"
										disabled={currentPage >= result.pagination.totalPages}
										onclick={() => currentPage++}
									>
										{m.common_next()}
										<ChevronRight class="h-4 w-4 ml-1" />
									</Button>
								</div>
							</div>
						</div>
					{/if}
				{/await}
			</div>
		</div>
	</div>
</div>

<EditBannerDialog banner={editingBanner} bind:open={editDialogOpen} />
<DeleteBannerDialog banner={deletingBanner} bind:open={deleteDialogOpen} />
