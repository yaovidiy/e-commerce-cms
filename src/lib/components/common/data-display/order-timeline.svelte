<script lang="ts">
	import { Check, Circle, Package, Truck, Home, X } from '@lucide/svelte';
	import type { Order } from '$lib/server/db/schema';

	let { order } = $props<{ order: Order }>();

	// Timeline steps based on order status
	const getTimelineSteps = (status: string, paymentStatus: string) => {
		const steps = [
			{
				key: 'pending',
				label: 'Order Placed',
				description: 'We received your order',
				icon: Circle,
				date: order.createdAt
			},
			{
				key: 'processing',
				label: 'Processing',
				description: 'Your order is being prepared',
				icon: Package,
				date: order.updatedAt && status !== 'pending' ? order.updatedAt : null
			},
			{
				key: 'shipped',
				label: 'Shipped',
				description: 'Your order is on the way',
				icon: Truck,
				date: order.shippedAt
			},
			{
				key: 'delivered',
				label: 'Delivered',
				description: 'Order delivered successfully',
				icon: Home,
				date: order.deliveredAt
			}
		];

		// Handle cancelled status
		if (status === 'cancelled') {
			return [
				steps[0],
				{
					key: 'cancelled',
					label: 'Cancelled',
					description: 'Order was cancelled',
					icon: X,
					date: order.updatedAt
				}
			];
		}

		// Handle refunded status
		if (status === 'refunded') {
			return [
				...steps,
				{
					key: 'refunded',
					label: 'Refunded',
					description: 'Payment refunded',
					icon: X,
					date: order.updatedAt
				}
			];
		}

		return steps;
	};

	const getStatusIndex = (status: string) => {
		const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
		return statusOrder.indexOf(status);
	};

	const steps = $derived(getTimelineSteps(order.status, order.paymentStatus));
	const currentIndex = $derived(getStatusIndex(order.status));

	const isStepCompleted = (index: number) => {
		if (order.status === 'cancelled' || order.status === 'refunded') {
			return index === 0 || steps[index].key === order.status;
		}
		return index <= currentIndex;
	};

	const isStepCurrent = (index: number) => {
		if (order.status === 'cancelled' || order.status === 'refunded') {
			return steps[index].key === order.status;
		}
		return index === currentIndex;
	};

	const formatDate = (date: Date | string | null) => {
		if (!date) return '';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div class="relative">
	{#each steps as step, index}
		<div class="relative flex items-start pb-8 last:pb-0">
			<!-- Vertical line -->
			{#if index < steps.length - 1}
				<div
					class={`absolute left-5 top-10 -ml-px h-full w-0.5 ${
						isStepCompleted(index) ? 'bg-primary' : 'bg-muted'
					}`}
				></div>
			{/if}

			<!-- Icon container -->
			<div
				class={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
					isStepCompleted(index)
						? order.status === 'cancelled' || order.status === 'refunded'
							? 'bg-destructive text-destructive-foreground'
							: 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground'
				}`}
			>
				{#if isStepCompleted(index)}
					{#if order.status === 'cancelled' || order.status === 'refunded'}
						{@const Icon = step.icon}
						<Icon class="h-5 w-5" />
					{:else}
						<Check class="h-5 w-5" />
					{/if}
				{:else}
					{@const Icon = step.icon}
					<Icon class="h-5 w-5" />
				{/if}
			</div>

			<!-- Content -->
			<div class="ml-4 flex-1">
				<div class="flex items-center justify-between">
					<h4
						class={`font-medium ${
							isStepCurrent(index)
								? 'text-primary'
								: isStepCompleted(index)
									? 'text-foreground'
									: 'text-muted-foreground'
						}`}
					>
						{step.label}
					</h4>
					{#if step.date}
						<span class="text-muted-foreground text-sm">{formatDate(step.date)}</span>
					{/if}
				</div>
				<p class="text-muted-foreground text-sm mt-1">{step.description}</p>

				<!-- Payment status indicator -->
				{#if index === 0}
					<div class="mt-2">
						<span
							class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
								order.paymentStatus === 'completed'
									? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
									: order.paymentStatus === 'failed'
										? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
										: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
							}`}
						>
							Payment: {order.paymentStatus}
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
