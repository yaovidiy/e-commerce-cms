<script lang="ts">
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';
	import { AdminSidebar } from '$lib/components/admin/layout';
	import { Separator } from '$lib/components/ui/separator';
	import * as m from '$lib/paraglide/messages';

	let { children } = $props();
</script>

<SidebarProvider>
	<AdminSidebar />
	<SidebarInset>
		<header
			class="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4"
		>
			<SidebarTrigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />
			<div class="flex items-center gap-2">
				<h1 class="text-lg font-semibold">{m.admin_panel()}</h1>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{#key children}
				{@render children()}
			{/key}
		</div>
	</SidebarInset>
</SidebarProvider>
