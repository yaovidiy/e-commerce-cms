<script lang="ts">
	import * as Card from '$lib/components/ui/card';
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
	import { Loader2, MapPin, Building, Truck } from '@lucide/svelte/icons';

	// Delivery type
	let deliveryType = $state<'post_office' | 'courier'>('post_office');

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

	// Full address display
	let fullAddress = $derived.by(() => {
		if (deliveryType === 'post_office') {
			if (!selectedRegion || !selectedDistrict || !selectedCity || !selectedPostOffice) return '';
			return `${selectedPostOffice.POSTCODE}, ${selectedRegion.REGION_UA} обл., ${selectedDistrict.DISTRICT_UA} р-н, ${selectedCity.SHORTCITYTYPE_UA} ${selectedCity.CITY_UA}, ${selectedPostOffice.STREET_UA_VPZ}`;
		} else {
			if (!selectedRegion || !selectedDistrict || !selectedCity || !selectedStreet || !houseNumber)
				return '';
			const apt = apartmentNumber ? `, кв. ${apartmentNumber}` : '';
			return `${houseData?.POSTCODE || '?????'}, ${selectedRegion.REGION_UA} обл., ${selectedDistrict.DISTRICT_UA} р-н, ${selectedCity.SHORTCITYTYPE_UA} ${selectedCity.CITY_UA}, ${selectedStreet.SHORTSTREETTYPE_UA} ${selectedStreet.STREET_UA}, буд. ${houseNumber}${apt}`;
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

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<MapPin class="h-5 w-5" />
			{m.ukrposhta_address_test?.() || 'Address Lookup Test'}
		</Card.Title>
		<Card.Description>
			{m.ukrposhta_test_address_lookup?.() ||
				'Test the address lookup functionality with the Ukrposhta API'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Delivery Type Selection -->
		<div class="flex gap-2">
			<Button
				variant={deliveryType === 'post_office' ? 'default' : 'outline'}
				onclick={() => onDeliveryTypeChange('post_office')}
				class="flex-1"
			>
				<Building class="mr-2 h-4 w-4" />
				{m.ukrposhta_delivery_post_office?.() || 'Post Office Delivery'}
			</Button>
			<Button
				variant={deliveryType === 'courier' ? 'default' : 'outline'}
				onclick={() => onDeliveryTypeChange('courier')}
				class="flex-1"
			>
				<Truck class="mr-2 h-4 w-4" />
				{m.ukrposhta_delivery_courier?.() || 'Courier Delivery'}
			</Button>
		</div>

		<!-- Region Selection -->
		<div class="space-y-2">
			<Label>{m.ukrposhta_region?.() || 'Region (Oblast)'}</Label>
			<Select.Root
				type="single"
				value={selectedRegionId}
				onValueChange={(v) => onRegionChange(v ?? '')}
			>
				<Select.Trigger disabled={loadingRegions}>
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
			<div class="space-y-2">
				<Label>{m.ukrposhta_district?.() || 'District (Rayon)'}</Label>
				<Select.Root
					type="single"
					value={selectedDistrictId}
					onValueChange={(v) => onDistrictChange(v ?? '')}
				>
					<Select.Trigger disabled={loadingDistricts}>
						{#if loadingDistricts}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{m.common_loading?.() || 'Loading...'}
						{:else}
							{selectedDistrict?.DISTRICT_UA ||
								m.ukrposhta_select_district?.() ||
								'Select district...'}
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
			<div class="space-y-2">
				<Label>{m.ukrposhta_city?.() || 'City/Settlement'}</Label>
				<Select.Root
					type="single"
					value={selectedCityId}
					onValueChange={(v) => onCityChange(v ?? '')}
				>
					<Select.Trigger disabled={loadingCities}>
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
			<div class="space-y-2">
				<Label>{m.ukrposhta_post_office?.() || 'Post Office'}</Label>
				{#if loadingPostOffices}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 class="h-4 w-4 animate-spin" />
						{m.common_loading?.() || 'Loading...'}
					</div>
				{:else if postOffices.length === 0}
					<p class="text-sm text-muted-foreground">
						{m.ukrposhta_no_post_offices?.() || 'No post offices found in this city'}
					</p>
				{:else}
					<Select.Root
						type="single"
						value={selectedPostOfficeCode}
						onValueChange={(v) => (selectedPostOfficeCode = v ?? '')}
					>
						<Select.Trigger>
							{selectedPostOffice?.POSTOFFICE_UA ||
								m.ukrposhta_select_post_office?.() ||
								'Select post office...'}
						</Select.Trigger>
						<Select.Content>
							{#each postOffices as office}
								<Select.Item value={office.POSTCODE}>
									{office.POSTCODE} - {office.STREET_UA_VPZ}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>
		{/if}

		<!-- Street Search (for courier delivery) -->
		{#if deliveryType === 'courier' && selectedCityId}
			<div class="space-y-2">
				<Label>{m.ukrposhta_street?.() || 'Street'}</Label>
				<div class="flex gap-2">
					<Input
						type="text"
						placeholder={m.ukrposhta_search_street?.() || 'Search street...'}
						bind:value={streetSearch}
						onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && onStreetSearch()}
					/>
					<Button onclick={onStreetSearch} disabled={loadingStreets || streetSearch.length < 2}>
						{#if loadingStreets}
							<Loader2 class="h-4 w-4 animate-spin" />
						{:else}
							{m.common_search?.() || 'Search'}
						{/if}
					</Button>
				</div>
				{#if streets.length > 0}
					<Select.Root
						type="single"
						value={selectedStreetId}
						onValueChange={(v) => onStreetSelect(v ?? '')}
					>
						<Select.Trigger>
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
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>{m.ukrposhta_house_number?.() || 'House Number'}</Label>
						<div class="flex gap-2">
							<Input
								type="text"
								placeholder="12"
								bind:value={houseNumber}
								onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && lookupHouse()}
							/>
							<Button onclick={lookupHouse} disabled={loadingHouse || !houseNumber}>
								{#if loadingHouse}
									<Loader2 class="h-4 w-4 animate-spin" />
								{:else}
									{m.ukrposhta_lookup?.() || 'Lookup'}
								{/if}
							</Button>
						</div>
					</div>
					<div class="space-y-2">
						<Label>{m.ukrposhta_apartment?.() || 'Apartment (optional)'}</Label>
						<Input type="text" placeholder="5" bind:value={apartmentNumber} />
					</div>
				</div>
			{/if}
		{/if}

		<!-- Result Display -->
		{#if fullAddress}
			<div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
				<h4 class="font-semibold text-green-800 mb-2">
					{m.ukrposhta_full_address?.() || 'Full Address'}
				</h4>
				<p class="text-green-700">{fullAddress}</p>
				{#if deliveryType === 'courier' && houseData}
					<p class="text-sm text-green-600 mt-2">
						{m.ukrposhta_delivery_postcode?.() || 'Delivery Postcode'}: <strong
							>{houseData.POSTCODE}</strong
						>
					</p>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
