<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as m from '$lib/paraglide/messages';

	let {
		data
	}: {
		data: {
			id: string;
			orderNumber: string;
			total: number;
			status: string;
			customerName: string;
			email: string;
			createdAt: Date;
		}[];
	} = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100);
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function getStatusVariant(
		status: string
	): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'delivered':
				return 'default';
			case 'shipped':
				return 'secondary';
			case 'processing':
				return 'outline';
			case 'cancelled':
			case 'refunded':
				return 'destructive';
			default:
				return 'outline';
		}
	}
</script>

<Card class="p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold">{m.recent_orders?.() || 'Recent Orders'}</h3>
		<Button href="/admin/orders" variant="ghost" size="sm">
			{m.view_all?.() || 'View All'}
		</Button>
	</div>

	{#if data.length > 0}
		<div class="space-y-4">
			{#each data as order}
				<div class="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1">
							<p class="font-medium truncate">{order.orderNumber}</p>
							<Badge variant={getStatusVariant(order.status)} class="capitalize">
								{order.status}
							</Badge>
						</div>
						<p class="text-sm text-muted-foreground truncate">{order.customerName}</p>
						<p class="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
					</div>

					<div class="text-right">
						<p class="font-semibold">{formatCurrency(order.total)}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center h-32 text-muted-foreground">
			<p>{m.no_orders_yet?.() || 'No orders yet'}</p>
		</div>
	{/if}
</Card>
