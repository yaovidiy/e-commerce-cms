<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import {
		IntegrationStatus,
		BalanceCard,
		OriginatorsList,
		RegisterOriginatorDialog
	} from '$lib/components/admin/features/sms-management';
	import { getAccountBalance, getOriginatorStatuses } from '$lib/remotes/sms.remote';
	import { MessageSquare, Settings, Send } from '@lucide/svelte/icons';

	let registerDialogOpen = $state(false);
	let balanceError: string | null = $state(null);
	let originatorsError: string | null = $state(null);
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">{m.sms_management?.() || 'SMS Management'}</h1>
		<p class="text-muted-foreground">{m.sms_management_description?.() || 'Manage your SMS Club integration'}</p>
	</div>

	<!-- Integration Status -->
	<IntegrationStatus />

	<!-- Tabs for different sections -->
	<Tabs.Root value="overview" class="w-full">
		<Tabs.List>
			<Tabs.Trigger value="overview">
				<Settings class="size-4 mr-2" />
				{m.sms_overview?.() || 'Overview'}
			</Tabs.Trigger>
			<Tabs.Trigger value="senders">
				<MessageSquare class="size-4 mr-2" />
				{m.sms_sender_names?.() || 'Sender Names'}
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview" class="space-y-4 mt-4">
			<!-- Balance Card -->
			{#await getAccountBalance() then balance}
				<BalanceCard {balance} />
			{:catch error}
				<BalanceCard balance={null} error={error instanceof Error ? error.message : 'Unknown error'} />
			{/await}

			<!-- Usage Information -->
			<div class="bg-muted/50 rounded-lg p-4 space-y-3">
				<h3 class="font-semibold text-sm">{m.sms_quick_info?.() || 'Quick Information'}</h3>
				<ul class="text-sm text-muted-foreground space-y-2 list-disc list-inside">
					<li>
						{m.sms_info_rate_limit?.() || 'Maximum 9 requests per second'}
					</li>
					<li>
						{m.sms_info_bulk_limit?.() || 'Up to 100 numbers per request'}
					</li>
					<li>
						{m.sms_info_lifetime?.() || 'Message lifetime: up to 60 minutes'}
					</li>
					<li>
						{m.sms_info_chars?.() || 'Message length: supports standard SMS encoding'}
					</li>
				</ul>
			</div>
		</Tabs.Content>

		<Tabs.Content value="senders" class="space-y-4 mt-4">
			<div class="flex justify-between items-center">
				<div>
					<h2 class="text-lg font-semibold">{m.sms_your_sender_names?.() || 'Your Sender Names'}</h2>
					<p class="text-sm text-muted-foreground">
						{m.sms_manage_and_register?.() || 'Manage and register your SMS sender names'}
					</p>
				</div>
				<Button onclick={() => (registerDialogOpen = true)}>
					<Send class="size-4 mr-2" />
					{m.sms_register_new?.() || 'Register New'}
				</Button>
			</div>

			{#await getOriginatorStatuses({ senderId: undefined }) then originatorsResponse}
				<OriginatorsList
					originators={originatorsResponse.statuses || []}
					onRefresh={() => {
						getOriginatorStatuses({ senderId: undefined }).refresh();
					}}
				/>
			{:catch error}
				<OriginatorsList
					originators={[]}
					error={error instanceof Error ? error.message : 'Unknown error'}
					onRefresh={() => {
						getOriginatorStatuses({ senderId: undefined }).refresh();
					}}
				/>
			{/await}

			<!-- Tips -->
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h4 class="font-semibold text-sm text-blue-900 mb-2">
					{m.sms_tips?.() || 'Tips for Registration'}
				</h4>
				<ul class="text-sm text-blue-700 space-y-1 list-disc list-inside">
					<li>{m.sms_tip_1?.() || 'Choose a memorable name for your brand'}</li>
					<li>{m.sms_tip_2?.() || 'Provide accurate company information'}</li>
					<li>{m.sms_tip_3?.() || 'Approval typically takes 1-3 business days'}</li>
					<li>{m.sms_tip_4?.() || 'You can use alphanumeric characters (max 50 characters)'}</li>
				</ul>
			</div>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Register Dialog -->
	<RegisterOriginatorDialog bind:open={registerDialogOpen} />
</div>
