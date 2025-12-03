<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { testConnection } from '$lib/remotes/ukrposhta.remote';
	import * as m from '$lib/paraglide/messages';
	import { CheckCircle, XCircle, RefreshCw, Loader2, Key, AlertTriangle } from '@lucide/svelte/icons';

	let testing = $state(false);
	let testResult: {
		success: boolean;
		message: string;
		regionsCount: number;
		hasApiToken: boolean;
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
				regionsCount: 0,
				hasApiToken: false,
				apiVersion: '3.20'
			};
		} finally {
			testing = false;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			{m.ukrposhta_integration_status?.() || 'Integration Status'}
		</Card.Title>
		<Card.Description>
			{m.ukrposhta_check_api_connection?.() || 'Check the Ukrposhta Address Classifier API connection'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="flex items-center gap-4">
			<div class="flex-1">
				<p class="text-sm font-medium">{m.ukrposhta_api_endpoint?.() || 'API Endpoint'}</p>
				<p class="text-xs text-muted-foreground">https://www.ukrposhta.ua/address-classifier-ws/</p>
			</div>
			<Button onclick={runTest} disabled={testing} variant="outline" size="sm">
				{#if testing}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{m.common_testing?.() || 'Testing...'}
				{:else}
					<RefreshCw class="mr-2 h-4 w-4" />
					{m.ukrposhta_test_connection?.() || 'Test Connection'}
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
							{m.ukrposhta_connection_success?.() || 'Connection successful'}
						</p>
						<p class="text-xs text-green-600 dark:text-green-400">{testResult.message}</p>
					</div>
				{:else}
					<XCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-red-800 dark:text-red-200">
							{m.ukrposhta_connection_failed?.() || 'Connection failed'}
						</p>
						<p class="text-xs text-red-600 dark:text-red-400">{testResult.message}</p>
					</div>
				{/if}
			</div>

			<!-- API Token Status -->
			<div
				class="flex items-center gap-3 p-3 rounded-lg {testResult.hasApiToken
					? 'bg-blue-50 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
					: 'bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'}"
			>
				{#if testResult.hasApiToken}
					<Key class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-blue-800 dark:text-blue-200">
							{m.ukrposhta_api_token_configured?.() || 'API Token Configured'}
						</p>
						<p class="text-xs text-blue-600 dark:text-blue-400">
							{m.ukrposhta_full_api_access?.() || 'Full API access enabled'}
						</p>
					</div>
				{:else}
					<AlertTriangle class="h-5 w-5 text-amber-600 dark:text-amber-400" />
					<div class="flex-1">
						<p class="text-sm font-medium text-amber-800 dark:text-amber-200">
							{m.ukrposhta_no_api_token?.() || 'No API Token'}
						</p>
						<p class="text-xs text-amber-600 dark:text-amber-400">
							{m.ukrposhta_limited_access?.() || 'Some features may be limited. Add UKRPOSHTA_API_TOKEN to .env'}
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
			<h4 class="text-sm font-semibold">{m.ukrposhta_api_info?.() || 'API Information'}</h4>
			<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
				<li>{m.ukrposhta_info_bearer?.() || 'Bearer token required for full access (from Ukrposhta contract)'}</li>
				<li>{m.ukrposhta_info_regions?.() || 'Access to all Ukrainian regions and districts'}</li>
				<li>
					{m.ukrposhta_info_cities?.() || 'Cities, streets, and house numbers for courier delivery'}
				</li>
				<li>
					{m.ukrposhta_info_offices?.() || 'Post office locations and postcodes'}
				</li>
				<li>{m.ukrposhta_info_geolocation?.() || 'Geolocation search for nearest post offices'}</li>
				<li>{m.ukrposhta_info_working_hours?.() || 'Post office working hours and schedules'}</li>
				<li>{m.ukrposhta_info_courier_check?.() || 'Courier delivery area availability check'}</li>
			</ul>
		</div>
	</Card.Content>
</Card.Root>
