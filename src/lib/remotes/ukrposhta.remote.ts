import { query } from '$app/server';
import * as v from 'valibot';
import {
	ukrposhtaClient,
	type UkrposhtaRegion,
	type UkrposhtaDistrict,
	type UkrposhtaCity,
	type UkrposhtaStreet,
	type UkrposhtaHouse,
	type UkrposhtaPostOffice,
	type UkrposhtaPostOfficeWorkingHours,
	type UkrposhtaNearestOffice,
	type UkrposhtaCourierAreaCheck,
	type UkrposhtaCityDetails,
	type UkrposhtaAddressDetails
} from '$lib/server/ukrposhta-client';

// Re-export types for client usage
export type {
	UkrposhtaRegion,
	UkrposhtaDistrict,
	UkrposhtaCity,
	UkrposhtaStreet,
	UkrposhtaHouse,
	UkrposhtaPostOffice,
	UkrposhtaPostOfficeWorkingHours,
	UkrposhtaNearestOffice,
	UkrposhtaCourierAreaCheck,
	UkrposhtaCityDetails,
	UkrposhtaAddressDetails
};

// ============================================
// REGIONS (Області)
// ============================================

/**
 * Get all Ukrainian regions (oblasti)
 */
export const getAllRegions = query(async () => {
	try {
		const regions = await ukrposhtaClient.getAllRegions();
		return regions.sort((a, b) => a.REGION_UA.localeCompare(b.REGION_UA, 'uk'));
	} catch (error) {
		console.error('Error fetching regions:', error);
		throw new Error('Failed to load regions from Ukrposhta');
	}
});

/**
 * Search regions by name
 */
export const searchRegions = query(
	v.object({
		name: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ name }) => {
		try {
			const regions = await ukrposhtaClient.searchRegions(name);
			return regions.sort((a, b) => a.REGION_UA.localeCompare(b.REGION_UA, 'uk'));
		} catch (error) {
			console.error('Error searching regions:', error);
			throw new Error('Failed to search regions');
		}
	}
);

// ============================================
// DISTRICTS (Райони)
// ============================================

/**
 * Get all districts for a specific region
 */
export const getDistrictsByRegion = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ regionId }) => {
		try {
			const districts = await ukrposhtaClient.getDistrictsByRegion(regionId);
			return districts.sort((a, b) => a.DISTRICT_UA.localeCompare(b.DISTRICT_UA, 'uk'));
		} catch (error) {
			console.error('Error fetching districts:', error);
			throw new Error('Failed to load districts');
		}
	}
);

/**
 * Search districts by name within a region
 */
export const searchDistricts = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ regionId, name }) => {
		try {
			const districts = await ukrposhtaClient.searchDistricts(regionId, name);
			return districts.sort((a, b) => a.DISTRICT_UA.localeCompare(b.DISTRICT_UA, 'uk'));
		} catch (error) {
			console.error('Error searching districts:', error);
			throw new Error('Failed to search districts');
		}
	}
);

// ============================================
// CITIES (Населені пункти)
// ============================================

/**
 * Get all cities/settlements in a district
 */
export const getCitiesByDistrict = query(
	v.object({
		districtId: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ districtId }) => {
		try {
			const cities = await ukrposhtaClient.getCitiesByDistrict(districtId);
			return cities.sort((a, b) => a.CITY_UA.localeCompare(b.CITY_UA, 'uk'));
		} catch (error) {
			console.error('Error fetching cities:', error);
			throw new Error('Failed to load cities');
		}
	}
);

/**
 * Search cities by name within a district
 */
export const searchCities = query(
	v.object({
		districtId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ districtId, name }) => {
		try {
			const cities = await ukrposhtaClient.searchCitiesByDistrict(districtId, name);
			return cities.sort((a, b) => a.CITY_UA.localeCompare(b.CITY_UA, 'uk'));
		} catch (error) {
			console.error('Error searching cities:', error);
			throw new Error('Failed to search cities');
		}
	}
);

// ============================================
// STREETS (Вулиці)
// ============================================

/**
 * Search streets by name within a city
 */
export const searchStreets = query(
	v.object({
		cityId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ cityId, name }) => {
		try {
			const streets = await ukrposhtaClient.searchStreets(cityId, name);
			return streets.sort((a, b) => a.STREET_UA.localeCompare(b.STREET_UA, 'uk'));
		} catch (error) {
			console.error('Error searching streets:', error);
			throw new Error('Failed to search streets');
		}
	}
);

// ============================================
// HOUSES (Будинки) - For courier delivery
// ============================================

/**
 * Get postcode for a specific house (courier delivery)
 */
export const getHousePostcode = query(
	v.object({
		streetId: v.pipe(v.string(), v.minLength(1)),
		houseNumber: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ streetId, houseNumber }) => {
		try {
			const houses = await ukrposhtaClient.getHouse(streetId, houseNumber);
			if (houses.length === 0) {
				return null;
			}
			return houses[0];
		} catch (error) {
			console.error('Error fetching house postcode:', error);
			throw new Error('Failed to get house postcode');
		}
	}
);

// ============================================
// POST OFFICES (Відділення)
// ============================================

/**
 * Get all available post offices in a city
 * Filters out closed and security offices
 */
export const getPostOfficesByCity = query(
	v.object({
		cityId: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ cityId }) => {
		try {
			const offices = await ukrposhtaClient.getPostOfficesByCity(cityId);
			// Filter out closed and security offices
			const availableOffices = ukrposhtaClient.filterAvailablePostOffices(offices);
			return availableOffices.sort((a, b) => a.POSTCODE.localeCompare(b.POSTCODE));
		} catch (error) {
			console.error('Error fetching post offices:', error);
			throw new Error('Failed to load post offices');
		}
	}
);

/**
 * Get post office details by postcode
 */
export const getPostOfficeByPostcode = query(
	v.object({
		postcode: v.pipe(v.string(), v.minLength(5), v.maxLength(5))
	}),
	async ({ postcode }) => {
		try {
			const offices = await ukrposhtaClient.getPostOfficeByPostcode(postcode);
			if (offices.length === 0) {
				return null;
			}
			return offices[0];
		} catch (error) {
			console.error('Error fetching post office:', error);
			throw new Error('Failed to get post office');
		}
	}
);

// ============================================
// ADMIN/TESTING
// ============================================

/**
 * Test the Ukrposhta API connection
 */
export const testConnection = query(async () => {
	try {
		const isConfigured = ukrposhtaClient.isConfigured();
		const regions = await ukrposhtaClient.getAllRegions();
		return {
			success: true,
			message: `Connected successfully. Found ${regions.length} regions.`,
			regionsCount: regions.length,
			hasApiToken: isConfigured,
			apiVersion: '3.20'
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Connection failed',
			regionsCount: 0,
			hasApiToken: ukrposhtaClient.isConfigured(),
			apiVersion: '3.20'
		};
	}
});

// ============================================
// FUZZY SEARCH (Нечіткий пошук)
// ============================================

/**
 * Search districts by name with fuzzy matching
 */
export const searchDistrictsFuzzy = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1)),
		lang: v.optional(v.picklist(['UA', 'EN']), 'UA'),
		fuzzy: v.optional(v.boolean(), false)
	}),
	async ({ regionId, name, lang, fuzzy }) => {
		try {
			const districts = await ukrposhtaClient.searchDistrictsByName(regionId, name, lang, fuzzy);
			return districts.sort((a, b) => a.DISTRICT_UA.localeCompare(b.DISTRICT_UA, 'uk'));
		} catch (error) {
			console.error('Error in fuzzy district search:', error);
			throw new Error('Failed to search districts');
		}
	}
);

/**
 * Search cities by name with fuzzy matching
 */
export const searchCitiesFuzzy = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1)),
		districtId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1)),
		lang: v.optional(v.picklist(['UA', 'EN']), 'UA'),
		fuzzy: v.optional(v.boolean(), false)
	}),
	async ({ regionId, districtId, name, lang, fuzzy }) => {
		try {
			const cities = await ukrposhtaClient.searchCityByName(
				regionId,
				districtId,
				name,
				lang,
				fuzzy
			);
			return cities.sort((a, b) => a.CITY_UA.localeCompare(b.CITY_UA, 'uk'));
		} catch (error) {
			console.error('Error in fuzzy city search:', error);
			throw new Error('Failed to search cities');
		}
	}
);

/**
 * Search streets by name with fuzzy matching
 */
export const searchStreetsFuzzy = query(
	v.object({
		cityId: v.pipe(v.string(), v.minLength(1)),
		name: v.pipe(v.string(), v.minLength(1)),
		lang: v.optional(v.picklist(['UA', 'EN']), 'UA'),
		fuzzy: v.optional(v.boolean(), false)
	}),
	async ({ cityId, name, lang, fuzzy }) => {
		try {
			const streets = await ukrposhtaClient.searchStreetByName(cityId, name, lang, fuzzy);
			return streets.sort((a, b) => a.STREET_UA.localeCompare(b.STREET_UA, 'uk'));
		} catch (error) {
			console.error('Error in fuzzy street search:', error);
			throw new Error('Failed to search streets');
		}
	}
);

// ============================================
// COURIER DELIVERY (Кур'єрська доставка)
// ============================================

/**
 * Check if courier delivery is available for a postcode
 */
export const checkCourierDelivery = query(
	v.object({
		postindex: v.pipe(v.string(), v.minLength(5), v.maxLength(5))
	}),
	async ({ postindex }) => {
		try {
			const isAvailable = await ukrposhtaClient.isCourierDeliveryAvailable(postindex);
			return {
				postindex,
				isCourierArea: isAvailable,
				message: isAvailable ? 'Courier delivery available' : 'Courier delivery not available'
			};
		} catch (error) {
			console.error('Error checking courier area:', error);
			return {
				postindex,
				isCourierArea: false,
				message: 'Failed to check courier availability'
			};
		}
	}
);

// ============================================
// POST OFFICE WORKING HOURS (Графік роботи)
// ============================================

/**
 * Get post office working hours by postcode
 */
export const getPostOfficeWorkingHours = query(
	v.object({
		postcode: v.pipe(v.string(), v.minLength(5), v.maxLength(5)),
		postOfficeId: v.optional(v.string())
	}),
	async ({ postcode, postOfficeId }) => {
		try {
			const hours = await ukrposhtaClient.getPostOfficeWorkingHours(postcode, postOfficeId);
			return hours;
		} catch (error) {
			console.error('Error fetching working hours:', error);
			throw new Error('Failed to get post office working hours');
		}
	}
);

/**
 * Get mobile post office schedule
 */
export const getMobilePostOfficeSchedule = query(
	v.object({
		techindex: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ techindex }) => {
		try {
			const schedule = await ukrposhtaClient.getMobilePostOfficeSchedule(techindex);
			return schedule;
		} catch (error) {
			console.error('Error fetching mobile post office schedule:', error);
			throw new Error('Failed to get mobile post office schedule');
		}
	}
);

// ============================================
// GEOLOCATION (Пошук за координатами)
// ============================================

/**
 * Find nearest post offices by coordinates
 */
export const findNearestPostOffices = query(
	v.object({
		lat: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
		long: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
		maxDistance: v.pipe(v.number(), v.minValue(0.1), v.maxValue(100)) // km
	}),
	async ({ lat, long, maxDistance }) => {
		try {
			const offices = await ukrposhtaClient.getNearestPostOffices(lat, long, maxDistance);
			return offices.sort((a, b) => parseFloat(a.DISTANCE) - parseFloat(b.DISTANCE));
		} catch (error) {
			console.error('Error finding nearest post offices:', error);
			throw new Error('Failed to find nearest post offices');
		}
	}
);

// ============================================
// ADDRESS LOOKUP BY POSTCODE
// ============================================

/**
 * Get city details by postcode
 */
export const getCityByPostcode = query(
	v.object({
		postcode: v.pipe(v.string(), v.minLength(5), v.maxLength(5)),
		lang: v.optional(v.picklist(['UA', 'EN']), 'UA')
	}),
	async ({ postcode, lang }) => {
		try {
			const cities = await ukrposhtaClient.getCityDetailsByPostcode(postcode, lang);
			if (cities.length === 0) {
				return null;
			}
			return cities[0];
		} catch (error) {
			console.error('Error fetching city by postcode:', error);
			throw new Error('Failed to get city details');
		}
	}
);

/**
 * Get full address details by postcode
 */
export const getAddressByPostcode = query(
	v.object({
		postcode: v.pipe(v.string(), v.minLength(5), v.maxLength(5)),
		lang: v.optional(v.picklist(['UA', 'EN']), 'UA')
	}),
	async ({ postcode, lang }) => {
		try {
			const addresses = await ukrposhtaClient.getAddressByPostcode(postcode, lang);
			return addresses;
		} catch (error) {
			console.error('Error fetching address by postcode:', error);
			throw new Error('Failed to get address details');
		}
	}
);

/**
 * Get all delivery zone postcodes for a city
 */
export const getPostcodesByCity = query(
	v.object({
		cityId: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ cityId }) => {
		try {
			const postcodes = await ukrposhtaClient.getPostcodesByCityId(cityId);
			return postcodes;
		} catch (error) {
			console.error('Error fetching postcodes by city:', error);
			throw new Error('Failed to get city postcodes');
		}
	}
);

// ============================================
// FULL ADDRESS LOOKUP (Convenience methods)
// ============================================

/**
 * Get full address data for post office delivery
 * Returns a structured address object
 */
export const getPostOfficeAddress = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1)),
		districtId: v.pipe(v.string(), v.minLength(1)),
		cityId: v.pipe(v.string(), v.minLength(1)),
		postcode: v.pipe(v.string(), v.minLength(5), v.maxLength(5))
	}),
	async ({ regionId, districtId, cityId, postcode }) => {
		try {
			// Get all data in parallel
			const [regions, districts, cities, offices] = await Promise.all([
				ukrposhtaClient.searchRegions(''),
				ukrposhtaClient.getDistrictsByRegion(regionId),
				ukrposhtaClient.getCitiesByDistrict(districtId),
				ukrposhtaClient.getPostOfficeByPostcode(postcode)
			]);

			const region = regions.find((r) => r.REGION_ID === regionId);
			const district = districts.find((d) => d.DISTRICT_ID === districtId);
			const city = cities.find((c) => c.CITY_ID === cityId);
			const office = offices.length > 0 ? offices[0] : null;

			if (!region || !district || !city || !office) {
				throw new Error('Invalid address components');
			}

			return {
				region: region.REGION_UA,
				district: district.DISTRICT_UA,
				city: `${city.SHORTCITYTYPE_UA} ${city.CITY_UA}`,
				postOffice: office.POSTOFFICE_UA,
				postcode: office.POSTCODE,
				address: office.STREET_UA_VPZ,
				fullAddress: `${office.POSTCODE}, ${region.REGION_UA} обл., ${district.DISTRICT_UA} р-н, ${city.SHORTCITYTYPE_UA} ${city.CITY_UA}, ${office.STREET_UA_VPZ}`
			};
		} catch (error) {
			console.error('Error building address:', error);
			throw new Error('Failed to build full address');
		}
	}
);

/**
 * Get full address data for courier delivery
 * Returns a structured address object with the delivery postcode
 */
export const getCourierAddress = query(
	v.object({
		regionId: v.pipe(v.string(), v.minLength(1)),
		districtId: v.pipe(v.string(), v.minLength(1)),
		cityId: v.pipe(v.string(), v.minLength(1)),
		streetId: v.pipe(v.string(), v.minLength(1)),
		houseNumber: v.pipe(v.string(), v.minLength(1)),
		apartmentNumber: v.optional(v.string())
	}),
	async ({ regionId, districtId, cityId, streetId, houseNumber, apartmentNumber }) => {
		try {
			// Get all data in parallel
			const [regions, districts, cities, streets, houses] = await Promise.all([
				ukrposhtaClient.getAllRegions(),
				ukrposhtaClient.getDistrictsByRegion(regionId),
				ukrposhtaClient.getCitiesByDistrict(districtId),
				ukrposhtaClient.searchStreets(cityId, ''),
				ukrposhtaClient.getHouse(streetId, houseNumber)
			]);

			const region = regions.find((r) => r.REGION_ID === regionId);
			const district = districts.find((d) => d.DISTRICT_ID === districtId);
			const city = cities.find((c) => c.CITY_ID === cityId);
			const street = streets.find((s) => s.STREET_ID === streetId);
			const house = houses.length > 0 ? houses[0] : null;

			if (!region || !district || !city || !street) {
				throw new Error('Invalid address components');
			}

			const apartmentPart = apartmentNumber ? `, кв. ${apartmentNumber}` : '';

			return {
				region: region.REGION_UA,
				district: district.DISTRICT_UA,
				city: `${city.SHORTCITYTYPE_UA} ${city.CITY_UA}`,
				street: `${street.SHORTSTREETTYPE_UA} ${street.STREET_UA}`,
				houseNumber,
				apartmentNumber: apartmentNumber || null,
				postcode: house?.POSTCODE || null,
				fullAddress: `${house?.POSTCODE || '?????'}, ${region.REGION_UA} обл., ${district.DISTRICT_UA} р-н, ${city.SHORTCITYTYPE_UA} ${city.CITY_UA}, ${street.SHORTSTREETTYPE_UA} ${street.STREET_UA}, буд. ${houseNumber}${apartmentPart}`
			};
		} catch (error) {
			console.error('Error building courier address:', error);
			throw new Error('Failed to build full address');
		}
	}
);
