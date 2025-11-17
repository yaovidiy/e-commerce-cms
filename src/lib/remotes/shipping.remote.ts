import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and, gte, lte, or, isNull } from 'drizzle-orm';
import * as v from 'valibot';
import * as auth from '$lib/server/auth';
import {
	CreateShippingZoneSchema,
	UpdateShippingZoneSchema,
	DeleteShippingZoneSchema,
	CreateShippingRateSchema,
	UpdateShippingRateSchema,
	DeleteShippingRateSchema,
	GetApplicableRatesSchema
} from '$lib/server/schemas';

// ============================================
// SHIPPING ZONES
// ============================================

export const getAllZones = query(async () => {
	auth.requireAdminUser();

	const zones = await db.select().from(tables.shippingZone);

	return zones.map((zone) => ({
		...zone,
		countries: JSON.parse(zone.countries)
	}));
});

export const createZone = form(CreateShippingZoneSchema, async (data) => {
	auth.requireAdminUser();

	const [newZone] = await db
		.insert(tables.shippingZone)
		.values({
			id: crypto.randomUUID(),
			name: data.name,
			countries: JSON.stringify(data.countries),
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// Refresh zones list
	await getAllZones().refresh();

	return {
		...newZone,
		countries: JSON.parse(newZone.countries)
	};
});

export const updateZone = form(UpdateShippingZoneSchema, async (data) => {
	auth.requireAdminUser();

	const updateData: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.name !== undefined) updateData.name = data.name;
	if (data.countries !== undefined) updateData.countries = JSON.stringify(data.countries);

	const [updated] = await db
		.update(tables.shippingZone)
		.set(updateData)
		.where(eq(tables.shippingZone.id, data.id))
		.returning();

	// Refresh zones list
	await getAllZones().refresh();

	return {
		...updated,
		countries: JSON.parse(updated.countries)
	};
});

export const deleteZone = form(DeleteShippingZoneSchema, async (data) => {
	auth.requireAdminUser();

	// Check if zone has any rates
	const rates = await db
		.select()
		.from(tables.shippingRate)
		.where(eq(tables.shippingRate.zoneId, data.id));

	if (rates.length > 0) {
		throw new Error('Cannot delete zone with existing shipping rates. Delete the rates first.');
	}

	await db.delete(tables.shippingZone).where(eq(tables.shippingZone.id, data.id));

	// Refresh zones list
	await getAllZones().refresh();

	return { success: true };
});

// ============================================
// SHIPPING RATES
// ============================================

export const getAllRates = query(async () => {
	auth.requireAdminUser();

	const rates = await db
		.select({
			rate: tables.shippingRate,
			zone: tables.shippingZone
		})
		.from(tables.shippingRate)
		.leftJoin(tables.shippingZone, eq(tables.shippingRate.zoneId, tables.shippingZone.id));

	return rates.map((r) => ({
		...r.rate,
		zone: r.zone
			? {
					...r.zone,
					countries: JSON.parse(r.zone.countries)
				}
			: null
	}));
});

export const getRatesByZone = query(v.string(), async (zoneId) => {
	auth.requireAdminUser();

	const rates = await db
		.select()
		.from(tables.shippingRate)
		.where(eq(tables.shippingRate.zoneId, zoneId));

	return rates;
});

export const createRate = form(CreateShippingRateSchema, async (data) => {
	auth.requireAdminUser();

	const [newRate] = await db
		.insert(tables.shippingRate)
		.values({
			id: crypto.randomUUID(),
			zoneId: data.zoneId,
			name: data.name,
			description: data.description,
			price: data.price,
			minOrderAmount: data.minOrderAmount,
			maxOrderAmount: data.maxOrderAmount,
			estimatedDays: data.estimatedDays,
			isActive: data.isActive ?? true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// Refresh rates list
	await getAllRates().refresh();

	return newRate;
});

export const updateRate = form(UpdateShippingRateSchema, async (data) => {
	auth.requireAdminUser();

	const updateData: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.zoneId !== undefined) updateData.zoneId = data.zoneId;
	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.price !== undefined) updateData.price = data.price;
	if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
	if (data.maxOrderAmount !== undefined) updateData.maxOrderAmount = data.maxOrderAmount;
	if (data.estimatedDays !== undefined) updateData.estimatedDays = data.estimatedDays;
	if (data.isActive !== undefined) updateData.isActive = data.isActive;

	const [updated] = await db
		.update(tables.shippingRate)
		.set(updateData)
		.where(eq(tables.shippingRate.id, data.id))
		.returning();

	// Refresh rates list
	await getAllRates().refresh();

	return updated;
});

export const deleteRate = form(DeleteShippingRateSchema, async (data) => {
	auth.requireAdminUser();

	await db.delete(tables.shippingRate).where(eq(tables.shippingRate.id, data.id));

	// Refresh rates list
	await getAllRates().refresh();

	return { success: true };
});

// ============================================
// PUBLIC/CUSTOMER FUNCTIONS
// ============================================

/**
 * Get applicable shipping rates for a given country and order amount
 * This is used during checkout to show available shipping options
 */
export const getApplicableRates = query(GetApplicableRatesSchema, async (data) => {
	// Find zones that include this country
	const zones = await db.select().from(tables.shippingZone);

	const applicableZoneIds = zones
		.filter((zone) => {
			const countries = JSON.parse(zone.countries);
			return countries.includes(data.country);
		})
		.map((zone) => zone.id);

	if (applicableZoneIds.length === 0) {
		return [];
	}

	// Find active rates for these zones that match the order amount
	const rates = await db
		.select({
			rate: tables.shippingRate,
			zone: tables.shippingZone
		})
		.from(tables.shippingRate)
		.leftJoin(tables.shippingZone, eq(tables.shippingRate.zoneId, tables.shippingZone.id))
		.where(
			and(
				eq(tables.shippingRate.isActive, true),
				// Zone must be in the applicable zones
				or(...applicableZoneIds.map((zoneId) => eq(tables.shippingRate.zoneId, zoneId))),
				// Check min order amount
				or(
					isNull(tables.shippingRate.minOrderAmount),
					lte(tables.shippingRate.minOrderAmount, data.orderAmount)
				),
				// Check max order amount
				or(
					isNull(tables.shippingRate.maxOrderAmount),
					gte(tables.shippingRate.maxOrderAmount, data.orderAmount)
				)
			)
		);

	return rates.map((r) => ({
		...r.rate,
		zone: r.zone
			? {
					...r.zone,
					countries: JSON.parse(r.zone.countries)
				}
			: null
	}));
});
