<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { AppSidebar } from '$lib/components/common/layout';
	import { ClientHeader, ClientFooter } from '$lib/components/client/layout';
	import { CartDrawer } from '$lib/components/client/features/cart';
	import WebVitalsTracker from '$lib/components/common/utility/web-vitals-tracker.svelte';
	import '../app.css';
	let { children } = $props();
	
	// Check if we're on an admin or dashboard route
	const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
	const isDashboardRoute = $derived($page.url.pathname.startsWith('/dashboard'));
	const isAuthRoute = $derived($page.url.pathname.startsWith('/auth'));
	
	// Cart drawer state
	let cartDrawerOpen = $state(false);
</script>

<ParaglideJS {i18n}>
	{#if isAdminRoute}
		<!-- Admin routes handle their own layout -->
		{@render children()}
	{:else if isDashboardRoute}
		<!-- Dashboard routes use sidebar layout -->
		<Sidebar.Provider>
			<AppSidebar />
			<Sidebar.Inset>
				<main class="flex flex-1 flex-col">
					{@render children()}
				</main>
			</Sidebar.Inset>
		</Sidebar.Provider>
	{:else}
		<!-- Customer-facing routes use header/footer layout -->
		<div class="flex min-h-screen flex-col">
			<ClientHeader onCartClick={() => (cartDrawerOpen = true)} />
			<main class="flex-1">
				<div class="mx-auto max-w-7xl px-4 md:px-6">
					{@render children()}
				</div>
			</main>
			<ClientFooter />
		</div>
		
		<!-- Cart drawer (available on all non-admin, non-auth routes) -->
		{#if !isAuthRoute}
			<CartDrawer bind:open={cartDrawerOpen} />
		{/if}
	{/if}
	
	<!-- Web Vitals Tracker (shows in dev mode only) -->
	<WebVitalsTracker />
</ParaglideJS>
