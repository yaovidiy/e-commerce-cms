<script lang="ts">
	import { checkPaymentStatus, getPaymentByOrderId, testLiqPayIntegration } from '$lib/remotes/payment.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon, XCircle, Clock, RefreshCw, Copy, ExternalLink, Zap } from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';

	let orderId = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let paymentData = $state<any>(null);
	let statusCheckResult = $state<any>(null);
	let copied = $state(false);
	let integrationStatus = $state<any>(null);
	let testingConnection = $state(false);

	async function handleGetPayment() {
		if (!orderId.trim()) {
			error = 'Please enter an Order ID';
			return;
		}

		loading = true;
		error = null;
		paymentData = null;
		statusCheckResult = null;

		try {
			const payment = await getPaymentByOrderId(orderId);
			paymentData = payment;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch payment';
			paymentData = null;
		} finally {
			loading = false;
		}
	}

	async function handleCheckStatus() {
		if (!orderId.trim()) {
			error = 'Please enter an Order ID';
			return;
		}

		loading = true;
		error = null;

		try {
			const result = await checkPaymentStatus(orderId);
			statusCheckResult = result;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to check payment status';
			statusCheckResult = null;
		} finally {
			loading = false;
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed':
			case 'success':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'failed':
			case 'error':
				return 'bg-red-100 text-red-800';
			case 'refunded':
			case 'reversed':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'completed':
			case 'success':
				return CheckCircleIcon;
			case 'failed':
			case 'error':
				return XCircle;
			case 'pending':
				return Clock;
			default:
				return AlertCircleIcon;
		}
	}

	async function handleTestIntegration() {
		testingConnection = true;
		try {
			const status = await testLiqPayIntegration();
			integrationStatus = status;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to test integration';
			integrationStatus = null;
		} finally {
			testingConnection = false;
		}
	}

	// Load integration status on mount
	$effect.pre(() => {
		handleTestIntegration();
	});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">{m.liqpay_admin_title()}</h2>
		<p class="text-muted-foreground">{m.liqpay_admin_description()}</p>
	</div>

	<!-- Configuration Info -->
	<Card class="border-blue-200 bg-blue-50">
		<div class="p-6">
			<div class="flex gap-2">
				<AlertCircleIcon class="size-5 text-blue-600 shrink-0 mt-0.5" />
				<div class="flex-1">
					<h3 class="font-semibold text-blue-900">{m.liqpay_configuration()}</h3>
					<div class="mt-2 space-y-1 text-sm text-blue-800">
						<p><strong>{m.liqpay_sandbox_mode()}:</strong> {import.meta.env.VITE_LIQPAY_SANDBOX ? m.liqpay_sandbox_enabled() : m.liqpay_sandbox_disabled()}</p>
						<p><strong>{m.liqpay_api_endpoint()}:</strong> https://www.liqpay.ua/api/</p>
						<p class="mt-3">
							<strong>{m.liqpay_documentation()}:</strong>
							<a href="https://www.liqpay.ua/documentation/en/" target="_blank" class="underline hover:no-underline">
								LiqPay API Documentation
							</a>
						</p>
						<p>
							<strong>{m.liqpay_test_cards()}:</strong>
							<a href="https://www.liqpay.ua/documentation/en/api/test_cards" target="_blank" class="underline hover:no-underline">
								{m.liqpay_test_cards()}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	</Card>

	<!-- Order Lookup -->
	<Card>
		<div class="p-6">
			<h3 class="text-lg font-semibold mb-4">{m.liqpay_payment_lookup()}</h3>
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder={m.liqpay_enter_order_id()}
					bind:value={orderId}
					disabled={loading}
					class="flex-1"
				/>
				<Button onclick={handleGetPayment} disabled={loading || !orderId.trim()}>
					{loading ? m.auth_loading() : m.liqpay_search()}
				</Button>
			</div>
		</div>
	</Card>

	<!-- Error Message -->
	{#if error}
		<Card class="border-red-200 bg-red-50">
			<div class="p-4 flex gap-2">
				<AlertCircleIcon class="size-5 text-red-600 shrink-0 mt-0.5" />
				<div>
					<h3 class="font-semibold text-red-900">{m.liqpay_error()}</h3>
					<p class="text-sm text-red-800">{error}</p>
				</div>
			</div>
		</Card>
	{/if}

	<!-- Tabs for Results -->
	{#if paymentData || statusCheckResult}
		<Tabs value="details" class="w-full">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="details">{m.liqpay_payment_details()}</TabsTrigger>
				<TabsTrigger value="status">{m.liqpay_status_check()}</TabsTrigger>
			</TabsList>

			<!-- Payment Details Tab -->
			<TabsContent value="details" class="space-y-4">
				{#if paymentData}
					<Card>
						<div class="p-6 space-y-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Basic Info -->
							<div>
								<p class="text-sm font-medium text-muted-foreground">{m.liqpay_payment_id()}</p>
								<div class="mt-1 flex items-center gap-2">
									<code class="bg-muted px-3 py-1 rounded text-sm font-mono">{paymentData.id}</code>
										<button
											onclick={() => copyToClipboard(paymentData.id)}
											class="p-1 hover:bg-muted rounded"
											title="Copy"
										>
											<Copy class="size-4" />
										</button>
									</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_order_id()}</p>
									<div class="mt-1">{paymentData.orderId}</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_provider()}</p>
									<div class="mt-1">
										<Badge variant="outline" class="uppercase">{paymentData.provider}</Badge>
									</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_status()}</p>
									<div class="mt-1">
										<Badge class={getStatusColor(paymentData.status)}>
											{paymentData.status}
										</Badge>
									</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_amount()}</p>
									<div class="mt-1 font-semibold">{paymentData.amount} {paymentData.currency}</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_transaction_id()}</p>
									<div class="mt-1">{paymentData.transactionId || 'N/A'}</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_created_at()}</p>
									<div class="mt-1 text-sm">{new Date(paymentData.createdAt).toLocaleString()}</div>
								</div>

								<div>
									<p class="text-sm font-medium text-muted-foreground">{m.liqpay_updated_at()}</p>
									<div class="mt-1 text-sm">{new Date(paymentData.updatedAt).toLocaleString()}</div>
								</div>
							</div>

						<!-- LiqPay Data (if available) -->
						{#if paymentData.liqpayData}
							<div class="border-t pt-4">
								<p class="text-sm font-medium text-muted-foreground">{m.liqpay_payment_data()}</p>
								<pre class="mt-2 bg-muted p-3 rounded text-xs overflow-auto max-h-48">{JSON.stringify(JSON.parse(paymentData.liqpayData), null, 2)}</pre>
							</div>
						{/if}

						<!-- Metadata (if available) -->
						{#if paymentData.metadata}
							<div class="border-t pt-4">
								<p class="text-sm font-medium text-muted-foreground">{m.liqpay_metadata()}</p>
								<pre class="mt-2 bg-muted p-3 rounded text-xs overflow-auto max-h-48">{JSON.stringify(JSON.parse(paymentData.metadata), null, 2)}</pre>
								</div>
							{/if}

							<!-- Action Button -->
							{#if paymentData.provider === 'liqpay' && paymentData.liqpayData}
								<div class="border-t pt-4 flex gap-2">
								<Button onclick={handleCheckStatus} disabled={loading}>
									<RefreshCw class="size-4 mr-2" />
									{loading ? m.liqpay_checking() : m.liqpay_check_status()}
								</Button>
									{#if paymentData.liqpayData && JSON.parse(paymentData.liqpayData).checkoutUrl}
										<a href={JSON.parse(paymentData.liqpayData).checkoutUrl} target="_blank">
										<Button variant="outline">
											<ExternalLink class="size-4 mr-2" />
											{m.liqpay_open_checkout()}
										</Button>
										</a>
									{/if}
								</div>
							{/if}
						</div>
					</Card>
				{:else}
					<Card>
						<div class="p-6 text-center text-muted-foreground">
								{m.liqpay_please_enter_order_id()}
						</div>
					</Card>
				{/if}
			</TabsContent>

			<!-- Status Check Tab -->
			<TabsContent value="status" class="space-y-4">
				{#if statusCheckResult}
					<Card>
						<div class="p-6 space-y-4">
						<div class="flex items-center gap-3">
							<div class="flex-1">
								<h4 class="text-sm font-medium text-muted-foreground">{m.liqpay_status()}</h4>
								<div class="mt-1 flex items-center gap-2">
									{#if statusCheckResult.status === 'completed' || statusCheckResult.status === 'success'}
										<CheckCircleIcon class="size-5" />
									{:else if statusCheckResult.status === 'failed' || statusCheckResult.status === 'error'}
										<XCircle class="size-5" />
									{:else if statusCheckResult.status === 'pending'}
										<Clock class="size-5" />
									{:else}
										<AlertCircleIcon class="size-5" />
									{/if}
									<span class="text-lg font-semibold capitalize">{statusCheckResult.status}</span>
									</div>
								</div>
								<Badge class={getStatusColor(statusCheckResult.status)}>
									{statusCheckResult.status}
								</Badge>
							</div>

						{#if statusCheckResult.details}
							<div class="border-t pt-4">
										<p class="text-sm font-medium text-muted-foreground">{m.liqpay_liqpay_response()}</p>
								<pre class="mt-2 bg-muted p-3 rounded text-xs overflow-auto max-h-48">{JSON.stringify(statusCheckResult.details, null, 2)}</pre>
								</div>
							{/if}

							{#if statusCheckResult.message}
								<div class="border-t pt-4">
									<p class="text-sm">{statusCheckResult.message}</p>
								</div>
							{/if}

							<div class="border-t pt-4 flex gap-2">
									<Button onclick={handleCheckStatus} disabled={loading}>
										<RefreshCw class="size-4 mr-2" />
										{loading ? m.liqpay_refreshing() : m.liqpay_refresh_status()}
									</Button>
							</div>
						</div>
					</Card>
				{:else if paymentData}
					<Card>
						<div class="p-6">
							<Button onclick={handleCheckStatus} disabled={loading} class="w-full">
								<RefreshCw class="size-4 mr-2" />
								{loading ? m.liqpay_checking() : m.liqpay_check_status()}
							</Button>
						</div>
					</Card>
				{/if}
			</TabsContent>
		</Tabs>
	{/if}

	<!-- Help Section -->
	<Card>
		<div class="p-6">
			<h3 class="text-lg font-semibold mb-4">{m.liqpay_testing_guide()}</h3>
			<div class="space-y-3 text-sm">
				<div>
					<h4 class="font-medium">{m.liqpay_find_test_order()}</h4>
					<p class="text-muted-foreground mt-1">{m.liqpay_find_test_order_desc()}</p>
				</div>
				<div>
					<h4 class="font-medium">{m.liqpay_lookup_payment()}</h4>
					<p class="text-muted-foreground mt-1">{m.liqpay_lookup_payment_desc()}</p>
				</div>
				<div>
					<h4 class="font-medium">{m.liqpay_check_status_guide()}</h4>
					<p class="text-muted-foreground mt-1">{m.liqpay_check_status_guide_desc()}</p>
				</div>
				<div>
					<h4 class="font-medium">{m.liqpay_test_payment()}</h4>
					<p class="text-muted-foreground mt-1">{m.liqpay_test_payment_desc()}</p>
				</div>
				<div class="bg-muted p-3 rounded mt-4">
					<p class="text-xs font-mono">
						<strong>{m.liqpay_test_card()}:</strong> {m.liqpay_test_card_number()} | {m.liqpay_test_card_exp()}: 12/25 | CVV: 999
					</p>
				</div>
			</div>
		</div>
	</Card>

	<!-- Integration Status -->
	<Card class={integrationStatus?.configured ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
		<div class="p-6">
			<div class="flex gap-2">
				{#if integrationStatus?.configured}
					<CheckCircleIcon class="size-5 text-green-600 shrink-0 mt-0.5" />
				{:else}
					<XCircle class="size-5 text-red-600 shrink-0 mt-0.5" />
				{/if}
				<div class="flex-1">
					<h3 class="font-semibold {integrationStatus?.configured ? 'text-green-900' : 'text-red-900'}">{m.liqpay_integration_status()}</h3>
					<div class="mt-3 space-y-2 text-sm {integrationStatus?.configured ? 'text-green-800' : 'text-red-800'}">
						<!-- Configuration Status -->
						<div class="flex items-center justify-between">
							<span>{m.liqpay_api_keys_configured()}:</span>
							{#if integrationStatus?.configured}
								<Badge class="bg-green-700">✓ {m.liqpay_configured()}</Badge>
							{:else}
								<Badge variant="destructive">✗ {m.liqpay_missing()}</Badge>
							{/if}
						</div>

						<!-- Public Key Status -->
						<div class="flex items-center justify-between text-xs opacity-75">
							<span class="ml-2">├─ {m.liqpay_public_key()}:</span>
							<span>{integrationStatus?.publicKeyConfigured ? '✓' : '✗'}</span>
						</div>

						<!-- Private Key Status -->
						<div class="flex items-center justify-between text-xs opacity-75">
							<span class="ml-2">└─ {m.liqpay_private_key()}:</span>
							<span>{integrationStatus?.privateKeyConfigured ? '✓' : '✗'}</span>
						</div>

						<!-- Sandbox Mode -->
						<div class="flex items-center justify-between mt-3">
							<span>{m.liqpay_environment()}:</span>
							<Badge variant={integrationStatus?.sandbox ? 'default' : 'secondary'}>
								{integrationStatus?.sandbox ? '🧪 ' + m.liqpay_sandbox() : '🚀 ' + m.liqpay_production()}
							</Badge>
						</div>

						<!-- Connection Test -->
						<div class="flex items-center justify-between mt-3">
							<span>{m.liqpay_api_connection()}:</span>
							{#if testingConnection}
								<Badge class="bg-blue-600">{m.liqpay_testing_connection()}</Badge>
							{:else if integrationStatus?.testConnectionSuccess}
								<Badge class="bg-green-700">✓ {m.liqpay_connected()}</Badge>
							{:else if integrationStatus?.testConnectionError}
								<Badge variant="destructive">✗ {m.liqpay_disconnected()}</Badge>
							{:else}
								<Badge variant="outline">{m.liqpay_connection_unknown()}</Badge>
							{/if}
						</div>

						<!-- Error Display -->
						{#if integrationStatus?.testConnectionError}
							<div class="mt-2 p-2 bg-red-100 rounded text-xs">
								<p><strong>{m.liqpay_error()}:</strong> {integrationStatus.testConnectionError}</p>
							</div>
						{/if}
					</div>

					<!-- Test Button -->
					<div class="mt-4 flex gap-2">
						<Button 
							onclick={handleTestIntegration} 
							disabled={testingConnection}
							size="sm"
							variant={integrationStatus?.configured ? 'outline' : 'destructive'}
						>
							<Zap class="size-4 mr-2" />
							{testingConnection ? m.liqpay_testing_connection() : m.liqpay_test_connection()}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</Card>
</div>
