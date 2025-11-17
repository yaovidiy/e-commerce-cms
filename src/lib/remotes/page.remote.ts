import { form, query, command } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq, and, like, desc, asc } from "drizzle-orm";
import * as v from 'valibot';
import {
    CreatePageSchema,
    UpdatePageSchema,
    DeletePageSchema,
    PublishPageSchema,
    FilterPagesSchema
} from "$lib/server/schemas";
import { requireAdminUser } from "$lib/server/auth";
import { error } from "@sveltejs/kit";

/**
 * Get all pages with optional filtering, sorting, and pagination (Admin)
 */
export const getAllPages = query(FilterPagesSchema, async (filters) => {
    requireAdminUser();

    const {
        title = '',
        status = 'all',
        page = 1,
        pageSize = 20,
        sortField = 'updatedAt',
        sortDirection = 'desc'
    } = filters;

    let query = db.select().from(tables.page);

    // Build conditions array
    const conditions = [];

    if (title) {
        conditions.push(like(tables.page.title, `%${title}%`));
    }

    if (status !== 'all') {
        conditions.push(eq(tables.page.status, status));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
    }

    // Apply sorting
    if (sortField === 'title') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.page.title) : desc(tables.page.title)) as typeof query;
    } else if (sortField === 'status') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.page.status) : desc(tables.page.status)) as typeof query;
    } else if (sortField === 'createdAt') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.page.createdAt) : desc(tables.page.createdAt)) as typeof query;
    } else if (sortField === 'publishedAt') {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.page.publishedAt) : desc(tables.page.publishedAt)) as typeof query;
    } else {
        query = query.orderBy(sortDirection === 'asc' ? asc(tables.page.updatedAt) : desc(tables.page.updatedAt)) as typeof query;
    }

    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset) as typeof query;

    const pages = await query;

    // Get total count for pagination
    let countQuery = db.select().from(tables.page);
    if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const totalPages = await countQuery;
    const totalCount = totalPages.length;

    return {
        pages,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize)
        }
    };
});

/**
 * Get a single page by ID (Admin)
 */
export const getPageById = query(v.string(), async (id) => {
    requireAdminUser();
    const [page] = await db.select().from(tables.page).where(eq(tables.page.id, id));
    if (!page) error(404, 'Page not found');
    return page;
});

/**
 * Get a published page by slug (Customer-facing)
 */
export const getPageBySlug = query(v.string(), async (slug) => {
    const [page] = await db.select()
        .from(tables.page)
        .where(
            and(
                eq(tables.page.slug, slug),
                eq(tables.page.status, 'published')
            )
        );
    
    if (!page) error(404, 'Page not found');
    return page;
});

/**
 * Create a new page
 */
export const createPage = form(CreatePageSchema, async (data) => {
    requireAdminUser();

    const now = new Date();

    // Check if slug already exists
    const [existing] = await db.select()
        .from(tables.page)
        .where(eq(tables.page.slug, data.slug));
    
    if (existing) {
        error(400, 'A page with this slug already exists');
    }

    const [newPage] = await db.insert(tables.page).values({
        id: crypto.randomUUID(),
        title: data.title,
        slug: data.slug,
        content: data.content || '[]', // Empty array of blocks
        template: data.template || 'default',
        status: data.status || 'draft',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        createdAt: now,
        updatedAt: now,
        publishedAt: data.status === 'published' ? now : null
    }).returning();

    // Refresh pages list
    await getAllPages({
        title: '',
        status: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'updatedAt',
        sortDirection: 'desc'
    }).refresh();

    return newPage;
});

/**
 * Update an existing page
 */
export const updatePage = form(UpdatePageSchema, async (data) => {
    requireAdminUser();

    const now = new Date();

    // Check if page exists
    const [existing] = await db.select()
        .from(tables.page)
        .where(eq(tables.page.id, data.id));
    
    if (!existing) {
        error(404, 'Page not found');
    }

    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== existing.slug) {
        const [slugExists] = await db.select()
            .from(tables.page)
            .where(eq(tables.page.slug, data.slug));
        
        if (slugExists) {
            error(400, 'A page with this slug already exists');
        }
    }

    const updateData: Partial<typeof tables.page.$inferInsert> = {
        updatedAt: now
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.template !== undefined) updateData.template = data.template;
    if (data.status !== undefined) {
        updateData.status = data.status;
        // Set publishedAt if publishing for the first time
        if (data.status === 'published' && !existing.publishedAt) {
            updateData.publishedAt = now;
        }
        // Clear publishedAt if unpublishing
        if (data.status === 'draft') {
            updateData.publishedAt = null;
        }
    }
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle || null;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription || null;

    const [updatedPage] = await db.update(tables.page)
        .set(updateData)
        .where(eq(tables.page.id, data.id))
        .returning();

    // Refresh pages list
    await getAllPages({
        title: '',
        status: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'updatedAt',
        sortDirection: 'desc'
    }).refresh();

    return updatedPage;
});

/**
 * Delete a page
 */
export const deletePage = form(DeletePageSchema, async (data) => {
    requireAdminUser();

    const [page] = await db.select()
        .from(tables.page)
        .where(eq(tables.page.id, data.id));
    
    if (!page) {
        error(404, 'Page not found');
    }

    await db.delete(tables.page).where(eq(tables.page.id, data.id));

    // Refresh pages list
    await getAllPages({
        title: '',
        status: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'updatedAt',
        sortDirection: 'desc'
    }).refresh();

    return { success: true };
});

/**
 * Toggle page publish status (command for quick toggle)
 */
export const togglePageStatus = command(PublishPageSchema, async (data) => {
    requireAdminUser();

    const now = new Date();

    const [existing] = await db.select()
        .from(tables.page)
        .where(eq(tables.page.id, data.id));
    
    if (!existing) {
        error(404, 'Page not found');
    }

    const newStatus = data.publish ? 'published' : 'draft';
    const publishedAt = data.publish ? (existing.publishedAt || now) : null;

    await db.update(tables.page)
        .set({
            status: newStatus,
            publishedAt,
            updatedAt: now
        })
        .where(eq(tables.page.id, data.id));

    // Refresh pages list
    await getAllPages({
        title: '',
        status: 'all',
        page: 1,
        pageSize: 20,
        sortField: 'updatedAt',
        sortDirection: 'desc'
    }).refresh();

    return { success: true, status: newStatus };
});
