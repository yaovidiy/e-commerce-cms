/**
 * Ukrposhta Address Classifier API Client
 *
 * Documentation: https://www.ukrposhta.ua/address-classifier-ws/
 * Version: 3.20 (09.12.2024)
 *
 * This client provides access to:
 * - Regions (oblasti)
 * - Districts (rayony)
 * - Cities/settlements
 * - Streets
 * - Houses (for courier delivery)
 * - Post offices (for office delivery)
 * - Working hours
 * - Geolocation search
 * - Courier area check
 *
 * IMPORTANT: URL must include www: https://www.ukrposhta.ua/...
 * Authorization Bearer token is required (obtained from contract appendix)
 */

import { UKRPOSHTA_API_TOKEN } from '$env/static/private';

// URL must include www per documentation
const ADDRESS_CLASSIFIER_BASE_URL = 'https://www.ukrposhta.ua/address-classifier-ws';

// Lock codes as per documentation Appendix A
export const LOCK_CODES = {
	ACTIVE: '0',
	TEMPORARILY_OCCUPIED: '1',
	TEMPORARILY_UNCONTROLLED: '2',
	CONTROLLED_NOT_FUNCTIONING: '3',
	NO_LINKED_HOUSES: '4',
	UKRPOSHTA_EXCLUDED: '5',
	BLOCKED: '65535',
	REPAIR: '32768',
	QUARANTINE: '32774'
} as const;

// Types for API responses
export interface UkrposhtaRegion {
	REGION_ID: string;
	REGION_UA: string;
	REGION_EN: string;
	REGION_KATOTTG: string;
	REGION_KOATUU?: string;
	REGION_RU?: string | null;
}

export interface UkrposhtaDistrict {
	REGION_ID: string;
	DISTRICT_ID: string;
	DISTRICT_UA: string;
	DISTRICT_EN: string;
	DISTRICT_KATOTTG: string;
	DISTRICT_KOATUU: string;
	DISTRICT_RU?: string | null;
	REGION_UA: string;
	REGION_EN: string;
	REGION_KATOTTG: string;
	REGION_KOATUU: string;
	REGION_RU?: string | null;
	NEW_DISTRICT_UA?: string | null;
}

export interface UkrposhtaCity {
	REGION_ID: string;
	DISTRICT_ID: string;
	CITY_ID: string;
	CITY_UA: string;
	CITY_EN: string;
	CITY_KATOTTG: string;
	CITY_KOATUU: string;
	CITY_RU?: string | null;
	CITYTYPE_UA: string;
	CITYTYPE_EN: string;
	CITYTYPE_RU?: string | null;
	SHORTCITYTYPE_UA: string;
	SHORTCITYTYPE_EN?: string | null;
	SHORTCITYTYPE_RU?: string | null;
	REGION_UA: string;
	REGION_EN: string;
	REGION_RU?: string | null;
	DISTRICT_UA: string;
	DISTRICT_EN: string;
	DISTRICT_RU?: string | null;
	NEW_DISTRICT_UA?: string | null;
	POPULATION: string;
	LONGITUDE: string;
	LATTITUDE: string;
	OWNOF?: string | null;
	OLDCITY_UA?: string | null;
	OLDCITY_EN?: string | null;
	OLDCITY_RU?: string | null;
	NAME_UA?: string; // Lock status description
	IS_DISTRICTCENTER?: string; // "1" if city is district center
}

export interface UkrposhtaStreet {
	REGION_ID: string;
	DISTRICT_ID: string;
	CITY_ID: string;
	STREET_ID: string;
	STREET_UA: string;
	STREET_EN: string;
	STREET_RU?: string | null;
	STREETTYPE_UA: string;
	STREETTYPE_EN: string;
	STREETTYPE_RU?: string | null;
	SHORTSTREETTYPE_UA: string;
	SHORTSTREETTYPE_EN?: string | null;
	SHORTSTREETTYPE_RU?: string | null;
	OLDSTREET_UA?: string | null;
	OLDSTREET_EN?: string | null;
	OLDSTREET_RU?: string | null;
	REGION_UA: string;
	DISTRICT_UA: string;
	CITY_UA: string;
	NEW_DISTRICT_UA?: string | null;
}

export interface UkrposhtaHouse {
	STREET_ID: string;
	POSTCODE: string;
	HOUSENUMBER_UA: string;
}

export interface UkrposhtaPostOffice {
	ID?: string;
	POSTOFFICE_ID?: string;
	POSTCODE: string;
	POSTINDEX?: string;
	POSTOFFICE_UA?: string;
	PO_LONG?: string;
	PO_SHORT?: string;
	PO_CODE?: string;
	CITY_ID: string;
	CITY_UA: string;
	CITY_EN?: string;
	CITY_RU?: string | null;
	CITY_UA_VPZ?: string;
	CITY_UA_TYPE?: string;
	CITY_VPZ_ID?: string;
	CITY_KOATUU: string;
	CITY_KATOTTG: string;
	CITY_VPZ_KOATUU?: string;
	CITY_VPZ_KATOTTG?: string;
	CITYTYPE_UA?: string;
	CITYTYPE_EN?: string;
	SHORTCITYTYPE_UA?: string;
	SHORTCITYTYPE_EN?: string | null;
	STREET_ID_VPZ?: string;
	STREET_UA_VPZ?: string;
	STREET_UA?: string;
	STREET_EN?: string;
	STREETTYPE_UA?: string;
	STREETTYPE_EN?: string;
	ADDRESS?: string;
	HOUSENUMBER?: string;
	LONGITUDE: string;
	LATTITUDE: string;
	PHONE?: string;
	TYPE_ID?: string;
	TYPE_ACRONYM?: string;
	TYPE_LONG?: string;
	TYPE_SHORT?: string;
	ISAUTOMATED?: string;
	IS_AUTOMATED?: string;
	IS_SECURITY: string; // "1" = restricted access (closed institution)
	IS_NOLETTERS?: string; // "1" = does not forward correspondence
	POSTTERMINAL?: string;
	LOCK_CODE: string; // "0" = active, see lock codes table
	LOCK_UA?: string;
	LOCK_EN?: string;
	LOCK_RU?: string;
	POLOCK_UA?: string;
	POLOCK_EN?: string;
	ISVPZ?: string;
	IS_NODISTRICT?: string;
	AVALIBLE?: string; // "1" = available
	// Additional services
	IS_CASH?: string;
	IS_DHL?: string;
	IS_SMARTBOX?: string;
	PELPEREKAZY?: string;
	IS_FLAGMAN?: string;
	// Region/District info
	REGION_ID?: string;
	REGION_UA?: string;
	REGION_EN?: string;
	DISTRICT_ID?: string;
	DISTRICT_UA?: string;
	DISTRICT_EN?: string;
	POREGION_ID?: string;
	PODISTRICT_ID?: string;
	PDREGION_ID?: string;
	PDDISTRICT_ID?: string;
	PDCITY_ID?: string;
	PDCITY_UA?: string;
	PDCITY_EN?: string;
	PDCITYTYPE_UA?: string;
	PDCITYTYPE_EN?: string;
	SHORTPDCITYTYPE_UA?: string;
	SHORTPDCITYTYPE_EN?: string | null;
	MEREZA_NUMBER?: string;
	TECHINDEX?: string;
	PARENT_ID?: string;
}

// New types for additional endpoints
export interface UkrposhtaPostOfficeWorkingHours {
	id: string;
	POSTCODE: string;
	SHORTNAME: string;
	FULLNAME: string;
	POSTOFFICE_TYPE: string;
	POSTOFFICE_PARENT: string;
	ISVPZ: string;
	LOCK_CODE: string;
	LOCK_REASON: string;
	DAYOFWEEK_NUM: string;
	DAYOFWEEK_UA: string;
	DAYOFWEEK_EN: string;
	DAYOFWEEK_RU?: string;
	DAYOFWEEK_SHORTNAME_UA: string;
	INTERVALTYPE: string; // "W" = working, "D" = break
	TFROM: string; // Start time
	TTO: string; // End time
	WORKCOMMENT?: string;
	// For mobile post offices
	CITY_ID?: string;
	CITY_UA?: string;
	CITY_KOATUU?: string;
	CITY_KATOTTG?: string;
	TECHINDEX?: string;
}

export interface UkrposhtaNearestOffice {
	ID: string;
	POSTINDEX: string;
	POSTCODE: string;
	POSTFILIALNAME: string;
	CITYNAME: string;
	ADDRESS: string;
	LONGITUDE: string;
	LATITUDE: string;
	DISTANCE: string; // in km
}

export interface UkrposhtaCourierAreaCheck {
	postindex: string;
	IS_COURIERAREA: string; // "1" = in courier area
}

export interface UkrposhtaCityDetails {
	REGION_ID: string;
	DISTRICT_ID: string;
	CITY_ID: string;
	REGION_NAME: string;
	DISTRICT_NAME: string;
	CITY_NAME: string;
	CITYTYPE_ID: string;
	CITYTYPE_NAME: string;
	POSTCODE: string;
	NEW_DISTRICT_NAME?: string | null;
	OLDCITY_NAME?: string | null;
}

export interface UkrposhtaAddressDetails extends UkrposhtaCityDetails {
	STREET_ID: string;
	STREET_NAME: string;
	STREETTYPE_ID: string;
	STREETTYPE_NAME: string;
	SHORTSTREETTYPE_NAME: string;
	HOUSENUMBER: string;
	OLDSTREET_NAME?: string | null;
	// ERP IDs (added in v3.20)
	ERP_REGION_ID?: string;
	ERP_DISTRICT_ID?: string;
	ERP_CITY_ID?: string;
	ERP_STREET_ID?: string;
}

export interface UkrposhtaPostcodeByCity {
	CITY_ID: string;
	POSTCODE: string;
}

interface ApiResponse<T> {
	Entries: {
		Entry: T[] | T;
	};
}

class UkrposhtaAddressClient {
	private baseUrl: string;
	private bearerToken: string | null;

	constructor() {
		this.baseUrl = ADDRESS_CLASSIFIER_BASE_URL;
		this.bearerToken = UKRPOSHTA_API_TOKEN || null;
	}

	/**
	 * Check if the client has a valid API token configured
	 */
	isConfigured(): boolean {
		return !!this.bearerToken;
	}

	private async fetch<T>(endpoint: string): Promise<T[]> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			Accept: 'application/json'
		};

		// Add authorization header if token is configured
		if (this.bearerToken) {
			headers['Authorization'] = `Bearer ${this.bearerToken}`;
		}

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers
			});

			if (!response.ok) {
				throw new Error(`Ukrposhta API error: ${response.status} ${response.statusText}`);
			}

			const data: ApiResponse<T> = await response.json();

			if (!data.Entries || !data.Entries.Entry) {
				return [];
			}

			return Array.isArray(data.Entries.Entry) ? data.Entries.Entry : [data.Entries.Entry];
		} catch (error) {
			console.error('Ukrposhta API fetch error:', error);
			throw error;
		}
	}

	// ============================================
	// REGIONS (Області)
	// ============================================

	/**
	 * Get all regions or search by name
	 * @param regionName - Optional region name (partial match supported)
	 * @param regionNameEn - Optional region name in English
	 */
	async getRegions(regionName?: string, regionNameEn?: string): Promise<UkrposhtaRegion[]> {
		const params = new URLSearchParams();
		if (regionName) params.append('region_name', regionName);
		if (regionNameEn) params.append('region_name_en', regionNameEn);

		const queryString = params.toString();
		return this.fetch<UkrposhtaRegion>(
			`/get_regions_by_region_ua${queryString ? `?${queryString}` : ''}`
		);
	}

	/**
	 * Get all regions
	 */
	async getAllRegions(): Promise<UkrposhtaRegion[]> {
		return this.getRegions();
	}

	/**
	 * Search regions by name
	 */
	async searchRegions(name: string): Promise<UkrposhtaRegion[]> {
		return this.getRegions(name);
	}

	// ============================================
	// DISTRICTS (Райони)
	// ============================================

	/**
	 * Get districts by region ID and optionally filter by name
	 * At least one parameter is required
	 */
	async getDistricts(regionId?: string, districtUa?: string): Promise<UkrposhtaDistrict[]> {
		const params = new URLSearchParams();
		if (regionId) params.append('region_id', regionId);
		if (districtUa) params.append('district_ua', districtUa);

		return this.fetch<UkrposhtaDistrict>(
			`/get_districts_by_region_id_and_district_ua?${params.toString()}`
		);
	}

	/**
	 * Get all districts for a region
	 */
	async getDistrictsByRegion(regionId: string): Promise<UkrposhtaDistrict[]> {
		return this.getDistricts(regionId);
	}

	/**
	 * Search districts by region ID and district name
	 */
	async searchDistricts(regionId: string, districtName: string): Promise<UkrposhtaDistrict[]> {
		return this.getDistricts(regionId, districtName);
	}

	/**
	 * Search districts by name with fuzzy matching
	 */
	async searchDistrictsByName(
		regionId: string,
		districtName: string,
		lang: 'UA' | 'EN' = 'UA',
		fuzzy: boolean = false
	): Promise<UkrposhtaDistrict[]> {
		const params = new URLSearchParams({
			region_id: regionId,
			district_name: districtName,
			lang,
			fuzzy: fuzzy ? '1' : '0'
		});

		return this.fetch<UkrposhtaDistrict>(`/get_district_by_name?${params.toString()}`);
	}

	// ============================================
	// CITIES (Населені пункти)
	// ============================================

	/**
	 * Get cities by various parameters
	 * At least one parameter is required
	 */
	async getCities(params: {
		districtId?: string;
		regionId?: string;
		cityUa?: string;
		koatuu?: string;
		katottg?: string;
	}): Promise<UkrposhtaCity[]> {
		const searchParams = new URLSearchParams();
		if (params.districtId) searchParams.append('district_id', params.districtId);
		if (params.regionId) searchParams.append('region_id', params.regionId);
		if (params.cityUa) searchParams.append('city_ua', params.cityUa);
		if (params.koatuu) searchParams.append('koatuu', params.koatuu);
		if (params.katottg) searchParams.append('katottg', params.katottg);

		return this.fetch<UkrposhtaCity>(
			`/get_city_by_region_id_and_district_id_and_city_ua?${searchParams.toString()}`
		);
	}

	/**
	 * Get cities by district
	 */
	async getCitiesByDistrict(districtId: string): Promise<UkrposhtaCity[]> {
		return this.getCities({ districtId });
	}

	/**
	 * Get city by KOATUU code
	 */
	async getCityByKoatuu(koatuu: string): Promise<UkrposhtaCity[]> {
		return this.getCities({ koatuu });
	}

	/**
	 * Get city by KATOTTG code
	 */
	async getCityByKatottg(katottg: string): Promise<UkrposhtaCity[]> {
		return this.getCities({ katottg });
	}

	/**
	 * Search cities by region, district and city name
	 */
	async searchCities(
		regionId: string,
		districtId: string,
		cityName: string
	): Promise<UkrposhtaCity[]> {
		return this.getCities({ regionId, districtId, cityUa: cityName });
	}

	/**
	 * Search cities by district ID and city name
	 */
	async searchCitiesByDistrict(districtId: string, cityName: string): Promise<UkrposhtaCity[]> {
		return this.getCities({ districtId, cityUa: cityName });
	}

	/**
	 * Search city by name with fuzzy matching
	 */
	async searchCityByName(
		regionId: string,
		districtId: string,
		cityName: string,
		lang: 'UA' | 'EN' = 'UA',
		fuzzy: boolean = false
	): Promise<UkrposhtaCity[]> {
		const params = new URLSearchParams({
			region_id: regionId,
			district_id: districtId,
			city_name: cityName,
			lang,
			fuzzy: fuzzy ? '1' : '0'
		});

		return this.fetch<UkrposhtaCity>(`/get_city_by_name?${params.toString()}`);
	}

	// ============================================
	// STREETS (Вулиці)
	// ============================================

	/**
	 * Get streets by various parameters
	 * At least one parameter is required
	 */
	async getStreets(params: {
		districtId?: string;
		regionId?: string;
		cityId?: string;
		streetUa?: string;
	}): Promise<UkrposhtaStreet[]> {
		const searchParams = new URLSearchParams();
		if (params.districtId) searchParams.append('district_id', params.districtId);
		if (params.regionId) searchParams.append('region_id', params.regionId);
		if (params.cityId) searchParams.append('city_id', params.cityId);
		if (params.streetUa) searchParams.append('street_ua', params.streetUa);

		return this.fetch<UkrposhtaStreet>(
			`/get_street_by_region_id_and_district_id_and_city_id_and_street_ua?${searchParams.toString()}`
		);
	}

	/**
	 * Get streets by city
	 */
	async getStreetsByCity(cityId: string): Promise<UkrposhtaStreet[]> {
		return this.getStreets({ cityId });
	}

	/**
	 * Search streets by city ID and street name
	 */
	async searchStreets(cityId: string, streetName: string): Promise<UkrposhtaStreet[]> {
		return this.getStreets({ cityId, streetUa: streetName });
	}

	/**
	 * Search street by name with fuzzy matching
	 */
	async searchStreetByName(
		cityId: string,
		streetName: string,
		lang: 'UA' | 'EN' = 'UA',
		fuzzy: boolean = false
	): Promise<UkrposhtaStreet[]> {
		const params = new URLSearchParams({
			city_id: cityId,
			street_name: streetName,
			lang,
			fuzzy: fuzzy ? '1' : '0'
		});

		return this.fetch<UkrposhtaStreet>(`/get_street_by_name?${params.toString()}`);
	}

	// ============================================
	// HOUSES (Будинки) - For courier delivery
	// ============================================

	/**
	 * Get house by street ID and house number
	 * Returns the postcode for courier delivery
	 * @param streetId - Required street ID
	 * @param houseNumber - Optional house number for specific lookup
	 */
	async getHouse(streetId: string, houseNumber?: string): Promise<UkrposhtaHouse[]> {
		const params = new URLSearchParams({ street_id: streetId });
		if (houseNumber) params.append('housenumber', houseNumber);

		return this.fetch<UkrposhtaHouse>(`/get_addr_house_by_street_id?${params.toString()}`);
	}

	/**
	 * Get all houses on a street
	 */
	async getHousesByStreet(streetId: string): Promise<UkrposhtaHouse[]> {
		return this.getHouse(streetId);
	}

	// ============================================
	// COURIER DELIVERY AREA CHECK
	// ============================================

	/**
	 * Check if a postcode is in the courier delivery area (ДКД)
	 * @returns IS_COURIERAREA = "1" means in courier area
	 */
	async checkCourierArea(postindex: string): Promise<UkrposhtaCourierAreaCheck[]> {
		return this.fetch<UkrposhtaCourierAreaCheck>(
			`/get_courierarea_by_postindex?postindex=${postindex}`
		);
	}

	/**
	 * Check if courier delivery is available for a postcode
	 */
	async isCourierDeliveryAvailable(postindex: string): Promise<boolean> {
		try {
			const result = await this.checkCourierArea(postindex);
			return result.length > 0 && result[0].IS_COURIERAREA === '1';
		} catch {
			return false;
		}
	}

	// ============================================
	// POST OFFICES (Відділення)
	// ============================================

	/**
	 * Get post office by postcode or other parameters
	 * At least one parameter is required
	 */
	async getPostOfficeByPostindex(params: {
		pi?: string; // Post office index
		pc?: string; // Postal code (delivery zone)
		poCityId?: string;
		poDistrictId?: string;
		poStreetId?: string;
		poRegionId?: string;
		pdCityId?: string;
		pdDistrictId?: string;
		pdRegionId?: string;
	}): Promise<UkrposhtaPostOffice[]> {
		const searchParams = new URLSearchParams();
		if (params.pi) searchParams.append('pi', params.pi);
		if (params.pc) searchParams.append('pc', params.pc);
		if (params.poCityId) searchParams.append('poCityId', params.poCityId);
		if (params.poDistrictId) searchParams.append('poDistrictId', params.poDistrictId);
		if (params.poStreetId) searchParams.append('poStreetId', params.poStreetId);
		if (params.poRegionId) searchParams.append('poRegionId', params.poRegionId);
		if (params.pdCityId) searchParams.append('pdCityId', params.pdCityId);
		if (params.pdDistrictId) searchParams.append('pdDistrictId', params.pdDistrictId);
		if (params.pdRegionId) searchParams.append('pdRegionId', params.pdRegionId);

		return this.fetch<UkrposhtaPostOffice>(
			`/get_postoffices_by_postindex?${searchParams.toString()}`
		);
	}

	/**
	 * Get post offices by city ID (with region_id required)
	 */
	async getPostOfficesByCityId(params: {
		regionId: string;
		cityId?: string;
		districtId?: string;
		postindex?: string;
	}): Promise<UkrposhtaPostOffice[]> {
		const searchParams = new URLSearchParams({ region_id: params.regionId });
		if (params.cityId) searchParams.append('city_id', params.cityId);
		if (params.districtId) searchParams.append('district_id', params.districtId);
		if (params.postindex) searchParams.append('postindex', params.postindex);

		return this.fetch<UkrposhtaPostOffice>(
			`/get_postoffices_by_city_id?${searchParams.toString()}`
		);
	}

	/**
	 * Get post offices by city KOATUU/KATOTTG codes
	 */
	async getPostOfficesByCode(params: {
		cityKoatuu?: string;
		cityKatottg?: string;
		cityVpzKatottg?: string;
		postcode?: string;
		districtId?: string;
		cityId?: string;
	}): Promise<UkrposhtaPostOffice[]> {
		const searchParams = new URLSearchParams();
		if (params.cityKoatuu) searchParams.append('city_koatuu', params.cityKoatuu);
		if (params.cityKatottg) searchParams.append('city_katottg', params.cityKatottg);
		if (params.cityVpzKatottg) searchParams.append('city_vpz_katottg', params.cityVpzKatottg);
		if (params.postcode) searchParams.append('postcode', params.postcode);
		if (params.districtId) searchParams.append('district_id', params.districtId);
		if (params.cityId) searchParams.append('city_id', params.cityId);

		return this.fetch<UkrposhtaPostOffice>(
			`/get_postoffices_by_postcode_cityid_cityvpzid?${searchParams.toString()}`
		);
	}

	/**
	 * Get post offices by city ID
	 */
	async getPostOfficesByCity(cityId: string): Promise<UkrposhtaPostOffice[]> {
		return this.getPostOfficesByCode({ cityId });
	}

	/**
	 * Get post offices by KOATUU code
	 */
	async getPostOfficesByKoatuu(cityKoatuu: string): Promise<UkrposhtaPostOffice[]> {
		return this.getPostOfficesByCode({ cityKoatuu });
	}

	/**
	 * Get post offices by KATOTTG code
	 */
	async getPostOfficesByKatottg(cityKatottg: string): Promise<UkrposhtaPostOffice[]> {
		return this.getPostOfficesByCode({ cityKatottg });
	}

	/**
	 * Get post office by postcode
	 */
	async getPostOfficeByPostcode(postcode: string): Promise<UkrposhtaPostOffice[]> {
		return this.getPostOfficesByCode({ postcode });
	}

	// ============================================
	// POST OFFICE WORKING HOURS
	// ============================================

	/**
	 * Get post office working hours by postcode
	 */
	async getPostOfficeWorkingHours(
		postcode: string,
		postOfficeId?: string
	): Promise<UkrposhtaPostOfficeWorkingHours[]> {
		const params = new URLSearchParams({ pc: postcode });
		if (postOfficeId) params.append('id', postOfficeId);

		return this.fetch<UkrposhtaPostOfficeWorkingHours>(
			`/get_postoffices_openhours_by_postindex?${params.toString()}`
		);
	}

	/**
	 * Get post office working hours by ID
	 */
	async getPostOfficeWorkingHoursById(
		postcode: string,
		postOfficeId?: string
	): Promise<UkrposhtaPostOfficeWorkingHours[]> {
		const params = new URLSearchParams({ pc: postcode });
		if (postOfficeId) params.append('id', postOfficeId);

		return this.fetch<UkrposhtaPostOfficeWorkingHours>(
			`/get_postoffices_openhours_by_id?${params.toString()}`
		);
	}

	/**
	 * Get mobile post office schedule by techindex
	 * For mobile (PV) post offices that visit multiple settlements
	 */
	async getMobilePostOfficeSchedule(
		techindex: string
	): Promise<UkrposhtaPostOfficeWorkingHours[]> {
		return this.fetch<UkrposhtaPostOfficeWorkingHours>(
			`/get_postoffices_mobile_openhours_by_postindex?techindex=${techindex}`
		);
	}

	// ============================================
	// GEOLOCATION
	// ============================================

	/**
	 * Get nearest post offices by coordinates
	 * @param lat - Latitude
	 * @param long - Longitude
	 * @param maxDistance - Max search radius in km
	 */
	async getNearestPostOffices(
		lat: number,
		long: number,
		maxDistance: number
	): Promise<UkrposhtaNearestOffice[]> {
		const params = new URLSearchParams({
			lat: lat.toString(),
			long: long.toString(),
			maxdistance: maxDistance.toString()
		});

		return this.fetch<UkrposhtaNearestOffice>(
			`/get_postoffices_by_geolocation?${params.toString()}`
		);
	}

	// ============================================
	// ADDRESS DETAILS BY POSTCODE
	// ============================================

	/**
	 * Get city details by postcode
	 */
	async getCityDetailsByPostcode(
		postcode: string,
		lang: 'UA' | 'EN' = 'UA'
	): Promise<UkrposhtaCityDetails[]> {
		const params = new URLSearchParams({ postcode, lang });
		return this.fetch<UkrposhtaCityDetails>(`/get_city_details_by_postcode?${params.toString()}`);
	}

	/**
	 * Get full address details by postcode
	 * Includes street and house information
	 */
	async getAddressByPostcode(
		postcode: string,
		lang: 'UA' | 'EN' = 'UA'
	): Promise<UkrposhtaAddressDetails[]> {
		const params = new URLSearchParams({ postcode, lang });
		return this.fetch<UkrposhtaAddressDetails>(`/get_address_by_postcode?${params.toString()}`);
	}

	/**
	 * Get delivery zone postcodes by city ID
	 */
	async getPostcodesByCityId(cityId: string): Promise<UkrposhtaPostcodeByCity[]> {
		return this.fetch<UkrposhtaPostcodeByCity>(`/get_postcode_by_city_id?city_id=${cityId}`);
	}

	// ============================================
	// UTILITY METHODS
	// ============================================

	/**
	 * Filter out temporarily closed post offices (LOCK_CODE !== '0')
	 */
	filterActivePostOffices(offices: UkrposhtaPostOffice[]): UkrposhtaPostOffice[] {
		return offices.filter((office) => office.LOCK_CODE === '0');
	}

	/**
	 * Filter out security/closed-type post offices (IS_SECURITY === '1')
	 * These only work for internal delivery (ministries, etc.)
	 */
	filterPublicPostOffices(offices: UkrposhtaPostOffice[]): UkrposhtaPostOffice[] {
		return offices.filter((office) => office.IS_SECURITY === '0');
	}

	/**
	 * Filter out post offices that don't forward letters (IS_NOLETTERS === '1')
	 */
	filterLetterForwardingOffices(offices: UkrposhtaPostOffice[]): UkrposhtaPostOffice[] {
		return offices.filter((office) => !office.IS_NOLETTERS || office.IS_NOLETTERS === '0');
	}

	/**
	 * Filter to only available post offices (AVALIBLE === '1')
	 */
	filterAvailableByStatus(offices: UkrposhtaPostOffice[]): UkrposhtaPostOffice[] {
		return offices.filter((office) => !office.AVALIBLE || office.AVALIBLE === '1');
	}

	/**
	 * Get only active public post offices suitable for delivery
	 */
	filterAvailablePostOffices(offices: UkrposhtaPostOffice[]): UkrposhtaPostOffice[] {
		return offices.filter(
			(office) =>
				office.LOCK_CODE === '0' &&
				office.IS_SECURITY === '0' &&
				(!office.AVALIBLE || office.AVALIBLE === '1')
		);
	}

	/**
	 * Get lock reason description
	 */
	getLockReason(lockCode: string): string {
		const reasons: Record<string, string> = {
			'0': 'Активний запис',
			'1': 'Тимчасово окуповані території',
			'2': 'Тимчасово непідконтрольні території',
			'3': 'Підконтрольні території, що тимчасово не функціонують',
			'4': 'Відсутні пов\'язані дома',
			'5': 'ПАТ «Укрпошта» без врахування 1,2,3',
			'65535': 'Заблокований запис',
			'32768': 'Ремонт',
			'32774': 'Карантин'
		};
		return reasons[lockCode] || `Невідомий код: ${lockCode}`;
	}
}

// Export singleton instance
export const ukrposhtaClient = new UkrposhtaAddressClient();
