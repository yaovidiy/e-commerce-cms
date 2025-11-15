<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { FileText, Users, Image, Package, FolderTree, Tag } from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';
	import { me } from '$lib/remotes/user.remote';

	// Navigation items for admin panel
	const navItems = [
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
		},
		{
			title: () => m.admin_blogs(),
			url: '/admin/blogs',
			icon: FileText
		},
		{
			title: () => m.admin_users(),
			url: '/admin/users',
			icon: Users
		},
		{
			title: () => m.asset_media_library(),
			url: '/admin/assets',
			icon: Image
		}
	];

	// Helper to check if route is active
	function isActive(url: string) {
		return $page.url.pathname === url || $page.url.pathname.startsWith(url + '/');
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
		<Sidebar.Group>
			<Sidebar.GroupLabel>{m.admin_management()}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(item.url)}>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon class="size-4" />
										<span>{item.title()}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
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
