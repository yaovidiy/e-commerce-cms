<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';

	let {
		data
	}: {
		data: { date: string; revenue: number; orders: number }[];
	} = $props();

	// Calculate max values for scaling
	const maxRevenue = $derived(Math.max(...data.map((d) => d.revenue), 1));
	const maxOrders = $derived(Math.max(...data.map((d) => d.orders), 1));

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100);
	}

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<Card class="p-6">
	<h3 class="text-lg font-semibold mb-4">{m.revenue_over_time?.() || 'Revenue Over Time'}</h3>

	{#if data.length > 0}
		<div class="space-y-4">
			<!-- Chart bars -->
			<div class="flex items-end gap-1 h-48">
				{#each data as point}
					{@const heightPercent = (point.revenue / maxRevenue) * 100}
					<div class="flex-1 flex flex-col items-center group">
						<div
							class="w-full bg-primary hover:bg-primary/80 transition-colors rounded-t-lg relative"
							style="height: {heightPercent}%"
							title="{formatDate(point.date)}: {formatCurrency(point.revenue)} ({point.orders} orders)"
						>
							<div
								class="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10"
							>
								{formatCurrency(point.revenue)}
								<br />
								{point.orders}
								{m.orders?.() || 'orders'}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- X-axis labels (show every few dates to avoid crowding) -->
			<div class="flex gap-1">
				{#each data as point, index}
					{@const showLabel = index % Math.ceil(data.length / 7) === 0}
					<div class="flex-1 text-center">
						{#if showLabel}
							<span class="text-xs text-muted-foreground">{formatDate(point.date)}</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Summary stats -->
			<div class="grid grid-cols-3 gap-4 pt-4 border-t">
				<div>
					<p class="text-sm text-muted-foreground">{m.total_revenue?.() || 'Total Revenue'}</p>
					<p class="text-xl font-bold">
						{formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
					</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">{m.total_orders?.() || 'Total Orders'}</p>
					<p class="text-xl font-bold">
						{data.reduce((sum, d) => sum + d.orders, 0)}
					</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">{m.average_order?.() || 'Avg Order'}</p>
					<p class="text-xl font-bold">
						{formatCurrency(
							data.reduce((sum, d) => sum + d.revenue, 0) /
								Math.max(data.reduce((sum, d) => sum + d.orders, 0), 1)
						)}
					</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-48 text-muted-foreground">
			<p>{m.no_data_available?.() || 'No data available'}</p>
		</div>
	{/if}
</Card>
