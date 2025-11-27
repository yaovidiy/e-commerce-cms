<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';
	import { AlertCircle, CheckCircle, Clock, XCircle, Zap } from '@lucide/svelte/icons';

	interface BalanceResponse {
		money: string;
		currency: string;
	}

	interface Props {
		balance: BalanceResponse | null;
		loading?: boolean;
		error?: string | null;
	}

	let { balance = $bindable(), loading = false, error = null } = $props();

	// Determine balance status
	const balanceNumber = balance ? parseFloat(balance.money) : 0;
	const isLow = balanceNumber < 10;
	const isEmpty = balanceNumber <= 0;

	function getStatusIcon() {
		if (isEmpty) {
			return XCircle;
		}
		if (isLow) {
			return AlertCircle;
		}
		return CheckCircle;
	}

	function getStatusColor() {
		if (isEmpty) return 'destructive';
		if (isLow) return 'warning';
		return 'default';
	}

	const StatusIcon = getStatusIcon();
	const statusColor = getStatusColor();
</script>

<Card class="p-6">
	<div class="flex items-start justify-between">
		<div class="flex items-start gap-4">
			<div class="rounded-lg bg-muted p-3">
				<Zap class="size-6 text-muted-foreground" />
			</div>
			<div class="space-y-1">
				<h3 class="font-semibold text-lg">{m.sms_account_balance?.() || 'Account Balance'}</h3>
				<p class="text-sm text-muted-foreground">{m.sms_current_account_balance?.() || 'Current SMS Club account balance'}</p>
			</div>
		</div>
		{#if !isEmpty && !isLow}
			<CheckCircle class="size-6 text-green-600" />
		{:else if isLow && !isEmpty}
			<AlertCircle class="size-6 text-amber-600" />
		{:else}
			<XCircle class="size-6 text-red-600" />
		{/if}
	</div>

	<div class="mt-4 space-y-3">
		{#if error}
			<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
				<p>{m.sms_error_loading_balance?.() || 'Error loading balance'}: {error}</p>
			</div>
		{:else if loading}
			<div class="space-y-2">
				<div class="h-8 rounded bg-muted animate-pulse"></div>
				<div class="h-6 rounded bg-muted animate-pulse w-48"></div>
			</div>
		{:else if balance}
			<div class="flex items-baseline gap-2">
				<span class="text-4xl font-bold">{balance.money}</span>
				<span class="text-sm font-medium text-muted-foreground">{balance.currency}</span>
			</div>

			{#if isEmpty}
				<Badge variant="destructive" class="w-fit">
					{m.sms_balance_empty?.() || 'Account Empty'}
				</Badge>
				<p class="text-sm text-muted-foreground">
					{m.sms_balance_empty_message?.() || 'Your account has no balance. Please refill to send SMS.'}
				</p>
			{:else if isLow}
				<Badge variant="outline" class="w-fit border-amber-600 text-amber-600">
					{m.sms_balance_low?.() || 'Low Balance'}
				</Badge>
				<p class="text-sm text-muted-foreground">
					{m.sms_balance_low_message?.() || 'Your balance is running low. Consider refilling soon.'}
				</p>
			{:else}
				<Badge variant="default" class="w-fit">
					{m.sms_balance_sufficient?.() || 'Sufficient Balance'}
				</Badge>
			{/if}
		{/if}
	</div>
</Card>
