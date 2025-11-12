<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { AppSidebar } from '$lib/components/common/layout';
	import '../app.css';
	let { children } = $props();
</script>

<ParaglideJS {i18n}>
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
</ParaglideJS>
