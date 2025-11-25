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

	let searchQuery = $state('');
</script>

<header class="sticky top-0 z-50 w-full bg-white">
	<!-- Top Navigation Bar (Desktop Only) -->
	<div class="hidden flex-col items-center justify-between md:flex">
		<div class="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-2">
			<!-- Logo -->
			{#await storeNamePromise then storeName}
				<a href="/" class="flex h-10 max-w-40 items-center">
					<div
						class="bg-primary text-primary-foreground mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
					>
						{storeName?.parsedValue
							? String(storeName.parsedValue).substring(0, 2).toUpperCase()
							: 'SR'}
					</div>
					<span class="text-lg font-bold">{storeName?.parsedValue}</span>
				</a>
			{:catch}
				<a href="/" class="flex h-10 max-w-40 items-center">
					<div
						class="bg-primary text-primary-foreground mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
					>
						SR
					</div>
					<span class="text-lg font-bold">SpiceRoom</span>
				</a>
			{/await}

			<!-- Desktop Navigation Links -->
			<nav class="flex items-center gap-5">
				{#await headerMenuPromise then headerMenu}
					{#if headerMenu?.items && headerMenu.items.length > 0}
						{#each headerMenu.items as link}
							<a
								href={link.url}
								class="hover:text-primary text-sm transition-colors {$page.url.pathname === link.url
									? 'text-foreground font-medium'
									: 'text-foreground/60'}"
								target={link.openInNewTab ? '_blank' : '_self'}
								rel={link.openInNewTab ? 'noopener noreferrer' : ''}
							>
								{link.label}
							</a>
						{/each}
					{:else}
						<!-- Fallback navigation -->
						<a
							href="/"
							class="hover:text-primary text-sm transition-colors {$page.url.pathname === '/'
								? 'text-foreground font-medium'
								: 'text-foreground/60'}"
						>
							{m.nav_home()}
						</a>
						<a
							href="/products"
							class="hover:text-primary text-sm transition-colors {$page.url.pathname ===
							'/products'
								? 'text-foreground font-medium'
								: 'text-foreground/60'}"
						>
							{m.nav_products()}
						</a>
					{/if}
				{/await}
			</nav>

			<!-- Empty space for alignment -->
			<div class="flex w-40 items-center gap-4"></div>
		</div>

		<!-- Second Bar with Categories, Search, and Actions -->
		<div class="bg-milky fixed top-14 z-10 h-20 w-full border-b transition-all">
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
								{#each categories.filter((c) => c.isVisible).slice(0, 10) as category}
									<DropdownMenu.Item onclick={() => goto(`/products?category=${category?.slug}`)}>
										{category?.name}
									</DropdownMenu.Item>
								{/each}
								<DropdownMenu.Separator />
							{/if}
						{/await}
						<DropdownMenu.Item onclick={() => goto('/products')}>View All</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Search Bar -->
				<div class="w-1/2">
					<div class="relative h-14">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search..."
							class="border-input ring-offset-primary placeholder:text-muted-foreground focus-visible:ring-ring flex h-full w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							onkeydown={(e) =>
								e.key === 'Enter' &&
								searchQuery &&
								goto(`/search?q=${encodeURIComponent(searchQuery)}`)}
						/>
						<Search
							class="text-muted-foreground absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2"
						/>
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
													<span class="text-muted-foreground text-xs">{phone.label}</span>
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
											<p class="text-sm leading-none font-medium">
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
										<button
											type="submit"
											disabled={!!logout.pending}
											onclick={() => logout()}
											class="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50"
										>
											{logout.pending
												? m.auth_logging_out?.() || 'Logging out...'
												: m.auth_logout()}
										</button>
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
	<div class="flex items-center justify-between border-b px-4 py-3 md:hidden">
		<!-- Mobile Logo -->
		{#await storeNamePromise then storeName}
			<a href="/" class="flex items-center space-x-2">
				<div
					class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
				>
					{storeName?.parsedValue
						? String(storeName.parsedValue).substring(0, 2).toUpperCase()
						: 'SR'}
				</div>
				<span class="text-lg font-bold">{storeName?.parsedValue || 'SpiceRoom'}</span>
			</a>
		{:catch}
			<a href="/" class="flex items-center space-x-2">
				<div
					class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
				>
					SR
				</div>
				<span class="text-lg font-bold">SpiceRoom</span>
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
					<DropdownMenu.Item onclick={() => goto('/products')}>Categories</DropdownMenu.Item>
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
