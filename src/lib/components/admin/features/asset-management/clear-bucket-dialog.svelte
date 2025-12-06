<script lang="ts">
	import { getAllAssets } from '$lib/remotes/asset.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';
	import { AlertCircle, Trash2 } from '@lucide/svelte';

	let { open = $bindable(false) } = $props<{
		open?: boolean;
	}>();

	let isClearing = $state(false);
	let deletedCount = $state(0);
	let totalCount = $state(0);
	let error = $state<string | null>(null);
	let success = $state(false);
	let eventSource: EventSource | null = null;
	let showCloseConfirmation = $state(false);
	let dotCount = $state(0);

	// Animate 3 dots
	let dotInterval: number | undefined;

	function startDotAnimation() {
		dotCount = 0;
		dotInterval = setInterval(() => {
			dotCount = (dotCount + 1) % 4;
		}, 500) as unknown as number;
	}

	function stopDotAnimation() {
		if (dotInterval) {
			clearInterval(dotInterval);
			dotInterval = undefined;
		}
		dotCount = 0;
	}

	function getDots() {
		return '.'.repeat(dotCount);
	}

	async function handleClearBucket() {
		isClearing = true;
		error = null;
		success = false;
		deletedCount = 0;
		totalCount = 0;
		startDotAnimation();

		try {
			// Connect to SSE endpoint
			eventSource = new EventSource('/api/assets/clear-bucket-sse');

			eventSource.addEventListener('message', (event) => {
				try {
					const data = JSON.parse(event.data);

					if (data.type === 'start') {
						totalCount = data.total;
						stopDotAnimation();
					} else if (data.type === 'progress') {
						deletedCount = data.current;
						totalCount = data.total;
					} else if (data.type === 'complete') {
						deletedCount = data.deleted;
						totalCount = data.total;
						success = true;

						// Close the event source
						if (eventSource) {
							eventSource.close();
							eventSource = null;
						}

						// Refresh assets list
						getAllAssets({ filename: '', mimeType: '', page: 1, pageSize: 20 }).refresh();

						// Wait a moment then close dialog
						setTimeout(() => {
							open = false;
							// Reset state
							isClearing = false;
							deletedCount = 0;
							totalCount = 0;
							error = null;
							success = false;
						}, 1500);
					} else if (data.type === 'error') {
						error = data.message || 'Failed to clear bucket';
						isClearing = false;

						if (eventSource) {
							eventSource.close();
							eventSource = null;
						}
					}
				} catch (parseError) {
					console.error('Error parsing SSE message:', parseError);
				}
			});

			eventSource.onerror = () => {
				error = 'Connection lost while clearing bucket';
				isClearing = false;

				if (eventSource) {
					eventSource.close();
					eventSource = null;
				}
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start clearing bucket';
			isClearing = false;
		}
	}

	function stopClearing() {
		// Close the event source connection to stop backend
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}

		stopDotAnimation();
		isClearing = false;
		error = null;
		deletedCount = 0;
		totalCount = 0;
		showCloseConfirmation = false;
		open = false; // Close the main dialog
	}

	function handleOpenChange(newOpen: boolean) {
		// If trying to close while clearing, show confirmation
		if (!newOpen && isClearing) {
			showCloseConfirmation = true;
			return; // Prevent closing
		}

		open = newOpen;

		if (!newOpen) {
			// Close event source if still connected
			if (eventSource) {
				eventSource.close();
				eventSource = null;
			}
			// Reset state when closing
			error = null;
			deletedCount = 0;
			totalCount = 0;
			success = false;
			showCloseConfirmation = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Trash2 class="h-5 w-5 text-destructive" />
				{m.asset_clear_bucket()}
			</Dialog.Title>
			<Dialog.Description>{m.asset_clear_bucket_description()}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			{#if !isClearing && !success}
				<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
					<p class="text-sm text-yellow-800 dark:text-yellow-200">
						<strong>{m.common_warning()}:</strong> {m.asset_clear_bucket_warning()}
					</p>
				</div>

				<div class="rounded-lg bg-muted p-4">
					<p class="text-sm text-muted-foreground">{m.asset_clear_bucket_confirmation()}</p>
				</div>

				<div class="flex gap-3">
					<Button
						variant="destructive"
						disabled={isClearing}
						class="flex-1"
						onclick={handleClearBucket}
					>
						{m.asset_clear_bucket()}
					</Button>
					<Button variant="outline" disabled={isClearing} class="flex-1" onclick={() => (open = false)}>
						{m.common_cancel()}
					</Button>
				</div>
			{:else if isClearing}
				<div class="space-y-4">
					<div class="text-center">
						<p class="text-sm font-medium">{m.asset_clearing_bucket()}</p>
						<p class="mt-2 text-xs text-muted-foreground">
							{#if totalCount > 0}
								{m.asset_clearing_bucket_progress({
									current: deletedCount.toString(),
									total: totalCount.toString()
								})}
							{:else}
								Initializing...
							{/if}
						</p>
					</div>

					<!-- Progress bar -->
					<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							class="h-full bg-primary transition-all duration-300 ease-in-out"
							style="width: {totalCount > 0 ? ((deletedCount / totalCount) * 100).toFixed(1) : 0}%"
						></div>
					</div>

					<!-- Progress text -->
					<div class="rounded-lg bg-muted p-3">
						<p class="text-center text-sm font-mono text-muted-foreground">
							{deletedCount} / {totalCount}
						</p>
					</div>

					<p class="text-center text-xs text-muted-foreground">
						{m.asset_clearing_bucket()}{getDots()}
					</p>

					<p class="text-center text-xs text-muted-foreground">
						Closing this dialog will stop the operation
					</p>
				</div>
			{:else if success}
				<div class="space-y-4">
					<div class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
						<p class="text-sm font-medium text-green-800 dark:text-green-200">
							✓ {m.asset_bucket_cleared({
								count: deletedCount.toString()
							})}
						</p>
					</div>

					<Button variant="outline" class="w-full" onclick={() => (open = false)}>
						{m.common_close()}
					</Button>
				</div>
			{:else if error}
				<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
					<div class="flex gap-3">
						<AlertCircle class="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
						<div>
							<p class="font-medium text-red-800 dark:text-red-200">{m.asset_clear_error()}</p>
							<p class="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
						</div>
					</div>
				</div>

				<div class="flex gap-3">
					<Button variant="outline" class="flex-1" onclick={() => (open = false)}>
						{m.common_close()}
					</Button>
					<Button variant="destructive" class="flex-1" onclick={handleClearBucket}>
						{m.common_retry()}
					</Button>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Separate confirmation dialog that shows even if main dialog is closed -->
<Dialog.Root open={showCloseConfirmation} onOpenChange={(newOpen) => {
	if (!newOpen) {
		showCloseConfirmation = false;
	}
}}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<AlertCircle class="h-5 w-5 text-orange-600 dark:text-orange-400" />
				{m.common_warning()}
			</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-900/20">
				<p class="text-sm font-medium text-orange-800 dark:text-orange-200">
					Progress will be lost
				</p>
				<p class="mt-2 text-sm text-orange-700 dark:text-orange-300">
					Are you sure you want to close? The clearing process will be stopped and <strong>{totalCount - deletedCount}</strong> of <strong>{totalCount}</strong> files will remain undeleted.
				</p>
			</div>

			<div class="flex gap-3">
				<Button variant="destructive" class="flex-1" onclick={stopClearing}>
					Yes, Stop and Close
				</Button>
				<Button
					variant="outline"
					class="flex-1"
					onclick={() => (showCloseConfirmation = false)}
				>
					Continue Clearing
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
