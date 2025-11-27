<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';
	import { testSmsClubConnection } from '$lib/remotes/sms.remote';
	import { CheckCircle, XCircle, Zap } from '@lucide/svelte/icons';

	let testResult: { success: boolean; message: string; balance?: { money: string; currency: string } } | null = $state(null);
	let isTestingConnection = $state(false);

	async function handleTestConnection() {
		isTestingConnection = true;
		testResult = null;

		try {
			const result = await testSmsClubConnection({});
			testResult = result;
		} catch (error) {
			testResult = {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		} finally {
			isTestingConnection = false;
		}
	}
</script>

<Card class="p-6">
	<div class="space-y-4">
		<div>
			<h3 class="font-semibold text-lg">{m.sms_integration_status?.() || 'Integration Status'}</h3>
			<p class="text-sm text-muted-foreground">
				{m.sms_test_connection?.() || 'Test your SMS Club API connection'}
			</p>
		</div>

		<div class="space-y-3">
			<div>
				<Label class="text-sm text-muted-foreground">
					{m.sms_api_token_status?.() || 'API Token Status'}
				</Label>
				<!-- Note: API token status is checked server-side during connection test -->
				<div class="flex items-center gap-2 mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
					<CheckCircle class="size-4 text-blue-600" />
					<span class="text-sm text-blue-700">
						{m.sms_test_connection?.() || 'Test your connection below'}
					</span>
				</div>
			</div>

			<div>
				<Label class="text-sm font-medium">{m.sms_connection_test?.() || 'Connection Test'}</Label>
				<Button
					onclick={handleTestConnection}
					disabled={isTestingConnection}
					variant="outline"
					class="mt-2 w-full"
				>
					{#if isTestingConnection}
						<span class="animate-spin mr-2">⏳</span>
						{m.common_testing?.() || 'Testing...'}
					{:else}
						<Zap class="size-4 mr-2" />
						{m.sms_test_connection?.() || 'Test Connection'}
					{/if}
				</Button>
			</div>

			{#if testResult}
				<div
					class={`p-3 rounded-lg border ${
						testResult.success
							? 'bg-green-50 border-green-200'
							: 'bg-red-50 border-red-200'
					}`}
				>
				<div class="flex items-start gap-2">
					{#if testResult.success}
						<CheckCircle class="size-5 text-green-600 shrink-0 mt-0.5" />
						<div class="flex-1">
							<p class="text-sm font-medium text-green-900">{testResult.message}</p>
							{#if testResult.balance}
								<p class="text-xs text-green-700 mt-1">
									{m.sms_balance?.() || 'Balance'}: {testResult.balance.money} {testResult.balance.currency}
								</p>
							{/if}
						</div>
					{:else}
						<XCircle class="size-5 text-red-600 shrink-0 mt-0.5" />
						<p class="text-sm font-medium text-red-900">{testResult.message}</p>
					{/if}
				</div>
				</div>
			{/if}
		</div>

		<div class="pt-4 border-t space-y-2">
			<h4 class="text-sm font-semibold">
				{m.sms_setup_instructions?.() || 'Setup Instructions'}
			</h4>
			<ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
				<li>{m.sms_instruction_1?.() || 'Get your API token from SMS Club dashboard'}</li>
				<li>{m.sms_instruction_2?.() || 'Add SMS_CLUB_API_TOKEN to your environment variables'}</li>
				<li>{m.sms_instruction_3?.() || 'Restart your application'}</li>
				<li>{m.sms_instruction_4?.() || 'Test the connection using the button above'}</li>
			</ol>
		</div>
	</div>
</Card>
