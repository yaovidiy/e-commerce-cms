<script lang="ts">
	/**
	 * Notification Badge Component
	 * Shows notification and task counts with icons
	 * Can be used in navbar or header
	 */

	import { getUnreadNotificationCount, getHasRunningTasks } from '$lib/state/notification-store.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Bell, Clock } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import NotificationCenter from './notification-center.svelte';
	import BackgroundTaskMonitor from './background-task-monitor.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		class?: string;
	}

	let { class: className } = $props();

	let notificationCenterOpen = $state(false);
	let taskMonitorOpen = $state(false);

	const unreadNotificationCount = $derived(getUnreadNotificationCount());
	const hasRunningTasks = $derived(getHasRunningTasks());
</script>

<div class={cn('flex gap-2', className)}>
	<!-- Notifications Button -->
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (notificationCenterOpen = true)}
		class="relative"
		title={m.notification_center?.() || 'Notifications'}
	>
		<Bell class="w-5 h-5" />
		{#if unreadNotificationCount > 0}
			<span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
		{/if}
	</Button>

	<!-- Background Tasks Button -->
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (taskMonitorOpen = true)}
		class={cn('relative', hasRunningTasks && 'animate-pulse')}
		title={m.background_tasks?.() || 'Background Tasks'}
	>
		<Clock class="w-5 h-5" />
		{#if hasRunningTasks}
			<span class="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
		{/if}
	</Button>
</div>

<!-- Dialogs -->
<NotificationCenter bind:open={notificationCenterOpen} />
<BackgroundTaskMonitor bind:open={taskMonitorOpen} />
