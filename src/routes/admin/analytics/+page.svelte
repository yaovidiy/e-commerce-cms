<script lang="ts">
	import {
		getDashboardStats,
		getRevenueChart,
		getTopProducts,
		getTopCategories,
		getRecentOrders
	} from '$lib/remotes/analytics.remote';
	import { StatCard, RevenueChart, TopProducts, TopCategories, RecentOrders } from '$lib/components/admin/widgets';
	import { DollarSign, ShoppingCart, Package, Users } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100);
	}
</script>

<svelte:head>
	<title>{m.analytics?.() || 'Analytics'} | Admin</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{m.analytics_dashboard?.() || 'Analytics Dashboard'}</h1>
	</div>

	<!-- Stats Cards -->
	{#await getDashboardStats()}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each Array(4) as _}
				<div class="h-32 bg-muted animate-pulse rounded-lg"></div>
			{/each}
		</div>
	{:then stats}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<StatCard
				title={m.total_revenue?.() || 'Total Revenue'}
				value={stats.revenue.value}
				change={stats.revenue.change}
				trend={stats.revenue.trend as 'up' | 'down'}
				icon={DollarSign}
				formatValue={(v) => formatCurrency(Number(v))}
			/>
			<StatCard
				title={m.total_orders?.() || 'Total Orders'}
				value={stats.orders.value}
				change={stats.orders.change}
				trend={stats.orders.trend as 'up' | 'down'}
				icon={ShoppingCart}
			/>
			<StatCard
				title={m.active_products?.() || 'Active Products'}
				value={stats.products.value}
				icon={Package}
			/>
			<StatCard
				title={m.total_customers?.() || 'Total Customers'}
				value={stats.customers.value}
				icon={Users}
			/>
		</div>
	{:catch error}
		<div class="p-6 border border-destructive rounded-lg bg-destructive/10">
			<p class="text-destructive">{m.error_loading_stats?.() || 'Error loading statistics'}: {error.message}</p>
		</div>
	{/await}

	<!-- Revenue Chart -->
	<div class="grid grid-cols-1 gap-6">
		{#await getRevenueChart()}
			<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
		{:then chartData}
			<RevenueChart data={chartData} />
		{:catch error}
			<div class="p-6 border border-destructive rounded-lg bg-destructive/10">
				<p class="text-destructive">{m.error_loading_chart?.() || 'Error loading chart'}: {error.message}</p>
			</div>
		{/await}
	</div>

	<!-- Top Products & Categories -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		{#await getTopProducts()}
			<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
		{:then products}
			<TopProducts data={products as any} />
		{:catch error}
			<div class="p-6 border border-destructive rounded-lg bg-destructive/10">
				<p class="text-destructive">{m.error_loading_products?.() || 'Error loading products'}: {error.message}</p>
			</div>
		{/await}

		{#await getTopCategories()}
			<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
		{:then categories}
			<TopCategories data={categories as any} />
		{:catch error}
			<div class="p-6 border border-destructive rounded-lg bg-destructive/10">
				<p class="text-destructive">{m.error_loading_categories?.() || 'Error loading categories'}: {error.message}</p>
			</div>
		{/await}
	</div>

	<!-- Recent Orders -->
	<div class="grid grid-cols-1 gap-6">
		{#await getRecentOrders()}
			<div class="h-96 bg-muted animate-pulse rounded-lg"></div>
		{:then orders}
			<RecentOrders data={orders} />
		{:catch error}
			<div class="p-6 border border-destructive rounded-lg bg-destructive/10">
				<p class="text-destructive">{m.error_loading_orders?.() || 'Error loading orders'}: {error.message}</p>
			</div>
		{/await}
	</div>
</div>
