import { query, form } from '$app/server';
import { db, rawDb } from '$lib/server/db';
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

// Customer-facing: Browse active products with filters
export const browseProducts = query(
	v.object({
		search: v.optional(v.string(), ''),
		categoryId: v.optional(v.string()),
		brandId: v.optional(v.string()),
		sortBy: v.optional(v.picklist(['newest', 'price-asc', 'price-desc', 'name']), 'newest'),
		page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
		pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(48)), 12)
	}),
	async (data) => {
		let productQuery = db.select().from(tables.product);

		const conditions = [eq(tables.product.status, 'active')];

		// Search by name or description
		if (data.search) {
			conditions.push(like(tables.product.name, `%${data.search}%`));
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
			productQuery = productQuery.where(and(...conditions)) as typeof productQuery;
		}

		// Sorting
		switch (data.sortBy) {
			case 'price-asc':
				productQuery = productQuery.orderBy(tables.product.price) as typeof productQuery;
				break;
			case 'price-desc':
				productQuery = productQuery.orderBy(desc(tables.product.price)) as typeof productQuery;
				break;
			case 'name':
				productQuery = productQuery.orderBy(tables.product.name) as typeof productQuery;
				break;
			case 'newest':
			default:
				productQuery = productQuery.orderBy(
					desc(tables.product.createdAt)
				) as typeof productQuery;
				break;
		}

		// Pagination
		const offset = (data.page - 1) * data.pageSize;
		productQuery = productQuery.limit(data.pageSize).offset(offset) as typeof productQuery;

		return await productQuery;
	}
);

// Search products using FTS5
export const searchProducts = query(
	v.object({
		query: v.string(),
		limit: v.optional(v.number(), 10)
	}),
	async (data) => {
		if (!data.query || data.query.trim().length === 0) {
			return [];
		}

		// Use FTS5 for full-text search
		const searchQuery = data.query.trim().replace(/"/g, '""'); // Escape quotes

		const results = rawDb
			.prepare(
				`
			SELECT p.*, 
				   c.name as category_name, 
				   c.slug as category_slug,
				   b.name as brand_name,
				   b.slug as brand_slug,
				   rank
			FROM product_fts
			JOIN product p ON product_fts.id = p.id
			LEFT JOIN category c ON p.category_id = c.id
			LEFT JOIN brand b ON p.brand_id = b.id
			WHERE product_fts MATCH ?
			  AND p.status = 'active'
			  AND p.quantity > 0
			ORDER BY rank
			LIMIT ?
		`
			)
			.all(searchQuery, data.limit);

		return results;
	}
);

// Autocomplete suggestions for search
export const searchAutocomplete = query(
	v.object({
		query: v.string(),
		limit: v.optional(v.number(), 5)
	}),
	async (data) => {
		if (!data.query || data.query.trim().length < 2) {
			return [];
		}

		// Use FTS5 prefix search for autocomplete
		const searchQuery = data.query.trim().replace(/"/g, '""') + '*'; // Prefix search

		const results = rawDb
			.prepare(
				`
			SELECT p.id, p.name, p.slug, p.price, p.images
			FROM product_fts
			JOIN product p ON product_fts.id = p.id
			WHERE product_fts MATCH ?
			  AND p.status = 'active'
			ORDER BY rank
			LIMIT ?
		`
			)
			.all(searchQuery, data.limit);

		return results;
	}
);
