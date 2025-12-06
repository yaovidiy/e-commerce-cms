import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { requireAdminUser } from '$lib/server/auth';
import { uploadToR2 } from '$lib/server/r2';
import { processImage, isValidImage } from '$lib/server/image-optimizer';
import { eq } from 'drizzle-orm';
import mime from 'mime-types';
import { generateSlug } from '$lib/utils';

// In-memory migration state storage (use database for production)
interface MigrationState {
	userId: string;
	status: 'running' | 'paused' | 'completed' | 'error';
	totalItems: number;
	processedItems: number;
	currentItem: string;
	error?: string;
	startedAt: number;
	lastUpdate: number;
}

const migrationStates = new Map<string, MigrationState>();

export const GET: RequestHandler = async () => {
	try {
		const user = requireAdminUser();
		const state = migrationStates.get(user.id);

		if (!state) {
			return new Response(
				JSON.stringify({
					status: 'no-migration',
					message: 'No active migration found'
				}),
				{ headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(JSON.stringify(state), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				status: 'error',
				message: error instanceof Error ? error.message : 'Failed to get migration status'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export const DELETE: RequestHandler = async () => {
	try {
		const user = requireAdminUser();
		migrationStates.delete(user.id);

		return new Response(
			JSON.stringify({ success: true }),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				status: 'error',
				message: error instanceof Error ? error.message : 'Failed to clear migration status'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const user = requireAdminUser();
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const baseUrl = formData.get('baseUrl') as string;

		if (!file) {
			return new Response('Missing file', { status: 400 });
		}

		if (!baseUrl) {
			return new Response('Missing baseUrl', { status: 400 });
		}

		// Parse the JSON data
		let data: Record<string, unknown>;
		try {
			const fileContent = await file.text();
			const parsed = JSON.parse(fileContent) as Record<string, unknown>;
			data = (parsed?.data as Record<string, unknown>) || {};
		} catch {
			return new Response('Invalid JSON file', { status: 400 });
		}

		const categories = Object.values(data['api::category.category'] || {});
		const files = Object.values(data['plugin::upload.file'] || {});
		const products = Object.values(data['api::product.product'] || {});
		const blogs = Object.values(data['api::blog.blog'] || {});

		const totalItems = categories.length + files.length + products.length + blogs.length;

		// Initialize migration state
		const migrationState: MigrationState = {
			userId: user.id,
			status: 'running',
			totalItems,
			processedItems: 0,
			currentItem: '',
			startedAt: Date.now(),
			lastUpdate: Date.now()
		};
		migrationStates.set(user.id, migrationState);

		// Create a readable stream with SSE
		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					// Send initial event
					controller.enqueue(
						new TextEncoder().encode(
							`data: ${JSON.stringify({ type: 'start', total: totalItems })}\n\n`
						)
					);

					// Maps for IDs
					const categoryIdMap = new Map<string, string>();
					const fileIdMap = new Map<string, string>();
					let processedCount = 0;

					// Process categories
					for (const category of categories as unknown[]) {
						const cat = category as Record<string, unknown>;
						try {
							const slug = generateSlug(cat.title as string);

							// Check if category exists by slug
							const [existing] = await db
								.select()
								.from(tables.category)
								.where(eq(tables.category.slug, slug));

							let categoryId: string;
							if (existing) {
								categoryId = existing.id;
							} else {
								const [newCategory] = await db
									.insert(tables.category)
									.values({
										id: crypto.randomUUID(),
										name: cat.title as string,
										slug,
										createdAt: new Date(),
										updatedAt: new Date()
									})
									.returning();
								categoryId = newCategory.id;
							}

						categoryIdMap.set(cat.id as string, categoryId);

						processedCount++;

						// Update migration state
						migrationState.processedItems = processedCount;
						migrationState.currentItem = `Category: ${cat.title}`;
						migrationState.lastUpdate = Date.now();

						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									type: 'progress',
									current: processedCount,
									total: totalItems,
									item: `Category: ${cat.title}`
								})}\n\n`
							)
						);
						} catch (error) {
							console.error('Category error:', error);
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({
										type: 'error',
										message: `Error processing category: ${error}`
									})}\n\n`
								)
							);
						}
					}

					// Process files
					for (const fileData of files as unknown[]) {
						const file = fileData as Record<string, unknown>;
						try {
							// Check if file already exists
							const [existingAsset] = await db
								.select()
								.from(tables.asset)
								.where(eq(tables.asset.originalFilename, file.name as string));

							let assetId: string;
							if (existingAsset) {
								assetId = existingAsset.id;
							} else {
							// Download file from URL
							const fullUrl = `${baseUrl}${file.url as string}`;
								const response = await fetch(fullUrl);
								if (!response.ok) {
									throw new Error(
										`Failed to download file: ${response.status} ${response.statusText}`
									);
								}

								const buffer = Buffer.from(await response.arrayBuffer());
								const mimeType =
									response.headers.get('content-type') ||
									mime.lookup(file.name as string) ||
									'application/octet-stream';

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
									processedBuffer = Buffer.from(original);

									// Upload thumbnail
									thumbnailUrl = await uploadToR2(`images/${thumbnailFilename}`, thumbnail, mimeType);
								}

								// Upload original to R2
								const assetUrl = await uploadToR2(`images/${filename}`, processedBuffer, mimeType);

								// Save metadata to database
								const [asset] = await db
									.insert(tables.asset)
									.values({
										id: crypto.randomUUID(),
										filename,
										originalFilename: file.name as string,
										mimeType,
										size: processedBuffer.length,
										url: assetUrl,
										thumbnailUrl,
										uploadedBy: user.id,
										createdAt: new Date()
									})
									.returning();

								assetId = asset.id;
							}

						fileIdMap.set(file.id as string, assetId);

						processedCount++;

						// Update migration state
						migrationState.processedItems = processedCount;
						migrationState.currentItem = `File: ${file.name}`;
						migrationState.lastUpdate = Date.now();

						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									type: 'progress',
									current: processedCount,
									total: totalItems,
									item: `File: ${file.name}`
									})}\n\n`
								)
							);
						} catch (error) {
							console.error('File error:', error);
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({
										type: 'error',
										message: `Error processing file: ${error}`
									})}\n\n`
								)
							);
						}
					}

				// Process products
				for (const product of products as unknown[]) {
					const prod = product as Record<string, unknown>;
					try {
						// Generate slug if missing
						const slug = (prod.slug as string) || generateSlug(prod.title as string);

						// Check if product exists
						const [existing] = await db
							.select()
							.from(tables.product)
							.where(eq(tables.product.slug, slug));

						if (!existing) {
							// Map category ID
							const categoryId = prod.category ? categoryIdMap.get(prod.category as string) : undefined;

							// Map image IDs
							const images = (prod.images as unknown[])
								? (prod.images as unknown[]).map((imgId) => fileIdMap.get(imgId as string)).filter(Boolean)
								: [];

							await db.insert(tables.product).values({
								id: crypto.randomUUID(),
								name: prod.title as string,
								description: (prod.description as string) || '',
								slug,
								price: Math.round(((prod.price as number) || 0) * 100), // convert to cents
								categoryId,
								images: images.length > 0 ? JSON.stringify(images) : '[]',
								status: 'draft',
								createdAt: new Date(),
								updatedAt: new Date()
							});
						}						processedCount++;

						// Update migration state
						migrationState.processedItems = processedCount;
						migrationState.currentItem = `Product: ${prod.title}`;
						migrationState.lastUpdate = Date.now();

						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									type: 'progress',
									current: processedCount,
									total: totalItems,
									item: `Product: ${prod.title}`
									})}\n\n`
								)
							);
						} catch (error) {
							console.error('Product error:', error);
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({
										type: 'error',
										message: `Error processing product: ${error}`
									})}\n\n`
								)
							);
						}
					}

				// Process blogs
				for (const blog of blogs as unknown[]) {
					const bl = blog as Record<string, unknown>;
					try {
						// Generate slug if missing
						const slug = (bl.slug as string) || generateSlug(bl.title as string);

						// Check if blog exists
						const [existing] = await db
							.select()
							.from(tables.blog)
							.where(eq(tables.blog.slug, slug));

						if (!existing) {
							await db.insert(tables.blog).values({
								id: crypto.randomUUID(),
								title: bl.title as string,
								content: bl.content as string,
								slug,
								authorId: user.id,
								createdAt: new Date()
							});
						}						processedCount++;

						// Update migration state
						migrationState.processedItems = processedCount;
						migrationState.currentItem = `Blog: ${bl.title}`;
						migrationState.lastUpdate = Date.now();

						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify({
									type: 'progress',
									current: processedCount,
									total: totalItems,
									item: `Blog: ${bl.title}`
									})}\n\n`
								)
							);
						} catch (error) {
							console.error('Blog error:', error);
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({
										type: 'error',
										message: `Error processing blog: ${error}`
									})}\n\n`
								)
							);
						}
					}

					// Send completion event
					migrationState.status = 'completed';
					controller.enqueue(
						new TextEncoder().encode(
							`data: ${JSON.stringify({
								type: 'complete',
								processed: processedCount,
								total: totalItems
							})}\n\n`
						)
					);

					// Clear migration state after completion
					migrationStates.delete(user.id);
					controller.close();
				} catch (error) {
					console.error('Migration error:', error);
					migrationState.status = 'error';
					migrationState.error = error instanceof Error ? error.message : String(error);
					controller.enqueue(
						new TextEncoder().encode(
							`data: ${JSON.stringify({
								type: 'error',
								message: error instanceof Error ? error.message : String(error)
							})}\n\n`
						)
					);
					controller.close();
				}
			}
		});

		return new Response(readableStream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Migration endpoint error:', error);
		return new Response(
			JSON.stringify({
				type: 'error',
				message: error instanceof Error ? error.message : String(error)
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
