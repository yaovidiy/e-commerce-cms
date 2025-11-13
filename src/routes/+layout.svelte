<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { AppSidebar } from '$lib/components/common/layout';
	import '../app.css';
	let { children } = $props();
	
	// Check if we're on an admin route
	const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
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
				</header>
				<main class="flex flex-1 flex-col gap-4 p-6">
					{@render children()}
				</main>
			</Sidebar.Inset>
		</Sidebar.Provider>
	{/if}
</ParaglideJS>
