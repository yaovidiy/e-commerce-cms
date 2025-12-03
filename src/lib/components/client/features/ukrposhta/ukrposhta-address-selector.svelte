<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
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
	import { Loader2, MapPin, Building, Truck, Search, Check } from '@lucide/svelte/icons';

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
		<Select.Root
			type="single"
			value={selectedRegionId}
			onValueChange={(v) => onRegionChange(v ?? '')}
		>
			<Select.Trigger disabled={loadingRegions} class="w-full">
				{#if loadingRegions}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{m.common_loading?.() || 'Loading...'}
				{:else}
					{selectedRegion?.REGION_UA || m.ukrposhta_select_region?.() || 'Select region...'}
				{/if}
			</Select.Trigger>
			<Select.Content>
				{#each regions as region}
					<Select.Item value={region.REGION_ID}>{region.REGION_UA}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<!-- District Selection -->
	{#if selectedRegionId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_district?.() || 'District'}</Label>
			<Select.Root
				type="single"
				value={selectedDistrictId}
				onValueChange={(v) => onDistrictChange(v ?? '')}
			>
				<Select.Trigger disabled={loadingDistricts} class="w-full">
					{#if loadingDistricts}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{m.common_loading?.() || 'Loading...'}
					{:else}
						{selectedDistrict?.DISTRICT_UA || m.ukrposhta_select_district?.() || 'Select district...'}
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each districts as district}
						<Select.Item value={district.DISTRICT_ID}>{district.DISTRICT_UA}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/if}

	<!-- City Selection -->
	{#if selectedDistrictId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_city?.() || 'City/Settlement'}</Label>
			<Select.Root
				type="single"
				value={selectedCityId}
				onValueChange={(v) => onCityChange(v ?? '')}
			>
				<Select.Trigger disabled={loadingCities} class="w-full">
					{#if loadingCities}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{m.common_loading?.() || 'Loading...'}
					{:else if selectedCity}
						{selectedCity.SHORTCITYTYPE_UA}
						{selectedCity.CITY_UA}
					{:else}
						{m.ukrposhta_select_city?.() || 'Select city...'}
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each cities as city}
						<Select.Item value={city.CITY_ID}>
							{city.SHORTCITYTYPE_UA}
							{city.CITY_UA}
							{#if city.OWNOF}
								<span class="text-muted-foreground ml-1">({city.OWNOF})</span>
							{/if}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
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
				<Select.Root
					type="single"
					value={selectedPostOfficeCode}
					onValueChange={(v) => (selectedPostOfficeCode = v ?? '')}
				>
					<Select.Trigger class="w-full">
						{selectedPostOffice?.POSTOFFICE_UA || m.ukrposhta_select_post_office?.() || 'Select post office...'}
					</Select.Trigger>
					<Select.Content>
						{#each postOffices as office}
							<Select.Item value={office.POSTCODE}>
								<div class="flex flex-col">
									<span>{office.POSTCODE} - {office.STREET_UA_VPZ}</span>
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/if}
		</div>
	{/if}

	<!-- Street Search (for courier delivery) -->
	{#if deliveryType === 'courier' && selectedCityId}
		<div class="space-y-1.5">
			<Label class="text-sm">{m.ukrposhta_street?.() || 'Street'}</Label>
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder={m.ukrposhta_search_street?.() || 'Search street...'}
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
				<Select.Root
					type="single"
					value={selectedStreetId}
					onValueChange={(v) => onStreetSelect(v ?? '')}
				>
					<Select.Trigger class="w-full">
						{#if selectedStreet}
							{selectedStreet.SHORTSTREETTYPE_UA}
							{selectedStreet.STREET_UA}
						{:else}
							{m.ukrposhta_select_street?.() || 'Select street...'}
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each streets as street}
							<Select.Item value={street.STREET_ID}>
								{street.SHORTSTREETTYPE_UA}
								{street.STREET_UA}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/if}
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
