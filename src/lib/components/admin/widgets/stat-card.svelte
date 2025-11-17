<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { TrendingUp, TrendingDown } from '@lucide/svelte';
	import type { Component } from 'svelte';

	let {
		title,
		value,
		change,
		trend,
		icon,
		formatValue = (v: number | string) => v.toString()
	}: {
		title: string;
		value: number | string;
		change?: number;
		trend?: 'up' | 'down';
		icon?: Component<any>;
		formatValue?: (v: number | string) => string;
	} = $props();

	const trendColor = $derived(trend === 'up' ? 'text-green-600' : 'text-red-600');
	const trendBgColor = $derived(trend === 'up' ? 'bg-green-100' : 'bg-red-100');
</script>

<Card class="p-6">
	<div class="flex items-center justify-between">
		<div class="flex-1">
			<p class="text-sm font-medium text-muted-foreground">{title}</p>
			<p class="text-3xl font-bold mt-2">{formatValue(value)}</p>
			{#if change !== undefined && trend}
				<div class="flex items-center gap-1 mt-2">
					<div class="flex items-center gap-0.5 {trendColor} {trendBgColor} px-2 py-0.5 rounded-full">
						{#if trend === 'up'}
							<TrendingUp class="h-3 w-3" />
						{:else}
							<TrendingDown class="h-3 w-3" />
						{/if}
						<span class="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
					</div>
				</div>
			{/if}
		</div>
		{#if icon}
			{@const Icon = icon}
			<div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
				<Icon class="h-6 w-6 text-primary" />
			</div>
		{/if}
	</div>
</Card>
