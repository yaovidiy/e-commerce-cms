/**
 * Response structure expected by DataTableWrapper component
 */
export interface PaginatedResponse<T> {
	data: T[];
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	currentPage: number;
	pageSize: number;
	totalCount: number;
}

/**
 * Options for pagination
 */
export interface PaginationOptions {
	page: number;
	pageSize: number;
}

/**
 * Create a paginated response from Drizzle query results
 *
 * @param data - The array of data for the current page
 * @param totalCount - Total count of items matching the filters
 * @param options - Pagination options (page and pageSize)
 * @returns Paginated response with data and pagination metadata
 *
 * @example
 * const conditions = [];
 * if (data.name) {
 *   conditions.push(like(tables.product.name, `%${data.name}%`));
 * }
 *
 * let baseQuery = db.select().from(tables.product);
 * if (conditions.length > 0) {
 *   baseQuery = baseQuery.where(and(...conditions));
 * }
 *
 * const { offset, limit } = calculatePagination(data.page, data.pageSize);
 * const products = await baseQuery.orderBy(desc(tables.product.createdAt)).limit(limit).offset(offset);
 *
 * let countQuery = db.select({ count: count() }).from(tables.product);
 * if (conditions.length > 0) {
 *   countQuery = countQuery.where(and(...conditions));
 * }
 * const countResult = await countQuery;
 * const totalCount = countResult[0]?.count ?? 0;
 *
 * return createPaginatedResponse(products, totalCount, {
 *   page: data.page,
 *   pageSize: data.pageSize
 * });
 */
export function createPaginatedResponse<T>(
	pageData: T[],
	itemCount: number,
	options: PaginationOptions
): PaginatedResponse<T> {
	const { page, pageSize } = options;

	// Validate page and pageSize
	const currentPage = Math.max(0, page);
	const validPageSize = Math.max(1, pageSize);

	// Calculate pagination metadata
	const totalPages = Math.ceil(Math.max(0, itemCount) / validPageSize);
	const isNextPage = currentPage < totalPages;
	const isPreviousPage = currentPage > 1;

	return {
		data: pageData,
		totalPages,
		hasNextPage: isNextPage,
		hasPreviousPage: isPreviousPage,
		currentPage,
		pageSize: validPageSize,
		totalCount: itemCount
	};
}

/**
 * Shorthand: Calculate pagination offset and limit
 *
 * @param page - Current page (1-based)
 * @param pageSize - Items per page
 * @returns Object with offset and limit
 *
 * @example
 * const { offset, limit } = calculatePagination(2, 20);
 * const results = await db.select().from(table).limit(limit).offset(offset);
 */
export function calculatePagination(
	page: number,
	pageSize: number
): { offset: number; limit: number } {
	const currentPage = Math.max(1, page);
	const validPageSize = Math.max(1, pageSize);
	const offset = (currentPage - 1) * validPageSize;

	return {
		offset,
		limit: validPageSize
	};
}

/**
 * Calculate total pages from count
 *
 * @param totalCount - Total number of items
 * @param pageSize - Items per page
 * @returns Total number of pages
 *
 * @example
 * const totalPages = calculateTotalPages(150, 20); // Returns 8
 */
export function calculateTotalPages(totalCount: number, pageSize: number): number {
	return Math.ceil(Math.max(0, totalCount) / Math.max(1, pageSize));
}

/**
 * Check if there is a next page
 *
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total pages available
 * @returns True if there is a next page
 *
 * @example
 * const hasNext = hasNextPage(2, 5); // Returns true
 * const hasNext = hasNextPage(5, 5); // Returns false
 */
export function hasNextPage(currentPage: number, totalPages: number): boolean {
	return currentPage < totalPages;
}

/**
 * Check if there is a previous page
 *
 * @param currentPage - Current page number (1-based)
 * @returns True if there is a previous page
 *
 * @example
 * const hasPrev = hasPreviousPage(1); // Returns false
 * const hasPrev = hasPreviousPage(3); // Returns true
 */
export function hasPreviousPage(currentPage: number): boolean {
	return currentPage > 1;
}
