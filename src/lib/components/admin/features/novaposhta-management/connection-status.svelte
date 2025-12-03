<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { testConnection } from '$lib/remotes/novaposhta.remote';
	import * as m from '$lib/paraglide/messages';
	import { CheckCircle, XCircle, RefreshCw, Loader2, Key, AlertTriangle } from '@lucide/svelte/icons';

	let testing = $state(false);
	let testResult: {
		success: boolean;
		message: string;
		areasCount: number;
		hasApiKey: boolean;
		apiVersion: string;
	} | null = $state(null);

	async function runTest() {
		testing = true;
		testResult = null;
		try {
			testResult = await testConnection();
		} catch (error) {
			testResult = {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error',
				areasCount: 0,
				hasApiKey: false,
				apiVersion: '2.0'
			};
		} finally {
			testing = false;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			{m.novaposhta_connection_status?.() || 'Connection Status'}
		</Card.Title>
		<Card.Description>
			{m.novaposhta_connection_description?.() || 'Check the Nova Poshta API connection and status'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="flex items-center gap-4">
			<div class="flex-1">
				<p class="text-sm font-medium">{m.novaposhta_api_endpoint?.() || 'API Endpoint'}</p>
				<p class="text-xs text-muted-foreground">https://api.novaposhta.ua/v2.0/json/</p>
			</div>
			<Button onclick={runTest} disabled={testing} variant="outline" size="sm">
				{#if testing}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{m.common_testing?.() || 'Testing...'}
				{:else}
					<RefreshCw class="mr-2 h-4 w-4" />
					{m.novaposhta_test_connection?.() || 'Test Connection'}
				{/if}
			</Button>
		</div>

		{#if testResult}
			<div
				class="flex items-center gap-3 p-3 rounded-lg {testResult.success
					? 'bg-green-50 border border-green-200 dark:bg-green-950/50 dark:border-green-800'
					: 'bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800'}"
			>
				{#if testResult.success}
					<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-green-800 dark:text-green-200">
							{m.novaposhta_connection_success?.() || 'Connection successful'}
						</p>
						<p class="text-xs text-green-600 dark:text-green-400">{testResult.message}</p>
					</div>
				{:else}
					<XCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-red-800 dark:text-red-200">
							{m.novaposhta_connection_failed?.() || 'Connection failed'}
						</p>
						<p class="text-xs text-red-600 dark:text-red-400">{testResult.message}</p>
					</div>
				{/if}
			</div>

			<!-- API Key Status -->
			<div
				class="flex items-center gap-3 p-3 rounded-lg {testResult.hasApiKey
					? 'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
					: 'bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'}"
			>
				{#if testResult.hasApiKey}
					<Key class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-blue-800 dark:text-blue-200">
							{m.novaposhta_api_key_configured?.() || 'API Key Configured'}
						</p>
						<p class="text-xs text-blue-600 dark:text-blue-400">
							{m.novaposhta_full_access?.() || 'Full API access enabled'}
						</p>
					</div>
				{:else}
					<AlertTriangle class="h-5 w-5 text-amber-600 dark:text-amber-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-amber-800 dark:text-amber-200">
							{m.novaposhta_no_api_key?.() || 'No API Key'}
						</p>
						<p class="text-xs text-amber-600 dark:text-amber-400">
							{m.novaposhta_limited_access?.() || 'API access unavailable. Add NOVAPOSHTA_API_KEY to .env'}
						</p>
					</div>
				{/if}
			</div>

			<!-- API Version -->
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span class="font-medium">API Version:</span>
				<span class="font-mono bg-muted px-2 py-0.5 rounded">{testResult.apiVersion}</span>
			</div>
		{/if}

		<div class="bg-muted/50 rounded-lg p-4 space-y-2">
			<h4 class="text-sm font-semibold">{m.novaposhta_about_integration?.() || 'About Nova Poshta Integration'}</h4>
			<p class="text-sm text-muted-foreground">
				{m.novaposhta_about_description?.() || 'This integration uses the Nova Poshta API v2.0 to provide delivery services including warehouse selection, tracking, and delivery cost calculation.'}
			</p>
			<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside mt-2">
				<li>{m.novaposhta_feature_1?.() || 'City and settlement search'}</li>
				<li>{m.novaposhta_feature_2?.() || 'Warehouse, branch, and postomat selection'}</li>
				<li>{m.novaposhta_feature_3?.() || 'Courier delivery address validation'}</li>
				<li>{m.novaposhta_feature_4?.() || 'Shipment tracking'}</li>
				<li>{m.novaposhta_feature_5?.() || 'Delivery cost calculation'}</li>
			</ul>
		</div>

		<!-- Setup instructions -->
		<div class="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2 border border-blue-200 dark:border-blue-800">
			<h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200">
				{m.novaposhta_setup_instructions?.() || 'Setup Instructions'}
			</h4>
			<ol class="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
				<li>{m.novaposhta_instruction_1?.() || 'Register at business.novaposhta.ua'}</li>
				<li>{m.novaposhta_instruction_2?.() || 'Get your API key from the dashboard'}</li>
				<li>{m.novaposhta_instruction_3?.() || 'Add NOVAPOSHTA_API_KEY to your .env file'}</li>
				<li>{m.novaposhta_instruction_4?.() || 'Restart your application'}</li>
				<li>{m.novaposhta_instruction_5?.() || 'Test the connection using the button above'}</li>
			</ol>
		</div>
	</Card.Content>
</Card.Root>
