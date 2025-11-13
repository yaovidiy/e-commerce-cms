import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

if (!env.CLOUDFLARE_ACCOUNT_ID) {
	throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is not set');
}
if (!env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
	throw new Error('CLOUDFLARE_R2_ACCESS_KEY_ID environment variable is not set');
}
if (!env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
	throw new Error('CLOUDFLARE_R2_SECRET_ACCESS_KEY environment variable is not set');
}
if (!env.CLOUDFLARE_R2_BUCKET_NAME) {
	throw new Error('CLOUDFLARE_R2_BUCKET_NAME environment variable is not set');
}

const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = env.CLOUDFLARE_R2_PUBLIC_URL || '';

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
	region: 'auto',
	endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: ACCESS_KEY_ID,
		secretAccessKey: SECRET_ACCESS_KEY
	}
});

/**
 * Upload a file to Cloudflare R2
 * @param key - The unique key/path for the file in R2
 * @param body - The file buffer to upload
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		Body: body,
		ContentType: contentType
	});

	await r2Client.send(command);

	// Return the public URL
	if (PUBLIC_URL) {
		return `${PUBLIC_URL}/${key}`;
	}

	// Fallback to R2 endpoint if no public URL is configured
	return `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;
}

/**
 * Delete a file from Cloudflare R2
 * @param key - The unique key/path of the file in R2
 */
export async function deleteFromR2(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	});

	await r2Client.send(command);
}

/**
 * Get a file from Cloudflare R2
 * @param key - The unique key/path of the file in R2
 * @returns The file buffer
 */
export async function getFromR2(key: string): Promise<Buffer> {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	});

	const response = await r2Client.send(command);

	if (!response.Body) {
		throw new Error('No body in R2 response');
	}

	// Convert stream to buffer
	const chunks: Uint8Array[] = [];
	// @ts-expect-error - AWS SDK response body is a stream
	for await (const chunk of response.Body) {
		chunks.push(chunk);
	}

	return Buffer.concat(chunks);
}

/**
 * Extract the key from an R2 URL
 * @param url - The full R2 URL
 * @returns The key/path of the file
 */
export function extractKeyFromUrl(url: string): string {
	if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
		return url.replace(`${PUBLIC_URL}/`, '');
	}

	// Fallback for non-public URLs
	const urlParts = url.split('/');
	return urlParts[urlParts.length - 1];
}
