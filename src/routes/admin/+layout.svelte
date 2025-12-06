<script lang="ts">
	import { page } from '$app/state';
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';
	import { AdminSidebar } from '$lib/components/admin/layout';
	import { Separator } from '$lib/components/ui/separator';
	import NotificationCenter from '$lib/components/common/feedback/notification-center.svelte';
	import BackgroundTaskMonitor from '$lib/components/common/feedback/background-task-monitor.svelte';
	import NotificationHeaderButtons from '$lib/components/common/utility/notification-header-buttons.svelte';
	import * as m from '$lib/paraglide/messages';

	let { children } = $props();
	let notificationCenterOpen = $state(false);
	let taskMonitorOpen = $state(false);
</script>

<SidebarProvider>
	<AdminSidebar />
	<SidebarInset>
		<header class="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4">
			<div class="flex items-center gap-2">
				<SidebarTrigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<h1 class="text-lg font-semibold">{m.admin_panel()}</h1>
			</div>
			<NotificationHeaderButtons 
				onNotificationsClick={() => notificationCenterOpen = true}
				onTasksClick={() => taskMonitorOpen = true}
			/>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</SidebarInset>
</SidebarProvider>

<!-- Dialogs -->
<NotificationCenter bind:open={notificationCenterOpen} />
<BackgroundTaskMonitor bind:open={taskMonitorOpen} />
