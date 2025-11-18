<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { User, Phone, Menu, Search, ShoppingCart } from '@lucide/svelte/icons';
	import { logout } from '$lib/remotes/user.remote';
	import { getMyProfile } from '$lib/remotes/profile.remote';
	import { getNavigationMenuByLocation } from '$lib/remotes/navigation.remote';
	import { getAllContactPhones } from '$lib/remotes/navigation.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { getSetting } from '$lib/remotes/settings.remote';

	let { onCartClick = () => {} } = $props();

	// Fetch dynamic data
	const headerMenuPromise = getNavigationMenuByLocation('header');
	const contactPhonesPromise = getAllContactPhones();
	const categoriesPromise = getAllCategories();
	const storeNamePromise = getSetting({ key: 'store_name' });

	// Check if user is authenticated
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
	
	// Create unique logout form instance for this header
	const headerLogout = logout.for('header');
	
	let searchQuery = $state('');
</script>

	<header class="sticky top-0 z-50 w-full bg-white">
	<!-- Top Navigation Bar (Desktop Only) -->
	<div class="hidden md:flex flex-col items-center justify-between">
		<div class="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-2">
			<!-- Logo -->
			{#await storeNamePromise then storeName}
				<a href="/" class="flex h-10 max-w-40 items-center">
					<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg mr-2">
						{storeName?.parsedValue ? String(storeName.parsedValue).substring(0, 2).toUpperCase() : 'SR'}
					</div>
					<span class="font-bold text-lg">{storeName?.parsedValue || 'SpiceRoom'}</span>
				</a>
			{:catch}
				<a href="/" class="flex h-10 max-w-40 items-center">
					<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg mr-2">
						SR
					</div>
					<span class="font-bold text-lg">SpiceRoom</span>
				</a>
			{/await}

			<!-- Desktop Navigation Links -->
			<nav class="flex items-center gap-5">
				{#await headerMenuPromise then headerMenu}
					{#if headerMenu?.items && headerMenu.items.length > 0}
						{#each headerMenu.items as link}
							<a
								href={link.url}
								class="text-sm transition-colors hover:text-primary {$page.url.pathname === link.url ? 'text-foreground font-medium' : 'text-foreground/60'}"
								target={link.openInNewTab ? '_blank' : '_self'}
								rel={link.openInNewTab ? 'noopener noreferrer' : ''}
							>
								{link.label}
							</a>
						{/each}
					{:else}
						<!-- Fallback navigation -->
						<a href="/" class="text-sm transition-colors hover:text-primary {$page.url.pathname === '/' ? 'text-foreground font-medium' : 'text-foreground/60'}">
							{m.nav_home()}
						</a>
						<a href="/products" class="text-sm transition-colors hover:text-primary {$page.url.pathname === '/products' ? 'text-foreground font-medium' : 'text-foreground/60'}">
							{m.nav_products()}
						</a>
					{/if}
				{/await}
			</nav>

			<!-- Empty space for alignment -->
			<div class="flex items-center gap-4 w-40"></div>
		</div>
		
		<!-- Second Bar with Categories, Search, and Actions -->
		<div class="fixed top-14 z-10 h-20 w-full bg-milky transition-all border-b">
			<div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-8">
				<!-- Categories Button -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" class="flex gap-3">
							<Menu class="h-5 w-5" />
							<span>Categories</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-56">
						{#await categoriesPromise then categories}
							{#if categories && categories.length > 0}
								{#each categories.filter(c => c.isVisible).slice(0, 10) as category}
									<DropdownMenu.Item onclick={() => goto(`/products?category=${category.slug}`)}>
										{category.name}
									</DropdownMenu.Item>
								{/each}
								<DropdownMenu.Separator />
							{/if}
						{/await}
						<DropdownMenu.Item onclick={() => goto('/products')}>
							View All
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Search Bar -->
				<div class="w-1/2">
					<div class="relative h-14">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search..."
							class="flex h-full w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-primary placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							onkeydown={(e) => e.key === 'Enter' && searchQuery && goto(`/search?q=${encodeURIComponent(searchQuery)}`)}
						/>
						<Search class="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-4">
					<!-- Phone Dropdown -->
					{#await contactPhonesPromise then phones}
						{#if phones && phones.length > 0}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Button variant="ghost" size="icon">
										<Phone class="h-5 w-5" />
										<span class="sr-only">Phone Dropdown Menu</span>
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									{#each phones as phone}
										<DropdownMenu.Item>
											<Phone class="mr-2 h-4 w-4" />
											<div class="flex flex-col">
												{#if phone.label}
													<span class="text-xs text-muted-foreground">{phone.label}</span>
												{/if}
												<span>{phone.phoneNumber}</span>
											</div>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					{/await}

					<!-- User menu -->
					{#await getMyProfile()}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="ghost" size="icon">
									<User class="h-5 w-5" />
									<span class="sr-only">User Dropdown</span>
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item disabled>
									<span class="text-muted-foreground">{m.auth_loading?.() || 'Loading...'}</span>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:then user}
						{#if user}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Button variant="ghost" size="icon">
										<User class="h-5 w-5" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" class="w-56">
									<DropdownMenu.Label>
										<div class="flex flex-col space-y-1">
											<p class="text-sm font-medium leading-none">
												{user.firstName && user.lastName
													? `${user.firstName} ${user.lastName}`
													: user.username}
											</p>
											<p class="text-muted-foreground text-xs leading-none">
												{user.email || user.username}
											</p>
										</div>
									</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item onclick={() => goto('/dashboard')}>
										{m.nav_dashboard()}
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/dashboard/orders')}>
										{m.nav_orders()}
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/dashboard/wishlist')}>
										{m.wishlist()}
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/dashboard/settings')}>
										{m.nav_settings()}
									</DropdownMenu.Item>
									{#if user.isAdmin}
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => goto('/admin')}>
											{m.nav_admin()}
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Separator />
									<DropdownMenu.Item>
										<form {...headerLogout}>
											<button
												type="submit"
												disabled={!!headerLogout.pending}
												class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
											>
												{headerLogout.pending ? m.auth_logging_out?.() || 'Logging out...' : m.auth_logout()}
											</button>
										</form>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{:else}
							<Button href="/auth/login" variant="ghost" size="icon">
								<User class="h-5 w-5" />
							</Button>
						{/if}
					{:catch error}
						<Button href="/auth/login" variant="ghost" size="icon">
							<User class="h-5 w-5" />
						</Button>
					{/await}

					<!-- Cart Button (hide on auth routes) -->
					{#if !isAuthRoute}
						<Button variant="ghost" size="icon" onclick={() => onCartClick()}>
							<div class="relative">
								<ShoppingCart class="h-5 w-5" />
							</div>
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Header -->
	<div class="flex md:hidden items-center justify-between px-4 py-3 border-b">
		<!-- Mobile Logo -->
		{#await storeNamePromise then storeName}
			<a href="/" class="flex items-center space-x-2">
				<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg">
					{storeName?.parsedValue ? String(storeName.parsedValue).substring(0, 2).toUpperCase() : 'SR'}
				</div>
				<span class="font-bold text-lg">{storeName?.parsedValue || 'SpiceRoom'}</span>
			</a>
		{:catch}
			<a href="/" class="flex items-center space-x-2">
				<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg">
					SR
				</div>
				<span class="font-bold text-lg">SpiceRoom</span>
			</a>
		{/await}

		<div class="flex items-center gap-2">
			<!-- Cart (mobile) -->
			{#if !isAuthRoute}
				<Button variant="ghost" size="icon" onclick={() => onCartClick()}>
					<ShoppingCart class="h-5 w-5" />
				</Button>
			{/if}
			
			<!-- Mobile Menu -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="icon">
						<Menu class="h-5 w-5" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-56">
					{#await headerMenuPromise then headerMenu}
						{#if headerMenu?.items && headerMenu.items.length > 0}
							{#each headerMenu.items as link}
								<DropdownMenu.Item onclick={() => goto(link.url)}>
									{link.label}
								</DropdownMenu.Item>
							{/each}
						{:else}
							<DropdownMenu.Item onclick={() => goto('/')}>
								{m.nav_home()}
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => goto('/products')}>
								{m.nav_products()}
							</DropdownMenu.Item>
						{/if}
					{/await}
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => goto('/products')}>
						Categories
					</DropdownMenu.Item>
					{#await contactPhonesPromise then phones}
						{#if phones && phones.length > 0}
							<DropdownMenu.Separator />
							{#each phones as phone}
								<DropdownMenu.Item>
									<Phone class="mr-2 h-4 w-4" />
									<span>{phone.phoneNumber}</span>
								</DropdownMenu.Item>
							{/each}
						{/if}
					{/await}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
