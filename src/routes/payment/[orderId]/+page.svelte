<script lang="ts">
	import { page } from '$app/stores';
	import { createPayment } from '$lib/remotes/payment.remote';
	import { Button } from '$lib/components/ui/button';
	import { Loader2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	const orderId = $page.params.orderId;
	
	if (!orderId) {
		throw new Error('Order ID is required');
	}
	
	let isCreatingPayment = $state(false);
	let error = $state<string | null>(null);

	async function initiatePayment() {
		isCreatingPayment = true;
		error = null;

		try {
			const result = await createPayment({
				orderId: orderId!,
				paymentMethod: 'liqpay'
			});

			if (result.checkoutUrl) {
				// Redirect to LiqPay checkout page
				window.location.href = result.checkoutUrl;
			} else {
				error = 'Failed to create payment. Please try again.';
				isCreatingPayment = false;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Payment creation failed';
			isCreatingPayment = false;
		}
	}

	// Auto-initiate payment on mount
	onMount(() => {
		initiatePayment();
	});
</script>

<div class="container max-w-2xl mx-auto py-12">
	<div class="bg-card p-8 rounded-lg border text-center">
		{#if isCreatingPayment}
			<Loader2 class="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
			<h1 class="text-2xl font-bold mb-2">Preparing Payment</h1>
			<p class="text-muted-foreground mb-6">
				Please wait while we redirect you to the payment gateway...
			</p>
		{:else if error}
			<h1 class="text-2xl font-bold mb-2 text-destructive">Payment Error</h1>
			<p class="text-muted-foreground mb-6">
				{error}
			</p>
			<Button onclick={initiatePayment}>
				Try Again
			</Button>
		{:else}
			<h1 class="text-2xl font-bold mb-2">Redirecting...</h1>
			<p class="text-muted-foreground">
				If you are not redirected automatically, click the button below.
			</p>
			<Button onclick={initiatePayment} class="mt-4">
				Continue to Payment
			</Button>
		{/if}
	</div>
</div>
