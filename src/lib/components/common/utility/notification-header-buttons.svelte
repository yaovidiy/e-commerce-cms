<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Bell, Clock } from '@lucide/svelte';
	import { getUnreadNotificationCount, getRunningTasksCount } from '$lib/state/notification-store.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		onNotificationsClick?: () => void;
		onTasksClick?: () => void;
	}

	let { onNotificationsClick, onTasksClick } = $props();

	const unreadNotificationCount = $derived(getUnreadNotificationCount());
	const runningTasksCount = $derived(getRunningTasksCount());
</script>

<div class="flex items-center gap-2">
	<!-- Notifications Button -->
	<Button
		variant="ghost"
		size="icon"
		class="relative"
		title={m.open_notifications?.() || 'Notifications'}
		onclick={onNotificationsClick}
	>
		<Bell class="w-5 h-5" />
		{#if unreadNotificationCount > 0}
			<Badge
				variant="destructive"
				class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
			>
				{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
			</Badge>
		{/if}
	</Button>

	<!-- Tasks Button -->
	<Button
		variant="ghost"
		size="icon"
		class="relative"
		title={m.open_tasks?.() || 'Tasks'}
		onclick={onTasksClick}
	>
		<Clock class="w-5 h-5" />
		{#if runningTasksCount > 0}
			<Badge
				variant="default"
				class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
			>
				{runningTasksCount > 9 ? '9+' : runningTasksCount}
			</Badge>
		{/if}
	</Button>
</div>
