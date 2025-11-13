# Pagination Utilities

This document describes the pagination utilities available in this project.

## Overview

The project provides reusable pagination utilities in `src/lib/server/pagination.ts`:
- **Cursor pagination** - Best for large datasets, infinite scroll
- **Offset pagination** - Simpler but slower for large datasets
- Cursor encoding/decoding for URL-safe pagination

## Cursor Pagination

### Usage in Remote Functions

```typescript
// src/lib/remotes/user.remote.ts
import { query } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { applyCursorPagination, parseCursor, encodeCursor } from '$lib/server/pagination';
import * as auth from '$lib/server/auth';
import { like } from 'drizzle-orm';

export const getUsersCursorPaginated = query(
  v.object({
    cursor: v.optional(v.string()),  // Base64 encoded cursor
    limit: v.pipe(v.number(), v.minValue(1), v.maxValue(100)),
    username: v.optional(v.string(), '')
  }),
  async (data) => {
    auth.requireAdminUser();
    
    const { cursor, limit, username } = data;
    
    // Parse cursor from base64 string
    const parsedCursor = parseCursor(cursor);
    
    // Build base query
    let baseQuery = db.select().from(tables.user);
    
    // Apply filters
    if (username) {
      baseQuery = baseQuery.where(like(tables.user.username, `%${username}%`)) as typeof baseQuery;
    }
    
    // Apply cursor pagination
    const result = await applyCursorPagination({
      query: baseQuery,
      orderColumn: tables.user.createdAt,
      tieBreaker: tables.user.id,
      direction: 'desc',
      cursor: parsedCursor,
      limit
    });
    
    // Encode next cursor for URL
    return {
      data: result.data,
      nextCursor: encodeCursor(result.nextCursor),
      hasNext: result.hasNext,
      pageSize: result.pageSize
    };
  }
);
```

### Usage in Components

#### Infinite Scroll Pattern

```svelte
<script lang="ts">
  import { getUsersCursorPaginated } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  
  type User = {
    id: string;
    username: string;
    email: string | null;
    createdAt: Date;
  };
  
  let searchQuery = $state('');
  let allUsers = $state<User[]>([]);
  let nextCursor = $state<string | null>(null);
  let isLoading = $state(false);
  let hasMore = $state(true);
  
  async function loadMore() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    try {
      const result = await getUsersCursorPaginated({
        cursor: nextCursor ?? undefined,
        limit: 20,
        username: searchQuery
      });
      
      allUsers = [...allUsers, ...result.data];
      nextCursor = result.nextCursor;
      hasMore = result.hasNext;
    } finally {
      isLoading = false;
    }
  }
  
  // Reset and load when search changes
  async function handleSearch() {
    allUsers = [];
    nextCursor = null;
    hasMore = true;
    await loadMore();
  }
  
  // Load initial data
  $effect(() => {
    if (allUsers.length === 0 && !isLoading) {
      loadMore();
    }
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex gap-2">
    <Input
      type="text"
      placeholder="Search users..."
      bind:value={searchQuery}
    />
    <Button onclick={handleSearch}>Search</Button>
  </div>
  
  <div class="flex flex-col gap-2">
    {#each allUsers as user}
      <div class="rounded-md border p-4">
        <p class="font-medium">{user.username}</p>
        <p class="text-sm text-muted-foreground">{user.email || 'No email'}</p>
      </div>
    {/each}
  </div>
  
  {#if hasMore}
    <Button onclick={loadMore} disabled={isLoading} class="w-full">
      {isLoading ? 'Loading...' : 'Load More'}
    </Button>
  {:else if allUsers.length > 0}
    <p class="text-center text-sm text-muted-foreground">
      No more users to load
    </p>
  {/if}
</div>
```

#### Load More Button Pattern

```svelte
<script lang="ts">
  import { getUsersCursorPaginated } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  
  let cursor = $state<string | undefined>(undefined);
  let searchQuery = $state('');
  
  // Function to get next page
  async function getNextPage() {
    const result = await getUsersCursorPaginated({
      cursor,
      limit: 20,
      username: searchQuery
    });
    
    cursor = result.nextCursor ?? undefined;
    return result;
  }
</script>

{#await getNextPage()}
  <div>Loading...</div>
{:then result}
  <div class="flex flex-col gap-4">
    {#each result.data as user}
      <div>{user.username}</div>
    {/each}
    
    {#if result.hasNext}
      <Button onclick={() => cursor = result.nextCursor ?? undefined}>
        Load More
      </Button>
    {/if}
  </div>
{/await}
```

## Offset Pagination

### Usage in Remote Functions

```typescript
// src/lib/remotes/user.remote.ts
import { query } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { applyOffsetPagination } from '$lib/server/pagination';
import { desc, like, count } from 'drizzle-orm';
import * as auth from '$lib/server/auth';

export const getUsersOffsetPaginated = query(
  v.object({
    page: v.pipe(v.number(), v.minValue(1)),
    pageSize: v.pipe(v.number(), v.minValue(1), v.maxValue(100)),
    username: v.optional(v.string(), '')
  }),
  async (data) => {
    auth.requireAdminUser();
    
    const { page, pageSize, username } = data;
    
    // Build base query
    let baseQuery = db.select().from(tables.user);
    let countQuery = db.select({ count: count() }).from(tables.user);
    
    // Apply filters to both queries
    if (username) {
      const filter = like(tables.user.username, `%${username}%`);
      baseQuery = baseQuery.where(filter) as typeof baseQuery;
      countQuery = countQuery.where(filter) as typeof countQuery;
    }
    
    // Apply offset pagination
    return await applyOffsetPagination({
      query: baseQuery,
      countQuery,
      orderBy: [desc(tables.user.createdAt), desc(tables.user.id)],
      page,
      pageSize
    });
  }
);
```

### Usage in Components

```svelte
<script lang="ts">
  import { getUsersOffsetPaginated } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  
  let currentPage = $state(1);
  let pageSize = $state(20);
  let searchQuery = $state('');
</script>

{#await getUsersOffsetPaginated({ page: currentPage, pageSize, username: searchQuery })}
  <div>Loading...</div>
{:then result}
  <div class="flex flex-col gap-4">
    <!-- Search input -->
    <Input
      type="text"
      placeholder="Search users..."
      bind:value={searchQuery}
      oninput={() => currentPage = 1}
    />
    
    <!-- Users list -->
    <div class="flex flex-col gap-2">
      {#each result.data as user}
        <div class="rounded-md border p-4">
          <p class="font-medium">{user.username}</p>
          <p class="text-sm text-muted-foreground">{user.email || 'No email'}</p>
        </div>
      {/each}
    </div>
    
    <!-- Pagination controls -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, result.pagination.total)} of {result.pagination.total} users
      </p>
      
      <div class="flex gap-2">
        <Button
          disabled={!result.pagination.hasPrev}
          onclick={() => currentPage--}
        >
          Previous
        </Button>
        
        <span class="flex items-center px-4">
          Page {currentPage} of {result.pagination.totalPages}
        </span>
        
        <Button
          disabled={!result.pagination.hasNext}
          onclick={() => currentPage++}
        >
          Next
        </Button>
      </div>
    </div>
  </div>
{/await}
```

## Best Practices

### When to Use Cursor Pagination
✅ Large datasets (thousands to millions of rows)  
✅ Infinite scroll UI  
✅ Real-time data where new items are frequently added  
✅ Mobile apps where users scroll continuously  

### When to Use Offset Pagination
✅ Small to medium datasets (< 10,000 rows)  
✅ Admin panels where users need page numbers  
✅ When you need to show total count  
✅ When users need to jump to specific pages  

### Performance Tips

1. **Always use indexes** for pagination columns:
```typescript
// In schema.ts
export const user = sqliteTable('user', {
  // ... fields
}, (table) => ({
  createdAtIdx: index('user_created_at_idx').on(table.createdAt, table.id)
}));
```

2. **Use composite ordering** (primary + tiebreaker):
```typescript
await applyCursorPagination({
  query: baseQuery,
  orderColumn: tables.user.createdAt,  // Primary sort
  tieBreaker: tables.user.id,          // Stable tiebreaker
  direction: 'desc',
  cursor: parsedCursor,
  limit: 20
});
```

3. **Set reasonable limits**:
```typescript
// In validation schema
v.pipe(v.number(), v.minValue(1), v.maxValue(100))
```

4. **Encode cursors for URLs**:
```typescript
// Server-side
return {
  nextCursor: encodeCursor(result.nextCursor)
};

// Client-side
const result = await getUsersCursorPaginated({
  cursor: nextCursor ?? undefined
});
```

## API Reference

### `applyCursorPagination<T>`
Applies cursor-based pagination to a Drizzle query.

**Parameters:**
- `query` - Drizzle query builder instance
- `orderColumn` - Primary sort column (e.g., `createdAt`)
- `tieBreaker` - Secondary sort column for stability (usually `id`)
- `direction` - Sort direction: `'asc'` or `'desc'` (default: `'desc'`)
- `cursor` - Cursor values from previous page (optional)
- `limit` - Number of items per page

**Returns:** `Promise<CursorPaginationResult<T>>`

### `applyOffsetPagination<T>`
Applies offset-based pagination to a Drizzle query.

**Parameters:**
- `query` - Drizzle query builder instance
- `countQuery` - Count query for total records
- `orderBy` - Array of order expressions (optional)
- `page` - Current page number (1-based)
- `pageSize` - Items per page

**Returns:** `Promise<OffsetPaginationResult<T>>`

### `encodeCursor(cursor)`
Encodes cursor object to base64 string for URL usage.

**Parameters:**
- `cursor` - Cursor values object or null

**Returns:** `string | null`

### `parseCursor(cursorString)`
Decodes base64 cursor string back to cursor object.

**Parameters:**
- `cursorString` - Base64 encoded cursor or undefined

**Returns:** `CursorValues | undefined`

## Type Definitions

```typescript
interface CursorValues {
  orderValue: string | number | Date;
  tieValue: string | number;
}

interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: CursorValues | null;
  hasNext: boolean;
  pageSize: number;
}

interface OffsetPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```
