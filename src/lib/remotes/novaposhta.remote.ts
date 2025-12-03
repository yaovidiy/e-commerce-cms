import { query } from '$app/server';
import * as v from 'valibot';
import {
	novaPoshtaClient,
	type NovaPoshtaArea,
	type NovaPoshtaCity,
	type NovaPoshtaSettlement,
	type NovaPoshtaStreet,
	type NovaPoshtaWarehouse,
	type NovaPoshtaWarehouseType,
	type NovaPoshtaTrackingDocument,
	type NovaPoshtaDeliveryCost,
	type NovaPoshtaDeliveryDate
} from '$lib/server/novaposhta-client';

// Re-export types for client usage
export type {
	NovaPoshtaArea,
	NovaPoshtaCity,
	NovaPoshtaSettlement,
	NovaPoshtaStreet,
	NovaPoshtaWarehouse,
	NovaPoshtaWarehouseType,
	NovaPoshtaTrackingDocument,
	NovaPoshtaDeliveryCost,
	NovaPoshtaDeliveryDate
};

// ============================================
// AREAS (Області)
// ============================================

/**
 * Get all Ukrainian areas (regions/oblasti)
 */
export const getAllAreas = query(async () => {
	try {
		const areas = await novaPoshtaClient.getAreas();
		return areas.sort((a, b) => a.Description.localeCompare(b.Description, 'uk'));
	} catch (error) {
		console.error('Error fetching areas:', error);
		throw new Error('Failed to load areas from Nova Poshta');
	}
});

// ============================================
// CITIES (Міста)
// ============================================

/**
 * Search cities by name
 */
export const searchCities = query(
	v.object({
		searchString: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 20)
	}),
	async ({ searchString, limit }) => {
		try {
			const cities = await novaPoshtaClient.searchCities(searchString, limit);
			return cities;
		} catch (error) {
			console.error('Error searching cities:', error);
			throw new Error('Failed to search cities');
		}
	}
);

/**
 * Get city by reference
 */
export const getCityByRef = query(
	v.object({
		ref: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ ref }) => {
		try {
			return await novaPoshtaClient.getCityByRef(ref);
		} catch (error) {
			console.error('Error fetching city:', error);
			throw new Error('Failed to get city');
		}
	}
);

// ============================================
// SETTLEMENTS (Населені пункти)
// ============================================

/**
 * Search settlements (includes villages, more detailed than cities)
 */
export const searchSettlements = query(
	v.object({
		searchString: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 20)
	}),
	async ({ searchString, limit }) => {
		try {
			const settlements = await novaPoshtaClient.searchSettlements(searchString, limit);
			return settlements;
		} catch (error) {
			console.error('Error searching settlements:', error);
			throw new Error('Failed to search settlements');
		}
	}
);

/**
 * Get settlements with warehouses in a specific area
 */
export const getSettlementsWithWarehouses = query(
	v.object({
		areaRef: v.optional(v.string()),
		limit: v.optional(v.number(), 100)
	}),
	async ({ areaRef, limit }) => {
		try {
			return await novaPoshtaClient.getSettlementsWithWarehouses(areaRef, limit);
		} catch (error) {
			console.error('Error fetching settlements:', error);
			throw new Error('Failed to load settlements');
		}
	}
);

// ============================================
// STREETS (Вулиці)
// ============================================

/**
 * Search streets in a city
 */
export const searchStreets = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1)),
		searchString: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 20)
	}),
	async ({ cityRef, searchString, limit }) => {
		try {
			const streets = await novaPoshtaClient.searchStreets(cityRef, searchString, limit);
			return streets;
		} catch (error) {
			console.error('Error searching streets:', error);
			throw new Error('Failed to search streets');
		}
	}
);

// ============================================
// WAREHOUSES (Відділення)
// ============================================

/**
 * Get warehouses by city reference
 */
export const getWarehousesByCity = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 100)
	}),
	async ({ cityRef, limit }) => {
		try {
			const warehouses = await novaPoshtaClient.getWarehousesByCity(cityRef, limit);
			// Filter active and sort by number
			const activeWarehouses = novaPoshtaClient.filterActiveWarehouses(warehouses);
			return novaPoshtaClient.sortWarehousesByNumber(activeWarehouses);
		} catch (error) {
			console.error('Error fetching warehouses:', error);
			throw new Error('Failed to load warehouses');
		}
	}
);

/**
 * Get warehouses by city name
 */
export const getWarehousesByCityName = query(
	v.object({
		cityName: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 100)
	}),
	async ({ cityName, limit }) => {
		try {
			const warehouses = await novaPoshtaClient.getWarehousesByCityName(cityName, limit);
			const activeWarehouses = novaPoshtaClient.filterActiveWarehouses(warehouses);
			return novaPoshtaClient.sortWarehousesByNumber(activeWarehouses);
		} catch (error) {
			console.error('Error fetching warehouses:', error);
			throw new Error('Failed to load warehouses');
		}
	}
);

/**
 * Search warehouses in a city
 */
export const searchWarehouses = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1)),
		searchString: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 50)
	}),
	async ({ cityRef, searchString, limit }) => {
		try {
			const warehouses = await novaPoshtaClient.searchWarehouses(cityRef, searchString, limit);
			const activeWarehouses = novaPoshtaClient.filterActiveWarehouses(warehouses);
			return novaPoshtaClient.sortWarehousesByNumber(activeWarehouses);
		} catch (error) {
			console.error('Error searching warehouses:', error);
			throw new Error('Failed to search warehouses');
		}
	}
);

/**
 * Get only branches (standard post offices) in a city
 */
export const getBranches = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 100)
	}),
	async ({ cityRef, limit }) => {
		try {
			const branches = await novaPoshtaClient.getBranches(cityRef, limit);
			const activeBranches = novaPoshtaClient.filterActiveWarehouses(branches);
			return novaPoshtaClient.sortWarehousesByNumber(activeBranches);
		} catch (error) {
			console.error('Error fetching branches:', error);
			throw new Error('Failed to load branches');
		}
	}
);

/**
 * Get only parcel lockers (postomats) in a city
 */
export const getPostomats = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1)),
		limit: v.optional(v.number(), 100)
	}),
	async ({ cityRef, limit }) => {
		try {
			const postomats = await novaPoshtaClient.getPostomats(cityRef, limit);
			const activePostomats = novaPoshtaClient.filterActiveWarehouses(postomats);
			return novaPoshtaClient.sortWarehousesByNumber(activePostomats);
		} catch (error) {
			console.error('Error fetching postomats:', error);
			throw new Error('Failed to load postomats');
		}
	}
);

/**
 * Get all warehouse types
 */
export const getWarehouseTypes = query(async () => {
	try {
		return await novaPoshtaClient.getWarehouseTypes();
	} catch (error) {
		console.error('Error fetching warehouse types:', error);
		throw new Error('Failed to load warehouse types');
	}
});

// ============================================
// DELIVERY COST & DATE
// ============================================

/**
 * Calculate delivery cost
 */
export const calculateDeliveryCost = query(
	v.object({
		citySender: v.pipe(v.string(), v.minLength(1)),
		cityRecipient: v.pipe(v.string(), v.minLength(1)),
		weight: v.pipe(v.number(), v.minValue(0.01)),
		cost: v.pipe(v.number(), v.minValue(0)),
		serviceType: v.picklist([
			'DoorsWarehouse',
			'WarehouseWarehouse',
			'WarehouseDoors',
			'DoorsDoors'
		]),
		cargoType: v.optional(
			v.picklist(['Cargo', 'Documents', 'TiresWheels', 'Pallet']),
			'Cargo'
		),
		seatsAmount: v.optional(v.number(), 1)
	}),
	async ({ citySender, cityRecipient, weight, cost, serviceType, cargoType, seatsAmount }) => {
		try {
			const result = await novaPoshtaClient.getDeliveryCost({
				CitySender: citySender,
				CityRecipient: cityRecipient,
				Weight: weight,
				Cost: cost,
				ServiceType: serviceType,
				CargoType: cargoType,
				SeatsAmount: seatsAmount
			});
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('Error calculating delivery cost:', error);
			throw new Error('Failed to calculate delivery cost');
		}
	}
);

/**
 * Get estimated delivery date
 */
export const getDeliveryDate = query(
	v.object({
		citySender: v.pipe(v.string(), v.minLength(1)),
		cityRecipient: v.pipe(v.string(), v.minLength(1)),
		serviceType: v.picklist([
			'DoorsWarehouse',
			'WarehouseWarehouse',
			'WarehouseDoors',
			'DoorsDoors'
		])
	}),
	async ({ citySender, cityRecipient, serviceType }) => {
		try {
			const result = await novaPoshtaClient.getDeliveryDate({
				CitySender: citySender,
				CityRecipient: cityRecipient,
				ServiceType: serviceType
			});
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			console.error('Error getting delivery date:', error);
			throw new Error('Failed to get delivery date');
		}
	}
);

// ============================================
// TRACKING
// ============================================

/**
 * Track a shipment by tracking number (TTN)
 */
export const trackDocument = query(
	v.object({
		trackingNumber: v.pipe(v.string(), v.minLength(1)),
		phone: v.optional(v.string())
	}),
	async ({ trackingNumber, phone }) => {
		try {
			const result = await novaPoshtaClient.trackDocument(trackingNumber, phone);
			if (result.length === 0) {
				return null;
			}
			const doc = result[0];
			return {
				...doc,
				statusDescription: novaPoshtaClient.getTrackingStatusDescription(doc.StatusCode)
			};
		} catch (error) {
			console.error('Error tracking document:', error);
			throw new Error('Failed to track document');
		}
	}
);

/**
 * Track multiple shipments
 */
export const trackDocuments = query(
	v.object({
		documents: v.array(
			v.object({
				trackingNumber: v.pipe(v.string(), v.minLength(1)),
				phone: v.optional(v.string())
			})
		)
	}),
	async ({ documents }) => {
		try {
			const result = await novaPoshtaClient.trackDocuments(documents);
			return result.map((doc) => ({
				...doc,
				statusDescription: novaPoshtaClient.getTrackingStatusDescription(doc.StatusCode)
			}));
		} catch (error) {
			console.error('Error tracking documents:', error);
			throw new Error('Failed to track documents');
		}
	}
);

// ============================================
// ADMIN/TESTING
// ============================================

/**
 * Test the Nova Poshta API connection
 */
export const testConnection = query(async () => {
	try {
		const isConfigured = novaPoshtaClient.isConfigured();
		if (!isConfigured) {
			return {
				success: false,
				message: 'API key not configured. Add NOVAPOSHTA_API_KEY to your .env file.',
				areasCount: 0,
				hasApiKey: false,
				apiVersion: '2.0'
			};
		}
		const areas = await novaPoshtaClient.getAreas();
		return {
			success: true,
			message: `Connected successfully. Found ${areas.length} areas.`,
			areasCount: areas.length,
			hasApiKey: true,
			apiVersion: '2.0'
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Connection failed',
			areasCount: 0,
			hasApiKey: novaPoshtaClient.isConfigured(),
			apiVersion: '2.0'
		};
	}
});

// ============================================
// CONVENIENCE METHODS
// ============================================

/**
 * Get full warehouse address for display
 */
export const getWarehouseFullAddress = query(
	v.object({
		warehouseRef: v.pipe(v.string(), v.minLength(1)),
		cityRef: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ warehouseRef, cityRef }) => {
		try {
			const [warehouses, city] = await Promise.all([
				novaPoshtaClient.getWarehouses({ CityRef: cityRef }),
				novaPoshtaClient.getCityByRef(cityRef)
			]);

			const warehouse = warehouses.find((w) => w.Ref === warehouseRef);

			if (!warehouse || !city) {
				return null;
			}

			return {
				cityName: city.Description,
				areaName: city.AreaDescription,
				warehouseNumber: warehouse.Number,
				warehouseDescription: warehouse.Description,
				shortAddress: warehouse.ShortAddress,
				phone: warehouse.Phone,
				schedule: warehouse.Schedule,
				coordinates: {
					lat: parseFloat(warehouse.Latitude),
					lng: parseFloat(warehouse.Longitude)
				},
				fullAddress: `${city.AreaDescription} обл., ${city.Description}, ${warehouse.Description}`
			};
		} catch (error) {
			console.error('Error building full address:', error);
			throw new Error('Failed to get warehouse address');
		}
	}
);

/**
 * Quick city and warehouse lookup combined
 * Returns city info along with its warehouses
 */
export const getCityWithWarehouses = query(
	v.object({
		cityRef: v.pipe(v.string(), v.minLength(1))
	}),
	async ({ cityRef }) => {
		try {
			const [city, warehouses] = await Promise.all([
				novaPoshtaClient.getCityByRef(cityRef),
				novaPoshtaClient.getWarehousesByCity(cityRef, 200)
			]);

			if (!city) {
				return null;
			}

			const activeWarehouses = novaPoshtaClient.filterActiveWarehouses(warehouses);
			const sortedWarehouses = novaPoshtaClient.sortWarehousesByNumber(activeWarehouses);

			return {
				city,
				warehouses: sortedWarehouses,
				branches: sortedWarehouses.filter(
					(w) => w.TypeOfWarehouse === '841339c7-591a-42e2-8571-3ca4752a3ac3'
				),
				postomats: sortedWarehouses.filter(
					(w) => w.TypeOfWarehouse === 'f9316480-5f2d-425d-bc2c-ac7cd29decf0'
				)
			};
		} catch (error) {
			console.error('Error fetching city with warehouses:', error);
			throw new Error('Failed to load city data');
		}
	}
);
