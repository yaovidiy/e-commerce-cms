<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { AppSidebar } from '$lib/components/common/layout';
	import { CartButton, CartDrawer } from '$lib/components/client/features/cart';
	import '../app.css';
	let { children } = $props();
	
	// Check if we're on an admin route
	const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
	
	// Cart drawer state
	let cartDrawerOpen = $state(false);
</script>

<ParaglideJS {i18n}>
	{#if isAdminRoute}
		<!-- Admin routes handle their own layout -->
		{@render children()}
	{:else}
		<!-- Regular app routes use sidebar layout -->
		<Sidebar.Provider>
			<AppSidebar />
			<Sidebar.Inset>
				<header class="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
					<Sidebar.Trigger />
					
					<!-- Spacer -->
					<div class="flex-1"></div>
					
					<!-- Cart button (hide on auth routes) -->
					{#if !isAuthRoute}
						<CartButton onclick={() => (cartDrawerOpen = true)} />
					{/if}
				</header>
				<main class="flex flex-1 flex-col gap-4 p-6">
					{@render children()}
				</main>
			</Sidebar.Inset>
		</Sidebar.Provider>
		
		<!-- Cart drawer (available on all non-admin routes) -->
		{#if !isAuthRoute}
			<CartDrawer bind:open={cartDrawerOpen} />
		{/if}
	{/if}
</ParaglideJS>
