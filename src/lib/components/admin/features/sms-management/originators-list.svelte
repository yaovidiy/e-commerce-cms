<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { CheckCircle, AlertCircle, Clock, XCircle, RefreshCw } from '@lucide/svelte/icons';

	interface Originator {
		name: string;
		status: string;
	}

	interface Props {
		originators: Originator[];
		loading?: boolean;
		error?: string | null;
		onRefresh?: () => void;
	}

	let { originators = [], loading = false, error = null, onRefresh } = $props();

	function getStatusIcon(status: string) {
		switch (status) {
			case 'Approved':
				return CheckCircle;
			case 'Being moderated':
			case 'Awaiting moderation by operator':
				return Clock;
			case 'Waiting for Additional. Information':
				return AlertCircle;
			case 'Rejected':
				return XCircle;
			default:
				return AlertCircle;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Approved':
				return 'text-green-600';
			case 'Being moderated':
			case 'Awaiting moderation by operator':
				return 'text-blue-600';
			case 'Waiting for Additional. Information':
				return 'text-amber-600';
			case 'Rejected':
				return 'text-red-600';
			default:
				return 'text-gray-600';
		}
	}
</script>

<Card class="p-6">
	<div class="flex items-center justify-between mb-4">
		<div>
			<h3 class="font-semibold text-lg">{m.sms_sender_names?.() || 'Sender Names'}</h3>
			<p class="text-sm text-muted-foreground">
				{m.sms_manage_sender_names?.() || 'Manage your approved sender names (originators)'}
			</p>
		</div>
		{#if onRefresh}
			<Button variant="outline" size="sm" onclick={onRefresh} disabled={loading}>
				<RefreshCw class={`size-4 ${loading ? 'animate-spin' : ''}`} />
				{m.common_refresh?.() || 'Refresh'}
			</Button>
		{/if}
	</div>

	{#if error}
		<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
			{m.sms_error_loading_originators?.() || 'Error loading sender names'}: {error}
		</div>
	{:else if loading}
		<div class="space-y-3">
			{#each [1, 2, 3] as _}
				<div class="flex items-center justify-between p-3 border rounded">
					<div class="h-5 rounded bg-muted animate-pulse w-32"></div>
					<div class="h-5 rounded bg-muted animate-pulse w-24"></div>
				</div>
			{/each}
		</div>
	{:else if originators.length === 0}
		<div class="rounded-lg bg-muted/50 p-6 text-center">
			<p class="text-sm text-muted-foreground">
				{m.sms_no_approved_senders?.() || 'No approved sender names yet'}
			</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each originators as originator}
				{@const Icon = getStatusIcon(originator.status)}
				{@const statusColor = getStatusColor(originator.status)}
				<div class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
					<div class="flex items-center gap-3">
						<Icon class={`size-5 ${statusColor}`} />
						<span class="font-medium">{originator.name}</span>
					</div>
					<span class="text-sm text-muted-foreground">{originator.status}</span>
				</div>
			{/each}
		</div>
	{/if}
</Card>
