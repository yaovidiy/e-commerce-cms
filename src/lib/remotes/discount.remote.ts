import { query, form, command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import {
	CreateDiscountSchema,
	UpdateDiscountSchema,
	DeleteDiscountSchema,
	ValidateDiscountSchema
} from '$lib/server/schemas';
import { eq, and, gte, lte, or, isNull } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';

// Get all discounts (admin only)
export const getAllDiscounts = query(async () => {
	auth.requireAdminUser();

	const discounts = await db.select().from(tables.discount);

	// Parse JSON fields
	return discounts.map((discount) => ({
		...discount,
		applicableProducts: discount.applicableProducts
			? JSON.parse(discount.applicableProducts)
			: null,
		applicableCategories: discount.applicableCategories
			? JSON.parse(discount.applicableCategories)
			: null
	}));
});

// Get single discount by ID (admin only)
export const getDiscount = query(v.string(), async (id: string) => {
	auth.requireAdminUser();

	const [discount] = await db.select().from(tables.discount).where(eq(tables.discount.id, id));

	if (!discount) {
		error(404, 'Discount not found');
	}

	return {
		...discount,
		applicableProducts: discount.applicableProducts
			? JSON.parse(discount.applicableProducts)
			: null,
		applicableCategories: discount.applicableCategories
			? JSON.parse(discount.applicableCategories)
			: null
	};
});

// Create discount (admin only)
export const createDiscount = form(CreateDiscountSchema, async (data) => {
	auth.requireAdminUser();

	// Check if code already exists
	const [existing] = await db
		.select()
		.from(tables.discount)
		.where(eq(tables.discount.code, data.code as string));

	if (existing) {
		error(409, 'Discount code already exists');
	}

	// Validate percentage value
	if (data.type === 'percentage' && (data.value as number) > 100) {
		error(400, 'Percentage discount cannot exceed 100%');
	}

	// Convert date strings to Date objects
	const startsAt = new Date(data.startsAt as string);
	const endsAt = data.endsAt ? new Date(data.endsAt as string) : null;

	// Validate dates
	if (endsAt && startsAt >= endsAt) {
		error(400, 'End date must be after start date');
	}

	const [newDiscount] = await db
		.insert(tables.discount)
		.values({
			id: crypto.randomUUID(),
			code: data.code as string,
			type: data.type as 'percentage' | 'fixed' | 'free_shipping',
			value: data.value as number,
			minOrderAmount: data.minOrderAmount as number | undefined,
			maxUsesTotal: data.maxUsesTotal as number | undefined,
			maxUsesPerCustomer: (data.maxUsesPerCustomer as number | undefined) ?? 1,
			currentUses: 0,
			startsAt,
			endsAt,
			isActive: (data.isActive as boolean | undefined) ?? true,
			applicableProducts: data.applicableProducts as string | undefined,
			applicableCategories: data.applicableCategories as string | undefined,
			description: data.description as string | undefined,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// Refresh the list
	await getAllDiscounts().refresh();

	return newDiscount;
});

// Update discount (admin only)
export const updateDiscount = form(UpdateDiscountSchema, async (data) => {
	auth.requireAdminUser();

	// Check if discount exists
	const [existing] = await db
		.select()
		.from(tables.discount)
		.where(eq(tables.discount.id, data.id as string));

	if (!existing) {
		error(404, 'Discount not found');
	}

	// If updating code, check for duplicates
	if (data.code && data.code !== existing.code) {
		const [duplicate] = await db
			.select()
			.from(tables.discount)
			.where(eq(tables.discount.code, data.code as string));

		if (duplicate) {
			error(409, 'Discount code already exists');
		}
	}

	// Validate percentage value
	if (data.type === 'percentage' && data.value && (data.value as number) > 100) {
		error(400, 'Percentage discount cannot exceed 100%');
	}

	// Convert date strings to Date objects
	const startsAt = data.startsAt ? new Date(data.startsAt as string) : undefined;
	const endsAt = data.endsAt ? new Date(data.endsAt as string) : undefined;

	// Validate dates
	const finalStartsAt = startsAt ?? existing.startsAt;
	const finalEndsAt = endsAt ?? existing.endsAt;
	if (finalEndsAt && finalStartsAt >= finalEndsAt) {
		error(400, 'End date must be after start date');
	}

	const [updated] = await db
		.update(tables.discount)
		.set({
			code: data.code as string | undefined,
			type: data.type as 'percentage' | 'fixed' | 'free_shipping' | undefined,
			value: data.value as number | undefined,
			minOrderAmount: data.minOrderAmount as number | undefined,
			maxUsesTotal: data.maxUsesTotal as number | undefined,
			maxUsesPerCustomer: data.maxUsesPerCustomer as number | undefined,
			startsAt,
			endsAt,
			isActive: data.isActive as boolean | undefined,
			applicableProducts: data.applicableProducts as string | undefined,
			applicableCategories: data.applicableCategories as string | undefined,
			description: data.description as string | undefined,
			updatedAt: new Date()
		})
		.where(eq(tables.discount.id, data.id as string))
		.returning();

	// Refresh the list
	await getAllDiscounts().refresh();

	return updated;
});

// Delete discount (admin only)
export const deleteDiscount = form(DeleteDiscountSchema, async (data) => {
	auth.requireAdminUser();

	const [existing] = await db
		.select()
		.from(tables.discount)
		.where(eq(tables.discount.id, data.id));

	if (!existing) {
		error(404, 'Discount not found');
	}

	await db.delete(tables.discount).where(eq(tables.discount.id, data.id));

	// Refresh the list
	await getAllDiscounts().refresh();

	return { success: true };
});

// Validate discount code (public - used in cart/checkout)
export const validateDiscount = query(ValidateDiscountSchema, async (data) => {
	const now = new Date();

	// Find discount by code
	const [discount] = await db
		.select()
		.from(tables.discount)
		.where(
			and(
				eq(tables.discount.code, data.code),
				eq(tables.discount.isActive, true),
				lte(tables.discount.startsAt, now),
				or(isNull(tables.discount.endsAt), gte(tables.discount.endsAt, now))
			)
		);

	if (!discount) {
		return {
			valid: false,
			error: 'Invalid or expired discount code'
		};
	}

	// Check if discount has reached max uses
	if (discount.maxUsesTotal && discount.currentUses >= discount.maxUsesTotal) {
		return {
			valid: false,
			error: 'Discount code has reached maximum uses'
		};
	}

	// Check minimum order amount
	if (discount.minOrderAmount && data.cartTotal < discount.minOrderAmount) {
		return {
			valid: false,
			error: `Minimum order amount of ${(discount.minOrderAmount / 100).toFixed(2)} required`,
			minOrderAmount: discount.minOrderAmount
		};
	}

	// Check product applicability
	if (discount.applicableProducts && data.cartItems) {
		const applicableProducts = JSON.parse(discount.applicableProducts) as string[];
		const hasApplicableProduct = data.cartItems.some((item) =>
			applicableProducts.includes(item.productId)
		);

		if (!hasApplicableProduct) {
			return {
				valid: false,
				error: 'Discount not applicable to items in cart'
			};
		}
	}

	// Check category applicability
	if (discount.applicableCategories && data.cartItems) {
		const applicableCategories = JSON.parse(discount.applicableCategories) as string[];
		const hasApplicableCategory = data.cartItems.some(
			(item) => item.categoryId && applicableCategories.includes(item.categoryId)
		);

		if (!hasApplicableCategory) {
			return {
				valid: false,
				error: 'Discount not applicable to items in cart'
			};
		}
	}

	// TODO: Check per-customer usage limit (requires tracking discount usage per user)
	// This would need a separate discount_usage table to track individual user usage

	// Calculate discount amount
	let discountAmount = 0;
	if (discount.type === 'percentage') {
		discountAmount = Math.round((data.cartTotal * discount.value) / 100);
	} else if (discount.type === 'fixed') {
		discountAmount = Math.min(discount.value, data.cartTotal);
	}
	// free_shipping is handled separately in checkout

	return {
		valid: true,
		discount: {
			id: discount.id,
			code: discount.code,
			type: discount.type,
			value: discount.value,
			discountAmount,
			description: discount.description
		}
	};
});

// Apply discount code (used when finalizing order)
export const applyDiscount = command(
	ValidateDiscountSchema,
	async (data) => {
		const validation = await validateDiscount(data);

		if (!validation.valid) {
			error(400, validation.error || 'Invalid discount code');
		}

		// Increment usage counter
		await db
			.update(tables.discount)
			.set({
				currentUses: validation.discount!.id
					? (await db
							.select()
							.from(tables.discount)
							.where(eq(tables.discount.id, validation.discount!.id))
							.then((rows) => rows[0]?.currentUses ?? 0)) + 1
					: 0,
				updatedAt: new Date()
			})
			.where(eq(tables.discount.id, validation.discount!.id));

		return validation.discount;
	}
);
