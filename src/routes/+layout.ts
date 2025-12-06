/**
 * Root Layout Client Load Function
 * Makes server-loaded notification data available to client
 */

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	return {
		user: data.user,
		initialNotificationData: data.initialNotificationData,
		initialUnreadCount: data.initialUnreadCount,
		initialBackgroundTasks: data.initialBackgroundTasks,
		initialRunningTasksCount: data.initialRunningTasksCount
	};
};
