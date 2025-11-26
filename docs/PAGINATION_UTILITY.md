# Pagination Utility Guide

This guide explains how to use the pagination utility functions in remote functions to create standardized paginated responses for the DataTableWrapper component.

## Overview

The pagination utility (`src/lib/server/pagination-utils.ts`) provides:

1. **`createPaginatedResponse<T>()`** - Main function to create paginated responses
2. **`calculatePagination()`** - Helper to calculate offset and limit
3. **`calculateTotalPages()`** - Helper to calculate total pages
4. **Helper functions** for checking next/previous page availability

## Types

### `PaginatedResponse<T>`

Standard response structure expected by DataTableWrapper:

```typescript
interface PaginatedResponse<T> {
  data: T[];              // Items for current page only
  totalPages: number;     // Total pages available
  hasNextPage: boolean;   // Is there a next page?
  currentPage: number;    // Current page (1-based)
  pageSize: number;       // Items per page
  totalCount: number;     // Total items matching filters
}
```

### `PaginationOptions`

Options for pagination:

```typescript
interface PaginationOptions {
  page: number;      // Current page (1-based)
  pageSize: number;  // Items per page
}
```

## Usage Pattern

### Standard Implementation

In your remote function (e.g., `src/lib/remotes/product.remote.ts`):

```typescript
import { query } from '$app/server';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { and, like, eq, desc, count } from 'drizzle-orm';
import * as v from 'valibot';

// Define your schema with pagination fields
const FilterProductsSchema = v.object({
  name: v.optional(v.string(), ''),
  status: v.optional(v.string(), 'all'),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 20)
});

export const getAllProducts = query(FilterProductsSchema, async (data) => {
  // 1. Build base query
  let baseQuery = db.select().from(tables.product);

  // 2. Build conditions array
  const conditions = [];

  if (data.name) {
    conditions.push(like(tables.product.name, `%${data.name}%`));
  }

  if (data.status && data.status !== 'all') {
    conditions.push(eq(tables.product.status, data.status));
  }

  // 3. Apply conditions to base query
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }

  // 4. Add ordering
  baseQuery = baseQuery.orderBy(desc(tables.product.createdAt)) as typeof baseQuery;

  // 5. Get total count (with same conditions)
  let countQuery = db.select({ count: count() }).from(tables.product);

  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }

  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;

  // 6. Calculate pagination
  const { offset, limit } = calculatePagination(data.page, data.pageSize);

  // 7. Apply pagination to query and execute
  const products = await baseQuery.limit(limit).offset(offset);

  // 8. Return paginated response using utility
  return createPaginatedResponse(products, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

### Key Points

1. **Build conditions separately** - Use an array to collect filter conditions
2. **Apply to both queries** - Apply the same conditions to both the count query and data query
3. **Calculate pagination after count** - Get the total count before applying limit/offset
4. **Execute data query with pagination** - Apply limit/offset to the data query only
5. **Use utility to build response** - Let `createPaginatedResponse()` handle response structure

## Helper Functions

### `calculatePagination(page, pageSize)`

Calculate offset and limit for database queries:

```typescript
const { offset, limit } = calculatePagination(2, 20);
// offset = 20 (skip first 20 items)
// limit = 20 (take 20 items)

const products = await db.select()
  .from(tables.product)
  .limit(limit)
  .offset(offset);
```

### `calculateTotalPages(totalCount, pageSize)`

Calculate total pages from count:

```typescript
const totalPages = calculateTotalPages(150, 20); // Returns 8
```

### `hasNextPage(currentPage, totalPages)`

Check if there's a next page:

```typescript
const hasNext = hasNextPage(2, 5); // true
const hasNext = hasNextPage(5, 5); // false
```

### `hasPreviousPage(currentPage)`

Check if there's a previous page:

```typescript
const hasPrev = hasPreviousPage(1); // false
const hasPrev = hasPreviousPage(3); // true
```

## DataTableWrapper Integration

Use the paginated response in components with DataTableWrapper:

```svelte
<script lang="ts">
  import { getAllProducts } from '$lib/remotes/product.remote';
  import { DataTableWrapper } from '$lib/components/common/data-display';
  
  let searchQuery = $state('');
  let currentPage = $state(1);
  let pageSize = $state(20);
  
  // Query parameters change trigger re-query automatically
  async function handlePageChange(pageIndex: number) {
    currentPage = pageIndex + 1; // DataTableWrapper sends 0-based index
  }
</script>

{#await getAllProducts({ 
  name: searchQuery, 
  page: currentPage, 
  pageSize 
}) then response}
  <DataTableWrapper
    data={response.data}
    columns={columns}
    totalPages={response.totalPages}
    page={currentPage}
    pageSize={response.pageSize}
    onPageChange={handlePageChange}
    emptyMessage="No products found"
  />
{/await}
```

## Complete Example: User Management

**Remote function** (`src/lib/remotes/user.remote.ts`):

```typescript
import { query } from '$app/server';
import { requireAdminUser } from '$lib/server/auth';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import * as v from 'valibot';

const FilterUsersSchema = v.object({
  username: v.optional(v.string(), ''),
  role: v.optional(v.picklist(['admin', 'user', 'all']), 'all'),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 20)
});

export const getAllUsers = query(FilterUsersSchema, async (data) => {
  requireAdminUser(); // Check admin access

  // Build query
  let baseQuery = db.select().from(tables.user);
  const conditions = [];

  // Add filters
  if (data.username) {
    conditions.push(like(tables.user.username, `%${data.username}%`));
  }

  if (data.role && data.role !== 'all') {
    conditions.push(eq(tables.user.role, data.role));
  }

  // Apply conditions
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }

  // Order by newest
  baseQuery = baseQuery.orderBy(desc(tables.user.createdAt)) as typeof baseQuery;

  // Count
  let countQuery = db.select({ count: count() }).from(tables.user);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }

  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;

  // Paginate
  const { offset, limit } = calculatePagination(data.page, data.pageSize);
  const users = await baseQuery.limit(limit).offset(offset);

  // Return
  return createPaginatedResponse(users, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

**Component** (`src/routes/admin/users/+page.svelte`):

```svelte
<script lang="ts">
  import { getAllUsers } from '$lib/remotes/user.remote';
  import { DataTableWrapper } from '$lib/components/common/data-display';
  import { userColumns } from './columns';
  
  let searchQuery = $state('');
  let roleFilter = $state('all');
  let currentPage = $state(1);
  
  const pageSize = 20;
  
  function handlePageChange(pageIndex: number) {
    currentPage = pageIndex + 1;
  }
</script>

<div class="space-y-4">
  <div class="flex gap-2">
    <input bind:value={searchQuery} placeholder="Search users..." />
    <select bind:value={roleFilter}>
      <option value="all">All Roles</option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
  </div>

  {#await getAllUsers({ 
    username: searchQuery, 
    role: roleFilter,
    page: currentPage, 
    pageSize 
  }) then response}
    <DataTableWrapper
      data={response.data}
      columns={userColumns}
      totalPages={response.totalPages}
      page={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      emptyMessage="No users found"
    />
  {/await}
</div>
```

## Best Practices

1. **Always validate pagination parameters** - The utility validates `page` and `pageSize`, but ensure your schema includes them with sensible defaults.

2. **Build conditions separately** - Keep filter logic separate from pagination logic for clarity.

3. **Apply conditions to both queries** - Count query must use the same filters as data query.

4. **Use ordering** - Always add `.orderBy()` to make pagination deterministic.

5. **Batch count and data queries** - For better performance, you can execute both in parallel:
   ```typescript
   const [products, countResult] = await Promise.all([
     baseQuery.limit(limit).offset(offset),
     countQuery
   ]);
   ```

6. **Handle empty results** - The utility handles zero counts correctly:
   ```typescript
   const totalPages = calculateTotalPages(0, 20); // Returns 0
   ```

## TypeScript Typing

The utility is fully generic and maintains TypeScript inference:

```typescript
// Automatically inferred return type
const response = await getAllProducts({ name: 'test', page: 1, pageSize: 20 });

// Type-safe access
response.data.forEach(product => {
  console.log(product.name); // ✓ TypeScript knows product properties
});

console.log(response.totalPages); // ✓ number
console.log(response.currentPage); // ✓ number
```

## Validation

Input validation is done via your Valibot schema. Example:

```typescript
const FilterProductsSchema = v.object({
  name: v.optional(v.string(), ''),
  page: v.pipe(
    v.optional(v.number(), 1),
    v.minValue(1, 'Page must be at least 1')
  ),
  pageSize: v.pipe(
    v.optional(v.number(), 20),
    v.minValue(1, 'Page size must be at least 1'),
    v.maxValue(100, 'Page size cannot exceed 100')
  )
});
```

The remote function will automatically validate and return validation errors if needed.

## Performance Considerations

1. **Count query optimization** - Ensure your count query uses the same indexes as your data query.

2. **Pagination at large offsets** - For very large offsets (thousands of pages), consider using keyset pagination instead.

3. **Caching** - Consider caching count results if filters are limited:
   ```typescript
   const cacheKey = `product-count-${data.status}`;
   const totalCount = await cache.get(cacheKey) || (await countQuery);
   ```

4. **Database indexes** - Ensure filtered columns have appropriate indexes:
   ```sql
   CREATE INDEX idx_product_name ON product(name);
   CREATE INDEX idx_product_status ON product(status);
   CREATE INDEX idx_product_created_at ON product(created_at DESC);
   ```

## Common Mistakes

❌ **Don't apply limit/offset to count query:**
```typescript
// WRONG!
const countResult = await countQuery.limit(limit).offset(offset);
```

❌ **Don't forget conditions in count query:**
```typescript
// WRONG! - Count won't match filtered results
let countQuery = db.select({ count: count() }).from(tables.product);
// Missing: if (conditions.length > 0) { countQuery = countQuery.where(...) }
```

❌ **Don't forget to order the query:**
```typescript
// WRONG! - Results won't be deterministic
const products = await baseQuery.limit(limit).offset(offset);
// Add: baseQuery = baseQuery.orderBy(desc(tables.product.createdAt));
```

✅ **Do use the utility consistently:**
```typescript
// RIGHT!
return createPaginatedResponse(products, totalCount, {
  page: data.page,
  pageSize: data.pageSize
});
```

## Migration from Old Pattern

If updating existing code to use the utility:

**Before:**
```typescript
const offset = (data.page - 1) * data.pageSize;
const products = await query.limit(data.pageSize).offset(offset);
const countResult = await countQuery;
const totalPages = Math.ceil(countResult[0].count / data.pageSize);

return {
  data: products,
  totalPages
};
```

**After:**
```typescript
const { offset, limit } = calculatePagination(data.page, data.pageSize);
const products = await query.limit(limit).offset(offset);
const countResult = await countQuery;
const totalCount = Number(countResult[0]?.count) || 0;

return createPaginatedResponse(products, totalCount, {
  page: data.page,
  pageSize: data.pageSize
});
```

Benefits:
- Consistent response structure across all remote functions
- Better compatibility with DataTableWrapper
- Additional metadata (hasNextPage, totalCount, pageSize)
- Less code duplication
