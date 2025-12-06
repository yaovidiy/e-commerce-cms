/**
 * In-App Notification and Background Task Remote Functions
 * Manages user notifications and long-running background tasks
 */

import { query, command, form, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import * as auth from '$lib/server/auth';
import {
    GetUserNotificationsSchema,
    MarkNotificationAsReadSchema,
    MarkAllNotificationsAsReadSchema,
    DeleteNotificationSchema,
    DeleteAllNotificationsSchema,
    GetBackgroundTasksSchema,
    GetBackgroundTaskSchema,
    CreateBackgroundTaskSchema,
    UpdateBackgroundTaskProgressSchema,
    CompleteBackgroundTaskSchema,
    CancelBackgroundTaskSchema,
    DeleteBackgroundTaskSchema
} from '$lib/server/schemas';
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    getBackgroundTasks,
    getBackgroundTask,
    createBackgroundTask,
    updateBackgroundTaskProgress,
    completeBackgroundTask,
    cancelBackgroundTask,
    deleteBackgroundTask,
    getRunningTasksCount,
    createNotification
} from '$lib/server/services/notification-manager';

/**
 * Get user notifications
 */
export const getUserNotificationsQuery = query(
    GetUserNotificationsSchema,
    async (options) => {
        const user = auth.getUser();
        if (!user) {
            return {
                notifications: [],
                total: 0,
                page: 1,
                pageSize: 20,
                totalPages: 0
            };
        }

        return await getUserNotifications(user.id, options);
    }
);

/**
 * Get unread notification count
 */
export const getUnreadCountQuery = query(async () => {
    const user = auth.getUser();
    if (!user) return 0;

    return await getUnreadNotificationCount(user.id);
});

/**
 * Mark notification as read
 */
export const markAsReadCommand = command(
    MarkNotificationAsReadSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return null;

        return await markNotificationAsRead(data.id, user.id);
    }
);

/**
 * Mark all notifications as read
 */
export const markAllAsReadCommand = command(
    MarkAllNotificationsAsReadSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return 0;

        return await markAllNotificationsAsRead(user.id, data.type === 'all' ? undefined : data.type);
    }
);

/**
 * Delete notification
 */
export const deleteNotificationCommand = command(
    DeleteNotificationSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return false;

        return await deleteNotification(data.id, user.id);
    }
);

/**
 * Delete all notifications
 */
export const deleteAllNotificationsCommand = command(
    DeleteAllNotificationsSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return 0;

        return await deleteAllNotifications(user.id, data.type === 'all' ? undefined : data.type);
    }
);

/**
 * Get background tasks
 */
export const getBackgroundTasksQuery = query(
    GetBackgroundTasksSchema,
    async (options) => {
        const user = auth.getUser();
        if (!user) {
            return {
                tasks: [],
                total: 0,
                page: 1,
                pageSize: 20,
                totalPages: 0
            };
        }

        return await getBackgroundTasks(user.id, options);
    }
);

/**
 * Get single background task
 */
export const getBackgroundTaskQuery = query(
    GetBackgroundTaskSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return null;

        return await getBackgroundTask(data.id, user.id);
    }
);

/**
 * Get running tasks count
 */
export const getRunningTasksCountQuery = query(async () => {
    const user = auth.getUser();
    if (!user) return 0;

    return await getRunningTasksCount(user.id);
});

/**
 * Create background task (form for creating new tasks)
 */
export const createBackgroundTaskForm = form(
    CreateBackgroundTaskSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const metadata = data.metadata ? JSON.parse(data.metadata) : {};

        const task = await createBackgroundTask(user.id, {
            name: data.name,
            description: data.description,
            metadata
        });

        return task;
    }
);

/**
 * Update background task progress (command)
 */
export const updateTaskProgressCommand = command(
    UpdateBackgroundTaskProgressSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return null;

        return await updateBackgroundTaskProgress(data.id, user.id, {
            progress: data.progress,
            processedItems: data.processedItems,
            status: data.status
        });
    }
);

/**
 * Complete background task (command)
 */
export const completeTaskCommand = command(
    CompleteBackgroundTaskSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return null;

        const result = data.result ? JSON.parse(data.result) : undefined;

        const task = await completeBackgroundTask(data.id, user.id, {
            result,
            error: data.error,
            errorCode: data.errorCode
        });

        // Create notification for completed task
        if (task) {
            const notificationType = data.error ? 'error' : 'success';
            const title = data.error ? `${task.name} failed` : `${task.name} completed`;
            const message = data.error || `Task "${task.name}" has been completed successfully`;

            await createNotification(user.id, {
                title,
                message,
                type: notificationType,
                taskId: task.id
            });
        }

        return task;
    }
);

/**
 * Cancel background task
 */
export const cancelTaskCommand = command(
    CancelBackgroundTaskSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return null;

        return await cancelBackgroundTask(data.id, user.id);
    }
);

/**
 * Delete background task
 */
export const deleteTaskCommand = command(
    DeleteBackgroundTaskSchema,
    async (data) => {
        const user = auth.getUser();
        if (!user) return false;

        return await deleteBackgroundTask(data.id, user.id);
    }
);
