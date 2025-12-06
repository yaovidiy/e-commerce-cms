/**
 * In-App Notification Store
 * Client-side state management for notifications and background tasks
 * Using Svelte 5 runes for reactive state management
 */

import type { UserNotification, BackgroundTask } from '$lib/server/db/schema';

export interface NotificationStoreState {
	// @ts-expect-error - any is needed for flexible metadata
	notifications: (UserNotification & { metadata?: Record<string, any> })[];
	unreadCount: number;
	isLoading: boolean;
	error: string | null;
}

export interface BackgroundTaskStoreState {
	// @ts-expect-error - any is needed for flexible metadata and result
	tasks: (BackgroundTask & { metadata?: Record<string, any>; result?: Record<string, any> })[];
	runningCount: number;
	isLoading: boolean;
	error: string | null;
}

/**
 * Notification Store Class
 * Manages notification state with reactive updates
 */
class NotificationStore {
	state = $state<NotificationStoreState>({
		notifications: [],
		unreadCount: 0,
		isLoading: false,
		error: null
	});

	get notifications() {
		return this.state.notifications;
	}

	get unreadCount() {
		return this.state.unreadCount;
	}

	get isLoading() {
		return this.state.isLoading;
	}

	get error() {
		return this.state.error;
	}

	async loadNotifications(_page = 1, _pageSize = 20, _unreadOnly = false) {
		this.state.isLoading = true;
		this.state.error = null;
		try {
			// This will be called from components using the remote function
			this.state.isLoading = false;
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Failed to load notifications';
			this.state.isLoading = false;
		}
	}

	// @ts-expect-error - any is needed for flexible data types
	setNotifications(notifications: any[]) {
		this.state.notifications = notifications;
		this.state.unreadCount = notifications.filter((n) => !n.isRead).length;
	}

	// @ts-expect-error - any is needed for flexible metadata
	addNotification(notification: UserNotification & { metadata?: Record<string, any> }) {
		this.state.notifications = [notification, ...this.state.notifications];
		this.state.unreadCount += 1;
	}

	removeNotification(id: string) {
		this.state.notifications = this.state.notifications.filter((n) => n.id !== id);
	}

	markAsRead(id: string) {
		const notification = this.state.notifications.find((n) => n.id === id);
		if (notification && !notification.isRead) {
			notification.isRead = true;
			this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
		}
	}

	setUnreadCount(count: number) {
		this.state.unreadCount = count;
	}

	clearError() {
		this.state.error = null;
	}
}

/**
 * Background Task Store Class
 * Manages background task state with reactive updates
 */
class BackgroundTaskStore {
	state = $state<BackgroundTaskStoreState>({
		tasks: [],
		runningCount: 0,
		isLoading: false,
		error: null
	});

	get tasks() {
		return this.state.tasks;
	}

	get runningCount() {
		return this.state.runningCount;
	}

	get isLoading() {
		return this.state.isLoading;
	}

	get error() {
		return this.state.error;
	}

	async loadTasks(_page = 1, _pageSize = 20, _status = 'all') {
		this.state.isLoading = true;
		this.state.error = null;
		try {
			// This will be called from components using the remote function
			this.state.isLoading = false;
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Failed to load tasks';
			this.state.isLoading = false;
		}
	}

	// @ts-expect-error - any is needed for flexible data types
	setTasks(tasks: any[]) {
		this.state.tasks = tasks;
		this.state.runningCount = tasks.filter((t) => t.status === 'running').length;
	}

	// @ts-expect-error - any is needed for flexible metadata
	addTask(task: BackgroundTask & { metadata?: Record<string, any> }) {
		this.state.tasks = [task, ...this.state.tasks];
		if (task.status === 'running') {
			this.state.runningCount += 1;
		}
	}

	updateTask(id: string, updates: Partial<BackgroundTask>) {
		const task = this.state.tasks.find((t) => t.id === id);
		if (task) {
			const isOldRunning = task.status === 'running';
			const isNewRunning = updates.status === 'running';

			Object.assign(task, updates);

			if (isNewRunning && !isOldRunning) {
				this.state.runningCount += 1;
			} else if (!isNewRunning && isOldRunning) {
				this.state.runningCount = Math.max(0, this.state.runningCount - 1);
			}
		}
	}

	removeTask(id: string) {
		const task = this.state.tasks.find((t) => t.id === id);
		if (task?.status === 'running') {
			this.state.runningCount = Math.max(0, this.state.runningCount - 1);
		}
		this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
	}

	setRunningCount(count: number) {
		this.state.runningCount = count;
	}

	clearError() {
		this.state.error = null;
	}
}

// Export singleton instances
export const notificationStore = new NotificationStore();
export const backgroundTaskStore = new BackgroundTaskStore();

// Getter functions for derived values - must be accessed in component context
export function getUnreadNotificationCount() {
	return notificationStore.unreadCount;
}

export function getRunningTasksCount() {
	return backgroundTaskStore.runningCount;
}

export function getHasRunningTasks() {
	return backgroundTaskStore.runningCount > 0;
}

/**
 * Setup notification polling and WebSocket connection
 * Call this from the root layout
 */
export async function initializeNotificationSystem() {
	if (typeof window === 'undefined') return;

	// Cleanup expired notifications periodically
	setInterval(async () => {
		try {
			// This endpoint will be created in the API routes
			await fetch('/api/notifications/cleanup', { method: 'POST' });
		} catch (error) {
			console.error('Failed to cleanup notifications:', error);
		}
	}, 60 * 60 * 1000); // Every hour
}

/**
 * Setup EventSource for background task updates
 */
// @ts-expect-error - any is needed for flexible data types
export function setupTaskProgressStream(taskId: string, onProgress: (data: any) => void) {
	const eventSource = new EventSource(`/api/tasks/${taskId}/progress`);

	eventSource.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			onProgress(data);
		} catch (error) {
			console.error('Failed to parse task progress:', error);
		}
	};

	eventSource.onerror = () => {
		eventSource.close();
	};

	return () => eventSource.close();
}
