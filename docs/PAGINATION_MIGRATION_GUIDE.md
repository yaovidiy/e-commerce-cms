# Pagination Utility: Implementation Guide for Other Remote Functions

This guide walks through applying the pagination utility to different remote functions in your codebase.

## Step-by-Step Pattern

### Step 1: Update Your Schema

Add pagination fields to your filter schema:

```typescript
// Before
const GetItemsSchema = v.object({
  search: v.optional(v.string(), ''),
  status: v.optional(v.string(), 'all')
});

// After
const GetItemsSchema = v.object({
  search: v.optional(v.string(), ''),
  status: v.optional(v.string(), 'all'),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 20)
});

// With validation (optional but recommended)
const GetItemsSchema = v.object({
  search: v.optional(v.string(), ''),
  status: v.optional(v.string(), 'all'),
  page: v.pipe(
    v.optional(v.number(), 1),
    v.minValue(1)
  ),
  pageSize: v.pipe(
    v.optional(v.number(), 20),
    v.minValue(1),
    v.maxValue(100)
  )
});
```

### Step 2: Import the Utility

```typescript
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
```

### Step 3: Refactor Your Query Function

**Before pattern:**
```typescript
export const getItems = query(GetItemsSchema, async (data) => {
  let query = db.select().from(tables.item);
  
  if (data.search) {
    query = query.where(like(tables.item.name, `%${data.search}%`));
  }
  
  const offset = (data.page - 1) * data.pageSize;
  const items = await query.limit(data.pageSize).offset(offset).orderBy(desc(tables.item.createdAt));
  
  const count = await db.select({ count: count() }).from(tables.item);
  const totalPages = Math.ceil(count[0].count / data.pageSize);
  
  return { data: items, totalPages };
});
```

**After pattern:**
```typescript
export const getItems = query(GetItemsSchema, async (data) => {
  // 1. Start with base query
  let baseQuery = db.select().from(tables.item);
  
  // 2. Build conditions separately
  const conditions = [];
  
  if (data.search) {
    conditions.push(like(tables.item.name, `%${data.search}%`));
  }
  
  // 3. Apply conditions
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }
  
  // 4. Add ordering
  baseQuery = baseQuery.orderBy(desc(tables.item.createdAt)) as typeof baseQuery;
  
  // 5. Create count query with same conditions
  let countQuery = db.select({ count: count() }).from(tables.item);
  
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }
  
  // 6. Execute count query
  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;
  
  // 7. Calculate pagination
  const { offset, limit } = calculatePagination(data.page, data.pageSize);
  
  // 8. Execute data query with pagination
  const items = await baseQuery.limit(limit).offset(offset);
  
  // 9. Return using utility
  return createPaginatedResponse(items, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

## Example Implementations

### Example 1: User Management

**Schema** (`src/lib/server/schemas/index.ts`):
```typescript
export const GetUsersSchema = v.object({
  username: v.optional(v.string(), ''),
  role: v.optional(v.picklist(['admin', 'user', 'all']), 'all'),
  isActive: v.optional(v.boolean()),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 20)
});
```

**Remote Function** (`src/lib/remotes/user.remote.ts`):
```typescript
import { query } from '$app/server';
import { requireAdminUser } from '$lib/server/auth';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';

export const getAllUsers = query(GetUsersSchema, async (data) => {
  requireAdminUser();
  
  let baseQuery = db.select().from(tables.user);
  const conditions = [];
  
  // Filter by username
  if (data.username) {
    conditions.push(like(tables.user.username, `%${data.username}%`));
  }
  
  // Filter by role
  if (data.role && data.role !== 'all') {
    conditions.push(eq(tables.user.role, data.role));
  }
  
  // Filter by active status
  if (data.isActive !== undefined) {
    conditions.push(eq(tables.user.isActive, data.isActive));
  }
  
  // Apply conditions
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }
  
  // Order by newest first
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

### Example 2: Order History

**Schema**:
```typescript
export const GetOrdersSchema = v.object({
  status: v.optional(v.picklist(['pending', 'processing', 'shipped', 'delivered', 'all']), 'all'),
  fromDate: v.optional(v.instance(Date)),
  toDate: v.optional(v.instance(Date)),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 15)
});
```

**Remote Function**:
```typescript
export const getOrders = query(GetOrdersSchema, async (data) => {
  let baseQuery = db.select().from(tables.order);
  const conditions = [];
  
  // Filter by status
  if (data.status && data.status !== 'all') {
    conditions.push(eq(tables.order.status, data.status));
  }
  
  // Filter by date range
  if (data.fromDate) {
    conditions.push(gte(tables.order.createdAt, data.fromDate));
  }
  
  if (data.toDate) {
    conditions.push(lte(tables.order.createdAt, data.toDate));
  }
  
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }
  
  baseQuery = baseQuery.orderBy(desc(tables.order.createdAt)) as typeof baseQuery;
  
  // Count
  let countQuery = db.select({ count: count() }).from(tables.order);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }
  
  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;
  
  // Paginate
  const { offset, limit } = calculatePagination(data.page, data.pageSize);
  const orders = await baseQuery.limit(limit).offset(offset);
  
  return createPaginatedResponse(orders, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

### Example 3: Blog Posts (with multiple filters)

**Schema**:
```typescript
export const GetBlogPostsSchema = v.object({
  search: v.optional(v.string(), ''),
  category: v.optional(v.string()),
  status: v.optional(v.picklist(['draft', 'published', 'archived', 'all']), 'all'),
  author: v.optional(v.string()),
  page: v.optional(v.number(), 1),
  pageSize: v.optional(v.number(), 12)
});
```

**Remote Function**:
```typescript
export const getBlogPosts = query(GetBlogPostsSchema, async (data) => {
  let baseQuery = db.select().from(tables.blogPost)
    .leftJoin(tables.author, eq(tables.blogPost.authorId, tables.author.id));
  
  const conditions = [];
  
  // Search in title and description
  if (data.search) {
    conditions.push(
      or(
        like(tables.blogPost.title, `%${data.search}%`),
        like(tables.blogPost.description, `%${data.search}%`)
      )
    );
  }
  
  // Filter by category
  if (data.category) {
    conditions.push(eq(tables.blogPost.categoryId, data.category));
  }
  
  // Filter by status
  if (data.status && data.status !== 'all') {
    conditions.push(eq(tables.blogPost.status, data.status));
  }
  
  // Filter by author
  if (data.author) {
    conditions.push(eq(tables.blogPost.authorId, data.author));
  }
  
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }
  
  baseQuery = baseQuery.orderBy(desc(tables.blogPost.publishedAt)) as typeof baseQuery;
  
  // Count
  let countQuery = db
    .select({ count: count() })
    .from(tables.blogPost)
    .leftJoin(tables.author, eq(tables.blogPost.authorId, tables.author.id));
  
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }
  
  const [countResult] = await countQuery;
  const totalCount = Number(countResult?.count) || 0;
  
  // Paginate
  const { offset, limit } = calculatePagination(data.page, data.pageSize);
  const posts = await baseQuery.limit(limit).offset(offset);
  
  return createPaginatedResponse(posts, totalCount, {
    page: data.page,
    pageSize: data.pageSize
  });
});
```

## Checklist: Converting a Remote Function

Use this checklist when converting an existing remote function to use the pagination utility:

- [ ] Add `page` and `pageSize` fields to schema
- [ ] Import `createPaginatedResponse` and `calculatePagination`
- [ ] Change `let query = db.select()...` to `let baseQuery = db.select()...`
- [ ] Create `const conditions = []` array
- [ ] Move all conditions to push into array instead of chaining `.where()`
- [ ] Add single `.where(and(...conditions))` after all conditions are collected
- [ ] Add `.orderBy()` to ensure deterministic results
- [ ] Create separate `countQuery` with same conditions
- [ ] Execute count query and get `totalCount`
- [ ] Use `calculatePagination()` to get offset and limit
- [ ] Apply pagination to data query
- [ ] Return using `createPaginatedResponse()`
- [ ] Test with various page numbers and filters
- [ ] Update component using this remote function

## Component Updates

Once your remote function is updated, update the component using it:

**Before:**
```svelte
<script>
  let items = [];
  let page = 1;
  
  $: {
    (async () => {
      const result = await getItems({ page });
      items = result.data;
    })();
  }
</script>
```

**After:**
```svelte
<script lang="ts">
  import { getItems } from '$lib/remotes/items.remote';
  
  let currentPage = $state(1);
  const pageSize = 20;
  
  function handlePageChange(pageIndex: number) {
    currentPage = pageIndex + 1;
  }
</script>

{#await getItems({ page: currentPage, pageSize }) then response}
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

## Advanced Patterns

### Pattern: Conditional Filters

When filters are conditional based on user permissions:

```typescript
const conditions = [];

// Always searchable
if (data.search) {
  conditions.push(like(tables.item.name, `%${data.search}%`));
}

// Only if admin
if (isAdmin && data.status) {
  conditions.push(eq(tables.item.status, data.status));
}

// Only if user owns it
if (!isAdmin && user) {
  conditions.push(eq(tables.item.userId, user.id));
}
```

### Pattern: Aggregated Counts with Joins

```typescript
let countQuery = db
  .select({ count: countDistinct(tables.order.id) })
  .from(tables.order)
  .leftJoin(tables.orderItem, eq(tables.order.id, tables.orderItem.orderId));

if (conditions.length > 0) {
  countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
}

const [countResult] = await countQuery;
const totalCount = Number(countResult?.count) || 0;
```

### Pattern: Parallel Query Execution

For better performance, execute both queries in parallel:

```typescript
const [countResult, dataItems] = await Promise.all([
  countQuery,
  baseQuery.limit(limit).offset(offset)
]);

const totalCount = Number(countResult[0]?.count) || 0;

return createPaginatedResponse(dataItems, totalCount, {
  page: data.page,
  pageSize: data.pageSize
});
```

### Pattern: With Caching

```typescript
const cacheKey = `items-count-${JSON.stringify(conditions)}`;
let totalCount = await cache.get(cacheKey);

if (!totalCount) {
  const [countResult] = await countQuery;
  totalCount = Number(countResult?.count) || 0;
  await cache.set(cacheKey, totalCount, 300); // Cache for 5 minutes
}

const { offset, limit } = calculatePagination(data.page, data.pageSize);
const items = await baseQuery.limit(limit).offset(offset);

return createPaginatedResponse(items, totalCount, {
  page: data.page,
  pageSize: data.pageSize
});
```

## Troubleshooting During Migration

### Issue: TypeScript error "Cannot use variable name 'query'"
**Solution**: Rename to `baseQuery` - `query` is reserved in this context.

### Issue: "Property does not exist on type" for count
**Solution**: Make sure count query has same conditions:
```typescript
// Both queries must have same conditions
if (conditions.length > 0) {
  baseQuery = baseQuery.where(and(...conditions));  // ✓
  countQuery = countQuery.where(and(...conditions)); // ✓ Required!
}
```

### Issue: Different result counts between pages
**Solution**: Add `.orderBy()` to ensure deterministic ordering:
```typescript
baseQuery = baseQuery.orderBy(desc(tables.item.createdAt));
```

### Issue: Component shows wrong page count
**Solution**: Check that `response.totalPages` is passed to DataTableWrapper:
```svelte
<DataTableWrapper
  totalPages={response.totalPages}  <!-- Must pass this -->
  {/* ... */}
/>
```

## Testing Your Updates

Test each pagination change with:

1. **First page**: `page: 1`
2. **Middle page**: `page: 5` (if enough data)
3. **Last page**: `page: totalPages`
4. **With filters**: Same tests with various filter values
5. **Empty results**: Filter that returns no items
6. **Single item**: Page with exactly 1 item
7. **Different page sizes**: Try `pageSize: 5`, `10`, `50`, `100`

## Performance Testing

For production use, test with:
- Large datasets (>10k items)
- Complex filters (multiple conditions)
- Large page sizes
- Rapid page changes

Consider adding indexes if queries are slow:
```sql
CREATE INDEX idx_item_name ON item(name);
CREATE INDEX idx_item_status ON item(status);
CREATE INDEX idx_item_created_at ON item(created_at DESC);
```

## Common Remote Functions to Update

Priority order for your codebase:
1. ✅ `product.remote.ts` - Done
2. ✅ `user.remote.ts` - Done
3. ✅ `category.remote.ts` - Done
4. ⏭️ `order.remote.ts` - Next to migrate
5. `blog.remote.ts` - Pending
6. `asset.remote.ts` - Pending
7. Others as needed

## Related Resources

- `docs/PAGINATION_UTILITY.md` - Full guide
- `docs/PAGINATION_QUICK_REFERENCE.md` - Quick lookup
- `src/lib/server/pagination-utils.ts` - Utility source
- `src/lib/remotes/product.remote.ts` - Working example
- `docs/COMPONENTS_STRUCTURE.md` - Remote function patterns
