<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import { ConnectionStatus } from '$lib/components/admin/features/ukrposhta-management';
	import { UkrposhtaAddressSelector, type UkrposhtaAddressData } from '$lib/components/client/features/ukrposhta';
	import { MapPin, Settings, TestTube } from '@lucide/svelte/icons';

	let selectedAddress: UkrposhtaAddressData | null = $state(null);

	function handleAddressSelect(address: UkrposhtaAddressData) {
		selectedAddress = address;
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">
			{m.ukrposhta_management?.() || 'Ukrposhta Integration'}
		</h1>
		<p class="text-muted-foreground">
			{m.ukrposhta_management_description?.() || 'Manage Ukrposhta address lookup and delivery integration'}
		</p>
	</div>

	<!-- Tabs -->
	<Tabs.Root value="overview" class="w-full">
		<Tabs.List>
			<Tabs.Trigger value="overview">
				<Settings class="size-4 mr-2" />
				{m.ukrposhta_overview?.() || 'Overview'}
			</Tabs.Trigger>
			<Tabs.Trigger value="test">
				<TestTube class="size-4 mr-2" />
				{m.ukrposhta_test?.() || 'Address Test'}
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview" class="space-y-6 mt-4">
			<!-- Connection Status -->
			<ConnectionStatus />

			<!-- Usage Information -->
			<div class="bg-muted/50 rounded-lg p-6 space-y-4">
				<h3 class="font-semibold text-lg flex items-center gap-2">
					<MapPin class="h-5 w-5" />
					{m.ukrposhta_how_to_use?.() || 'How to Use'}
				</h3>
				<div class="grid md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<h4 class="font-medium">{m.ukrposhta_post_office_delivery?.() || 'Post Office Delivery'}</h4>
						<ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
							<li>{m.ukrposhta_step_region?.() || 'Select region (oblast)'}</li>
							<li>{m.ukrposhta_step_district?.() || 'Select district (rayon)'}</li>
							<li>{m.ukrposhta_step_city?.() || 'Select city/settlement'}</li>
							<li>{m.ukrposhta_step_office?.() || 'Select post office'}</li>
						</ol>
					</div>
					<div class="space-y-2">
						<h4 class="font-medium">{m.ukrposhta_courier_delivery?.() || 'Courier Delivery'}</h4>
						<ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
							<li>{m.ukrposhta_step_region?.() || 'Select region (oblast)'}</li>
							<li>{m.ukrposhta_step_district?.() || 'Select district (rayon)'}</li>
							<li>{m.ukrposhta_step_city?.() || 'Select city/settlement'}</li>
							<li>{m.ukrposhta_step_street?.() || 'Search and select street'}</li>
							<li>{m.ukrposhta_step_house?.() || 'Enter house number to get postcode'}</li>
						</ol>
					</div>
				</div>
			</div>

			<!-- Delivery Types Info -->
			<div class="grid md:grid-cols-2 gap-4">
				<div class="border rounded-lg p-4 space-y-2">
					<h4 class="font-semibold">{m.ukrposhta_w2d?.() || 'W2D (Warehouse to Door)'}</h4>
					<p class="text-sm text-muted-foreground">
						{m.ukrposhta_w2d_description?.() || 'Delivery from post office to customer address by courier'}
					</p>
				</div>
				<div class="border rounded-lg p-4 space-y-2">
					<h4 class="font-semibold">{m.ukrposhta_w2w?.() || 'W2W (Warehouse to Warehouse)'}</h4>
					<p class="text-sm text-muted-foreground">
						{m.ukrposhta_w2w_description?.() || 'Delivery from post office to post office for customer pickup'}
					</p>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="test" class="space-y-6 mt-4">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<MapPin class="h-5 w-5" />
						{m.ukrposhta_address_selector_demo?.() || 'Address Selector Demo'}
					</Card.Title>
					<Card.Description>
						{m.ukrposhta_address_selector_demo_description?.() || 'This is how the address selector will appear to customers during checkout'}
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<UkrposhtaAddressSelector onAddressSelect={handleAddressSelect} />

					{#if selectedAddress}
						<div class="mt-4 p-4 bg-muted rounded-lg">
							<h4 class="font-medium mb-2">{m.ukrposhta_selected_address_data?.() || 'Selected Address Data'}</h4>
							<pre class="text-xs overflow-auto">{JSON.stringify(selectedAddress, null, 2)}</pre>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
