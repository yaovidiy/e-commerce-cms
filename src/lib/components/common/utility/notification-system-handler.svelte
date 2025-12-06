<script lang="ts">
	/**
	 * Global Notification System Handler
	 * Manages displaying notifications and syncing with backend
	 * This should be placed in the root layout
	 */

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { 
		getUserNotificationsQuery, 
		getUnreadCountQuery,
		getBackgroundTasksQuery,
		getRunningTasksCountQuery
	} from '$lib/remotes/in-app-notification.remote';
	import { notificationStore, backgroundTaskStore, initializeNotificationSystem } from '$lib/state/notification-store.svelte';

	interface Props {
		initialUnreadCount?: number;
		initialNotificationData?: any;
		initialBackgroundTasks?: any;
		initialRunningTasksCount?: number;
	}

	let { 
		initialUnreadCount = 0, 
		initialNotificationData = null,
		initialBackgroundTasks = null,
		initialRunningTasksCount = 0
	}: Props = $props();

	let isInitialized = false;

	onMount(async () => {
		if (!browser || isInitialized) return;

		try {
			// Initialize notification system
			await initializeNotificationSystem();

			// Set initial data from server (this prevents flickering)
			if (initialUnreadCount > 0) {
				notificationStore.setUnreadCount(initialUnreadCount);
			}

			if (initialNotificationData) {
				notificationStore.setNotifications(initialNotificationData.notifications);
			}

			if (initialBackgroundTasks) {
				backgroundTaskStore.setTasks(initialBackgroundTasks.tasks);
			}

			if (initialRunningTasksCount > 0) {
				backgroundTaskStore.setRunningCount(initialRunningTasksCount);
			}

			// Poll for new notifications every 10 seconds
			const notificationInterval = setInterval(async () => {
				try {
					const count = await getUnreadCountQuery();
					notificationStore.setUnreadCount(count);
				} catch (error) {
					console.error('Failed to fetch notification count:', error);
				}
			}, 10000);

			// Poll for running tasks every 5 seconds
			const tasksInterval = setInterval(async () => {
				try {
					const count = await getRunningTasksCountQuery();
					backgroundTaskStore.setRunningCount(count);
				} catch (error) {
					console.error('Failed to fetch running tasks count:', error);
				}
			}, 5000);

			isInitialized = true;

			return () => {
				clearInterval(notificationInterval);
				clearInterval(tasksInterval);
			};
		} catch (error) {
			console.error('Failed to initialize notification system:', error);
		}
	});
</script>

<!-- This component handles all notification system initialization -->
<!-- No visual output, pure logic -->