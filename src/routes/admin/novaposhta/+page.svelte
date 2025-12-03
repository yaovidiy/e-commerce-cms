<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import {
		NovaPoshtaConnectionStatus,
		NovaPoshtaAddressTest
	} from '$lib/components/admin/features/novaposhta-management';
	import { NovaPoshtaAddressSelector, type NovaPoshtaAddressData } from '$lib/components/client/features/novaposhta';
	import * as Card from '$lib/components/ui/card';
	import { Truck, MapPin } from '@lucide/svelte/icons';

	let selectedAddress: NovaPoshtaAddressData | null = $state(null);

	function handleAddressSelect(address: NovaPoshtaAddressData) {
		selectedAddress = address;
	}
</script>

<svelte:head>
	<title>{m.novaposhta_admin_title?.() || 'Nova Poshta Integration'} | Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<div class="bg-primary/10 p-3 rounded-lg">
			<Truck class="h-6 w-6 text-primary" />
		</div>
		<div>
			<h1 class="text-2xl font-bold">{m.novaposhta_admin_title?.() || 'Nova Poshta Integration'}</h1>
			<p class="text-muted-foreground">
				{m.novaposhta_admin_description?.() || 'Test and manage Nova Poshta API integration for delivery services'}
			</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Connection Status -->
		<NovaPoshtaConnectionStatus />

		<!-- Address Test -->
		<NovaPoshtaAddressTest />
	</div>

	<!-- Client Address Selector Demo -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<MapPin class="h-5 w-5" />
				{m.novaposhta_address_selector_demo?.() || 'Address Selector Demo'}
			</Card.Title>
			<Card.Description>
				{m.novaposhta_address_selector_demo_description?.() || 'This is how the address selector will appear to customers during checkout'}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<NovaPoshtaAddressSelector onAddressSelect={handleAddressSelect} />

			{#if selectedAddress}
				<div class="mt-4 p-4 bg-muted rounded-lg">
					<h4 class="font-medium mb-2">{m.novaposhta_selected_address_data?.() || 'Selected Address Data'}</h4>
					<pre class="text-xs overflow-auto">{JSON.stringify(selectedAddress, null, 2)}</pre>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
