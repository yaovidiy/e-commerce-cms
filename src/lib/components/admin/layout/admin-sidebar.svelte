<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { FileText, Users, Image, Package, FolderTree, Tag, Receipt, Mail, Truck, Percent, Settings, Frame, Layout, BarChart, Menu, Database, ShoppingCart, ChevronDown, MessageSquare, Bell, MapPin, CreditCard, ListChecks } from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';
	import { me } from '$lib/remotes/user.remote';
	import { goto } from '$app/navigation';

	// Navigation items organized by category
	const menuGroups = [
		{
			label: () => m.admin_dashboard(),
			icon: BarChart,
			items: [
				{
					title: () => m.analytics?.() || 'Analytics',
					url: '/admin/analytics',
					icon: BarChart
				}
			]
		},
		{
			label: () => m.admin_sales(),
			icon: ShoppingCart,
			items: [
				{
					title: () => m.order_orders?.() || 'Orders',
					url: '/admin/orders',
					icon: ShoppingCart
				},
				{
					title: () => m.admin_fiscal_receipts(),
					url: '/admin/receipts',
					icon: Receipt
				}
			]
		},
		{
			label: () => m.admin_catalog(),
			icon: Package,
			items: [
				{
					title: () => m.product_products(),
					url: '/admin/products',
					icon: Package
				},
				{
					title: () => m.category_categories(),
					url: '/admin/categories',
					icon: FolderTree
				},
				{
					title: () => m.brand_brands(),
					url: '/admin/brands',
					icon: Tag
				}
			]
		},
		{
			label: () => m.admin_commerce(),
			icon: Truck,
			items: [
				{
					title: () => m.shipping(),
					url: '/admin/shipping/zones',
					icon: Truck
				},
				{
					title: () => m.discounts(),
					url: '/admin/discounts',
					icon: Percent
				},
				{
					title: () => 'LiqPay Testing',
					url: '/admin/liqpay',
					icon: CreditCard
				},
				{
					title: () => m.ukrposhta_management?.() || 'Ukrposhta',
					url: '/admin/ukrposhta',
					icon: MapPin
				},
				{
					title: () => m.novaposhta_management?.() || 'Nova Poshta',
					url: '/admin/novaposhta',
					icon: Truck
				}
			]
		},
		{
			label: () => m.admin_content(),
			icon: FileText,
			items: [
				{
					title: () => m.admin_blogs(),
					url: '/admin/blogs',
					icon: FileText
				},
				{
					title: () => m.page_pages(),
					url: '/admin/pages',
					icon: Layout
				},
				{
					title: () => m.banner_banners(),
					url: '/admin/banners',
					icon: Frame
				},
				{
					title: () => 'Mega Menu',
					url: '/admin/mega-menu',
					icon: ListChecks
				}
			]
		},
		{
			label: () => m.admin_media(),
			icon: Image,
			items: [
				{
					title: () => m.asset_media_library(),
					url: '/admin/assets',
					icon: Image
				}
			]
		},
		{
			label: () => m.admin_system(),
			icon: Settings,
			items: [
				{
					title: () => m.notification_templates?.() || 'Notification Templates',
					url: '/admin/notifications',
					icon: Bell
				},
				{
					title: () => m.admin_users(),
					url: '/admin/users',
					icon: Users
				},
				{
					title: () => m.admin_navigation_contact(),
					url: '/admin/navigation',
					icon: Menu
				},
				{
					title: () => m.admin_email_settings(),
					url: '/admin/email-settings',
					icon: Mail
				},
				{
					title: () => m.sms_management?.() || 'SMS Management',
					url: '/admin/sms',
					icon: MessageSquare
				},
				{
					title: () => m.settings(),
					url: '/admin/settings',
					icon: Settings
				},
				{
					title: () => m.migration(),
					url: '/admin/migration',
					icon: Database
				}
			]
		}
	];

	// Helper to check if route is active
	function isActive(url: string) {
		return page.url.pathname === url || page.url.pathname.startsWith(url + '/');
	}

	// Helper to check if any item in a group is active
	function isGroupActive(items: any[]) {
		return items.some(item => isActive(item.url));
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href="/" {...props} class="flex items-center gap-2 font-semibold">
							<div
								class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg"
							>
								<FileText class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-semibold">{m.nav_admin()}</span>
								<span class="text-muted-foreground text-xs">{m.admin_panel()}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each menuGroups as group}
			{#if group.items.length === 1}
				<!-- Single item groups as simple nav items -->
				<Sidebar.Group>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each group.items as item}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton
										onclick={() => {
											goto(item.url);
										}}
										isActive={isActive(item.url)}
									>
										<item.icon class="size-4" />
										<span>{item.title()}</span>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{:else}
				<!-- Multi-item groups as collapsibles -->
				<Collapsible.Root open={isGroupActive(group.items)} class="group/collapsible">
					<Sidebar.Group>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Collapsible.Trigger>
										<Sidebar.MenuButton>
											<svelte:component this={group.icon} class="size-4" />
											<span>{group.label()}</span>
											<ChevronDown class="ms-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
										</Sidebar.MenuButton>
									</Collapsible.Trigger>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
						<Collapsible.Content>
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									{#each group.items as item}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton
												onclick={() => {
													goto(item.url);
												}}
												isActive={isActive(item.url)}
											>
												<item.icon class="size-4" />
												<span>{item.title()}</span>
											</Sidebar.MenuButton>
										</Sidebar.MenuItem>
									{/each}
								</Sidebar.Menu>
							</Sidebar.GroupContent>
						</Collapsible.Content>
					</Sidebar.Group>
				</Collapsible.Root>
			{/if}
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			{#await me() then user}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child()}
							<div class="flex items-center gap-2">
								<div
									class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
								>
									<Users class="size-4" />
								</div>
								<div class="flex flex-col items-start gap-0.5 leading-none">
									<span class="font-semibold">{user?.username}</span>
									<span class="text-muted-foreground text-xs">{m.admin_role()}</span>
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{:catch error}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child()}
							<div class="flex items-center gap-2">
								<div
									class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
								>
									<Users class="size-4" />
								</div>
								<div class="flex flex-col items-start gap-0.5 leading-none">
									<span class="font-semibold">Guest</span>
									<span class="text-muted-foreground text-xs">{m.admin_role()}</span>
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/await}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
