import sharp from 'sharp';

export interface OptimizedImages {
	original: Buffer;
	thumbnail: Buffer;
	originalSize: number;
	thumbnailSize: number;
}

export interface ImageDimensions {
	width: number;
	height: number;
}

// Formats that support transparency
const TRANSPARENCY_FORMATS = ['png', 'webp', 'gif', 'svg'];

/**
 * Check if the image format supports transparency
 */
function supportsTransparency(format: string | undefined): boolean {
	if (!format) return false;
	return TRANSPARENCY_FORMATS.includes(format.toLowerCase());
}

/**
 * Optimize and resize an image while preserving format for images with transparency
 * @param buffer - The original image buffer
 * @param maxWidth - Maximum width for the optimized image
 * @param maxHeight - Maximum height for the optimized image
 * @param quality - Quality (1-100)
 * @param format - Original image format (optional, will be detected if not provided)
 * @returns Optimized image buffer
 */
export async function optimizeImage(
	buffer: Buffer,
	maxWidth: number = 1920,
	maxHeight: number = 1080,
	quality: number = 85,
	format?: string
): Promise<Buffer> {
	const metadata = await sharp(buffer).metadata();
	const imageFormat = format || metadata.format;

	const pipeline = sharp(buffer).resize(maxWidth, maxHeight, {
		fit: 'inside',
		withoutEnlargement: true
	});

	// Preserve format for images that support transparency
	if (supportsTransparency(imageFormat)) {
		if (imageFormat === 'png') {
			return pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
		} else if (imageFormat === 'webp') {
			return pipeline.webp({ quality }).toBuffer();
		} else if (imageFormat === 'gif') {
			return pipeline.gif().toBuffer();
		}
	}

	// Default to JPEG for non-transparent formats
	return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
}

/**
 * Create a thumbnail from an image while preserving format for images with transparency
 * @param buffer - The original image buffer
 * @param size - Thumbnail size (width/height will be this value, maintaining aspect ratio)
 * @param quality - Quality (1-100)
 * @param format - Original image format (optional, will be detected if not provided)
 * @returns Thumbnail buffer
 */
export async function createThumbnail(
	buffer: Buffer,
	size: number = 200,
	quality: number = 80,
	format?: string
): Promise<Buffer> {
	const metadata = await sharp(buffer).metadata();
	const imageFormat = format || metadata.format;

	const pipeline = sharp(buffer).resize(size, size, {
		fit: 'cover',
		position: 'center'
	});

	// Preserve format for images that support transparency
	if (supportsTransparency(imageFormat)) {
		if (imageFormat === 'png') {
			return pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
		} else if (imageFormat === 'webp') {
			return pipeline.webp({ quality }).toBuffer();
		} else if (imageFormat === 'gif') {
			return pipeline.gif().toBuffer();
		}
	}

	// Default to JPEG for non-transparent formats
	return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
}

/**
 * Process an image: optimize the original and create a thumbnail
 * @param buffer - The original image buffer
 * @param mimeType - Original MIME type (optional, used to determine format)
 * @returns Object containing optimized original and thumbnail
 */
export async function processImage(buffer: Buffer, mimeType?: string): Promise<OptimizedImages> {
	// Get format from metadata or mime type
	const metadata = await sharp(buffer).metadata();
	const format = metadata.format || mimeType?.split('/')[1];

	// Optimize the original image (max 1920x1080, quality 85)
	const optimizedOriginal = await optimizeImage(buffer, 1920, 1080, 85, format);

	// Create thumbnail (200x200, quality 80)
	const thumbnail = await createThumbnail(buffer, 200, 80, format);

	return {
		original: optimizedOriginal,
		thumbnail: thumbnail,
		originalSize: optimizedOriginal.length,
		thumbnailSize: thumbnail.length
	};
}

/**
 * Get image dimensions
 * @param buffer - The image buffer
 * @returns Image dimensions (width and height)
 */
export async function getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
	const metadata = await sharp(buffer).metadata();

	return {
		width: metadata.width || 0,
		height: metadata.height || 0
	};
}

/**
 * Validate if a buffer is a valid image
 * @param buffer - The buffer to validate
 * @returns True if valid image, false otherwise
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
	try {
		await sharp(buffer).metadata();
		return true;
	} catch {
		return false;
	}
}

/**
 * Convert image to WebP format
 * @param buffer - The original image buffer
 * @param quality - WebP quality (1-100)
 * @returns WebP buffer
 */
export async function convertToWebP(buffer: Buffer, quality: number = 85): Promise<Buffer> {
	return sharp(buffer).webp({ quality }).toBuffer();
}
