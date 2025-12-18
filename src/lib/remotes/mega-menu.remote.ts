import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import {
	CreateMegaMenuSchema,
	UpdateMegaMenuSchema,
	DeleteMegaMenuSchema,
	GetMegaMenuSchema
} from '$lib/server/schemas';
import { eq, like, and, count, desc } from 'drizzle-orm';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';

// Get all mega menus with pagination
export const getAllMegaMenus = query(GetMegaMenuSchema, async (data) => {
	auth.requireAdminUser();

	let baseQuery = db.select().from(tables.megaMenu);
	const conditions = [];

	// Filter by search term
	if (data.search) {
		conditions.push(like(tables.megaMenu.title, `%${data.search}%`));
	}

	// Apply conditions
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// Add ordering
	baseQuery = baseQuery.orderBy(desc(tables.megaMenu.displayOrder), tables.megaMenu.title) as typeof baseQuery;

	// Create count query with same conditions
	let countQuery = db.select({ count: count() }).from(tables.megaMenu);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	// Execute count query
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// Execute data query with pagination
	const items = await baseQuery.limit(limit).offset(offset);

	// Parse categories JSON
	const itemsWithParsedCategories = items.map((item) => ({
		...item,
		categories: JSON.parse(item.categories || '[]')
	}));

	// Return using utility
	return createPaginatedResponse(itemsWithParsedCategories, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});

// Get single mega menu by ID
export const getMegaMenuById = query(v.string(), async (id) => {
	auth.requireAdminUser();

	const [item] = await db.select().from(tables.megaMenu).where(eq(tables.megaMenu.id, id));

	if (!item) {
		throw new Error('Mega menu not found');
	}

	return {
		...item,
		categories: JSON.parse(item.categories || '[]')
	};
});

// Create new mega menu
export const createMegaMenu = form(CreateMegaMenuSchema, async (data) => {
	auth.requireAdminUser();

	const now = new Date();

	// Parse categories string into array
	const categoriesArray = data.categories
		? data.categories
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0)
		: [];

	console.log('Creating mega menu with data:', data);

	const [newItem] = await db
		.insert(tables.megaMenu)
		.values({
			id: crypto.randomUUID(),
			title: data.title,
			categoryId: data.categoryId || null,
			categories: JSON.stringify(categoriesArray),
			isVisible: data.isVisible,
			displayOrder: data.displayOrder,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	// Refresh list
	await getAllMegaMenus({ search: '', page: 1, pageSize: 20 }).refresh();

	return {
		...newItem,
		categories: JSON.parse(newItem.categories || '[]')
	};
});

// Update existing mega menu
export const updateMegaMenu = form(UpdateMegaMenuSchema, async (data) => {
	auth.requireAdminUser();

	const { id, ...updateData } = data;

	// Build update object, only including provided fields
	const updateObject: any = {
		updatedAt: new Date()
	};

	if (updateData.title !== undefined) updateObject.title = updateData.title;
	if (updateData.categoryId !== undefined) updateObject.categoryId = updateData.categoryId || null;
	if (updateData.categories !== undefined) {
		// Parse categories string into array
		const categoriesArray = updateData.categories
			? updateData.categories
					.split(',')
					.map((categoryId) => categoryId.trim())
					.filter((categoryId) => categoryId.length > 0)
			: [];
		updateObject.categories = JSON.stringify(categoriesArray);
	}
	if (updateData.isVisible !== undefined) updateObject.isVisible = updateData.isVisible;
	if (updateData.displayOrder !== undefined) updateObject.displayOrder = updateData.displayOrder;

	const [updatedItem] = await db
		.update(tables.megaMenu)
		.set(updateObject)
		.where(eq(tables.megaMenu.id, id))
		.returning();

	// Refresh list
	await getAllMegaMenus({ search: '', page: 1, pageSize: 20 }).refresh();

	return {
		...updatedItem,
		categories: JSON.parse(updatedItem.categories || '[]')
	};
});

// Delete mega menu
export const deleteMegaMenu = form(DeleteMegaMenuSchema, async (data) => {
	auth.requireAdminUser();

	await db.delete(tables.megaMenu).where(eq(tables.megaMenu.id, data.id));

	// Refresh list
	await getAllMegaMenus({ search: '', page: 1, pageSize: 20 }).refresh();

	return { success: true };
});
