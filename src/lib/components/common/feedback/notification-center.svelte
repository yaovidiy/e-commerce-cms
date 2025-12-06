<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserNotificationsQuery, markAsReadCommand, deleteNotificationCommand, deleteAllNotificationsCommand, markAllAsReadCommand } from '$lib/remotes/in-app-notification.remote';
	import { getUnreadNotificationCount } from '$lib/state/notification-store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils';
	import NotificationItem from './notification-item.svelte';
	import * as m from '$lib/paraglide/messages';
	
	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) } = $props();
	
	let currentPage = $state(1);
	let unreadOnly = $state(false);
	let selectedType = $state<'all' | 'success' | 'error' | 'info' | 'warning' | 'task'>('all');

	const unreadNotificationCount = $derived(getUnreadNotificationCount());

	onMount(() => {
		// Refresh on mount
	});

	async function handleMarkAllAsRead() {
		await markAllAsReadCommand({
			type: selectedType
		});
		// Refresh the list
		await (getUserNotificationsQuery as any)({ 
			page: currentPage, 
			pageSize: 20,
			unreadOnly,
			type: selectedType 
		}).refresh?.();
	}

	async function handleDeleteAll() {
		await deleteAllNotificationsCommand({
			type: selectedType
		});
		// Refresh the list
		currentPage = 1;
		await (getUserNotificationsQuery as any)({ 
			page: currentPage, 
			pageSize: 20,
			unreadOnly,
			type: selectedType 
		}).refresh?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl max-h-[80vh] flex flex-col">
		<Dialog.Header>
		<Dialog.Title>
			{m.notifications?.() || 'Notifications'}
			{#if unreadNotificationCount > 0}
				<span class="text-sm font-normal text-muted-foreground ml-2">
					({unreadNotificationCount} {m.unread?.() || 'unread'})
				</span>
			{/if}
		</Dialog.Title>
		</Dialog.Header>

		<!-- Controls -->
		<div class="flex flex-col gap-4 border-b pb-4">
			<!-- Filter buttons -->
			<div class="flex flex-wrap gap-2">
				{#each ['all', 'success', 'error', 'info', 'warning', 'task'] as type}
					<Button
						variant={selectedType === type ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							selectedType = type as any;
							currentPage = 1;
						}}
					>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</Button>
				{/each}
			</div>

			<!-- Checkbox for unread only -->
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={unreadOnly}
					onchange={() => {
						currentPage = 1;
					}}
				/>
				<span class="text-sm">{m.notification_unread_only?.() || 'Unread only'}</span>
			</label>

			<!-- Action buttons -->
			<div class="flex gap-2 justify-end">
				<Button
					variant="outline"
					size="sm"
					onclick={handleMarkAllAsRead}
				>
					{m.notification_mark_all_as_read?.() || 'Mark All as Read'}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={handleDeleteAll}
					class="text-destructive"
				>
					{m.notification_delete_all?.() || 'Delete All'}
				</Button>
			</div>
		</div>

		<!-- Notifications list -->
		<div class="flex-1 overflow-y-auto">
			{#await getUserNotificationsQuery({ 
				page: currentPage, 
				pageSize: 20,
				unreadOnly,
				type: selectedType 
			})}
				<div class="flex items-center justify-center py-8">
					<div class="text-sm text-muted-foreground">{m.loading?.() || 'Loading...'}</div>
				</div>
			{:then data}
				{#if data.notifications.length === 0}
					<div class="flex items-center justify-center py-12">
						<div class="text-center text-muted-foreground">
							<p class="text-sm">{m.notification_no_notifications?.() || 'No notifications'}</p>
						</div>
					</div>
				{:else}
					<div class="space-y-2">
						{#each data.notifications as notification (notification.id)}
							<NotificationItem 
								{notification}
								onRead={async () => {
									if (!notification.isRead) {
										await markAsReadCommand({ id: notification.id });
										await (getUserNotificationsQuery as any)({ 
											page: currentPage, 
											pageSize: 20,
											unreadOnly,
											type: selectedType 
										}).refresh?.();
									}
								}}
								onDelete={async () => {
									await deleteNotificationCommand({ id: notification.id });
									await (getUserNotificationsQuery as any)({ 
										page: currentPage, 
										pageSize: 20,
										unreadOnly,
										type: selectedType 
									}).refresh?.();
								}}
							/>
						{/each}
					</div>

					<!-- Pagination -->
					{#if data.totalPages > 1}
						<div class="flex items-center justify-between border-t pt-4 mt-4">
							<div class="text-sm text-muted-foreground">
								{m.page?.() || 'Page'} {data.page} {m.of?.() || 'of'} {data.totalPages}
							</div>
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onclick={() => {
										if (currentPage > 1) currentPage--;
									}}
								>
									{m.common_previous?.() || 'Previous'}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage >= data.totalPages}
									onclick={() => {
										if (currentPage < data.totalPages) currentPage++;
									}}
								>
									{m.common_next?.() || 'Next'}
								</Button>
							</div>
						</div>
					{/if}
				{/if}
			{/await}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => open = false}>
				{m.common_close?.() || 'Close'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
