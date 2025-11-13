import { asc, desc, gt, lt, and, or, eq, type SQLWrapper } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';

/**
 * Cursor values for pagination
 */
export interface CursorValues {
	orderValue: string | number | Date;
	tieValue: string | number;
}

/**
 * Cursor pagination configuration
 */
export interface CursorPaginationConfig {
	/** Primary sort column (e.g., createdAt) */
	orderColumn: SQLiteColumn;
	/** Secondary sort column for stable sorting (usually id) */
	tieBreaker: SQLiteColumn;
	/** Sort direction - 'asc' or 'desc' */
	direction?: 'asc' | 'desc';
	/** Cursor values from last item of previous page */
	cursor?: CursorValues;
	/** Number of items per page */
	limit: number;
}

/**
 * Result of cursor pagination
 */
export interface CursorPaginationResult<T> {
	/** Page items */
	data: T[];
	/** Cursor for next page (null if no more pages) */
	nextCursor: CursorValues | null;
	/** Whether there are more pages */
	hasNext: boolean;
	/** Page size */
	pageSize: number;
}

/**
 * Apply cursor pagination to a Drizzle query
 * 
 * @example
 * ```typescript
 * const result = await applyCursorPagination({
 *   query: db.select().from(tables.user),
 *   orderColumn: tables.user.createdAt,
 *   tieBreaker: tables.user.id,
 *   direction: 'desc',
 *   cursor: previousCursor,
 *   limit: 20
 * });
 * ```
 */
export async function applyCursorPagination<T extends Record<string, unknown>>(
	config: CursorPaginationConfig & { query: unknown }
): Promise<CursorPaginationResult<T>> {
	const { query, orderColumn, tieBreaker, direction = 'desc', cursor, limit } = config;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let paginatedQuery = query as any;

	// Apply cursor condition if provided
	if (cursor) {
		const { orderValue, tieValue } = cursor;

		if (direction === 'desc') {
			// For descending order: (orderColumn < cursor.orderValue) OR 
			// (orderColumn = cursor.orderValue AND tieBreaker < cursor.tieValue)
			paginatedQuery = paginatedQuery.where(
				or(
					lt(orderColumn, orderValue),
					and(eq(orderColumn, orderValue), lt(tieBreaker, tieValue))
				)
			);
		} else {
			// For ascending order: (orderColumn > cursor.orderValue) OR 
			// (orderColumn = cursor.orderValue AND tieBreaker > cursor.tieValue)
			paginatedQuery = paginatedQuery.where(
				or(
					gt(orderColumn, orderValue),
					and(eq(orderColumn, orderValue), gt(tieBreaker, tieValue))
				)
			);
		}
	}

	// Apply ordering
	const orderFn = direction === 'desc' ? desc : asc;
	paginatedQuery = paginatedQuery.orderBy(orderFn(orderColumn), orderFn(tieBreaker));

	// Fetch limit + 1 to check if there's a next page
	const results = await paginatedQuery.limit(limit + 1);

	// Check if there are more results
	const hasNext = results.length > limit;
	const data = hasNext ? results.slice(0, limit) : results;

	// Generate next cursor from last item
	const nextCursor =
		hasNext && data.length > 0
			? {
					orderValue: data[data.length - 1][orderColumn.name],
					tieValue: data[data.length - 1][tieBreaker.name]
				}
			: null;

	return {
		data,
		nextCursor,
		hasNext,
		pageSize: limit
	};
}

/**
 * Offset pagination configuration
 */
export interface OffsetPaginationConfig {
	/** Current page number (1-based) */
	page: number;
	/** Items per page */
	pageSize: number;
}

/**
 * Result of offset pagination
 */
export interface OffsetPaginationResult<T> {
	/** Page items */
	data: T[];
	/** Pagination metadata */
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

/**
 * Apply offset pagination to a Drizzle query
 * 
 * @example
 * ```typescript
 * const result = await applyOffsetPagination({
 *   query: db.select().from(tables.user),
 *   countQuery: db.select({ count: count() }).from(tables.user),
 *   orderBy: [desc(tables.user.createdAt)],
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export async function applyOffsetPagination<T extends Record<string, unknown>>(
	config: OffsetPaginationConfig & {
		query: unknown;
		countQuery: unknown;
		orderBy?: SQLWrapper[];
	}
): Promise<OffsetPaginationResult<T>> {
	const { query, countQuery, orderBy = [], page, pageSize } = config;

	// Calculate offset
	const offset = (page - 1) * pageSize;

	// Get total count
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [countResult] = await (countQuery as any);
	const total = countResult.count;

	// Apply ordering
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let paginatedQuery = query as any;
	if (orderBy.length > 0) {
		paginatedQuery = paginatedQuery.orderBy(...orderBy);
	}

	// Apply pagination
	const data = await paginatedQuery.limit(pageSize).offset(offset);

	return {
		data,
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize),
			hasNext: page * pageSize < total,
			hasPrev: page > 1
		}
	};
}

/**
 * Parse cursor from string (for URL encoding)
 */
export function parseCursor(cursorString: string | null | undefined): CursorValues | undefined {
	if (!cursorString) return undefined;

	try {
		const decoded = Buffer.from(cursorString, 'base64').toString('utf-8');
		return JSON.parse(decoded);
	} catch {
		return undefined;
	}
}

/**
 * Encode cursor to string (for URL encoding)
 */
export function encodeCursor(cursor: CursorValues | null): string | null {
	if (!cursor) return null;

	try {
		const json = JSON.stringify(cursor);
		return Buffer.from(json, 'utf-8').toString('base64');
	} catch {
		return null;
	}
}
