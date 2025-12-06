# In-App Notification System - Complete Guide

## Overview

The in-app notification system provides a comprehensive solution for managing real-time notifications and long-running background tasks. Users can continue using the app while tasks run in the background and receive toast notifications when tasks complete or important events occur.

## System Components

### 1. **Database Tables**

#### `user_notification` - User-facing notifications
- `id` - Unique identifier
- `userId` - User receiving the notification
- `title` - Notification title
- `message` - Notification content
- `type` - Type: 'success', 'error', 'info', 'warning', 'task'
- `taskId` - Optional link to a background task
- `isRead` - Read status
- `readAt` - When the notification was read
- `actionUrl` - Optional action URL (e.g., to view the result)
- `actionLabel` - Label for the action button
- `metadata` - Additional JSON data
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `expiresAt` - Auto-deletion timestamp

#### `background_task` - Long-running background operations
- `id` - Unique identifier
- `userId` - User who initiated the task
- `name` - Task name (e.g., "data_migration", "bulk_export")
- `description` - Task description
- `status` - Status: 'pending', 'running', 'completed', 'failed', 'cancelled'
- `progress` - Progress percentage (0-100)
- `totalItems` - Total items to process (optional)
- `processedItems` - Items processed so far
- `error` - Error message if failed
- `errorCode` - Error code for categorization
- `result` - JSON with task result data
- `metadata` - Task-specific JSON data
- `createdAt`, `startedAt`, `completedAt`, `updatedAt` - Timestamps
- `expiresAt` - Auto-deletion timestamp

### 2. **Services**

#### Notification Manager Service (`src/lib/server/services/notification-manager.ts`)

**Key Functions:**

```typescript
// Create notification
createNotification(userId, {
  title, message, type, taskId?, actionUrl?, metadata?, expiresAt?
})

// Get notifications with pagination
getUserNotifications(userId, { page?, pageSize?, unreadOnly?, type?, sortBy? })

// Mark as read
markNotificationAsRead(id, userId)
markAllNotificationsAsRead(userId, type?)

// Delete
deleteNotification(id, userId)
deleteAllNotifications(userId, type?)

// Background task functions
createBackgroundTask(userId, { name, description?, totalItems?, metadata? })
getBackgroundTasks(userId, { page?, pageSize?, status?, sortBy? })
getBackgroundTask(id, userId)
updateBackgroundTaskProgress(id, userId, { progress, processedItems?, status? })
completeBackgroundTask(id, userId, { result?, error?, errorCode? })
cancelBackgroundTask(id, userId)
```

### 3. **Remote Functions**

Located in `src/lib/remotes/in-app-notification.remote.ts`

#### Queries (Read Operations)
```typescript
getUserNotificationsQuery - Get notifications with pagination
getUnreadCountQuery - Get unread notification count
getBackgroundTasksQuery - Get background tasks
getBackgroundTaskQuery - Get single task
getRunningTasksCountQuery - Get count of running tasks
```

#### Commands (Write Operations)
```typescript
markAsReadCommand - Mark notification as read
markAllAsReadCommand - Mark all as read
deleteNotificationCommand - Delete notification
deleteAllNotificationsCommand - Delete all
updateTaskProgressCommand - Update task progress
completeTaskCommand - Complete task
cancelTaskCommand - Cancel task
deleteTaskCommand - Delete task
```

#### Form
```typescript
createBackgroundTaskForm - Create new background task
```

### 4. **UI Components**

#### NotificationCenter (`notification-center.svelte`)
- Dialog showing all user notifications
- Filter by type and read status
- Mark as read/delete functionality
- Pagination support

#### NotificationItem (`notification-item.svelte`)
- Individual notification display
- Shows type badge, timestamp
- Action buttons (mark read, delete, open link)

#### BackgroundTaskMonitor (`background-task-monitor.svelte`)
- Dialog showing background tasks
- Progress bars with item counts
- Task duration tracking
- Error display and task result viewing
- Cancel functionality for running tasks

#### NotificationToast (`notification-toast.svelte`)
- Toast notification display
- Auto-dismisses after 5 seconds (unless task type)
- Shows action link if available

#### NotificationInitializer (`notification-initializer.svelte`)
- Root layout component that initializes the system
- Polls for new notifications every 5 seconds
- Polls for task updates every 2 seconds
- Displays toast notifications in real-time

### 5. **Client-Side State Management**

Located in `src/lib/state/notification-store.ts`

```typescript
// Stores
notificationStore - Manages notifications
backgroundTaskStore - Manages background tasks

// Derived stores
unreadNotificationCount - Reactive unread count
runningTasksCount - Reactive count of running tasks
hasRunningTasks - Boolean indicating if tasks are running
```

### 6. **API Routes**

#### Task Progress Streaming
`GET /api/tasks/[taskId]/progress`
- Server-Sent Events (SSE) stream for real-time task progress
- Polls database every 1 second
- Auto-closes when task completes

#### Cleanup Endpoint
`POST /api/notifications/cleanup`
- Removes expired notifications and tasks
- Can be called periodically or via cron job

## Usage Examples

### Example 1: Creating a Long-Running Task

```typescript
// In a remote function (src/lib/remotes/my-feature.remote.ts)
import { createBackgroundTask, completeBackgroundTask, updateBackgroundTaskProgress } from '$lib/server/services/notification-manager';
import { createNotification } from '$lib/server/services/notification-manager';

export const startDataMigration = form(MigrationSchema, async (data) => {
  const user = auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Create background task
  const task = await createBackgroundTask(user.id, {
    name: 'Data Migration',
    description: 'Importing data from JSON export',
    totalItems: data.items.length,
    metadata: {
      fileSize: data.fileSize,
      startDate: new Date().toISOString()
    }
  });

  // Create a notification for task start
  await createNotification(user.id, {
    title: 'Migration Started',
    message: `Starting to import ${data.items.length} items...`,
    type: 'task',
    taskId: task.id
  });

  // Start async task processing
  processDataAsync(user.id, task.id, data.items).catch(error => {
    console.error('Data migration error:', error);
  });

  return { success: true, taskId: task.id };
});

// Async function that runs in background
async function processDataAsync(userId: string, taskId: string, items: any[]) {
  try {
    let processedCount = 0;

    for (const item of items) {
      // Process item
      await saveItem(item);

      processedCount++;

      // Update progress
      await updateBackgroundTaskProgress(taskId, userId, {
        progress: Math.round((processedCount / items.length) * 100),
        processedItems: processedCount,
        status: 'running'
      });
    }

    // Complete task
    await completeBackgroundTask(taskId, userId, {
      result: {
        processedItems: processedCount,
        successCount: processedCount,
        completedAt: new Date().toISOString()
      }
    });

    // Create success notification
    await createNotification(userId, {
      title: 'Migration Completed',
      message: `Successfully imported ${processedCount} items`,
      type: 'success',
      taskId: taskId,
      actionUrl: '/admin/dashboard',
      actionLabel: 'View Results'
    });
  } catch (error) {
    // Complete task with error
    await completeBackgroundTask(taskId, userId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'MIGRATION_ERROR'
    });

    // Create error notification
    await createNotification(userId, {
      title: 'Migration Failed',
      message: error instanceof Error ? error.message : 'An error occurred',
      type: 'error',
      taskId: taskId
    });
  }
}
```

### Example 2: Using Notifications in a Component

```svelte
<script lang="ts">
  import { 
    getBackgroundTasksQuery, 
    getUserNotificationsQuery,
    markAsReadCommand,
    deleteNotificationCommand 
  } from '$lib/remotes/in-app-notification.remote';
  import NotificationCenter from '$lib/components/common/feedback/notification-center.svelte';
  import BackgroundTaskMonitor from '$lib/components/common/feedback/background-task-monitor.svelte';
  import { unreadNotificationCount, runningTasksCount } from '$lib/state/notification-store';
  import { Bell, Clock } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  let notificationCenterOpen = $state(false);
  let taskMonitorOpen = $state(false);
</script>

<nav>
  <!-- Notification Bell Icon -->
  <Button 
    variant="ghost" 
    size="icon"
    onclick={() => notificationCenterOpen = true}
    class="relative"
  >
    <Bell class="w-5 h-5" />
    {#if $unreadNotificationCount > 0}
      <Badge 
        variant="destructive" 
        class="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
      >
        {$unreadNotificationCount}
      </Badge>
    {/if}
  </Button>

  <!-- Background Tasks Icon -->
  <Button 
    variant="ghost" 
    size="icon"
    onclick={() => taskMonitorOpen = true}
    class="relative"
  >
    <Clock class="w-5 h-5" />
    {#if $runningTasksCount > 0}
      <Badge 
        variant="default" 
        class="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
      >
        {$runningTasksCount}
      </Badge>
    {/if}
  </Button>
</nav>

<!-- Notification Center Dialog -->
<NotificationCenter bind:open={notificationCenterOpen} />

<!-- Background Task Monitor Dialog -->
<BackgroundTaskMonitor bind:open={taskMonitorOpen} />
```

### Example 3: Real-Time Progress Monitoring

```svelte
<script lang="ts">
  import { getBackgroundTaskQuery } from '$lib/remotes/in-app-notification.remote';
  import { setupTaskProgressStream } from '$lib/state/notification-store';
  import { Progress } from '$lib/components/ui/progress';
  import { onMount, onDestroy } from 'svelte';

  let { taskId } = $props();

  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Setup real-time progress stream
    unsubscribe = setupTaskProgressStream(taskId, (data) => {
      console.log('Task progress:', data);
      // Update local state or UI based on progress data
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

{#await getBackgroundTaskQuery({ id: taskId }) then task}
  <div>
    <h3>{task.name}</h3>
    
    {#if task.totalItems}
      <div class="text-sm text-muted-foreground mb-2">
        {task.processedItems} / {task.totalItems} items
      </div>
    {/if}
    
    <Progress value={task.progress} class="h-2" />
    
    <p class="text-sm mt-2">{task.progress}% complete</p>
    
    {#if task.error}
      <div class="text-red-600 text-sm mt-2">
        Error: {task.error}
      </div>
    {/if}
  </div>
{/await}
```

### Example 4: Creating a Quick Notification

```typescript
// Simple notification from any remote function
import { createNotification } from '$lib/server/services/notification-manager';

export const updateUserProfile = form(ProfileSchema, async (data) => {
  const user = auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Update profile
  await db.update(tables.user).set(data).where(eq(tables.user.id, user.id));

  // Create notification
  await createNotification(user.id, {
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully',
    type: 'success',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire in 24 hours
  });

  return { success: true };
});
```

## Layout Integration

Add the `NotificationInitializer` component to your root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import NotificationInitializer from '$lib/components/common/feedback/notification-initializer.svelte';
  import { Toaster } from '$lib/components/ui/sonner/index.js';
  import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import { i18n } from '$lib/i18n';

  let { children } = $props();
</script>

<ParaglideJS {i18n}>
  <!-- Initialize notification system -->
  <NotificationInitializer />

  <!-- Render pages -->
  {@render children()}

  <!-- Global toast notifications -->
  <Toaster />
</ParaglideJS>
```

## Translation Keys

All UI text is internationalized. Available keys:

- `notifications` - Notification center title
- `notification_center` - Dialog title
- `notification_no_notifications` - Empty state
- `notification_unread_only` - Filter label
- `notification_mark_all_as_read` - Button label
- `notification_delete_all` - Button label
- `background_tasks` - Task monitor title
- `task_pending`, `task_running`, `task_completed`, `task_failed`, `task_cancelled` - Status labels
- `task_started` - Field label
- `task_duration` - Field label
- `task_error` - Field label
- `task_result` - Field label

## Best Practices

1. **Always Use Background Tasks for Long Operations**
   - Anything taking more than 1-2 seconds should be a background task
   - Never block the user's interaction waiting for server tasks

2. **Provide Progress Updates**
   - Update progress regularly (at least every second)
   - Help users understand how long tasks will take

3. **Create Meaningful Notifications**
   - Use clear, actionable titles and messages
   - Provide action URLs to view results
   - Include error details when tasks fail

4. **Set Expiration Dates**
   - Automatic cleanup keeps database clean
   - Older notifications auto-delete after 30 days

5. **Monitor Resource Usage**
   - Check notification and task counts periodically
   - Implement cleanup routines via cron jobs
   - Use pagination for large lists

6. **Handle Task Cancellation**
   - Implement graceful cleanup in async processes
   - Update task status immediately when cancelled
   - Notify users of cancellation

## Cleanup

The system automatically cleans up expired notifications and tasks. To ensure cleanup runs:

1. **Manual Cleanup**: Call the cleanup endpoint manually
   ```bash
   curl -X POST https://yourdomain.com/api/notifications/cleanup
   ```

2. **Cron Job**: Set up a cron job to call the endpoint periodically
   ```bash
   # Run cleanup every hour
   0 * * * * curl -X POST https://yourdomain.com/api/notifications/cleanup
   ```

3. **Automatic in Components**: The `NotificationInitializer` runs cleanup once per hour automatically

## Performance Considerations

- Notifications and tasks are stored in SQLite
- Polling intervals: 5s for notifications, 2s for tasks (configurable)
- SSE streams are efficient and scalable
- Old data is automatically cleaned up
- Pagination prevents loading too many items at once

## Future Enhancements

- WebSocket support for real-time updates (instead of polling)
- Email notifications for important events
- Notification preferences per user
- Task retry mechanism
- Task scheduling and queuing
- Integration with external notification services (Slack, Discord, etc.)
