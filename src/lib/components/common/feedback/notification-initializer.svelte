<script lang="ts">
	/**
	 * Notification System Initializer
	 * This component should be placed in the root layout to initialize the notification system
	 * It handles real-time notification polling and WebSocket connections
	 */

	import { onMount, onDestroy } from 'svelte';
	import {
		notificationStore,
		backgroundTaskStore,
		initializeNotificationSystem,
		setupTaskProgressStream
	} from '$lib/state/notification-store.svelte';
	import {
		getUserNotificationsQuery,
		getUnreadCountQuery,
		getRunningTasksCountQuery,
		getBackgroundTasksQuery
	} from '$lib/remotes/in-app-notification.remote';
	import NotificationToast from './notification-toast.svelte';

	let notificationToShow: any = $state(null);
	let pollInterval: NodeJS.Timeout | null = null;
	let taskPollInterval: NodeJS.Timeout | null = null;

	onMount(async () => {
		// Initialize the notification system
		await initializeNotificationSystem();

		// Initial load
		await refreshNotifications();
		await refreshBackgroundTasks();

		// Poll for new notifications every 5 seconds
		pollInterval = setInterval(async () => {
			await refreshNotifications();
		}, 5000);

		// Poll for background task updates every 2 seconds
		taskPollInterval = setInterval(async () => {
			await refreshBackgroundTasks();
		}, 2000);

		// Show toast notification when a new notification arrives
		const unsubscribe = notificationStore.subscribe((state) => {
			if (state.notifications.length > 0 && !state.notifications[0].isRead) {
				notificationToShow = state.notifications[0];
			}
		});

		return () => {
			unsubscribe();
		};
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
		if (taskPollInterval) clearInterval(taskPollInterval);
	});

	async function refreshNotifications() {
		try {
			const result = await (getUserNotificationsQuery as any)({
				page: 1,
				pageSize: 50,
				unreadOnly: false
			});

			notificationStore.setNotifications(result.notifications);
		} catch (error) {
			console.error('Failed to load notifications:', error);
		}
	}

	async function refreshBackgroundTasks() {
		try {
			const result = await (getBackgroundTasksQuery as any)({
				page: 1,
				pageSize: 50,
				status: 'all'
			});

			backgroundTaskStore.setTasks(result.tasks);
		} catch (error) {
			console.error('Failed to load background tasks:', error);
		}
	}
</script>

<!-- Toast notification display -->
{#if notificationToShow}
	<NotificationToast
		notification={notificationToShow}
		onClose={() => {
			notificationToShow = null;
		}}
	/>
{/if}
