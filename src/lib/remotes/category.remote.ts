import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import { CreateCategorySchema, UpdateCategorySchema, DeleteCategorySchema } from '$lib/server/schemas';
import { eq, isNull, desc } from 'drizzle-orm';

// Get all categories (including nested structure)
export const getAllCategories = query(async () => {
	const categories = await db
		.select()
		.from(tables.category)
		.orderBy(desc(tables.category.displayOrder), tables.category.name);

	return categories;
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
	const [category] = await db.select().from(tables.category).where(eq(tables.category.slug, slug));

	return category;
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

	// Refresh category list
	await getAllCategories().refresh();

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

	// Refresh category list
	await getAllCategories().refresh();

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

	// Refresh category list
	await getAllCategories().refresh();

	return { success: true };
});
