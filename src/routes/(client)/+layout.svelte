<script lang="ts">
	import { page } from '$app/state';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { AppSidebar } from '$lib/components/common/layout';
	import Header from '$lib/components/client/layout/header.svelte';
	import Footer from '$lib/components/client/layout/footer.svelte';
	import MobileMenu from '$lib/components/client/layout/mobile-menu.svelte';
	import WebVitalsTracker from '$lib/components/common/utility/web-vitals-tracker.svelte';
	import SiteHead from '$lib/components/common/utility/site-head.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../../app.css';
	let { children } = $props();

	// Check if we're on an admin or dashboard route
	const isDashboardRoute = $derived(page.url.pathname.startsWith('/dashboard'));
	const isAuthRoute = $derived(page.url.pathname.startsWith('/auth'));

	// Cart drawer state
	let cartDrawerOpen = $state(false);
</script>

<!-- Dynamic favicon, title, and SEO meta from store settings -->
<SiteHead />

<ParaglideJS {i18n}>
	{#if isDashboardRoute}
		<!-- Dashboard routes use sidebar layout -->
		<main class="flex flex-1 flex-col">
			{@render children()}
		</main>
	{:else if isAuthRoute}
		<!-- Auth routes use minimal layout -->
		<div class="flex min-h-screen flex-col">
			<main class="flex-1">
				<div class="mx-auto max-w-2xl px-4 md:px-6">
					{@render children()}
				</div>
			</main>
		</div>
	{:else}
		<!-- Customer-facing routes use header/footer layout -->
		<div class="flex min-h-screen flex-col">
			<Header />
			<MobileMenu />
			<Toaster />
			<main class="flex-1">
				<div class="mx-auto max-w-7xl px-4 md:px-6">
					{@render children()}
				</div>
			</main>
			<Footer />
		</div>
	{/if}

	<!-- Web Vitals Tracker (shows in dev mode only) -->
	<WebVitalsTracker />
</ParaglideJS>
