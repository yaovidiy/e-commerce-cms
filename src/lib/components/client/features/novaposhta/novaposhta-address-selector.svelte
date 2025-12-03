<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';
	import { tick } from 'svelte';
	import {
		searchCities,
		getWarehousesByCity,
		searchStreets,
		type NovaPoshtaCity,
		type NovaPoshtaWarehouse,
		type NovaPoshtaStreet
	} from '$lib/remotes/novaposhta.remote';
	import { Loader2, Building, Truck, Search, Check, Package, ChevronsUpDown } from '@lucide/svelte/icons';

	// Props
	interface Props {
		deliveryType?: 'warehouse' | 'address';
		onAddressSelect?: (address: AddressData) => void;
		class?: string;
	}

	let { deliveryType = $bindable('warehouse'), onAddressSelect, class: className = '' }: Props = $props();

	// Address data type
	export interface AddressData {
		deliveryType: 'warehouse' | 'address';
		cityRef: string;
		cityName: string;
		areaName: string;
		// For warehouse delivery
		warehouseRef?: string;
		warehouseNumber?: string;
		warehouseName?: string;
		warehouseAddress?: string;
		warehousePhone?: string;
		// For address delivery
		streetRef?: string;
		streetName?: string;
		buildingNumber?: string;
		flatNumber?: string;
		// Full formatted address
		fullAddress: string;
		// Postal code if available
		postalCode?: string;
	}

	// City search
	let citySearch = $state('');
	let cities = $state<NovaPoshtaCity[]>([]);
	let selectedCityRef = $state<string>('');
	let loadingCities = $state(false);

	// Warehouse selection
	let warehouses = $state<NovaPoshtaWarehouse[]>([]);
	let selectedWarehouseRef = $state<string>('');
	let loadingWarehouses = $state(false);

	// Street search (for address delivery)
	let streetSearch = $state('');
	let streets = $state<NovaPoshtaStreet[]>([]);
	let selectedStreetRef = $state<string>('');
	let loadingStreets = $state(false);

	// Address details
	let buildingNumber = $state('');
	let flatNumber = $state('');

	// Popover open states
	let cityPopoverOpen = $state(false);
	let warehousePopoverOpen = $state(false);
	let streetPopoverOpen = $state(false);

	// Trigger refs for focus management
	let cityTriggerRef = $state<HTMLButtonElement>(null!);
	let warehouseTriggerRef = $state<HTMLButtonElement>(null!);
	let streetTriggerRef = $state<HTMLButtonElement>(null!);

	// Get current selection info
	let selectedCity = $derived(cities.find((c) => c.Ref === selectedCityRef));
	let selectedWarehouse = $derived(warehouses.find((w) => w.Ref === selectedWarehouseRef));
	let selectedStreet = $derived(streets.find((s) => s.Ref === selectedStreetRef));

	// Helper to close popover and refocus trigger
	function closeCityPopover() {
		cityPopoverOpen = false;
		tick().then(() => cityTriggerRef?.focus());
	}

	function closeWarehousePopover() {
		warehousePopoverOpen = false;
		tick().then(() => warehouseTriggerRef?.focus());
	}

	function closeStreetPopover() {
		streetPopoverOpen = false;
		tick().then(() => streetTriggerRef?.focus());
	}

	// Check if address is complete
	let isComplete = $derived.by(() => {
		if (deliveryType === 'warehouse') {
			return !!(selectedCity && selectedWarehouse);
		} else {
			return !!(selectedCity && selectedStreet && buildingNumber);
		}
	});

	// Build address data
	let addressData = $derived.by((): AddressData | null => {
		if (!isComplete || !selectedCity) return null;

		if (deliveryType === 'warehouse' && selectedWarehouse) {
			return {
				deliveryType: 'warehouse',
				cityRef: selectedCityRef,
				cityName: selectedCity.Description,
				areaName: selectedCity.AreaDescription,
				warehouseRef: selectedWarehouseRef,
				warehouseNumber: selectedWarehouse.Number,
				warehouseName: selectedWarehouse.Description,
				warehouseAddress: selectedWarehouse.ShortAddress,
				warehousePhone: selectedWarehouse.Phone,
				postalCode: selectedWarehouse.PostalCodeUA || selectedWarehouse.WarehouseIndex,
				fullAddress: `${selectedCity.AreaDescription} обл., ${selectedCity.Description}, ${selectedWarehouse.Description}`
			};
		} else if (deliveryType === 'address' && selectedStreet) {
			const flat = flatNumber ? `, кв. ${flatNumber}` : '';
			return {
				deliveryType: 'address',
				cityRef: selectedCityRef,
				cityName: selectedCity.Description,
				areaName: selectedCity.AreaDescription,
				streetRef: selectedStreetRef,
				streetName: `${selectedStreet.StreetsType} ${selectedStreet.Description}`,
				buildingNumber,
				flatNumber: flatNumber || undefined,
				fullAddress: `${selectedCity.AreaDescription} обл., ${selectedCity.Description}, ${selectedStreet.StreetsType} ${selectedStreet.Description}, буд. ${buildingNumber}${flat}`
			};
		}
		return null;
	});

	// Notify parent when address is complete
	$effect(() => {
		if (addressData && onAddressSelect) {
			onAddressSelect(addressData);
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

	// Handle city selection
	async function onCitySelect(ref: string) {
		selectedCityRef = ref;
		selectedWarehouseRef = '';
		selectedStreetRef = '';
		warehouses = [];
		streets = [];
		streetSearch = '';
		buildingNumber = '';
		flatNumber = '';
		closeCityPopover();

		if (!ref) return;

		if (deliveryType === 'warehouse') {
			await loadWarehouses(ref);
		}
	}

	// Handle warehouse selection
	function onWarehouseSelect(ref: string) {
		selectedWarehouseRef = ref;
		closeWarehousePopover();
	}

	// Load warehouses for a city
	async function loadWarehouses(cityRef: string) {
		loadingWarehouses = true;
		try {
			warehouses = await getWarehousesByCity({ cityRef, limit: 200 });
		} catch (error) {
			console.error('Error loading warehouses:', error);
			warehouses = [];
		} finally {
			loadingWarehouses = false;
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

	// Handle street selection
	function onStreetSelect(ref: string) {
		selectedStreetRef = ref;
		buildingNumber = '';
		flatNumber = '';
		closeStreetPopover();
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

		// If city is selected and switching to warehouse, load warehouses
		if (type === 'warehouse' && selectedCityRef) {
			loadWarehouses(selectedCityRef);
		}
	}
</script>

<div class="space-y-4 {className}">
	<!-- Delivery Type Selection -->
	<div class="grid grid-cols-2 gap-2">
		<button
			type="button"
			class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors {deliveryType === 'warehouse'
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border hover:border-primary/50'}"
			onclick={() => onDeliveryTypeChange('warehouse')}
		>
			<Package class="h-4 w-4" />
			<span class="text-sm font-medium">
				{m.novaposhta_to_warehouse?.() || 'To Warehouse'}
			</span>
		</button>
		<button
			type="button"
			class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors {deliveryType === 'address'
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border hover:border-primary/50'}"
			onclick={() => onDeliveryTypeChange('address')}
		>
			<Truck class="h-4 w-4" />
			<span class="text-sm font-medium">
				{m.novaposhta_to_address?.() || 'To Address'}
			</span>
		</button>
	</div>

	<!-- City Search with Combobox -->
	<div class="space-y-1.5">
		<Label class="text-sm">{m.novaposhta_city?.() || 'City'}</Label>
		<div class="flex gap-2">
			<Input
				type="text"
				placeholder={m.novaposhta_search_city?.() || 'Search city...'}
				bind:value={citySearch}
				onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && onCitySearch()}
				class="flex-1"
			/>
			<Button
				type="button"
				onclick={onCitySearch}
				disabled={loadingCities || citySearch.length < 2}
				size="icon"
				variant="outline"
			>
				{#if loadingCities}
					<Loader2 class="h-4 w-4 animate-spin" />
				{:else}
					<Search class="h-4 w-4" />
				{/if}
			</Button>
		</div>
		{#if cities.length > 0}
			<Popover.Root bind:open={cityPopoverOpen}>
				<Popover.Trigger bind:ref={cityTriggerRef}>
					{#snippet child({ props })}
						<Button
							variant="outline"
							class="w-full justify-between"
							{...props}
							role="combobox"
							aria-expanded={cityPopoverOpen}
						>
							{#if selectedCity}
								{selectedCity.Description}, {selectedCity.AreaDescription} обл.
							{:else}
								{m.novaposhta_select_city?.() || 'Select city...'}
							{/if}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
					<Command.Root>
						<Command.Input placeholder={m.novaposhta_search_city?.() || 'Search city...'} />
						<Command.List>
							<Command.Empty>No city found.</Command.Empty>
							<Command.Group>
								{#each cities as city}
									<Command.Item
										value={`${city.Description} ${city.AreaDescription}`}
										onSelect={() => onCitySelect(city.Ref)}
									>
										<Check
											class={cn(
												'mr-2 h-4 w-4',
												selectedCityRef !== city.Ref && 'text-transparent'
											)}
										/>
										<span>{city.Description}</span>
										<span class="text-muted-foreground ml-2">
											{city.SettlementTypeDescription}, {city.AreaDescription} обл.
										</span>
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		{/if}
	</div>

	<!-- Warehouse Selection with Combobox (for warehouse delivery) -->
	{#if deliveryType === 'warehouse' && selectedCityRef}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.novaposhta_warehouse?.() || 'Warehouse'}</Label>
			{#if loadingWarehouses}
				<div class="flex items-center gap-2 py-2 text-sm text-muted-foreground">
					<Loader2 class="h-4 w-4 animate-spin" />
					{m.common_loading?.() || 'Loading...'}
				</div>
			{:else if warehouses.length === 0}
				<p class="text-sm text-muted-foreground py-2">
					{m.novaposhta_no_warehouses?.() || 'No warehouses found in this city'}
				</p>
			{:else}
				<Popover.Root bind:open={warehousePopoverOpen}>
					<Popover.Trigger bind:ref={warehouseTriggerRef}>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="w-full justify-between"
								{...props}
								role="combobox"
								aria-expanded={warehousePopoverOpen}
							>
								{selectedWarehouse?.Description || m.novaposhta_select_warehouse?.() || 'Select warehouse...'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
						<Command.Root>
							<Command.Input placeholder={m.novaposhta_select_warehouse?.() || 'Search warehouse...'} />
							<Command.List>
								<Command.Empty>No warehouse found.</Command.Empty>
								<Command.Group>
									{#each warehouses as warehouse}
										<Command.Item
											value={`${warehouse.Number} ${warehouse.Description}`}
											onSelect={() => onWarehouseSelect(warehouse.Ref)}
										>
											<Check
												class={cn(
													'mr-2 h-4 w-4',
													selectedWarehouseRef !== warehouse.Ref && 'text-transparent'
												)}
											/>
											№{warehouse.Number} - {warehouse.Description}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				
				<!-- Warehouse info -->
				{#if selectedWarehouse}
					<div class="mt-2 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
						<div class="flex items-center gap-2">
							<Building class="h-4 w-4 text-muted-foreground shrink-0" />
							<span class="font-medium">{selectedWarehouse.ShortAddress}</span>
						</div>
						{#if selectedWarehouse.Phone}
							<p class="text-muted-foreground">📞 {selectedWarehouse.Phone}</p>
						{/if}
						{#if selectedWarehouse.Schedule}
							<div class="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
								<span>Пн: {selectedWarehouse.Schedule.Monday}</span>
								<span>Вт: {selectedWarehouse.Schedule.Tuesday}</span>
								<span>Ср: {selectedWarehouse.Schedule.Wednesday}</span>
								<span>Чт: {selectedWarehouse.Schedule.Thursday}</span>
								<span>Пт: {selectedWarehouse.Schedule.Friday}</span>
								<span>Сб: {selectedWarehouse.Schedule.Saturday}</span>
								<span>Нд: {selectedWarehouse.Schedule.Sunday}</span>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	<!-- Street Search with Combobox (for address delivery) -->
	{#if deliveryType === 'address' && selectedCityRef}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.novaposhta_street?.() || 'Street'}</Label>
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder={m.novaposhta_search_street?.() || 'Search street...'}
					bind:value={streetSearch}
					onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && onStreetSearch()}
					class="flex-1"
				/>
				<Button
					type="button"
					onclick={onStreetSearch}
					disabled={loadingStreets || streetSearch.length < 2}
					size="icon"
					variant="outline"
				>
					{#if loadingStreets}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Search class="h-4 w-4" />
					{/if}
				</Button>
			</div>
			{#if streets.length > 0}
				<Popover.Root bind:open={streetPopoverOpen}>
					<Popover.Trigger bind:ref={streetTriggerRef}>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class="w-full justify-between"
								{...props}
								role="combobox"
								aria-expanded={streetPopoverOpen}
							>
								{#if selectedStreet}
									{selectedStreet.StreetsType} {selectedStreet.Description}
								{:else}
									{m.novaposhta_select_street?.() || 'Select street...'}
								{/if}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
						<Command.Root>
							<Command.Input placeholder={m.novaposhta_search_street?.() || 'Search street...'} />
							<Command.List>
								<Command.Empty>No street found.</Command.Empty>
								<Command.Group>
									{#each streets as street}
										<Command.Item
											value={`${street.StreetsType} ${street.Description}`}
											onSelect={() => onStreetSelect(street.Ref)}
										>
											<Check
												class={cn(
													'mr-2 h-4 w-4',
													selectedStreetRef !== street.Ref && 'text-transparent'
												)}
											/>
											{street.StreetsType} {street.Description}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>

		<!-- Building and Flat Numbers -->
		{#if selectedStreetRef}
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1.5">
					<Label class="text-sm">{m.novaposhta_building?.() || 'Building'}</Label>
					<Input type="text" placeholder="12" bind:value={buildingNumber} />
				</div>
				<div class="space-y-1.5">
					<Label class="text-sm">{m.novaposhta_flat?.() || 'Flat (optional)'}</Label>
					<Input type="text" placeholder="5" bind:value={flatNumber} />
				</div>
			</div>
		{/if}
	{/if}

	<!-- Address Preview -->
	{#if isComplete && addressData}
		<div class="mt-4 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
			<div class="flex items-start gap-2">
				<Check class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
				<div>
					<p class="text-sm font-medium text-green-800 dark:text-green-200">
						{m.ukrposhta_address_selected?.() || 'Address selected'}
					</p>
					<p class="text-sm text-green-700 dark:text-green-300 mt-1">{addressData.fullAddress}</p>
					{#if addressData.postalCode}
						<p class="text-xs text-green-600 dark:text-green-400 mt-1">
							{m.novaposhta_postal_code?.() || 'Postal Code'}: <strong>{addressData.postalCode}</strong>
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
