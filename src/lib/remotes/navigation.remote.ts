import { form, query, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import * as v from 'valibot';

// ============= SCHEMAS =============

const CreateNavigationMenuSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
	location: v.picklist(['header', 'footer', 'mobile']),
	isActive: v.optional(v.boolean(), true)
});

const UpdateNavigationMenuSchema = v.object({
	id: v.string(),
	name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
	location: v.optional(v.picklist(['header', 'footer', 'mobile'])),
	isActive: v.optional(v.boolean())
});

const DeleteNavigationMenuSchema = v.object({
	id: v.string()
});

const CreateNavigationMenuItemSchema = v.object({
	menuId: v.string(),
	label: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
	url: v.pipe(v.string(), v.minLength(1)),
	parentId: v.optional(v.string()),
	displayOrder: v.optional(v.number(), 0),
	openInNewTab: v.optional(v.boolean(), false),
	isVisible: v.optional(v.boolean(), true),
	icon: v.optional(v.string())
});

const UpdateNavigationMenuItemSchema = v.object({
	id: v.string(),
	label: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
	url: v.optional(v.pipe(v.string(), v.minLength(1))),
	parentId: v.optional(v.string()),
	displayOrder: v.optional(v.number()),
	openInNewTab: v.optional(v.boolean()),
	isVisible: v.optional(v.boolean()),
	icon: v.optional(v.string())
});

const DeleteNavigationMenuItemSchema = v.object({
	id: v.string()
});

const CreateContactPhoneSchema = v.object({
	phoneNumber: v.pipe(v.string(), v.minLength(1)),
	label: v.optional(v.string()),
	displayOrder: v.optional(v.number(), 0),
	isActive: v.optional(v.boolean(), true)
});

const UpdateContactPhoneSchema = v.object({
	id: v.string(),
	phoneNumber: v.optional(v.pipe(v.string(), v.minLength(1))),
	label: v.optional(v.string()),
	displayOrder: v.optional(v.number()),
	isActive: v.optional(v.boolean())
});

const DeleteContactPhoneSchema = v.object({
	id: v.string()
});

// ============= NAVIGATION MENUS =============

/**
 * Get all navigation menus
 */
export const getAllNavigationMenus = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const menus = await db.select().from(tables.navigationMenu);
	return menus;
});

/**
 * Get navigation menu by ID with items
 */
export const getNavigationMenuById = query(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const [menu] = await db
		.select()
		.from(tables.navigationMenu)
		.where(eq(tables.navigationMenu.id, id));

	if (!menu) return null;

	const items = await db
		.select()
		.from(tables.navigationMenuItem)
		.where(eq(tables.navigationMenuItem.menuId, id))
		.orderBy(tables.navigationMenuItem.displayOrder);

	return { ...menu, items };
});

/**
 * Get navigation menu by location
 */
export const getNavigationMenuByLocation = query(
	v.picklist(['header', 'footer', 'mobile']),
	async (location) => {
		const [menu] = await db
			.select()
			.from(tables.navigationMenu)
			.where(
				and(
					eq(tables.navigationMenu.location, location),
					eq(tables.navigationMenu.isActive, true)
				)
			);

		if (!menu) return null;

		const items = await db
			.select()
			.from(tables.navigationMenuItem)
			.where(
				and(
					eq(tables.navigationMenuItem.menuId, menu.id),
					eq(tables.navigationMenuItem.isVisible, true)
				)
			)
			.orderBy(tables.navigationMenuItem.displayOrder);

		return { ...menu, items };
	}
);

/**
 * Create navigation menu
 */
export const createNavigationMenu = form(CreateNavigationMenuSchema, async (data) => {
	console.log('Creating navigation menu with data:', data);
    const event = getRequestEvent();
	const user = event?.locals?.user;

    console.log('User in createNavigationMenu:', user);

	if (!user) {
        console.log('Authentication required');
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
        console.log('Admin access required');
		throw new Error('Admin access required');
	}

    console.log('Creating navigation menu with data:', data);
	const [menu] = await db
		.insert(tables.navigationMenu)
		.values({
			id: crypto.randomUUID(),
			name: data.name,
			location: data.location,
			isActive: data.isActive ?? true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	await getAllNavigationMenus().refresh();
	return menu;
});

/**
 * Update navigation menu
 */
export const updateNavigationMenu = form(UpdateNavigationMenuSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const updateData: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.name !== undefined) updateData.name = data.name;
	if (data.location !== undefined) updateData.location = data.location;
	if (data.isActive !== undefined) updateData.isActive = data.isActive;

	const [updated] = await db
		.update(tables.navigationMenu)
		.set(updateData)
		.where(eq(tables.navigationMenu.id, data.id))
		.returning();

	await getAllNavigationMenus().refresh();
	return updated;
});

/**
 * Delete navigation menu
 */
export const deleteNavigationMenu = form(DeleteNavigationMenuSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	await db.delete(tables.navigationMenu).where(eq(tables.navigationMenu.id, data.id));

	await getAllNavigationMenus().refresh();
	return { success: true };
});

// ============= NAVIGATION MENU ITEMS =============

/**
 * Get all menu items for a menu
 */
export const getNavigationMenuItems = query(v.string(), async (menuId) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const items = await db
		.select()
		.from(tables.navigationMenuItem)
		.where(eq(tables.navigationMenuItem.menuId, menuId))
		.orderBy(tables.navigationMenuItem.displayOrder);

	return items;
});

/**
 * Create navigation menu item
 */
export const createNavigationMenuItem = form(CreateNavigationMenuItemSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const [item] = await db
		.insert(tables.navigationMenuItem)
		.values({
			id: crypto.randomUUID(),
			menuId: data.menuId,
			label: data.label,
			url: data.url,
			parentId: data.parentId ?? null,
			displayOrder: data.displayOrder ?? 0,
			openInNewTab: data.openInNewTab ?? false,
			isVisible: data.isVisible ?? true,
			icon: data.icon ?? null,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	await getNavigationMenuItems(data.menuId).refresh();
	return item;
});

/**
 * Update navigation menu item
 */
export const updateNavigationMenuItem = form(UpdateNavigationMenuItemSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const updateData: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.label !== undefined) updateData.label = data.label;
	if (data.url !== undefined) updateData.url = data.url;
	if (data.parentId !== undefined) updateData.parentId = data.parentId;
	if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
	if (data.openInNewTab !== undefined) updateData.openInNewTab = data.openInNewTab;
	if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
	if (data.icon !== undefined) updateData.icon = data.icon;

	const [updated] = await db
		.update(tables.navigationMenuItem)
		.set(updateData)
		.where(eq(tables.navigationMenuItem.id, data.id as string))
		.returning();

	// Refresh the menu items list
	if (updated) {
		await getNavigationMenuItems(updated.menuId).refresh();
	}

	return updated;
});

/**
 * Delete navigation menu item
 */
export const deleteNavigationMenuItem = form(DeleteNavigationMenuItemSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	// Get the item first to know which menu to refresh
	const [item] = await db
		.select()
		.from(tables.navigationMenuItem)
		.where(eq(tables.navigationMenuItem.id, data.id));

	if (!item) {
		return { success: false, message: 'Item not found' };
	}

	await db.delete(tables.navigationMenuItem).where(eq(tables.navigationMenuItem.id, data.id));

	await getNavigationMenuItems(item.menuId).refresh();
	return { success: true };
});

// ============= CONTACT PHONES =============

/**
 * Get all contact phones
 */
export const getAllContactPhones = query(async () => {
	const phones = await db
		.select()
		.from(tables.contactPhone)
		.where(eq(tables.contactPhone.isActive, true))
		.orderBy(tables.contactPhone.displayOrder);

	return phones;
});

/**
 * Get all contact phones (admin - includes inactive)
 */
export const getAllContactPhonesAdmin = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const phones = await db
		.select()
		.from(tables.contactPhone)
		.orderBy(tables.contactPhone.displayOrder);

	return phones;
});

/**
 * Create contact phone
 */
export const createContactPhone = form(CreateContactPhoneSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const [phone] = await db
		.insert(tables.contactPhone)
		.values({
			id: crypto.randomUUID(),
			phoneNumber: data.phoneNumber,
			label: data.label ?? null,
			displayOrder: data.displayOrder ?? 0,
			isActive: data.isActive ?? true,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	await getAllContactPhones().refresh();
	await getAllContactPhonesAdmin().refresh();
	return phone;
});

/**
 * Update contact phone
 */
export const updateContactPhone = form(UpdateContactPhoneSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	const updateData: Record<string, unknown> = {
		updatedAt: new Date()
	};

	if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
	if (data.label !== undefined) updateData.label = data.label;
	if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
	if (data.isActive !== undefined) updateData.isActive = data.isActive;

	const [updated] = await db
		.update(tables.contactPhone)
		.set(updateData)
		.where(eq(tables.contactPhone.id, data.id as string))
		.returning();

	await getAllContactPhones().refresh();
	await getAllContactPhonesAdmin().refresh();
	return updated;
});

/**
 * Delete contact phone
 */
export const deleteContactPhone = form(DeleteContactPhoneSchema, async (data) => {
	const event = getRequestEvent();
	const user = event?.locals?.user;

	if (!user) {
		throw new Error('Authentication required');
	}

	if (!user.isAdmin) {
		throw new Error('Admin access required');
	}

	await db.delete(tables.contactPhone).where(eq(tables.contactPhone.id, data.id));

	await getAllContactPhones().refresh();
	await getAllContactPhonesAdmin().refresh();
	return { success: true };
});
