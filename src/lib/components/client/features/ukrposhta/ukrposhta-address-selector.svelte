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
		getAllRegions,
		getDistrictsByRegion,
		getCitiesByDistrict,
		searchStreets,
		getHousePostcode,
		getPostOfficesByCity,
		type UkrposhtaRegion,
		type UkrposhtaDistrict,
		type UkrposhtaCity,
		type UkrposhtaStreet,
		type UkrposhtaHouse,
		type UkrposhtaPostOffice
	} from '$lib/remotes/ukrposhta.remote';
	import { Loader2, MapPin, Building, Truck, Search, Check, ChevronsUpDown } from '@lucide/svelte/icons';

	// Props
	interface Props {
		deliveryType?: 'post_office' | 'courier';
		onAddressSelect?: (address: AddressData) => void;
		class?: string;
	}

	let { deliveryType = $bindable('post_office'), onAddressSelect, class: className = '' }: Props = $props();

	// Address data type
	export interface AddressData {
		deliveryType: 'post_office' | 'courier';
		regionId: string;
		regionName: string;
		districtId: string;
		districtName: string;
		cityId: string;
		cityName: string;
		postcode: string;
		// For post office delivery
		postOfficeCode?: string;
		postOfficeName?: string;
		postOfficeAddress?: string;
		// For courier delivery
		streetId?: string;
		streetName?: string;
		houseNumber?: string;
		apartmentNumber?: string;
		// Full formatted address
		fullAddress: string;
	}

	// Selected values
	let selectedRegionId = $state<string>('');
	let selectedDistrictId = $state<string>('');
	let selectedCityId = $state<string>('');
	let selectedStreetId = $state<string>('');
	let selectedPostOfficeCode = $state<string>('');

	// Input values
	let streetSearch = $state('');
	let houseNumber = $state('');
	let apartmentNumber = $state('');

	// Data
	let regions = $state<UkrposhtaRegion[]>([]);
	let districts = $state<UkrposhtaDistrict[]>([]);
	let cities = $state<UkrposhtaCity[]>([]);
	let streets = $state<UkrposhtaStreet[]>([]);
	let postOffices = $state<UkrposhtaPostOffice[]>([]);
	let houseData = $state<UkrposhtaHouse | null>(null);

	// Loading states
	let loadingRegions = $state(false);
	let loadingDistricts = $state(false);
	let loadingCities = $state(false);
	let loadingStreets = $state(false);
	let loadingPostOffices = $state(false);
	let loadingHouse = $state(false);

	// Popover open states
	let regionPopoverOpen = $state(false);
	let districtPopoverOpen = $state(false);
	let cityPopoverOpen = $state(false);
	let streetPopoverOpen = $state(false);
	let postOfficePopoverOpen = $state(false);

	// Trigger refs for focus management
	let regionTriggerRef = $state<HTMLButtonElement | null>(null);
	let districtTriggerRef = $state<HTMLButtonElement | null>(null);
	let cityTriggerRef = $state<HTMLButtonElement | null>(null);
	let streetTriggerRef = $state<HTMLButtonElement | null>(null);
	let postOfficeTriggerRef = $state<HTMLButtonElement | null>(null);

	// Close popover helpers
	function closeRegionPopover() {
		regionPopoverOpen = false;
		tick().then(() => regionTriggerRef?.focus());
	}

	function closeDistrictPopover() {
		districtPopoverOpen = false;
		tick().then(() => districtTriggerRef?.focus());
	}

	function closeCityPopover() {
		cityPopoverOpen = false;
		tick().then(() => cityTriggerRef?.focus());
	}

	function closeStreetPopover() {
		streetPopoverOpen = false;
		tick().then(() => streetTriggerRef?.focus());
	}

	function closePostOfficePopover() {
		postOfficePopoverOpen = false;
		tick().then(() => postOfficeTriggerRef?.focus());
	}

	// Get current selection info
	let selectedRegion = $derived(regions.find((r) => r.REGION_ID === selectedRegionId));
	let selectedDistrict = $derived(districts.find((d) => d.DISTRICT_ID === selectedDistrictId));
	let selectedCity = $derived(cities.find((c) => c.CITY_ID === selectedCityId));
	let selectedStreet = $derived(streets.find((s) => s.STREET_ID === selectedStreetId));
	let selectedPostOffice = $derived(postOffices.find((o) => o.POSTCODE === selectedPostOfficeCode));

	// Check if address is complete
	let isComplete = $derived.by(() => {
		if (deliveryType === 'post_office') {
			return !!(selectedRegion && selectedDistrict && selectedCity && selectedPostOffice);
		} else {
			return !!(selectedRegion && selectedDistrict && selectedCity && selectedStreet && houseNumber && houseData);
		}
	});

	// Build address data
	let addressData = $derived.by((): AddressData | null => {
		if (!isComplete) return null;

		if (deliveryType === 'post_office' && selectedPostOffice) {
			return {
				deliveryType: 'post_office',
				regionId: selectedRegionId,
				regionName: selectedRegion!.REGION_UA,
				districtId: selectedDistrictId,
				districtName: selectedDistrict!.DISTRICT_UA,
				cityId: selectedCityId,
				cityName: `${selectedCity!.SHORTCITYTYPE_UA} ${selectedCity!.CITY_UA}`,
				postcode: selectedPostOffice.POSTCODE,
				postOfficeCode: selectedPostOffice.POSTCODE,
				postOfficeName: selectedPostOffice.POSTOFFICE_UA,
				postOfficeAddress: selectedPostOffice.STREET_UA_VPZ,
				fullAddress: `${selectedPostOffice.POSTCODE}, ${selectedRegion!.REGION_UA} обл., ${selectedDistrict!.DISTRICT_UA} р-н, ${selectedCity!.SHORTCITYTYPE_UA} ${selectedCity!.CITY_UA}, ${selectedPostOffice.STREET_UA_VPZ}`
			};
		} else if (deliveryType === 'courier' && selectedStreet && houseData) {
			const apt = apartmentNumber ? `, кв. ${apartmentNumber}` : '';
			return {
				deliveryType: 'courier',
				regionId: selectedRegionId,
				regionName: selectedRegion!.REGION_UA,
				districtId: selectedDistrictId,
				districtName: selectedDistrict!.DISTRICT_UA,
				cityId: selectedCityId,
				cityName: `${selectedCity!.SHORTCITYTYPE_UA} ${selectedCity!.CITY_UA}`,
				postcode: houseData.POSTCODE,
				streetId: selectedStreetId,
				streetName: `${selectedStreet.SHORTSTREETTYPE_UA} ${selectedStreet.STREET_UA}`,
				houseNumber,
				apartmentNumber: apartmentNumber || undefined,
				fullAddress: `${houseData.POSTCODE}, ${selectedRegion!.REGION_UA} обл., ${selectedDistrict!.DISTRICT_UA} р-н, ${selectedCity!.SHORTCITYTYPE_UA} ${selectedCity!.CITY_UA}, ${selectedStreet.SHORTSTREETTYPE_UA} ${selectedStreet.STREET_UA}, буд. ${houseNumber}${apt}`
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

	// Load regions on mount
	$effect(() => {
		loadRegions();
	});

	async function loadRegions() {
		loadingRegions = true;
		try {
			regions = await getAllRegions();
		} catch (error) {
			console.error('Error loading regions:', error);
		} finally {
			loadingRegions = false;
		}
	}

	async function onRegionChange(regionId: string) {
		selectedRegionId = regionId;
		selectedDistrictId = '';
		selectedCityId = '';
		selectedStreetId = '';
		selectedPostOfficeCode = '';
		districts = [];
		cities = [];
		streets = [];
		postOffices = [];
		houseData = null;

		if (!regionId) return;

		loadingDistricts = true;
		try {
			districts = await getDistrictsByRegion({ regionId });
		} catch (error) {
			console.error('Error loading districts:', error);
		} finally {
			loadingDistricts = false;
		}
	}

	async function onDistrictChange(districtId: string) {
		selectedDistrictId = districtId;
		selectedCityId = '';
		selectedStreetId = '';
		selectedPostOfficeCode = '';
		cities = [];
		streets = [];
		postOffices = [];
		houseData = null;

		if (!districtId) return;

		loadingCities = true;
		try {
			cities = await getCitiesByDistrict({ districtId });
		} catch (error) {
			console.error('Error loading cities:', error);
		} finally {
			loadingCities = false;
		}
	}

	async function onCityChange(cityId: string) {
		selectedCityId = cityId;
		selectedStreetId = '';
		selectedPostOfficeCode = '';
		streets = [];
		postOffices = [];
		houseData = null;

		if (!cityId) return;

		if (deliveryType === 'post_office') {
			loadingPostOffices = true;
			try {
				postOffices = await getPostOfficesByCity({ cityId });
			} catch (error) {
				console.error('Error loading post offices:', error);
			} finally {
				loadingPostOffices = false;
			}
		}
	}

	async function onStreetSearch() {
		if (!selectedCityId || streetSearch.length < 2) return;

		loadingStreets = true;
		try {
			streets = await searchStreets({ cityId: selectedCityId, name: streetSearch });
		} catch (error) {
			console.error('Error searching streets:', error);
		} finally {
			loadingStreets = false;
		}
	}

	async function onStreetSelect(streetId: string) {
		selectedStreetId = streetId;
		houseData = null;
	}

	async function lookupHouse() {
		if (!selectedStreetId || !houseNumber) return;

		loadingHouse = true;
		try {
			houseData = await getHousePostcode({ streetId: selectedStreetId, houseNumber });
		} catch (error) {
			console.error('Error looking up house:', error);
		} finally {
			loadingHouse = false;
		}
	}

	function onDeliveryTypeChange(type: 'post_office' | 'courier') {
		deliveryType = type;
		selectedStreetId = '';
		selectedPostOfficeCode = '';
		streets = [];
		postOffices = [];
		houseData = null;
		streetSearch = '';
		houseNumber = '';
		apartmentNumber = '';

		// If city is selected and switching to post office, load offices
		if (type === 'post_office' && selectedCityId) {
			onCityChange(selectedCityId);
		}
	}
</script>

<div class="space-y-4 {className}">
	<!-- Delivery Type Selection -->
	<div class="grid grid-cols-2 gap-2">
		<button
			type="button"
			class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors {deliveryType === 'post_office'
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border hover:border-primary/50'}"
			onclick={() => onDeliveryTypeChange('post_office')}
		>
			<Building class="h-4 w-4" />
			<span class="text-sm font-medium">
				{m.ukrposhta_to_post_office?.() || 'To Post Office'}
			</span>
		</button>
		<button
			type="button"
			class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors {deliveryType === 'courier'
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border hover:border-primary/50'}"
			onclick={() => onDeliveryTypeChange('courier')}
		>
			<Truck class="h-4 w-4" />
			<span class="text-sm font-medium">
				{m.ukrposhta_courier?.() || 'Courier'}
			</span>
		</button>
	</div>

	<!-- Region Selection -->
	<div class="space-y-1.5">
		<Label class="text-sm">{m.ukrposhta_region?.() || 'Region'}</Label>
		<Popover.Root bind:open={regionPopoverOpen}>
			<Popover.Trigger bind:ref={regionTriggerRef}>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						role="combobox"
						aria-expanded={regionPopoverOpen}
						class="w-full justify-between"
						disabled={loadingRegions}
					>
						{#if loadingRegions}
							<span class="flex items-center gap-2">
								<Loader2 class="h-4 w-4 animate-spin" />
								{m.common_loading?.() || 'Loading...'}
							</span>
						{:else}
							{selectedRegion?.REGION_UA || m.ukrposhta_select_region?.() || 'Select region...'}
						{/if}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
				<Command.Root>
					<Command.Input placeholder={m.ukrposhta_select_region?.() || 'Search region...'} />
					<Command.List>
						<Command.Empty>{m.common_no_results?.() || 'No results found.'}</Command.Empty>
						<Command.Group>
							{#each regions as region}
								<Command.Item
									value={region.REGION_UA}
									onSelect={() => {
										onRegionChange(region.REGION_ID);
										closeRegionPopover();
									}}
								>
									<Check class={cn('mr-2 h-4 w-4', selectedRegionId === region.REGION_ID ? 'opacity-100' : 'opacity-0')} />
									{region.REGION_UA}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- District Selection -->
	{#if selectedRegionId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_district?.() || 'District'}</Label>
			<Popover.Root bind:open={districtPopoverOpen}>
				<Popover.Trigger bind:ref={districtTriggerRef}>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							role="combobox"
							aria-expanded={districtPopoverOpen}
							class="w-full justify-between"
							disabled={loadingDistricts}
						>
							{#if loadingDistricts}
								<span class="flex items-center gap-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									{m.common_loading?.() || 'Loading...'}
								</span>
							{:else}
								{selectedDistrict?.DISTRICT_UA || m.ukrposhta_select_district?.() || 'Select district...'}
							{/if}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
					<Command.Root>
						<Command.Input placeholder={m.ukrposhta_select_district?.() || 'Search district...'} />
						<Command.List>
							<Command.Empty>{m.common_no_results?.() || 'No results found.'}</Command.Empty>
							<Command.Group>
								{#each districts as district}
									<Command.Item
										value={district.DISTRICT_UA}
										onSelect={() => {
											onDistrictChange(district.DISTRICT_ID);
											closeDistrictPopover();
										}}
									>
										<Check class={cn('mr-2 h-4 w-4', selectedDistrictId === district.DISTRICT_ID ? 'opacity-100' : 'opacity-0')} />
										{district.DISTRICT_UA}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/if}

	<!-- City Selection -->
	{#if selectedDistrictId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_city?.() || 'City/Settlement'}</Label>
			<Popover.Root bind:open={cityPopoverOpen}>
				<Popover.Trigger bind:ref={cityTriggerRef}>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							role="combobox"
							aria-expanded={cityPopoverOpen}
							class="w-full justify-between"
							disabled={loadingCities}
						>
							{#if loadingCities}
								<span class="flex items-center gap-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									{m.common_loading?.() || 'Loading...'}
								</span>
							{:else if selectedCity}
								{selectedCity.SHORTCITYTYPE_UA} {selectedCity.CITY_UA}
							{:else}
								{m.ukrposhta_select_city?.() || 'Select city...'}
							{/if}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
					<Command.Root>
						<Command.Input placeholder={m.ukrposhta_select_city?.() || 'Search city...'} />
						<Command.List>
							<Command.Empty>{m.common_no_results?.() || 'No results found.'}</Command.Empty>
							<Command.Group>
								{#each cities as city}
									<Command.Item
										value={`${city.SHORTCITYTYPE_UA} ${city.CITY_UA} ${city.OWNOF || ''}`}
										onSelect={() => {
											onCityChange(city.CITY_ID);
											closeCityPopover();
										}}
									>
										<Check class={cn('mr-2 h-4 w-4', selectedCityId === city.CITY_ID ? 'opacity-100' : 'opacity-0')} />
										{city.SHORTCITYTYPE_UA} {city.CITY_UA}
										{#if city.OWNOF}
											<span class="text-muted-foreground ml-1">({city.OWNOF})</span>
										{/if}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/if}

	<!-- Post Office Selection (for post office delivery) -->
	{#if deliveryType === 'post_office' && selectedCityId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_post_office?.() || 'Post Office'}</Label>
			{#if loadingPostOffices}
				<div class="flex items-center gap-2 py-2 text-sm text-muted-foreground">
					<Loader2 class="h-4 w-4 animate-spin" />
					{m.common_loading?.() || 'Loading...'}
				</div>
			{:else if postOffices.length === 0}
				<p class="text-sm text-muted-foreground py-2">
					{m.ukrposhta_no_post_offices?.() || 'No post offices found'}
				</p>
			{:else}
				<Popover.Root bind:open={postOfficePopoverOpen}>
					<Popover.Trigger bind:ref={postOfficeTriggerRef}>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								role="combobox"
								aria-expanded={postOfficePopoverOpen}
								class="w-full justify-between"
							>
								{selectedPostOffice?.POSTOFFICE_UA || m.ukrposhta_select_post_office?.() || 'Select post office...'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
						<Command.Root>
							<Command.Input placeholder={m.ukrposhta_select_post_office?.() || 'Search post office...'} />
							<Command.List>
								<Command.Empty>{m.common_no_results?.() || 'No results found.'}</Command.Empty>
								<Command.Group>
									{#each postOffices as office}
										<Command.Item
											value={`${office.POSTCODE} ${office.STREET_UA_VPZ}`}
											onSelect={() => {
												selectedPostOfficeCode = office.POSTCODE;
												closePostOfficePopover();
											}}
										>
											<Check class={cn('mr-2 h-4 w-4', selectedPostOfficeCode === office.POSTCODE ? 'opacity-100' : 'opacity-0')} />
											{office.POSTCODE} - {office.STREET_UA_VPZ}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	{/if}

	<!-- Street Search (for courier delivery) -->
	{#if deliveryType === 'courier' && selectedCityId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_street?.() || 'Street'}</Label>
			<Popover.Root bind:open={streetPopoverOpen}>
				<Popover.Trigger bind:ref={streetTriggerRef}>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							role="combobox"
							aria-expanded={streetPopoverOpen}
							class="w-full justify-between"
							disabled={loadingStreets}
						>
							{#if loadingStreets}
								<span class="flex items-center gap-2">
									<Loader2 class="h-4 w-4 animate-spin" />
									{m.common_loading?.() || 'Loading...'}
								</span>
							{:else if selectedStreet}
								{selectedStreet.SHORTSTREETTYPE_UA} {selectedStreet.STREET_UA}
							{:else}
								{m.ukrposhta_select_street?.() || 'Select street...'}
							{/if}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[--bits-popover-anchor-width] p-0">
					<Command.Root shouldFilter={false}>
						<Command.Input 
							placeholder={m.ukrposhta_search_street?.() || 'Search street...'} 
							bind:value={streetSearch}
							oninput={() => {
								if (streetSearch.length >= 2) {
									onStreetSearch();
								}
							}}
						/>
						<Command.List>
							{#if streets.length === 0 && streetSearch.length >= 2 && !loadingStreets}
								<Command.Empty>No results found.</Command.Empty>
							{:else if streets.length === 0}
								<Command.Empty>Type at least 2 characters to search...</Command.Empty>
							{/if}
							<Command.Group>
								{#each streets as street}
									<Command.Item
										value={`${street.SHORTSTREETTYPE_UA} ${street.STREET_UA}`}
										onSelect={() => {
											onStreetSelect(street.STREET_ID);
											closeStreetPopover();
										}}
									>
										<Check class={cn('mr-2 h-4 w-4', selectedStreetId === street.STREET_ID ? 'opacity-100' : 'opacity-0')} />
										{street.SHORTSTREETTYPE_UA} {street.STREET_UA}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>

		<!-- House Number -->
		{#if selectedStreetId}
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1.5">
					<Label class="text-sm">{m.ukrposhta_house_number?.() || 'House'}</Label>
					<div class="flex gap-2">
						<Input
							type="text"
							placeholder="12"
							bind:value={houseNumber}
							onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && lookupHouse()}
							onblur={lookupHouse}
							class="flex-1"
						/>
					</div>
				</div>
				<div class="space-y-1.5">
					<Label class="text-sm">{m.ukrposhta_apartment?.() || 'Apartment'}</Label>
					<Input type="text" placeholder="5" bind:value={apartmentNumber} />
				</div>
			</div>
			{#if loadingHouse}
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 class="h-4 w-4 animate-spin" />
					{m.ukrposhta_looking_up_postcode?.() || 'Looking up postcode...'}
				</div>
			{:else if houseNumber && !houseData}
				<p class="text-sm text-amber-600">
					{m.ukrposhta_postcode_not_found?.() || 'Postcode not found for this address'}
				</p>
			{/if}
		{/if}
	{/if}

	<!-- Address Preview -->
	{#if isComplete && addressData}
		<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
			<div class="flex items-start gap-2">
				<Check class="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
				<div>
					<p class="text-sm font-medium text-green-800">
						{m.ukrposhta_address_selected?.() || 'Address selected'}
					</p>
					<p class="text-sm text-green-700 mt-1">{addressData.fullAddress}</p>
				</div>
			</div>
		</div>
	{/if}
</div>
