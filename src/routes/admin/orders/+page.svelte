<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { OrderListTable } from '$lib/components/admin/features/order-management';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.order_orders?.() ?? 'Orders'}</h2>
			<p class="text-muted-foreground">{m.order_manage_description?.() ?? 'Manage customer orders, update statuses, and send emails'}</p>
		</div>
	</div>

	<OrderListTable />
</div>
