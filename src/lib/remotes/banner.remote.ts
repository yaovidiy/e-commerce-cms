import { form, query, command } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq, and, or, lte, gte, like, desc, asc, isNull } from "drizzle-orm";
import * as v from 'valibot';
import {
    CreateBannerSchema,
    UpdateBannerSchema,
    DeleteBannerSchema,
    GetBannersByPositionSchema,
    FilterBannersSchema
} from "$lib/server/schemas";
import { requireAdminUser } from "$lib/server/auth";

/**
 * Get all banners with optional filtering, sorting, and pagination
 */
export const getAllBanners = query(FilterBannersSchema, async (filters) => {
    requireAdminUser();

    const {
        title = '',
        position = 'all',
        isActive = 'all',
        page = 1,
        pageSize = 20,
        sortField = 'displayOrder',
        sortDirection = 'asc'
    } = filters;

    let query = db.select({
        id: tables.banner.id,
        title: tables.banner.title,
        imageId: tables.banner.imageId,
        imageUrl: tables.banner.imageUrl,
        assetUrl: tables.asset.url,
        link: tables.banner.link,
        linkText: tables.banner.linkText,
        position: tables.banner.position,
        displayOrder: tables.banner.displayOrder,
        startsAt: tables.banner.startsAt,
        endsAt: tables.banner.endsAt,
        isActive: tables.banner.isActive,
        createdAt: tables.banner.createdAt,
        updatedAt: tables.banner.updatedAt
    })
        .from(tables.banner)
        .leftJoin(tables.asset, eq(tables.banner.imageId, tables.asset.id));

    // Build conditions array
    const conditions = [];

    if (title) {
        conditions.push(like(tables.banner.title, `%${title}%`));
    }

    if (position !== 'all') {
        conditions.push(eq(tables.banner.position, position));
    }

    if (isActive !== 'all') {
        conditions.push(eq(tables.banner.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
    }

    // Apply sorting
    if (sortField === 'title') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.banner.title) : desc(tables.banner.title)) as typeof query;
    } else if (sortField === 'position') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.banner.position) : desc(tables.banner.position)) as typeof query;
    } else if (sortField === 'createdAt') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.banner.createdAt) : desc(tables.banner.createdAt)) as typeof query;
    } else {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.banner.displayOrder) : desc(tables.banner.displayOrder)) as typeof query;
    }

    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset) as typeof query;

    const results = await query;

    // Map results to use assetUrl as imageUrl if available
    const banners = results.map(row => ({
        id: row.id,
        title: row.title,
        imageId: row.imageId,
        imageUrl: row.assetUrl || row.imageUrl,
        link: row.link,
        linkText: row.linkText,
        position: row.position,
        displayOrder: row.displayOrder,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }));

    // Get total count for pagination
    let countQuery = db.select().from(tables.banner);
    if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const totalBanners = await countQuery;
    const totalCount = totalBanners.length;

    return {
        banners,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize)
        }
    };
});

/**
 * Get a single banner by ID
 */
export const getBannerById = query(v.string(), async (id) => {
    requireAdminUser();
    const [banner] = await db.select().from(tables.banner).where(eq(tables.banner.id, id));
    return banner;
});

/**
 * Get active banners for a specific position (customer-facing)
 * Only returns banners that are:
 * - isActive = true
 * - startsAt is null or in the past
 * - endsAt is null or in the future
 */
export const getActiveBannersByPosition = query(GetBannersByPositionSchema, async ({ position, includeInactive = false }) => {
    const now = new Date();
    type BannerPosition = 'home_hero' | 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer';

    if (includeInactive) {
        const results = await db.select({
            id: tables.banner.id,
            title: tables.banner.title,
            imageId: tables.banner.imageId,
            imageUrl: tables.banner.imageUrl,
            assetUrl: tables.asset.url,
            link: tables.banner.link,
            linkText: tables.banner.linkText,
            position: tables.banner.position,
            displayOrder: tables.banner.displayOrder,
            startsAt: tables.banner.startsAt,
            endsAt: tables.banner.endsAt,
            isActive: tables.banner.isActive,
            createdAt: tables.banner.createdAt,
            updatedAt: tables.banner.updatedAt
        })
            .from(tables.banner)
            .leftJoin(tables.asset, eq(tables.banner.imageId, tables.asset.id))
            .where(eq(tables.banner.position, position as BannerPosition))
            .orderBy(asc(tables.banner.displayOrder));

        return results.map(row => ({
            ...row,
            imageUrl: row.assetUrl || row.imageUrl
        }));
    }

    const results = await db.select({
        id: tables.banner.id,
        title: tables.banner.title,
        imageId: tables.banner.imageId,
        imageUrl: tables.banner.imageUrl,
        assetUrl: tables.asset.url,
        link: tables.banner.link,
        linkText: tables.banner.linkText,
        position: tables.banner.position,
        displayOrder: tables.banner.displayOrder,
        startsAt: tables.banner.startsAt,
        endsAt: tables.banner.endsAt,
        isActive: tables.banner.isActive,
        createdAt: tables.banner.createdAt,
        updatedAt: tables.banner.updatedAt
    })
        .from(tables.banner)
        .leftJoin(tables.asset, eq(tables.banner.imageId, tables.asset.id))
        .where(
            and(
                eq(tables.banner.position, position as BannerPosition),
                eq(tables.banner.isActive, true),
                or(
                    isNull(tables.banner.startsAt),
                    lte(tables.banner.startsAt, now)
                ),
                or(
                    isNull(tables.banner.endsAt),
                    gte(tables.banner.endsAt, now)
                )
            )
        )
        .orderBy(asc(tables.banner.displayOrder));

    return results.map(row => ({
        ...row,
        imageUrl: row.assetUrl || row.imageUrl
    }));
});

/**
 * Get all banners for a specific position (admin-facing)
 * Returns all banners regardless of active status
 */
export const getBannersByPosition = query(v.string(), async (position) => {
    requireAdminUser();
    type BannerPosition = 'home_hero' | 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer';
    const banners = await db.select()
        .from(tables.banner)
        .where(eq(tables.banner.position, position as BannerPosition))
        .orderBy(asc(tables.banner.displayOrder));
    return banners;
});

/**
 * Create a new banner
 */
export const createBanner = form(CreateBannerSchema, async (data) => {
    requireAdminUser();

    const now = new Date();

    const [newBanner] = await db.insert(tables.banner).values({
        id: crypto.randomUUID(),
        title: data.title,
        imageId: data.imageId || null,
        imageUrl: data.imageUrl || null,
        link: data.link || null,
        linkText: data.linkText || null,
        position: data.position || 'home_hero',
        displayOrder: data.displayOrder ?? 0,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive ?? true,
        createdAt: now,
        updatedAt: now
    }).returning();

    // Refresh relevant queries
    await getAllBanners({
        title: '',
        position: 'all',
        isActive: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'displayOrder',
        sortDirection: 'asc'
    }).refresh();

    return newBanner;
});

/**
 * Update an existing banner
 */
export const updateBanner = form(UpdateBannerSchema, async (data) => {
    requireAdminUser();

    const updateData: {
        title?: string;
        imageId?: string | null;
        imageUrl?: string | null;
        link?: string | null;
        linkText?: string | null;
        position?: 'home_hero' | 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer';
        displayOrder?: number;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isActive?: boolean;
        updatedAt: Date;
    } = {
        updatedAt: new Date()
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.imageId !== undefined) updateData.imageId = data.imageId || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.link !== undefined) updateData.link = data.link || null;
    if (data.linkText !== undefined) updateData.linkText = data.linkText || null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedBanner] = await db.update(tables.banner)
        .set(updateData)
        .where(eq(tables.banner.id, data.id))
        .returning();

    // Refresh relevant queries
    await getAllBanners({
        title: '',
        position: 'all',
        isActive: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'displayOrder',
        sortDirection: 'asc'
    }).refresh();

    return updatedBanner;
});

/**
 * Delete a banner
 */
export const deleteBanner = form(DeleteBannerSchema, async ({ id }) => {
    requireAdminUser();

    await db.delete(tables.banner).where(eq(tables.banner.id, id));

    // Refresh relevant queries
    await getAllBanners({
        title: '',
        position: 'all',
        isActive: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'displayOrder',
        sortDirection: 'asc'
    }).refresh();

    return { success: true };
});

/**
 * Toggle banner active status
 */
export const toggleBannerStatus = command(v.object({ id: v.string() }), async ({ id }) => {
    requireAdminUser();

    const [banner] = await db.select().from(tables.banner).where(eq(tables.banner.id, id));

    if (!banner) {
        throw new Error('Banner not found');
    }

    const [updatedBanner] = await db.update(tables.banner)
        .set({
            isActive: !banner.isActive,
            updatedAt: new Date()
        })
        .where(eq(tables.banner.id, id))
        .returning();

    // Refresh relevant queries
    await getAllBanners({
        title: '',
        position: 'all',
        isActive: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'displayOrder',
        sortDirection: 'asc'
    }).refresh();

    return updatedBanner;
});

/**
 * Update display order for multiple banners (for drag-and-drop reordering)
 */
export const updateBannerOrder = form(
    v.object({
        banners: v.array(v.object({
            id: v.string(),
            displayOrder: v.number()
        }))
    }),
    async ({ banners }) => {
        requireAdminUser();

        // Update each banner's display order
        for (const banner of banners) {
            await db.update(tables.banner)
                .set({
                    displayOrder: banner.displayOrder,
                    updatedAt: new Date()
                })
                .where(eq(tables.banner.id, banner.id));
        }

        // Refresh relevant queries
        await getAllBanners({
            title: '',
            position: 'all',
            isActive: 'all',
            page: 1,
            pageSize: 20,
            sortField: 'displayOrder',
            sortDirection: 'asc'
        }).refresh();

        return { success: true };
    }
);
