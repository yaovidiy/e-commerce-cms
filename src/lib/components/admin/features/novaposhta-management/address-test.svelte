<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import * as m from '$lib/paraglide/messages';
	import {
		searchCities,
		getWarehousesByCity,
		searchStreets,
		type NovaPoshtaCity,
		type NovaPoshtaWarehouse,
		type NovaPoshtaStreet
	} from '$lib/remotes/novaposhta.remote';
	import { Loader2, MapPin, Building, Truck, Package, Search } from '@lucide/svelte/icons';

	// Delivery type: warehouse or address
	let deliveryType = $state<'warehouse' | 'address'>('warehouse');

	// City search
	let citySearch = $state('');
	let cities = $state<NovaPoshtaCity[]>([]);
	let selectedCityRef = $state<string>('');
	let loadingCities = $state(false);

	// Warehouse selection
	let warehouses = $state<NovaPoshtaWarehouse[]>([]);
	let selectedWarehouseRef = $state<string>('');
	let loadingWarehouses = $state(false);

	// Address selection
	let streetSearch = $state('');
	let streets = $state<NovaPoshtaStreet[]>([]);
	let selectedStreetRef = $state<string>('');
	let loadingStreets = $state(false);
	let buildingNumber = $state('');
	let flatNumber = $state('');

	// Derived values
	let selectedCity = $derived(cities.find((c) => c.Ref === selectedCityRef));
	let selectedWarehouse = $derived(warehouses.find((w) => w.Ref === selectedWarehouseRef));
	let selectedStreet = $derived(streets.find((s) => s.Ref === selectedStreetRef));

	// Full address display
	let fullAddress = $derived.by(() => {
		if (deliveryType === 'warehouse') {
			if (!selectedCity || !selectedWarehouse) return '';
			return `${selectedCity.AreaDescription} обл., ${selectedCity.Description}, ${selectedWarehouse.Description}`;
		} else {
			if (!selectedCity || !selectedStreet || !buildingNumber) return '';
			const flat = flatNumber ? `, кв. ${flatNumber}` : '';
			return `${selectedCity.AreaDescription} обл., ${selectedCity.Description}, ${selectedStreet.StreetsType} ${selectedStreet.Description}, буд. ${buildingNumber}${flat}`;
		}
	});

	// Search cities
	async function onCitySearch() {
		if (citySearch.length < 2) return;

		loadingCities = true;
		selectedCityRef = '';
		selectedWarehouseRef = '';
		selectedStreetRef = '';
		warehouses = [];
		streets = [];

		try {
			cities = await searchCities({ searchString: citySearch, limit: 20 });
		} catch (error) {
			console.error('Error searching cities:', error);
			cities = [];
		} finally {
			loadingCities = false;
		}
	}

	// Load warehouses when city is selected
	async function onCitySelect(ref: string) {
		selectedCityRef = ref;
		selectedWarehouseRef = '';
		selectedStreetRef = '';
		warehouses = [];
		streets = [];

		if (!ref) return;

		if (deliveryType === 'warehouse') {
			loadingWarehouses = true;
			try {
				warehouses = await getWarehousesByCity({ cityRef: ref, limit: 200 });
			} catch (error) {
				console.error('Error loading warehouses:', error);
				warehouses = [];
			} finally {
				loadingWarehouses = false;
			}
		}
	}

	// Search streets
	async function onStreetSearch() {
		if (!selectedCityRef || streetSearch.length < 2) return;

		loadingStreets = true;
		selectedStreetRef = '';

		try {
			streets = await searchStreets({ cityRef: selectedCityRef, searchString: streetSearch, limit: 20 });
		} catch (error) {
			console.error('Error searching streets:', error);
			streets = [];
		} finally {
			loadingStreets = false;
		}
	}

	// Change delivery type
	function onDeliveryTypeChange(type: 'warehouse' | 'address') {
		deliveryType = type;
		selectedWarehouseRef = '';
		selectedStreetRef = '';
		warehouses = [];
		streets = [];
		streetSearch = '';
		buildingNumber = '';
		flatNumber = '';

		// Reload warehouses if city is selected and switching to warehouse
		if (type === 'warehouse' && selectedCityRef) {
			onCitySelect(selectedCityRef);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<MapPin class="h-5 w-5" />
			{m.novaposhta_address_test?.() || 'Address Lookup Test'}
		</Card.Title>
		<Card.Description>
			{m.novaposhta_test_description?.() || 'Test the Nova Poshta address lookup functionality'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Delivery Type Selection -->
		<div class="flex gap-2">
			<Button
				variant={deliveryType === 'warehouse' ? 'default' : 'outline'}
				onclick={() => onDeliveryTypeChange('warehouse')}
				class="flex-1"
			>
				<Package class="mr-2 h-4 w-4" />
				{m.novaposhta_to_warehouse?.() || 'To Warehouse'}
			</Button>
			<Button
				variant={deliveryType === 'address' ? 'default' : 'outline'}
				onclick={() => onDeliveryTypeChange('address')}
				class="flex-1"
			>
				<Truck class="mr-2 h-4 w-4" />
				{m.novaposhta_to_address?.() || 'To Address'}
			</Button>
		</div>

		<!-- City Search -->
		<div class="space-y-2">
			<Label>{m.novaposhta_city?.() || 'City'}</Label>
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder={m.novaposhta_search_city?.() || 'Search city...'}
					bind:value={citySearch}
					onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && onCitySearch()}
				/>
				<Button onclick={onCitySearch} disabled={loadingCities || citySearch.length < 2}>
					{#if loadingCities}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Search class="h-4 w-4" />
					{/if}
				</Button>
			</div>
			{#if cities.length > 0}
				<Select.Root type="single" value={selectedCityRef} onValueChange={(v) => onCitySelect(v ?? '')}>
					<Select.Trigger>
						{#if selectedCity}
							{selectedCity.Description}, {selectedCity.AreaDescription} обл.
						{:else}
							{m.novaposhta_select_city?.() || 'Select city...'}
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each cities as city}
							<Select.Item value={city.Ref}>
								{city.Description}
								<span class="text-muted-foreground ml-2">
									{city.SettlementTypeDescription}, {city.AreaDescription} обл.
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/if}
		</div>

		<!-- Warehouse Selection (for warehouse delivery) -->
		{#if deliveryType === 'warehouse' && selectedCityRef}
			<div class="space-y-2">
				<Label>{m.novaposhta_warehouse?.() || 'Warehouse'}</Label>
				{#if loadingWarehouses}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 class="h-4 w-4 animate-spin" />
						{m.common_loading?.() || 'Loading...'}
					</div>
				{:else if warehouses.length === 0}
					<p class="text-sm text-muted-foreground">
						{m.novaposhta_no_warehouses?.() || 'No warehouses found in this city'}
					</p>
				{:else}
					<Select.Root type="single" value={selectedWarehouseRef} onValueChange={(v) => (selectedWarehouseRef = v ?? '')}>
						<Select.Trigger>
							{selectedWarehouse?.Description || m.novaposhta_select_warehouse?.() || 'Select warehouse...'}
						</Select.Trigger>
						<Select.Content>
							{#each warehouses as warehouse}
								<Select.Item value={warehouse.Ref}>
									№{warehouse.Number} - {warehouse.Description}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					
					<!-- Warehouse info -->
					{#if selectedWarehouse}
						<div class="mt-4 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
							<div class="flex items-center gap-2">
								<Building class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium">{selectedWarehouse.ShortAddress}</span>
							</div>
							{#if selectedWarehouse.Phone}
								<p class="text-muted-foreground">📞 {selectedWarehouse.Phone}</p>
							{/if}
							{#if selectedWarehouse.Schedule}
								<div class="text-xs text-muted-foreground">
									<p>Пн: {selectedWarehouse.Schedule.Monday}</p>
									<p>Вт: {selectedWarehouse.Schedule.Tuesday}</p>
									<p>Ср: {selectedWarehouse.Schedule.Wednesday}</p>
									<p>Чт: {selectedWarehouse.Schedule.Thursday}</p>
									<p>Пт: {selectedWarehouse.Schedule.Friday}</p>
									<p>Сб: {selectedWarehouse.Schedule.Saturday}</p>
									<p>Нд: {selectedWarehouse.Schedule.Sunday}</p>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Street Search (for address delivery) -->
		{#if deliveryType === 'address' && selectedCityRef}
			<div class="space-y-2">
				<Label>{m.novaposhta_street?.() || 'Street'}</Label>
				<div class="flex gap-2">
					<Input
						type="text"
						placeholder={m.novaposhta_search_street?.() || 'Search street...'}
						bind:value={streetSearch}
						onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && onStreetSearch()}
					/>
					<Button onclick={onStreetSearch} disabled={loadingStreets || streetSearch.length < 2}>
						{#if loadingStreets}
							<Loader2 class="h-4 w-4 animate-spin" />
						{:else}
							<Search class="h-4 w-4" />
						{/if}
					</Button>
				</div>
				{#if streets.length > 0}
					<Select.Root type="single" value={selectedStreetRef} onValueChange={(v) => (selectedStreetRef = v ?? '')}>
						<Select.Trigger>
							{#if selectedStreet}
								{selectedStreet.StreetsType} {selectedStreet.Description}
							{:else}
								{m.novaposhta_select_street?.() || 'Select street...'}
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each streets as street}
								<Select.Item value={street.Ref}>
									{street.StreetsType} {street.Description}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>

			<!-- Building and Flat Numbers -->
			{#if selectedStreetRef}
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>{m.novaposhta_building?.() || 'Building'}</Label>
						<Input type="text" placeholder="12" bind:value={buildingNumber} />
					</div>
					<div class="space-y-2">
						<Label>{m.novaposhta_flat?.() || 'Flat (optional)'}</Label>
						<Input type="text" placeholder="5" bind:value={flatNumber} />
					</div>
				</div>
			{/if}
		{/if}

		<!-- Result Display -->
		{#if fullAddress}
			<div class="mt-6 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
				<h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">
					{m.novaposhta_full_address?.() || 'Full Address'}
				</h4>
				<p class="text-green-700 dark:text-green-300">{fullAddress}</p>
				{#if selectedWarehouse}
					<p class="text-sm text-green-600 dark:text-green-400 mt-2">
						{m.novaposhta_postal_code?.() || 'Postal Code'}: <strong>{selectedWarehouse.PostalCodeUA || selectedWarehouse.WarehouseIndex || 'N/A'}</strong>
					</p>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
