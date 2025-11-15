import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import { CreateBrandSchema, UpdateBrandSchema, DeleteBrandSchema } from '$lib/server/schemas';
import { eq } from 'drizzle-orm';

// Get all brands
export const getAllBrands = query(async () => {
	const brands = await db.select().from(tables.brand).orderBy(tables.brand.name);

	return brands;
});

// Get single brand by ID
export const getBrandById = query(v.string(), async (id) => {
	const [brand] = await db.select().from(tables.brand).where(eq(tables.brand.id, id));

	return brand;
});

// Get single brand by slug
export const getBrandBySlug = query(v.string(), async (slug) => {
	const [brand] = await db.select().from(tables.brand).where(eq(tables.brand.slug, slug));

	return brand;
});

// Create new brand
export const createBrand = form(CreateBrandSchema, async (data) => {
	auth.requireAdminUser();

	const now = new Date();

	const [newBrand] = await db
		.insert(tables.brand)
		.values({
			id: crypto.randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	// Refresh brand list
	await getAllBrands().refresh();

	return newBrand;
});

// Update existing brand
export const updateBrand = form(UpdateBrandSchema, async (data) => {
	auth.requireAdminUser();

	const { id, ...updateData } = data;

	const [updatedBrand] = await db
		.update(tables.brand)
		.set({
			...updateData,
			updatedAt: new Date()
		})
		.where(eq(tables.brand.id, id))
		.returning();

	// Refresh brand list
	await getAllBrands().refresh();

	return updatedBrand;
});

// Delete brand
export const deleteBrand = form(DeleteBrandSchema, async (data) => {
	auth.requireAdminUser();

	// Check if brand has products
	const products = await db.select().from(tables.product).where(eq(tables.product.brandId, data.id));

	if (products.length > 0) {
		throw new Error('Cannot delete brand with products');
	}

	await db.delete(tables.brand).where(eq(tables.brand.id, data.id));

	// Refresh brand list
	await getAllBrands().refresh();

	return { success: true };
});
