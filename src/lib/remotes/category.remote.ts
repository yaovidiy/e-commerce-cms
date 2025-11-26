import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import { CreateCategorySchema, UpdateCategorySchema, DeleteCategorySchema, GetCategoriesSchema } from '$lib/server/schemas';
import { eq, isNull, desc, like, and, count } from 'drizzle-orm';
import { categoryCache, withCache, invalidateCategoryCaches } from '$lib/server/cache';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';

// Get all categories with pagination (including search)
export const getAllCategories = query(GetCategoriesSchema, async (data) => {
	let baseQuery = db.select().from(tables.category);
	const conditions = [];

	// Filter by search term
	if (data.search) {
		conditions.push(like(tables.category.name, `%${data.search}%`));
	}

	// Apply conditions
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// Add ordering for deterministic results
	baseQuery = baseQuery.orderBy(desc(tables.category.displayOrder), tables.category.name) as typeof baseQuery;

	// Create count query with same conditions
	let countQuery = db.select({ count: count() }).from(tables.category);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	// Execute count query
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// Execute data query with pagination
	const categories = await baseQuery.limit(limit).offset(offset);

	// Return using utility
	return createPaginatedResponse(categories, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});

// Get root categories (no parent)
export const getRootCategories = query(async () => {
	const categories = await db
		.select()
		.from(tables.category)
		.where(isNull(tables.category.parentId))
		.orderBy(desc(tables.category.displayOrder), tables.category.name);

	return categories;
});

// Get categories by parent ID
export const getCategoriesByParent = query(v.string(), async (parentId) => {
	const categories = await db
		.select()
		.from(tables.category)
		.where(eq(tables.category.parentId, parentId))
		.orderBy(desc(tables.category.displayOrder), tables.category.name);

	return categories;
});

// Get single category by ID
export const getCategoryById = query(v.string(), async (id) => {
	const [category] = await db.select().from(tables.category).where(eq(tables.category.id, id));

	return category;
});

// Get single category by slug
export const getCategoryBySlug = query(v.string(), async (slug) => {
	return await withCache(categoryCache, `category-slug-${slug}`, async () => {
		const [category] = await db.select().from(tables.category).where(eq(tables.category.slug, slug));

		return category;
	});
});

// Create new category
export const createCategory = form(CreateCategorySchema, async (data) => {
	auth.requireAdminUser();

	const now = new Date();

	const [newCategory] = await db
		.insert(tables.category)
		.values({
			id: crypto.randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	// Invalidate category caches (also clears product caches)
	invalidateCategoryCaches();

	// Refresh category list
	await getAllCategories({ search: '', page: 1, pageSize: 20 }).refresh();

	return newCategory;
});

// Update existing category
export const updateCategory = form(UpdateCategorySchema, async (data) => {
	auth.requireAdminUser();

	const { id, ...updateData } = data;

	const [updatedCategory] = await db
		.update(tables.category)
		.set({
			...updateData,
			updatedAt: new Date()
		})
		.where(eq(tables.category.id, id))
		.returning();

	// Invalidate category caches (also clears product caches)
	invalidateCategoryCaches();

	// Refresh category list
	await getAllCategories({ search: '', page: 1, pageSize: 20 }).refresh();

	return updatedCategory;
});

// Delete category
export const deleteCategory = form(DeleteCategorySchema, async (data) => {
	auth.requireAdminUser();

	// Check if category has children
	const children = await db
		.select()
		.from(tables.category)
		.where(eq(tables.category.parentId, data.id));

	if (children.length > 0) {
		throw new Error('Cannot delete category with subcategories');
	}

	// Check if category has products
	const products = await db.select().from(tables.product).where(eq(tables.product.categoryId, data.id));

	if (products.length > 0) {
		throw new Error('Cannot delete category with products');
	}

	await db.delete(tables.category).where(eq(tables.category.id, data.id));

	// Invalidate category caches (also clears product caches)
	invalidateCategoryCaches();

	// Refresh category list
	await getAllCategories({ search: '', page: 1, pageSize: 20 }).refresh();

	return { success: true };
});
