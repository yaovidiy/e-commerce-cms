<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle, XCircle, Loader2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	// LiqPay returns data and signature in URL params
	const urlParams = $derived($page.url.searchParams);
	let data = $state<string | null>(null);
	let signature = $state<string | null>(null);
	let paymentData = $state<any>(null);
	let isLoading = $state(true);

	onMount(() => {
		data = urlParams.get('data');
		signature = urlParams.get('signature');

		if (data) {
			try {
				// Decode base64 data
				const decoded = JSON.parse(atob(data));
				paymentData = decoded;
			} catch (err) {
				console.error('Failed to decode payment data:', err);
			}
		}

		isLoading = false;
	});

	function goToOrderConfirmation() {
		if (paymentData?.order_id) {
			// Find order by order number
			goto(`/order-confirmation?orderNumber=${paymentData.order_id}`);
		} else {
			goto('/');
		}
	}

	function goHome() {
		goto('/');
	}
</script>

<div class="container max-w-2xl mx-auto py-12">
	<div class="bg-card p-8 rounded-lg border text-center">
		{#if isLoading}
			<Loader2 class="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
			<h1 class="text-2xl font-bold mb-2">Processing Payment Result...</h1>
		{:else if paymentData}
			{#if paymentData.status === 'success'}
				<!-- Payment Success -->
				<CheckCircle class="h-16 w-16 mx-auto mb-4 text-green-500" />
				<h1 class="text-3xl font-bold mb-2 text-green-600">Payment Successful!</h1>
				<p class="text-muted-foreground mb-2">
					Your payment has been processed successfully.
				</p>
				<p class="text-sm text-muted-foreground mb-6">
					Order Number: <span class="font-mono font-semibold">{paymentData.order_id}</span>
				</p>
				<p class="text-sm text-muted-foreground mb-6">
					Amount: <span class="font-semibold">{paymentData.amount} {paymentData.currency}</span>
				</p>
				
				<div class="space-y-2">
					<Button onclick={goToOrderConfirmation} class="w-full">
						View Order Details
					</Button>
					<Button onclick={goHome} variant="outline" class="w-full">
						Continue Shopping
					</Button>
				</div>
			{:else if paymentData.status === 'failure' || paymentData.status === 'error'}
				<!-- Payment Failed -->
				<XCircle class="h-16 w-16 mx-auto mb-4 text-destructive" />
				<h1 class="text-3xl font-bold mb-2 text-destructive">Payment Failed</h1>
				<p class="text-muted-foreground mb-2">
					We couldn't process your payment.
				</p>
				{#if paymentData.err_description}
					<p class="text-sm text-muted-foreground mb-6">
						Reason: {paymentData.err_description}
					</p>
				{/if}
				
				<div class="space-y-2">
					<Button onclick={() => goto(`/payment/${paymentData.order_id}`)} class="w-full">
						Try Again
					</Button>
					<Button onclick={goHome} variant="outline" class="w-full">
						Back to Home
					</Button>
				</div>
			{:else if paymentData.status === 'sandbox'}
				<!-- Sandbox Mode Success -->
				<CheckCircle class="h-16 w-16 mx-auto mb-4 text-yellow-500" />
				<h1 class="text-3xl font-bold mb-2 text-yellow-600">Test Payment (Sandbox)</h1>
				<p class="text-muted-foreground mb-2">
					This was a test payment. No real money was charged.
				</p>
				<p class="text-sm text-muted-foreground mb-6">
					Order Number: <span class="font-mono font-semibold">{paymentData.order_id}</span>
				</p>
				
				<div class="space-y-2">
					<Button onclick={goToOrderConfirmation} class="w-full">
						View Order Details
					</Button>
					<Button onclick={goHome} variant="outline" class="w-full">
						Continue Shopping
					</Button>
				</div>
			{:else}
				<!-- Payment Pending -->
				<Loader2 class="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
				<h1 class="text-2xl font-bold mb-2">Payment Pending</h1>
				<p class="text-muted-foreground mb-6">
					Your payment is being processed. This may take a few moments.
				</p>
				<p class="text-sm text-muted-foreground mb-6">
					Status: {paymentData.status}
				</p>
				
				<Button onclick={goHome} variant="outline">
					Back to Home
				</Button>
			{/if}
		{:else}
			<!-- No Payment Data -->
			<XCircle class="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
			<h1 class="text-2xl font-bold mb-2">No Payment Information</h1>
			<p class="text-muted-foreground mb-6">
				We couldn't find any payment information in the URL.
			</p>
			
			<Button onclick={goHome}>
				Back to Home
			</Button>
		{/if}
	</div>
</div>
