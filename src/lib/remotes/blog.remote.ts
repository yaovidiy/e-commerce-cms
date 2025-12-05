import { form, query } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq, like, and, desc, count } from "drizzle-orm";
import * as v from 'valibot';
import { CreateBlogSchema, UpdateBlogSchema, DeleteBlogSchema, GetBlogsSchema } from "$lib/server/schemas";
import { requireAdminUser } from "$lib/server/auth";
import { createPaginatedResponse, calculatePagination } from "$lib/server/pagination-utils";

// ===== PUBLIC QUERIES (No Auth Required) =====

export const getAllPublishedBlogs = query(GetBlogsSchema, async (data) => {
    let baseQuery = db.select().from(tables.blog);
    const conditions = [];
    
    // Search in title
    if (data.search) {
        conditions.push(like(tables.blog.title, `%${data.search}%`));
    }
    
    // Apply conditions
    if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
    }
    
    // Order by newest first
    baseQuery = baseQuery.orderBy(desc(tables.blog.createdAt)) as typeof baseQuery;
    
    // Count
    let countQuery = db.select({ count: count() }).from(tables.blog);
    if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    
    const [countResult] = await countQuery;
    const totalCount = Number(countResult?.count) || 0;
    
    // Paginate
    const { offset, limit } = calculatePagination(data.page, data.pageSize);
    const blogs = await baseQuery.limit(limit).offset(offset);
    
    // Return
    return createPaginatedResponse(blogs, totalCount, {
        page: data.page,
        pageSize: data.pageSize
    });
});

export const getPublishedBlog = query(v.string(), async (slug) => {
    const [blog] = await db.select().from(tables.blog).where(eq(tables.blog.slug, slug));
    return blog;
});

export const getPublishedBlogById = query(v.string(), async (id) => {
    const [blog] = await db.select().from(tables.blog).where(eq(tables.blog.id, id));
    return blog;
});

// ===== ADMIN QUERIES (Require Admin Auth) =====

export const getAllBlogs = query(GetBlogsSchema, async (data) => {
    requireAdminUser();
    
    let baseQuery = db.select().from(tables.blog);
    const conditions = [];
    
    // Search in title
    if (data.search) {
        conditions.push(like(tables.blog.title, `%${data.search}%`));
    }
    
    // Apply conditions
    if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
    }
    
    // Order by newest first
    baseQuery = baseQuery.orderBy(desc(tables.blog.createdAt)) as typeof baseQuery;
    
    // Count
    let countQuery = db.select({ count: count() }).from(tables.blog);
    if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    
    const [countResult] = await countQuery;
    const totalCount = Number(countResult?.count) || 0;
    
    // Paginate
    const { offset, limit } = calculatePagination(data.page, data.pageSize);
    const blogs = await baseQuery.limit(limit).offset(offset);
    
    // Return
    return createPaginatedResponse(blogs, totalCount, {
        page: data.page,
        pageSize: data.pageSize
    });
});

export const getBlog = query(v.string(), async (slug) => {
    requireAdminUser();
    const [blog] = await db.select().from(tables.blog).where(eq(tables.blog.slug, slug));
    return blog;
});

export const getBlogById = query(v.string(), async (id) => {
    requireAdminUser();
    const [blog] = await db.select().from(tables.blog).where(eq(tables.blog.id, id));
    return blog;
});

export const getBlogsByAuthor = query(v.string(), async (authorId) => {
    requireAdminUser();
    const blogs = await db.select().from(tables.blog).where(eq(tables.blog.authorId, authorId));
    return blogs;
});

export const searchBlogsByTitle = query(v.string(), async (title) => {
    requireAdminUser();
    const blogs = await db.select().from(tables.blog).where(like(tables.blog.title, `%${title}%`));
    return blogs;
});

export const createBlog = form(CreateBlogSchema, async (data) => {
    const user = requireAdminUser();
    const newBlog = await db.insert(tables.blog).values({
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        slug: data.slug,
        authorId: user.id,
        createdAt: new Date()
    }).returning();

    await getAllBlogs({ search: '', page: 1, pageSize: 10 }).refresh();
    return newBlog[0];
});

export const updateBlog = form(UpdateBlogSchema, async ({ id, title, content, slug }) => {
    requireAdminUser();
    const [updatedBlog] = await db.update(tables.blog).set({
        title,
        content,
        slug
    }).where(eq(tables.blog.id, id)).returning();

    await getAllBlogs({ search: '', page: 1, pageSize: 10 }).refresh();
    return updatedBlog;
})

export const deleteBlog = form(DeleteBlogSchema, async ({ id }) => {
    requireAdminUser();
    await db.delete(tables.blog).where(eq(tables.blog.id, id));
    await getAllBlogs({ search: '', page: 1, pageSize: 10 }).refresh();
    return { success: true };
})