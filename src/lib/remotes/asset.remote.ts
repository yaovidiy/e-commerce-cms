import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { DeleteAssetSchema, FilterAssetsSchema } from '$lib/server/schemas';
import { requireAdminUser } from '$lib/server/auth';
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from '$lib/server/r2';
import { processImage, isValidImage } from '$lib/server/image-optimizer';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import { eq, like, and, count, desc } from 'drizzle-orm';
import * as v from 'valibot';
import mime from 'mime-types';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload a file to R2 and store metadata in database
 */
export const uploadAsset = form(
	v.object({
		file: v.pipe(
			v.file(),
			v.mimeType(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
			v.maxSize(MAX_FILE_SIZE)
		)
	}),
	async (data) => {
		const user = requireAdminUser();

		const file = data.file;
		const buffer = Buffer.from(await file.arrayBuffer());

		// Validate it's a real image
		if (!(await isValidImage(buffer))) {
			throw new Error('Invalid image file');
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = mime.extension(file.type) || 'jpg';
		const filename = `${timestamp}-${randomString}.${extension}`;
		const thumbnailFilename = `${timestamp}-${randomString}-thumb.${extension}`;

		// Process image (optimize and create thumbnail), preserving format for transparency
		const { original, thumbnail } = await processImage(buffer, file.type);

		// Upload original to R2
		const url = await uploadToR2(`images/${filename}`, original, file.type);

		// Upload thumbnail to R2
		const thumbnailUrl = await uploadToR2(`images/${thumbnailFilename}`, thumbnail, file.type);

		// Save metadata to database
		const [asset] = await db
			.insert(tables.asset)
			.values({
				id: crypto.randomUUID(),
				filename,
				originalFilename: file.name,
				mimeType: file.type,
				size: original.length,
				url,
				thumbnailUrl,
				uploadedBy: user.id,
				createdAt: new Date()
			})
			.returning();

		// Refresh assets list
		await getAllAssets({ filename: '', mimeType: '', page: 1, pageSize: 20 }).refresh();

		return asset;
	}
);

/**
 * Get all assets with optional filtering
 */
export const getAllAssets = query(FilterAssetsSchema, async (data) => {
	requireAdminUser();

	// 1. Start with base query
	let baseQuery = db.select().from(tables.asset);

	// 2. Build conditions separately
	const conditions = [];

	if (data.filename) {
		conditions.push(like(tables.asset.originalFilename, `%${data.filename}%`));
	}

	if (data.mimeType) {
		conditions.push(eq(tables.asset.mimeType, data.mimeType));
	}

	// 3. Apply conditions
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// 4. Add ordering
	baseQuery = baseQuery.orderBy(desc(tables.asset.createdAt)) as typeof baseQuery;

	// 5. Create count query with same conditions
	let countQuery = db.select({ count: count() }).from(tables.asset);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	// 6. Execute count query
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// 7. Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// 8. Execute data query with pagination
	const assets = await baseQuery.limit(limit).offset(offset);

	// 9. Return using utility
	return createPaginatedResponse(assets, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});

/**
 * Get a single asset by ID
 */
export const getAssetById = query(v.string(), async (id) => {
	// Return null if no ID provided
	if (!id) {
		return null;
	}

	const [asset] = await db.select().from(tables.asset).where(eq(tables.asset.id, id));

	if (!asset) {
		return null;
	}

	return asset;
});

/**
 * Delete an asset from R2 and database
 */
export const deleteAsset = form(DeleteAssetSchema, async (data) => {
	requireAdminUser();

	// Get asset from database
	const [asset] = await db.select().from(tables.asset).where(eq(tables.asset.id, data.id));

	if (!asset) {
		throw new Error('Asset not found');
	}

	// Extract keys from URLs
	const originalKey = extractKeyFromUrl(asset.url);
	const thumbnailKey = asset.thumbnailUrl ? extractKeyFromUrl(asset.thumbnailUrl) : null;

	// Delete from R2
	try {
		await deleteFromR2(originalKey);
		if (thumbnailKey) {
			await deleteFromR2(thumbnailKey);
		}
	} catch (error) {
		console.error('Error deleting from R2:', error);
		// Continue with database deletion even if R2 deletion fails
	}

	// Delete from database
	await db.delete(tables.asset).where(eq(tables.asset.id, data.id));

	// Refresh assets list
	await getAllAssets({ filename: '', mimeType: '', page: 1, pageSize: 20 }).refresh();

	return { success: true };
});

