import { form, query } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq, like } from "drizzle-orm";
import * as v from 'valibot';
import { CreateBlogSchema, UpdateBlogSchema } from "$lib/server/schemas";

export const getAllBlogs = query(async () => {
    const blogs = await db.select().from(tables.blog);
    return blogs;
});

export const getBlog = query(v.string(), async (slug) => {
    const [blog] = await db.select().from(tables.blog).where(eq(tables.blog.slug, slug));
    return blog;
});

export const getBlogsByAuthor = query(v.string(), async (authorId) => {
    const blogs = await db.select().from(tables.blog).where(eq(tables.blog.authorId, authorId));
    return blogs;
});

export const searchBlogsByTitle = query(v.string(), async (title) => {
    const blogs = await db.select().from(tables.blog).where(like(tables.blog.title, `%${title}%`));
    return blogs;
});

export const createBlog = form(CreateBlogSchema, async (data) => {
    const newBlog = await db.insert(tables.blog).values({
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        slug: data.slug,
        authorId: data.authorId,
        createdAt: new Date()
    }).returning();

    return newBlog;
});

export const updateBlog = form(UpdateBlogSchema, async ({ id, title, content, slug }) => {
    const updatedBlog = await db.update(tables.blog).set({
        title,
        content,
        slug
    }).where(eq(tables.blog.id, id));

    return updatedBlog;
})