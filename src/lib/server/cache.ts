/**
 * Server-Side Caching Layer
 * 
 * In-memory cache for frequently accessed data with TTL (Time To Live).
 * Reduces database queries for static or rarely-changing data.
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class Cache<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private ttl: number;

	constructor(ttlMinutes: number) {
		this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
	}

	/**
	 * Get data from cache
	 * @returns cached data or null if expired/not found
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		const now = Date.now();
		if (now - entry.timestamp > this.ttl) {
			// Expired, remove from cache
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set data in cache
	 */
	set(key: string, data: T): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	/**
	 * Check if key exists and is not expired
	 */
	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) return false;

		const now = Date.now();
		if (now - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Invalidate a single cache entry
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Invalidate all entries matching a prefix
	 */
	invalidatePrefix(prefix: string): void {
		for (const key of this.cache.keys()) {
			if (key.startsWith(prefix)) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			size: this.cache.size,
			ttl: this.ttl
		};
	}
}

// Cache instances for different data types
// Product catalog: 10 minutes TTL (changes when products are updated)
export const productCache = new Cache<unknown[]>(10);

// Category tree: 15 minutes TTL (changes when categories are updated)
export const categoryCache = new Cache<unknown[]>(15);

// Site settings: 30 minutes TTL (rarely changes)
export const settingsCache = new Cache<unknown[]>(30);

// Brand list: 15 minutes TTL
export const brandCache = new Cache<unknown[]>(15);

// User data: 5 minutes TTL (for non-sensitive user info)
export const userCache = new Cache<unknown>(5);

/**
 * Helper function to use cache with automatic fallback
 * 
 * @example
 * const products = await withCache(
 *   productCache,
 *   'all-active-products',
 *   async () => await db.select().from(tables.product).where(eq(tables.product.status, 'active'))
 * );
 */
export async function withCache<T>(
	cache: Cache<T>,
	key: string,
	fetcher: () => Promise<T>
): Promise<T> {
	// Try to get from cache
	const cached = cache.get(key);
	if (cached !== null) {
		return cached;
	}

	// Cache miss - fetch from database
	const data = await fetcher();

	// Store in cache
	cache.set(key, data);

	return data;
}

/**
 * Invalidate product-related caches
 * Call this when products are created, updated, or deleted
 */
export function invalidateProductCaches(): void {
	productCache.clear();
}

/**
 * Invalidate category-related caches
 * Call this when categories are created, updated, or deleted
 */
export function invalidateCategoryCaches(): void {
	categoryCache.clear();
	// Also invalidate products since they depend on categories
	productCache.clear();
}

/**
 * Invalidate brand-related caches
 * Call this when brands are created, updated, or deleted
 */
export function invalidateBrandCaches(): void {
	brandCache.clear();
	// Also invalidate products since they depend on brands
	productCache.clear();
}

/**
 * Invalidate settings caches
 * Call this when site settings are updated
 */
export function invalidateSettingsCaches(): void {
	settingsCache.clear();
}
