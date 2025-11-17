<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { FolderOpen } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let {
		data
	}: {
		data: {
			id: string;
			name: string;
			slug: string;
			product_count: number;
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
	<h3 class="text-lg font-semibold mb-4">{m.top_categories?.() || 'Top Categories'}</h3>

	{#if data.length > 0}
		<div class="space-y-4">
			{#each data as category, index}
				<div class="flex items-center gap-4">
					<div class="text-2xl font-bold text-muted-foreground w-6">#{index + 1}</div>

					<div class="h-12 w-12 bg-primary/10 rounded flex items-center justify-center">
						<FolderOpen class="h-6 w-6 text-primary" />
					</div>

					<div class="flex-1 min-w-0">
						<p class="font-medium truncate">{category.name}</p>
						<p class="text-sm text-muted-foreground">
							{category.product_count}
							{m.products?.() || 'products'} • {category.total_sold || 0}
							{m.sold?.() || 'sold'}
						</p>
					</div>

					<div class="text-right">
						<p class="font-semibold">{formatCurrency(category.total_revenue || 0)}</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center h-32 text-muted-foreground">
			<p>{m.no_category_data?.() || 'No category data available'}</p>
		</div>
	{/if}
</Card>
