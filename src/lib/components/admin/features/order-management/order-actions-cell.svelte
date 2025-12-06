<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import {
		MoreHorizontal,
		Eye,
		Mail,
		Package,
		Truck,
		CheckCircle,
		XCircle,
		Clock,
		RefreshCw,
		Download
	} from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import PDFDownloadButton from './pdf-download-button.svelte';

	interface Props {
		order: {
			id: string;
			orderNumber: string;
			status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
		};
		onView: (order: any) => void;
		onEmail: (order: any) => void;
		onStatusChange: (orderId: string, status: string) => void;
	}

	let { order, onView, onEmail, onStatusChange }: Props = $props();

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'pending': return m.order_status_pending?.() ?? 'Pending';
			case 'processing': return m.order_status_processing?.() ?? 'Processing';
			case 'shipped': return m.order_status_shipped?.() ?? 'Shipped';
			case 'delivered': return m.order_status_delivered?.() ?? 'Delivered';
			case 'cancelled': return m.order_status_cancelled?.() ?? 'Cancelled';
			case 'refunded': return m.order_status_refunded?.() ?? 'Refunded';
			default: return status;
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending':
				return Clock;
			case 'processing':
				return Package;
			case 'shipped':
				return Truck;
			case 'delivered':
				return CheckCircle;
			case 'cancelled':
				return XCircle;
			case 'refunded':
				return RefreshCw;
			default:
				return Clock;
		}
	}
</script>

<div class="flex items-center justify-end gap-2">
	<PDFDownloadButton orderId={order.id} orderNumber={order.orderNumber} />

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="ghost" size="icon">
				<MoreHorizontal class="h-4 w-4" />
				<span class="sr-only">{m.common_actions()}</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => onView(order)}>
				<Eye class="mr-2 h-4 w-4" />
				{m.order_view_details?.() ?? 'View Details'}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => onEmail(order)}>
				<Mail class="mr-2 h-4 w-4" />
				{m.order_send_email?.() ?? 'Send Email'}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>
					<Package class="mr-2 h-4 w-4" />
					{m.order_update_status?.() ?? 'Update Status'}
				</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'pending')}
						disabled={order.status === 'pending'}
					>
						<Clock class="mr-2 h-4 w-4" />
						{m.order_status_pending?.() ?? 'Pending'}
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'processing')}
						disabled={order.status === 'processing'}
					>
						<Package class="mr-2 h-4 w-4" />
						{m.order_status_processing?.() ?? 'Processing'}
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'shipped')}
						disabled={order.status === 'shipped'}
					>
						<Truck class="mr-2 h-4 w-4" />
						{m.order_status_shipped?.() ?? 'Shipped'}
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'delivered')}
						disabled={order.status === 'delivered'}
					>
						<CheckCircle class="mr-2 h-4 w-4" />
						{m.order_status_delivered?.() ?? 'Delivered'}
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'cancelled')}
						disabled={order.status === 'cancelled'}
						class="text-destructive"
					>
						<XCircle class="mr-2 h-4 w-4" />
						{m.order_status_cancelled?.() ?? 'Cancelled'}
					</DropdownMenu.Item>
					<DropdownMenu.Item 
						onclick={() => onStatusChange(order.id, 'refunded')}
						disabled={order.status === 'refunded'}
					>
						<RefreshCw class="mr-2 h-4 w-4" />
						{m.order_status_refunded?.() ?? 'Refunded'}
					</DropdownMenu.Item>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
