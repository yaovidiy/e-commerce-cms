<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { User, Package, MapPin, Settings, LogOut } from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';
	import { getMyProfile } from '$lib/remotes/profile.remote';
	import { goto } from '$app/navigation';
	import { logout } from '$lib/remotes/user.remote';

	// Navigation items for customer dashboard
	const navItems = [
		{
			title: () => m.nav_profile(),
			url: '/dashboard',
			icon: User
		},
		{
			title: () => m.nav_orders(),
			url: '/dashboard/orders',
			icon: Package
		},
		{
			title: () => m.nav_addresses(),
			url: '/dashboard/addresses',
			icon: MapPin
		},
		{
			title: () => m.nav_settings(),
			url: '/dashboard/settings',
			icon: Settings
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
								<User class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-semibold">{m.customer_dashboard()}</span>
								<span class="text-muted-foreground text-xs">{m.customer_panel()}</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>{m.nav_account()}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems as item}
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
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			{#await getMyProfile()}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child()}
							<div class="flex items-center gap-2">
								<div
									class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
								>
									<User class="size-4" />
								</div>
								<div class="flex flex-col items-start gap-0.5 leading-none">
									<span class="font-semibold">Loading...</span>
									<span class="text-muted-foreground text-xs">{m.customer_role()}</span>
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{:then user}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child()}
							<div class="flex items-center gap-2">
								<div
									class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
								>
									<User class="size-4" />
								</div>
								<div class="flex flex-col items-start gap-0.5 leading-none">
									<span class="font-semibold">
										{user.firstName && user.lastName
											? `${user.firstName} ${user.lastName}`
											: user.username}
									</span>
									<span class="text-muted-foreground text-xs">{m.customer_role()}</span>
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
				<Sidebar.MenuItem>
					<form {...logout} class="w-full">
						<button
							type="submit"
							disabled={!!logout.pending}
							class="hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none ring-sidebar-ring transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
						>
							<LogOut class="size-4" />
							<span>{logout.pending ? 'Logging out...' : m.auth_logout()}</span>
						</button>
					</form>
				</Sidebar.MenuItem>
			{:catch error}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child()}
							<div class="flex items-center gap-2">
								<div
									class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg"
								>
									<User class="size-4" />
								</div>
								<div class="flex flex-col items-start gap-0.5 leading-none">
									<span class="font-semibold">Guest</span>
									<span class="text-muted-foreground text-xs">{m.customer_role()}</span>
								</div>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/await}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
