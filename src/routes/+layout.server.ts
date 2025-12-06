/**
 * Root Layout Server Load Function
 * Fetches initial notification data to prevent hydration mismatch
 */

import type { LayoutServerLoad } from './$types';
import * as auth from '$lib/server/auth';
import {
	getUserNotifications,
	getUnreadNotificationCount,
	getBackgroundTasks,
	getRunningTasksCount
} from '$lib/server/services/notification-manager';

export const load: LayoutServerLoad = async (event) => {
	// Get current user if authenticated
	const user = auth.getUser();

	// If user is authenticated, fetch initial notification data
	let notificationData = null;
	let unreadCount = 0;
	let backgroundTasks = null;
	let runningTasksCount = 0;

	if (user) {
		try {
			// Fetch initial notifications
			const notificationsResult = await getUserNotifications(user.id, {
				page: 1,
				pageSize: 50,
				unreadOnly: false
			});
			notificationData = notificationsResult;

			// Fetch unread count
			unreadCount = await getUnreadNotificationCount(user.id);

			// Fetch background tasks
			const tasksResult = await getBackgroundTasks(user.id, {
				page: 1,
				pageSize: 50,
				status: 'all'
			});
			backgroundTasks = tasksResult;

			// Fetch running tasks count
			runningTasksCount = await getRunningTasksCount(user.id);
		} catch (error) {
			console.error('Failed to load notification data on server:', error);
		}
	}

	return {
		user,
		initialNotificationData: notificationData,
		initialUnreadCount: unreadCount,
		initialBackgroundTasks: backgroundTasks,
		initialRunningTasksCount: runningTasksCount
	};
};
