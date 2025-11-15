import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import {
	CreateProductSchema,
	UpdateProductSchema,
	DeleteProductSchema,
	FilterProductsSchema
} from '$lib/server/schemas';
import { eq, like, and, desc } from 'drizzle-orm';

// Get all products with filters
export const getAllProducts = query(FilterProductsSchema, async (data) => {
	auth.requireAdminUser();

	let query = db.select().from(tables.product);

	const conditions = [];

	// Filter by name (search)
	if (data.name) {
		conditions.push(like(tables.product.name, `%${data.name}%`));
	}

	// Filter by status
	if (data.status && data.status !== 'all') {
		conditions.push(eq(tables.product.status, data.status));
	}

	// Filter by category
	if (data.categoryId) {
		conditions.push(eq(tables.product.categoryId, data.categoryId));
	}

	// Filter by brand
	if (data.brandId) {
		conditions.push(eq(tables.product.brandId, data.brandId));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions)) as typeof query;
	}

	// Order by creation date (newest first)
	query = query.orderBy(desc(tables.product.createdAt)) as typeof query;

	// Pagination
	const offset = (data.page - 1) * data.pageSize;
	query = query.limit(data.pageSize).offset(offset) as typeof query;

	return await query;
});

// Get single product by ID
export const getProductById = query(v.string(), async (id) => {
	const [product] = await db.select().from(tables.product).where(eq(tables.product.id, id));

	return product;
});

// Get single product by slug (for customer-facing pages)
export const getProductBySlug = query(v.string(), async (slug) => {
	const [product] = await db
		.select()
		.from(tables.product)
		.where(and(eq(tables.product.slug, slug), eq(tables.product.status, 'active')));

	return product;
});

// Create new product
export const createProduct = form(CreateProductSchema, async (data) => {
	auth.requireAdminUser();

	const now = new Date();

	const [newProduct] = await db
		.insert(tables.product)
		.values({
			id: crypto.randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	// Refresh product list
	await getAllProducts({
		name: '',
		status: 'all',
		page: 1,
		pageSize: 20
	}).refresh();

	return newProduct;
});

// Update existing product
export const updateProduct = form(UpdateProductSchema, async (data) => {
	auth.requireAdminUser();

	const { id, ...updateData } = data;

	const [updatedProduct] = await db
		.update(tables.product)
		.set({
			...updateData,
			updatedAt: new Date()
		})
		.where(eq(tables.product.id, id))
		.returning();

	// Refresh product list
	await getAllProducts({
		name: '',
		status: 'all',
		page: 1,
		pageSize: 20
	}).refresh();

	return updatedProduct;
});

// Delete product
export const deleteProduct = form(DeleteProductSchema, async (data) => {
	auth.requireAdminUser();

	await db.delete(tables.product).where(eq(tables.product.id, data.id));

	// Refresh product list
	await getAllProducts({
		name: '',
		status: 'all',
		page: 1,
		pageSize: 20
	}).refresh();

	return { success: true };
});
