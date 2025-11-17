<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Package } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let {
		data
	}: {
		data: {
			id: string;
			name: string;
			slug: string;
			price: number;
			images: string;
			total_sold: number;
			total_revenue: number;
		}[];
	} = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100);
	}
</script>

<Card class="p-6">
	<h3 class="text-lg font-semibold mb-4">{m.top_products?.() || 'Top Products'}</h3>

	{#if data.length > 0}
		<div class="space-y-4">
			{#each data as product, index}
				{@const images =
					typeof product.images === 'string' ? JSON.parse(product.images) : product.images}
				<div class="flex items-center gap-4">
					<div class="text-2xl font-bold text-muted-foreground w-6">#{index + 1}</div>

					{#if images && images.length > 0}
						<img
							src={images[0]}
							alt={product.name}
							class="w-12 h-12 object-cover rounded"
						/>
					{:else}
						<div class="w-12 h-12 bg-muted rounded flex items-center justify-center">
							<Package class="h-6 w-6 text-muted-foreground" />
						</div>
					{/if}

					<div class="flex-1 min-w-0">
						<p class="font-medium truncate">{product.name}</p>
						<p class="text-sm text-muted-foreground">
							{product.total_sold}
							{m.units_sold?.() || 'units sold'}
						</p>
					</div>

					<div class="text-right">
						<p class="font-semibold">{formatCurrency(product.total_revenue)}</p>
						<p class="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center h-32 text-muted-foreground">
			<p>{m.no_sales_data?.() || 'No sales data available'}</p>
		</div>
	{/if}
</Card>
