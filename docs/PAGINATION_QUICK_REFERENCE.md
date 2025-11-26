# Pagination Utility Quick Reference

**File**: `src/lib/server/pagination-utils.ts`

## Main Function

```typescript
createPaginatedResponse<T>(
  pageData: T[],
  itemCount: number,
  options: PaginationOptions
): PaginatedResponse<T>
```

**Returns**:
```typescript
{
  data: T[];           // Current page items
  totalPages: number;  // Total pages
  hasNextPage: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}
```

## Helper Functions

| Function | Usage |
|----------|-------|
| `calculatePagination(page, pageSize)` | Get offset and limit for DB query |
| `calculateTotalPages(totalCount, pageSize)` | Calculate pages from count |
| `hasNextPage(currentPage, totalPages)` | Check for next page |
| `hasPreviousPage(currentPage)` | Check for previous page |

## Remote Function Template

```typescript
import { query } from '$app/server';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import * as v from 'valibot';

const FilterSchema = v.object({
  filter1: v.optional(v.string(), ''),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 20)
});

export const getAll = query(FilterSchema, async (data) => {
  // 1. Build base query
  let baseQuery = db.select().from(table);
  
  // 2. Build conditions
  const conditions = [];
  if (data.filter1) conditions.push(...);
  
  // 3. Apply conditions
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }
  
  // 4. Add ordering
  baseQuery = baseQuery.orderBy(desc(table.createdAt)) as typeof baseQuery;
  
  // 5. Count (with same conditions)
  let countQuery = db.select({ count: count() }).from(table);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }
  
  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;
  
  // 6. Paginate
  const { offset, limit } = calculatePagination(data.page, data.pageSize);
  const items = await baseQuery.limit(limit).offset(offset);
  
  // 7. Return
  return createPaginatedResponse(items, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

## Component Usage

```svelte
<script lang="ts">
  import { getAll } from '$lib/remotes/file.remote';
  import { DataTableWrapper } from '$lib/components/common/data-display';
  
  let currentPage = $state(1);
  const pageSize = 20;
  
  function handlePageChange(pageIndex: number) {
    currentPage = pageIndex + 1;
  }
</script>

{#await getAll({ page: currentPage, pageSize }) then response}
  <DataTableWrapper
    data={response.data}
    columns={columns}
    totalPages={response.totalPages}
    page={currentPage}
    pageSize={pageSize}
    onPageChange={handlePageChange}
  />
{/await}
```

## Import Statement

```typescript
import { 
  createPaginatedResponse, 
  calculatePagination,
  calculateTotalPages,
  hasNextPage,
  hasPreviousPage,
  type PaginatedResponse,
  type PaginationOptions
} from '$lib/server/pagination-utils';
```

## DataTableWrapper Props

From `createPaginatedResponse` return:

| Prop | Value |
|------|-------|
| `data` | `response.data` |
| `columns` | Your column definitions |
| `totalPages` | `response.totalPages` |
| `page` | Current page (1-based) |
| `pageSize` | Items per page |
| `onPageChange` | Callback receives 0-based index |
| `emptyMessage` | Custom empty state text |

## Error Handling

The utility validates and handles:
- ✓ Page < 1 → Defaults to 1
- ✓ PageSize < 1 → Defaults to 1
- ✓ Zero total count → Returns 0 pages
- ✓ Large offsets → Properly calculated

No try-catch needed in your code.

## Pagination Math

```
page = 1, pageSize = 20
→ offset = 0, limit = 20
→ Items 1-20

page = 2, pageSize = 20
→ offset = 20, limit = 20
→ Items 21-40

page = 3, pageSize = 20
→ offset = 40, limit = 20
→ Items 41-60
```

## Conditions Pattern

```typescript
const conditions = [];

if (data.search) {
  conditions.push(like(table.name, `%${data.search}%`));
}

if (data.status) {
  conditions.push(eq(table.status, data.status));
}

if (data.date) {
  conditions.push(gte(table.createdAt, data.date));
}

// Apply to both queries
if (conditions.length > 0) {
  baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
}
```

## 1-Based vs 0-Based

- **Remote function**: Use 1-based page numbers
- **DataTableWrapper**: Internally uses 0-based, sends 0-based in `onPageChange`
- **Your callback**: Convert 0-based to 1-based:
  ```typescript
  function handlePageChange(pageIndex: number) {
    currentPage = pageIndex + 1;
  }
  ```

## Common Issues

| Issue | Solution |
|-------|----------|
| Wrong item count | Ensure count query has same `where` conditions |
| Empty last page | Check offset calculation (should be `(page-1) * pageSize`) |
| Items shift on page change | Add `.orderBy()` to query |
| Type errors in conditions | Cast: `as typeof baseQuery` after `.where()` |
| Blank pages | Check condition logic - might filter everything out |

## See Also

- Full guide: `docs/PAGINATION_UTILITY.md`
- Product example: `src/lib/remotes/product.remote.ts`
- Component: `src/lib/components/common/data-display/data-table-wrapper.svelte`
