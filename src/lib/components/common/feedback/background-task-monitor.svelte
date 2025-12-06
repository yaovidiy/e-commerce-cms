<script lang="ts">
	import { getBackgroundTasksQuery, cancelTaskCommand } from '$lib/remotes/in-app-notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Clock, CheckCircle, AlertCircle, Pause, Trash2 } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) } = $props();

	let selectedStatus = $state<'all' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'>('all');
	let currentPage = $state(1);

	const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
		pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
		running: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
		completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
		failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
		cancelled: { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-100' }
	};

	function formatDuration(startDate: Date | null, endDate: Date | null) {
		if (!startDate) return '-';

		const end = endDate ? new Date(endDate) : new Date();
		const start = new Date(startDate);
		const diffMs = end.getTime() - start.getTime();
		const diffSecs = Math.floor(diffMs / 1000);
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);

		if (diffSecs < 60) return `${diffSecs}s`;
		if (diffMins < 60) return `${diffMins}m`;
		return `${diffHours}h ${diffMins % 60}m`;
	}

	async function handleCancelTask(taskId: string) {
		await cancelTaskCommand({ id: taskId });
		await (getBackgroundTasksQuery as any)({
			page: currentPage,
			pageSize: 20,
			status: selectedStatus
		}).refresh?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-3xl max-h-[80vh] flex flex-col">
		<Dialog.Header>
			<Dialog.Title>{m.background_tasks?.() || 'Background Tasks'}</Dialog.Title>
		</Dialog.Header>

		<!-- Filter buttons -->
		<div class="flex flex-wrap gap-2 border-b pb-4">
			{#each ['all', 'pending', 'running', 'completed', 'failed', 'cancelled'] as status}
				<Button
					variant={selectedStatus === status ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						selectedStatus = status as any;
						currentPage = 1;
					}}
				>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Button>
			{/each}
		</div>

		<!-- Tasks list -->
		<div class="flex-1 overflow-y-auto">
			{#await getBackgroundTasksQuery({
				page: currentPage,
				pageSize: 20,
				status: selectedStatus
			})}
				<div class="flex items-center justify-center py-8">
					<div class="text-sm text-muted-foreground">{m.task_loading?.() || 'Loading...'}</div>
				</div>
			{:then data}
				{#if data.tasks.length === 0}
					<div class="flex items-center justify-center py-12">
						<div class="text-center text-muted-foreground">
							<p class="text-sm">{m.task_no_tasks?.() || 'No tasks'}</p>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						{#each data.tasks as task (task.id)}
							{@const config = statusConfig[task.status] || statusConfig.pending}
							{@const IconComponent = config.icon}

							<div class="border rounded-lg p-4">
								<!-- Header -->
								<div class="flex items-start justify-between mb-3">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<IconComponent class={cn('w-5 h-5', config.color)} />
											<h4 class="font-semibold text-sm">{task.name}</h4>
											<Badge variant="outline">{task.status}</Badge>
										</div>
										{#if task.description}
											<p class="text-sm text-muted-foreground">{task.description}</p>
										{/if}
									</div>

									<!-- Actions -->
									<div class="flex gap-1">
										{#if task.status === 'running' || task.status === 'pending'}
											<Button
												variant="ghost"
												size="sm"
												class="h-8 w-8 p-0 text-destructive"
												title={m.common_cancel?.() || 'Cancel'}
												onclick={() => handleCancelTask(task.id)}
											>
												<Pause class="w-4 h-4" />
											</Button>
										{/if}
									</div>
								</div>

								<!-- Progress -->
								{#if task.totalItems}
									<div class="mb-3">
										<div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
											<span>
												{task.processedItems} / {task.totalItems}
											</span>
											<span>{task.progress}%</span>
										</div>
										<Progress value={task.progress} class="h-2" />
									</div>
								{:else if task.status === 'running' || task.status === 'pending'}
									<div class="mb-3">
										<div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
											<span>{m.task_in_progress?.() || 'In progress'}</span>
											<span>{task.progress}%</span>
										</div>
										<Progress value={task.progress} class="h-2" />
									</div>
								{/if}

								<!-- Info -->
								<div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
									<div>
										<span class="font-semibold">{m.task_started?.() || 'Started'}:</span>
										{#if task.startedAt}
											{new Date(task.startedAt).toLocaleString()}
										{:else}
											-
										{/if}
									</div>
									<div>
										<span class="font-semibold">{m.task_duration?.() || 'Duration'}:</span>
										{formatDuration(task.startedAt, task.completedAt)}
									</div>
								</div>

								<!-- Error message -->
								{#if task.error}
									<div class="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
										<strong>{m.task_error?.() || 'Error'}:</strong> {task.error}
										{#if task.errorCode}
											<div class="text-xs opacity-75">({task.errorCode})</div>
										{/if}
									</div>
								{/if}

								<!-- Result -->
								{#if task.result && Object.keys(task.result).length > 0}
									<div class="mt-2 p-2 bg-success/10 border border-success/20 rounded text-xs">
										<strong>{m.task_result?.() || 'Result'}:</strong>
										<pre class="mt-1 text-xs overflow-auto">{JSON.stringify(task.result, null, 2)}</pre>
									</div>
								{/if}
							</div>
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
									{m.previous?.() || 'Previous'}
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage >= data.totalPages}
									onclick={() => {
										if (currentPage < data.totalPages) currentPage++;
									}}
								>
									{m.next?.() || 'Next'}
								</Button>
							</div>
						</div>
					{/if}
				{/if}
			{/await}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => open = false}>
				{m.close?.() || 'Close'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
