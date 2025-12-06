<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { UserNotification } from '$lib/server/db/schema';

	interface Props {
		notification?: UserNotification & { metadata?: Record<string, any> };
		onClose?: () => void;
	}

	let { notification, onClose } = $props();
	let timeoutId: NodeJS.Timeout | null = null;

	const typeToVariant: Record<string, any> = {
		success: 'success',
		error: 'error',
		info: 'info',
		warning: 'warning',
		task: 'info'
	};

	onMount(() => {
		if (notification) {
			// Show toast using sonner
			toast[typeToVariant[notification.type] || 'info'](notification.title, {
				description: notification.message,
				action: notification.actionUrl
					? {
							label: notification.actionLabel || 'View',
							onClick: () => {
								window.location.href = notification!.actionUrl || '';
							}
						}
					: undefined,
				duration: notification.type === 'task' ? Infinity : 5000
			});

			// Auto-dismiss after specified duration (unless it's a task notification)
			if (notification.type !== 'task') {
				timeoutId = setTimeout(() => {
					onClose?.();
				}, 5000);
			}
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});

	function handleClose() {
		if (timeoutId) clearTimeout(timeoutId);
		onClose?.();
	}
</script>

<!-- Toast notifications are rendered by sonner globally -->
