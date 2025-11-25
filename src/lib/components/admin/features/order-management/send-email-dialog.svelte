<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { sendOrderEmail } from '$lib/remotes/order.remote';
	import * as m from '$lib/paraglide/messages';
	import { Mail, Send, AlertCircle, CheckCircle2 } from '@lucide/svelte';

	type Order = {
		id: string;
		orderNumber: string;
		customerEmail: string;
		customerFirstName: string;
		customerLastName: string;
		status: string;
		total: number;
	};

	let { order, open = $bindable(false) }: { order: Order | null; open?: boolean } = $props();

	let subject = $state('');
	let message = $state('');
	let sending = $state(false);
	let result = $state<{ success: boolean; message: string } | null>(null);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			subject = '';
			message = '';
			result = null;
		}
	});

	async function handleSendEmail(e: Event) {
		e.preventDefault();
		if (!order) return;

		sending = true;
		result = null;

		try {
			const response = await sendOrderEmail({
				orderId: order.id,
				subject,
				message
			});

			if (response && typeof response === 'object' && 'success' in response) {
				result = response as { success: boolean; message: string };
				if (result.success) {
					// Clear form on success
					subject = '';
					message = '';
				}
			}
		} catch (error) {
			result = {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to send email'
			};
		} finally {
			sending = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Mail class="h-5 w-5" />
				{m.order_send_email?.() ?? 'Send Email to Customer'}
			</Dialog.Title>
			<Dialog.Description>
				{m.order_send_email_description?.() ?? 'Send a custom email to the customer about their order.'}
			</Dialog.Description>
		</Dialog.Header>

		{#if order}
			<form onsubmit={handleSendEmail} class="space-y-4 mt-4">
				<div class="bg-muted/50 rounded-lg p-3 text-sm">
					<p><strong>{m.order_order_number?.() ?? 'Order'}:</strong> {order.orderNumber}</p>
					<p><strong>{m.order_to?.() ?? 'To'}:</strong> {order.customerFirstName} {order.customerLastName} ({order.customerEmail})</p>
				</div>

				{#if result}
					<div
						class="flex items-start gap-2 p-3 rounded-lg {result.success
							? 'bg-green-50 text-green-700'
							: 'bg-red-50 text-red-700'}"
					>
						{#if result.success}
							<CheckCircle2 class="h-5 w-5 mt-0.5" />
						{:else}
							<AlertCircle class="h-5 w-5 mt-0.5" />
						{/if}
						<p class="text-sm">{result.message}</p>
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="email-subject">{m.order_email_subject?.() ?? 'Subject'}</Label>
					<Input
						id="email-subject"
						bind:value={subject}
						placeholder={m.order_email_subject_placeholder?.() ?? 'e.g., Update regarding your order'}
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="email-message">{m.order_email_message?.() ?? 'Message'}</Label>
					<Textarea
						id="email-message"
						bind:value={message}
						placeholder={m.order_email_message_placeholder?.() ?? 'Write your message to the customer...'}
						rows={6}
						required
					/>
				</div>

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (open = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
						{#if sending}
							{m.order_sending?.() ?? 'Sending...'}
						{:else}
							<Send class="h-4 w-4 mr-2" />
							{m.order_send?.() ?? 'Send Email'}
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
