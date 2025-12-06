<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { X, Check, AlertCircle, Info, CheckCircle, Clock } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { UserNotification } from '$lib/server/db/schema';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		notification: UserNotification & { metadata?: Record<string, any> };
		onRead?: () => void;
		onDelete?: () => void;
	}

	let { notification, onRead, onDelete } = $props();

	const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
		success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
		error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
		info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
		warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
		task: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' }
	};

	const config = typeConfig[notification.type] || typeConfig.info;
	const IconComponent = config.icon;

	function formatTime(date: Date) {
		const now = new Date();
		const diffMs = now.getTime() - new Date(date).getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return m.justNow?.() || 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return new Date(date).toLocaleDateString();
	}
</script>

<div
	class={cn(
		'flex gap-3 p-4 rounded-lg border transition-colors',
		notification.isRead
			? 'bg-background border-border'
			: 'bg-accent border-primary bg-opacity-10'
	)}
>
	<!-- Icon -->
	<div class={cn('flex-shrink-0 mt-0.5', config.color)}>
		<svelte:component this={IconComponent} class="w-5 h-5" />
	</div>

	<!-- Content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-1">
					<h4 class="font-semibold text-sm">{notification.title}</h4>
					<Badge variant="outline" class="text-xs">
						{notification.type}
					</Badge>
					{#if !notification.isRead}
						<div class="w-2 h-2 rounded-full bg-primary"></div>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground line-clamp-2">
					{notification.message}
				</p>
				<div class="text-xs text-muted-foreground mt-2">
					{formatTime(notification.createdAt)}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-1 flex-shrink-0">
				{#if notification.actionUrl}
					<Button
						variant="ghost"
						size="sm"
						class="h-8 px-2"
						onclick={() => {
							window.location.href = notification.actionUrl || '';
						}}
					>
						{notification.actionLabel || 'View'}
					</Button>
				{/if}

				{#if !notification.isRead}
					<Button
						variant="ghost"
						size="sm"
						class="h-8 w-8 p-0"
						title={m.markAsRead?.() || 'Mark as read'}
						onclick={() => {
							onRead?.();
						}}
					>
						<Check class="w-4 h-4" />
					</Button>
				{/if}

				<Button
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0 text-destructive hover:text-destructive"
					title={m.delete?.() || 'Delete'}
					onclick={() => {
						onDelete?.();
					}}
				>
					<X class="w-4 h-4" />
				</Button>
			</div>
		</div>
	</div>
</div>
