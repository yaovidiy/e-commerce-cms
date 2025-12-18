import { query, form, command } from '$app/server';
import { db, rawDb } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import {
	CreateProductSchema,
	UpdateProductSchema,
	DeleteProductSchema,
	FilterProductsSchema,
	CreateProductTierSchema,
	UpdateProductTierSchema,
	DeleteProductTierSchema,
	GetProductTiersSchema
} from '$lib/server/schemas';
import { eq, like, and, desc, count, asc } from 'drizzle-orm';
import { productCache, withCache, invalidateProductCaches } from '$lib/server/cache';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import { SortOptions } from '$lib/schemas';

// Get all products with filters
export const getAllProducts = query(FilterProductsSchema, async (data) => {
	let baseQuery = db.select().from(tables.product);

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
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// Order by creation date (newest first)
	baseQuery = baseQuery.orderBy(desc(tables.product.createdAt)) as typeof baseQuery;

	// Get total count for pagination
	let countQuery = db.select({ count: count() }).from(tables.product);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);
	const results = await baseQuery.limit(limit).offset(offset);

	// Return paginated response
	return createPaginatedResponse(results, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});

// Public: Get all active products with filtering, searching, and sorting
export const getAllPublicProducts = query(
	v.object({
		page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
		pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 12),
		categoryId: v.optional(v.string()),
		query: v.optional(v.string()),
		sortBy: v.optional(v.enum(SortOptions), SortOptions.CREATED_AT_DESC)
	}),
	async (data) => {
		let baseQuery = db.select().from(tables.product);

		const conditions = [eq(tables.product.status, 'active')];

		// Filter by category
		if (data.categoryId) {
			conditions.push(eq(tables.product.categoryId, data.categoryId));
		}

		// Search by product title
		if (data.query) {
			conditions.push(like(tables.product.name, `%${data.query}%`));
		}

		if (conditions.length > 0) {
			baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
		}

		// Apply sorting based on SortOptions enum
		switch (data.sortBy) {
			case SortOptions.TITLE_ASC:
				baseQuery = baseQuery.orderBy(asc(tables.product.name)) as typeof baseQuery;
				break;
			case SortOptions.PRICE_ASC:
				baseQuery = baseQuery.orderBy(asc(tables.product.price)) as typeof baseQuery;
				break;
			case SortOptions.PRICE_DESC:
				baseQuery = baseQuery.orderBy(desc(tables.product.price)) as typeof baseQuery;
				break;
			case SortOptions.CREATED_AT_DESC:
			default:
				baseQuery = baseQuery.orderBy(desc(tables.product.createdAt)) as typeof baseQuery;
				break;
		}

		// Get total count for pagination
		let countQuery = db.select({ count: count() }).from(tables.product);

		if (conditions.length > 0) {
			countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
		}

		const [countResult] = await countQuery;
		const totalCount = Number(countResult?.count) || 0;

		// Calculate pagination
		const { offset, limit } = calculatePagination(data.page, data.pageSize);
		const results = await baseQuery.limit(limit).offset(offset);

		// Parse images for each product
		const productsWithParsedImages = results.map((product) => ({
			...product,
			images: product.images ? JSON.parse(product.images) : []
		}));

		// Return paginated response
		return createPaginatedResponse(productsWithParsedImages, totalCount, {
			page: data.page,
			pageSize: data.pageSize
		});
	}
);

// Get single product by ID
export const getProductById = query(v.string(), async (id) => {
	const [product] = await db.select().from(tables.product).where(eq(tables.product.id, id));

	return product;
});

// Get single product by slug (for customer-facing pages)
export const getProductBySlug = query(v.string(), async (slug) => {
	return await withCache(productCache, `product-slug-${slug}`, async () => {
		const [product] = await db
			.select()
			.from(tables.product)
			.where(and(eq(tables.product.slug, slug), eq(tables.product.status, 'active')));

		return product;
	});
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

	// Invalidate product caches
	invalidateProductCaches();

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

	// Invalidate product caches
	invalidateProductCaches();

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

	// Invalidate product caches
	invalidateProductCaches();

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
				productQuery = productQuery.orderBy(desc(tables.product.createdAt)) as typeof productQuery;
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

// Update all products to a specific status
export const updateAllProductsStatus = command(
	v.object({
		status: v.picklist(['draft', 'active', 'archived'])
	}),
	async (data) => {
		auth.requireAdminUser();

		const now = new Date();

		await db
			.update(tables.product)
			.set({
				status: data.status,
				updatedAt: now
			})
			.execute();

		// Invalidate product caches
		invalidateProductCaches();

		// Refresh product list on server
		await getAllProducts({
			name: '',
			status: 'all',
			page: 1,
			pageSize: 20
		}).refresh();

		return { success: true };
	}
);

// ==================== PRODUCT TIER PRICING ====================

// Get all tiers for a product
export const getProductTiers = query(
	v.object({
		productId: v.string()
	}),
	async (data) => {
		const tiers = await db
			.select()
			.from(tables.productTier)
			.where(eq(tables.productTier.productId, data.productId))
			.orderBy(asc(tables.productTier.minQuantity));

		return tiers;
	}
);

// Create a new tier for a product
export const createProductTier = command(
	CreateProductTierSchema,
	async (data) => {
		auth.requireAdminUser();

		// Verify product exists
		const [product] = await db
			.select()
			.from(tables.product)
			.where(eq(tables.product.id, data.productId));

		if (!product) {
			throw new Error('Product not found');
		}

		// Check if tier with this minQuantity already exists
		const [existing] = await db
			.select()
			.from(tables.productTier)
			.where(
				and(
					eq(tables.productTier.productId, data.productId),
					eq(tables.productTier.minQuantity, data.minQuantity)
				)
			);

		if (existing) {
			throw new Error('Tier with this minimum quantity already exists');
		}

		const [tier] = await db
			.insert(tables.productTier)
			.values({
				id: crypto.randomUUID(),
				productId: data.productId,
				minQuantity: data.minQuantity,
				discount: data.discount,
				createdAt: new Date()
			})
			.returning();

		// Mark product as having multiple prices
		await db
			.update(tables.product)
			.set({
				hasMultiplePrices: true,
				updatedAt: new Date()
			})
			.where(eq(tables.product.id, data.productId));

		// Refresh product cache and tier list
		invalidateProductCaches();
		await getProductTiers({ productId: data.productId }).refresh();

		return tier;
	}
);

// Update a product tier
export const updateProductTier = form(
	UpdateProductTierSchema,
	async (data) => {
		auth.requireAdminUser();

		// Get existing tier
		const [tier] = await db
			.select()
			.from(tables.productTier)
			.where(eq(tables.productTier.id, data.id));

		if (!tier) {
			throw new Error('Tier not found');
		}

		// Update tier
		const updates: Record<string, any> = {};
		if (data.minQuantity !== undefined) {
			updates.minQuantity = data.minQuantity;
		}
		if (data.discount !== undefined) {
			updates.discount = data.discount;
		}

		const [updated] = await db
			.update(tables.productTier)
			.set(updates)
			.where(eq(tables.productTier.id, data.id))
			.returning();

		// Refresh tier list
		invalidateProductCaches();
		await getProductTiers({ productId: tier.productId }).refresh();

		return updated;
	}
);

// Delete a product tier
export const deleteProductTier = form(
	v.object({
		id: v.string()
	}),
	async (data) => {
		auth.requireAdminUser();

		// Get tier to find product
		const [tier] = await db
			.select()
			.from(tables.productTier)
			.where(eq(tables.productTier.id, data.id));

		if (!tier) {
			throw new Error('Tier not found');
		}

		// Delete tier
		await db.delete(tables.productTier).where(eq(tables.productTier.id, data.id));

		// Check if product still has tiers
		const [remainingTier] = await db
			.select()
			.from(tables.productTier)
			.where(eq(tables.productTier.productId, tier.productId))
			.limit(1);

		// Update product's hasMultiplePrices flag
		await db
			.update(tables.product)
			.set({
				hasMultiplePrices: !!remainingTier,
				updatedAt: new Date()
			})
			.where(eq(tables.product.id, tier.productId));

		// Refresh tier list
		invalidateProductCaches();
		await getProductTiers({ productId: tier.productId }).refresh();

		return { success: true };
	}
);

