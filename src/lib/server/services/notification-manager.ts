/**
 * Notification Manager Service
 * Handles creating, reading, and managing user notifications and background tasks
 */

import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and, desc, count, gte, lte } from 'drizzle-orm';
import type { 
    UserNotification, 
    InsertUserNotification,
    BackgroundTask,
    InsertBackgroundTask
} from '$lib/server/db/schema';

/**
 * Create a user notification
 */
export async function createNotification(
    userId: string,
    data: {
        title: string;
        message: string;
        type?: 'success' | 'error' | 'info' | 'warning' | 'task';
        taskId?: string;
        actionUrl?: string;
        actionLabel?: string;
        metadata?: Record<string, any>;
        expiresAt?: Date;
    }
): Promise<UserNotification> {
    const [notification] = await db.insert(tables.userNotification).values({
        id: crypto.randomUUID(),
        userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        taskId: data.taskId,
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        metadata: JSON.stringify(data.metadata || {}),
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: data.expiresAt
    }).returning();

    return notification;
}

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(
    userId: string,
    options: {
        page?: number;
        pageSize?: number;
        unreadOnly?: boolean;
        type?: string;
        sortBy?: 'newest' | 'oldest';
    } = {}
) {
    const {
        page = 1,
        pageSize = 20,
        unreadOnly = false,
        type = 'all',
        sortBy = 'newest'
    } = options;

    const offset = (page - 1) * pageSize;

    const conditions: any[] = [eq(tables.userNotification.userId, userId)];

    if (unreadOnly) {
        conditions.push(eq(tables.userNotification.isRead, false));
    }

    if (type && type !== 'all') {
        conditions.push(eq(tables.userNotification.type, type as any));
    }

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(tables.userNotification)
        .where(and(...conditions));

    // Get paginated notifications
    const notifications = await db
        .select()
        .from(tables.userNotification)
        .where(and(...conditions))
        .orderBy(
            sortBy === 'newest' 
                ? desc(tables.userNotification.createdAt) 
                : tables.userNotification.createdAt
        )
        .limit(pageSize)
        .offset(offset);

    const parseNotifications = notifications.map(n => ({
        ...n,
        metadata: JSON.parse(n.metadata || '{}')
    }));

    return {
        notifications: parseNotifications,
        total: countResult.count,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.count / pageSize)
    };
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
        .select({ count: count() })
        .from(tables.userNotification)
        .where(
            and(
                eq(tables.userNotification.userId, userId),
                eq(tables.userNotification.isRead, false)
            )
        );

    return result.count;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
    notificationId: string,
    userId: string
): Promise<UserNotification | null> {
    const [notification] = await db
        .update(tables.userNotification)
        .set({
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
        })
        .where(
            and(
                eq(tables.userNotification.id, notificationId),
                eq(tables.userNotification.userId, userId)
            )
        )
        .returning();

    return notification || null;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
    userId: string,
    type?: string
): Promise<number> {
    const conditions: any[] = [
        eq(tables.userNotification.userId, userId),
        eq(tables.userNotification.isRead, false)
    ];

    if (type && type !== 'all') {
        conditions.push(eq(tables.userNotification.type, type as any));
    }

    const result = await db
        .update(tables.userNotification)
        .set({
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
        })
        .where(and(...conditions));

    return result.changes || 0;
}

/**
 * Delete notification
 */
export async function deleteNotification(
    notificationId: string,
    userId: string
): Promise<boolean> {
    const result = await db
        .delete(tables.userNotification)
        .where(
            and(
                eq(tables.userNotification.id, notificationId),
                eq(tables.userNotification.userId, userId)
            )
        );

    return (result.changes || 0) > 0;
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(
    userId: string,
    type?: string
): Promise<number> {
    const conditions: any[] = [eq(tables.userNotification.userId, userId)];

    if (type && type !== 'all') {
        conditions.push(eq(tables.userNotification.type, type as any));
    }

    const result = await db
        .delete(tables.userNotification)
        .where(and(...conditions));

    return result.changes || 0;
}

/**
 * Create background task
 */
export async function createBackgroundTask(
    userId: string,
    data: {
        name: string;
        description?: string;
        totalItems?: number;
        metadata?: Record<string, any>;
    }
): Promise<BackgroundTask> {
    const [task] = await db.insert(tables.backgroundTask).values({
        id: crypto.randomUUID(),
        userId,
        name: data.name,
        description: data.description,
        status: 'pending',
        progress: 0,
        processedItems: 0,
        totalItems: data.totalItems,
        metadata: JSON.stringify(data.metadata || {}),
        createdAt: new Date(),
        updatedAt: new Date()
    }).returning();

    return task;
}

/**
 * Get background tasks with pagination
 */
export async function getBackgroundTasks(
    userId: string,
    options: {
        page?: number;
        pageSize?: number;
        status?: string;
        sortBy?: 'newest' | 'oldest';
    } = {}
) {
    const {
        page = 1,
        pageSize = 20,
        status = 'all',
        sortBy = 'newest'
    } = options;

    const offset = (page - 1) * pageSize;

    const conditions: any[] = [eq(tables.backgroundTask.userId, userId)];

    if (status && status !== 'all') {
        conditions.push(eq(tables.backgroundTask.status, status as any));
    }

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(tables.backgroundTask)
        .where(and(...conditions));

    // Get paginated tasks
    const tasks = await db
        .select()
        .from(tables.backgroundTask)
        .where(and(...conditions))
        .orderBy(
            sortBy === 'newest' 
                ? desc(tables.backgroundTask.createdAt) 
                : tables.backgroundTask.createdAt
        )
        .limit(pageSize)
        .offset(offset);

    const parseTasks = tasks.map(t => ({
        ...t,
        metadata: JSON.parse(t.metadata || '{}'),
        result: JSON.parse(t.result || '{}')
    }));

    return {
        tasks: parseTasks,
        total: countResult.count,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.count / pageSize)
    };
}

/**
 * Get single background task
 */
export async function getBackgroundTask(
    taskId: string,
    userId: string
): Promise<any | null> {
    const [task] = await db
        .select()
        .from(tables.backgroundTask)
        .where(
            and(
                eq(tables.backgroundTask.id, taskId),
                eq(tables.backgroundTask.userId, userId)
            )
        );

    if (!task) return null;

    return {
        ...task,
        metadata: JSON.parse(task.metadata || '{}'),
        result: JSON.parse(task.result || '{}')
    };
}

/**
 * Update background task progress
 */
export async function updateBackgroundTaskProgress(
    taskId: string,
    userId: string,
    data: {
        progress: number;
        processedItems?: number;
        status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    }
): Promise<BackgroundTask | null> {
    const updates: any = {
        progress: data.progress,
        updatedAt: new Date()
    };

    if (data.processedItems !== undefined) {
        updates.processedItems = data.processedItems;
    }

    if (data.status) {
        updates.status = data.status;
        if (data.status === 'running' && !updates.startedAt) {
            updates.startedAt = new Date();
        }
    }

    const [task] = await db
        .update(tables.backgroundTask)
        .set(updates)
        .where(
            and(
                eq(tables.backgroundTask.id, taskId),
                eq(tables.backgroundTask.userId, userId)
            )
        )
        .returning();

    return task || null;
}

/**
 * Complete background task
 */
export async function completeBackgroundTask(
    taskId: string,
    userId: string,
    data: {
        result?: Record<string, any>;
        error?: string;
        errorCode?: string;
    }
): Promise<BackgroundTask | null> {
    const [task] = await db
        .update(tables.backgroundTask)
        .set({
            status: data.error ? 'failed' : 'completed',
            progress: data.error ? 0 : 100,
            result: JSON.stringify(data.result || {}),
            error: data.error,
            errorCode: data.errorCode,
            completedAt: new Date(),
            updatedAt: new Date()
        })
        .where(
            and(
                eq(tables.backgroundTask.id, taskId),
                eq(tables.backgroundTask.userId, userId)
            )
        )
        .returning();

    return task || null;
}

/**
 * Cancel background task
 */
export async function cancelBackgroundTask(
    taskId: string,
    userId: string
): Promise<BackgroundTask | null> {
    const [task] = await db
        .update(tables.backgroundTask)
        .set({
            status: 'cancelled',
            completedAt: new Date(),
            updatedAt: new Date()
        })
        .where(
            and(
                eq(tables.backgroundTask.id, taskId),
                eq(tables.backgroundTask.userId, userId)
            )
        )
        .returning();

    return task || null;
}

/**
 * Delete background task
 */
export async function deleteBackgroundTask(
    taskId: string,
    userId: string
): Promise<boolean> {
    const result = await db
        .delete(tables.backgroundTask)
        .where(
            and(
                eq(tables.backgroundTask.id, taskId),
                eq(tables.backgroundTask.userId, userId)
            )
        );

    return (result.changes || 0) > 0;
}

/**
 * Get running tasks count for user
 */
export async function getRunningTasksCount(userId: string): Promise<number> {
    const [result] = await db
        .select({ count: count() })
        .from(tables.backgroundTask)
        .where(
            and(
                eq(tables.backgroundTask.userId, userId),
                eq(tables.backgroundTask.status, 'running')
            )
        );

    return result.count;
}

/**
 * Cleanup expired notifications and tasks
 */
export async function cleanupExpiredNotificationsAndTasks(): Promise<void> {
    const now = new Date();

    // Delete expired notifications
    await db
        .delete(tables.userNotification)
        .where(lte(tables.userNotification.expiresAt, now));

    // Delete expired tasks
    await db
        .delete(tables.backgroundTask)
        .where(lte(tables.backgroundTask.expiresAt, now));
}
