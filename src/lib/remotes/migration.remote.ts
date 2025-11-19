import { command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { requireAdminUser } from '$lib/server/auth';
import { uploadToR2 } from '$lib/server/r2';
import { processImage, isValidImage } from '$lib/server/image-optimizer';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import mime from 'mime-types';
import { generateSlug } from '$lib/utils';

/**
 * Create category if it doesn't exist, return existing or new ID
 */
export const createCategoryIfNotExists = command(
    v.object({
        name: v.pipe(v.string(), v.nonEmpty())
    }),
    async (data) => {
        console.log(data, 'createCategoryIfNotExists data');
        requireAdminUser();

        // Check if category exists
        const [existing] = await db
            .select()
            .from(tables.category)
            .where(eq(tables.category.name, data.name));

        if (existing) {
            return { id: existing.id, created: false };
        }

        // Create new category
        const slug = generateSlug(data.name);
        const [category] = await db
            .insert(tables.category)
            .values({
                id: crypto.randomUUID(),
                name: data.name,
                slug,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        return { id: category.id, created: true };
    }
);

/**
 * Upload file from URL to R2 and create asset record
 */
export const uploadFileFromUrl = command(
    v.object({
        url: v.string(),
        filename: v.pipe(v.string(), v.nonEmpty())
    }),
    async (data) => {
        const user = requireAdminUser();

        const BASE_URL = 'https://crm.thespiceroom.com.ua'; // Replace with your actual base URL

        try {
            const [existingAsset] = await db
                .select()
                .from(tables.asset)
                .where(eq(tables.asset.originalFilename, data.filename));

            if (existingAsset) {
                return existingAsset;
            }

            // Download file from URL
            const response = await fetch(`${BASE_URL}${data.url}`);
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const mimeType = response.headers.get('content-type') || mime.lookup(data.filename) || 'application/octet-stream';

            // Validate if it's an image
            if (mimeType.startsWith('image/') && !(await isValidImage(buffer))) {
                throw new Error('Invalid image file');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = mime.extension(mimeType) || 'jpg';
            const filename = `${timestamp}-${randomString}.${extension}`;
            let thumbnailFilename: string | undefined;
            let thumbnailUrl: string | undefined;

            let processedBuffer = buffer;

            // Process image if it's an image
            if (mimeType.startsWith('image/')) {
                thumbnailFilename = `${timestamp}-${randomString}-thumb.${extension}`;
                const { original, thumbnail } = await processImage(buffer);
                processedBuffer = original;

                // Upload thumbnail
                thumbnailUrl = await uploadToR2(`images/${thumbnailFilename}`, thumbnail, mimeType);
            }

            // Upload original to R2
            const url = await uploadToR2(`images/${filename}`, processedBuffer, mimeType);

            // Save metadata to database
            const [asset] = await db
                .insert(tables.asset)
                .values({
                    id: crypto.randomUUID(),
                    filename,
                    originalFilename: data.filename,
                    mimeType,
                    size: processedBuffer.length,
                    url,
                    thumbnailUrl,
                    uploadedBy: user.id,
                    createdAt: new Date()
                })
                .returning();

            return asset;
        } catch (error) {
            throw new Error(`Failed to upload file from URL: ${error}`);
        }
    }
);

/**
 * Create product
 */
export const createProduct = command(
    v.object({
        name: v.pipe(v.string(), v.nonEmpty()),
        description: v.optional(v.string()),
        slug: v.pipe(v.string(), v.nonEmpty()),
        price: v.pipe(v.number(), v.minValue(0)),
        categoryId: v.optional(v.string()),
        images: v.optional(v.array(v.string())), // array of asset IDs
        status: v.optional(v.picklist(['draft', 'active', 'archived']), 'draft')
    }),
    async (data) => {
        requireAdminUser();

        const [existingProduct] = await db
            .select()
            .from(tables.product)
            .where(eq(tables.product.slug, data.slug));

        if (existingProduct) {
            throw new Error(`Product with slug "${data.slug}" already exists.`);
        }

        const [product] = await db
            .insert(tables.product)
            .values({
                id: crypto.randomUUID(),
                name: data.name,
                description: data.description || '',
                slug: data.slug,
                price: Math.round(data.price * 100), // convert to cents
                categoryId: data.categoryId,
                images: data.images ? JSON.stringify(data.images) : '[]',
                status: data.status,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();

        return product;
    }
);

export const createBlogCommand = command(
    v.object({
        title: v.pipe(v.string(), v.nonEmpty()),
        content: v.pipe(v.string(), v.nonEmpty()),
        slug: v.pipe(v.string(), v.nonEmpty()),
        authorId: v.pipe(v.string(), v.nonEmpty())
    }),
    async (data) => {
        requireAdminUser();

        const [blog] = await db
            .insert(tables.blog)
            .values({
                id: crypto.randomUUID(),
                title: data.title,
                content: data.content,
                slug: data.slug,
                authorId: data.authorId,
                createdAt: new Date()
            })
            .returning();

        return blog;
    }
);
