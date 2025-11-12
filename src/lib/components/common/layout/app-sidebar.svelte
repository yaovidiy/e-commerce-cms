<script lang="ts">
	import Home from '@lucide/svelte/icons/house';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Package from '@lucide/svelte/icons/package';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import User from '@lucide/svelte/icons/user';
	import Settings from '@lucide/svelte/icons/settings';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/stores';
	import { me } from '$lib/remotes/user.remote';

	// Get current user from remote function
	let user = $derived(await me());

	// Main navigation items
	const mainNavItems = [
		{
			title: m.nav_home,
			url: '/',
			icon: Home
		},
		{
			title: m.nav_dashboard,
			url: '/dashboard',
			icon: LayoutDashboard
		},
		{
			title: m.nav_products,
			url: '/products',
			icon: Package
		},
		{
			title: m.nav_blog,
			url: '/blog',
			icon: BookOpen
		}
	];

	// Account navigation items
	const accountNavItems = [
		{
			title: m.nav_profile,
			url: '/profile',
			icon: User
		},
		{
			title: m.nav_settings,
			url: '/settings',
			icon: Settings
		}
	];

	// Check if current route is active
	function isActive(url: string): boolean {
		if (url === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(url);
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
								class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
							>
								<Package class="size-4" />
							</div>
							<span>E-commerce CMS</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<!-- Main Navigation Group -->
		<Sidebar.Group>
			<Sidebar.GroupLabel>{m.nav_application()}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each mainNavItems as item (item.url)}
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

		<Sidebar.Separator />

		<!-- Account Navigation Group (only if logged in) -->
		{#if user}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{m.nav_account()}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each accountNavItems as item (item.url)}
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

			<Sidebar.Separator />
		{/if}

		<!-- Admin Button (only if user is admin) -->
		{#if user?.isAdmin}
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive('/admin')}>
								{#snippet child({ props })}
									<a href="/admin" {...props}>
										<ShieldCheck class="size-4" />
										<span>{m.nav_admin()}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer>
		{#if user}
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<div {...props} class="flex items-center gap-2">
								<div
									class="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
								>
									<User class="size-4" />
								</div>
								<div class="flex flex-col gap-0.5 leading-none">
									<span class="font-semibold">{user.username}</span>
									{#if user.email}
										<span class="text-xs text-muted-foreground">{user.email}</span>
									{/if}
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		{:else}
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/auth/login" {...props} class="w-full">
								<Button variant="default" class="w-full">
									{m.auth_login()}
								</Button>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		{/if}
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
