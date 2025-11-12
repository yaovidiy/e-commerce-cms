# Remote Functions Style Guide

## Overview
Remote functions use SvelteKit's experimental `remoteFunctions` feature to create type-safe server functions callable from the client. They wrap database operations and handle validation.

## File Location
```
src/lib/remotes/{domain}.remote.ts
```

Examples:
- `blog.remote.ts` - Blog-related operations
- `product.remote.ts` - Product operations
- `user.remote.ts` - User operations

## File Template

```typescript
import { form, query } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq, like } from "drizzle-orm";
import * as v from 'valibot';
import { SchemaName } from "$lib/server/schemas";

// Query functions (read operations)
export const getAll = query(async () => {
    const results = await db.select().from(tables.tableName);
    return results;
});

export const getById = query(v.string(), async (id) => {
    const [result] = await db.select()
      .from(tables.tableName)
      .where(eq(tables.tableName.id, id));
    return result;
});

// Form functions (write operations)
export const create = form(SchemaName, async (data) => {
    const newRecord = await db.insert(tables.tableName)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date()
      })
      .returning();
    return newRecord;
});

export const update = form(UpdateSchemaName, async ({ id, ...data }) => {
    const updated = await db.update(tables.tableName)
      .set(data)
      .where(eq(tables.tableName.id, id))
      .returning();
    return updated;
});
```

## Imports

### Required Imports
```typescript
// Remote function primitives
import { form, query } from "$app/server";

// Database client
import { db } from "$lib/server/db";

// Database tables
import * as tables from "$lib/server/db/schema";

// Drizzle query operators
import { eq, like, and, or, gt, lt } from "drizzle-orm";

// Validation
import * as v from 'valibot';
import { CreateSchema, UpdateSchema } from "$lib/server/schemas";
```

## Query Functions (Read Operations)

### Simple Query (No Parameters)
```typescript
export const getAllBlogs = query(async () => {
    const blogs = await db.select().from(tables.blog);
    return blogs;
});
```

### Query with Single Parameter
```typescript
export const getBlog = query(v.string(), async (slug) => {
    const [blog] = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.slug, slug));
    return blog;
});
```

### Query with Object Parameter
```typescript
export const searchBlogs = query(
  v.object({
    query: v.string(),
    authorId: v.optional(v.string())
  }),
  async ({ query, authorId }) => {
    let queryBuilder = db.select()
      .from(tables.blog)
      .where(like(tables.blog.title, `%${query}%`));
    
    if (authorId) {
      queryBuilder = queryBuilder.where(eq(tables.blog.authorId, authorId));
    }
    
    const blogs = await queryBuilder;
    return blogs;
  }
);
```

### Query with Multiple Parameters
For multiple simple parameters, use object:

```typescript
export const getBlogsByAuthor = query(
  v.object({
    authorId: v.string(),
    limit: v.optional(v.number(), 10)
  }),
  async ({ authorId, limit }) => {
    const blogs = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.authorId, authorId))
      .limit(limit);
    return blogs;
  }
);
```

## Form Functions (Write Operations)

### Create Operation
```typescript
export const createBlog = form(CreateBlogSchema, async (data) => {
    const newBlog = await db.insert(tables.blog)
      .values({
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        slug: data.slug,
        authorId: data.authorId,
        createdAt: new Date()  // Important: Date object, not Date.now()
      })
      .returning();

    return newBlog;
});
```

**Key Points:**
- Schema validates input automatically
- Generate UUID for `id`
- Use `new Date()` for timestamps
- Use `.returning()` to get created record
- Destructure only needed fields from `data`

### Update Operation
```typescript
export const updateBlog = form(UpdateBlogSchema, async ({ id, title, content, slug }) => {
    const updatedBlog = await db.update(tables.blog)
      .set({ title, content, slug })
      .where(eq(tables.blog.id, id))
      .returning();

    return updatedBlog;
});
```

**Key Points:**
- Schema includes `id` field
- Destructure `id` separately from update fields
- Use `.set()` with only fields to update
- Always use `.where()` to target specific record

### Delete Operation
```typescript
export const deleteBlog = form(
  v.object({ id: v.string() }),
  async ({ id }) => {
    await db.delete(tables.blog)
      .where(eq(tables.blog.id, id));
    
    return { success: true };
  }
);
```

## Common Patterns

### Search/Filter Pattern
```typescript
export const searchBlogsByTitle = query(v.string(), async (title) => {
    const blogs = await db.select()
      .from(tables.blog)
      .where(like(tables.blog.title, `%${title}%`));
    return blogs;
});
```

### Get by Foreign Key
```typescript
export const getBlogsByAuthor = query(v.string(), async (authorId) => {
    const blogs = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.authorId, authorId));
    return blogs;
});
```

### Pagination Pattern
```typescript
export const getPaginatedBlogs = query(
  v.object({
    page: v.pipe(v.number(), v.minValue(1)),
    limit: v.pipe(v.number(), v.minValue(1), v.maxValue(100))
  }),
  async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    
    const blogs = await db.select()
      .from(tables.blog)
      .limit(limit)
      .offset(offset);
    
    return blogs;
  }
);
```

### With Join
```typescript
export const getBlogsWithAuthors = query(async () => {
    const blogs = await db.select({
        blog: tables.blog,
        author: tables.user
      })
      .from(tables.blog)
      .innerJoin(tables.user, eq(tables.blog.authorId, tables.user.id));
    
    return blogs;
});
```

### Conditional Filtering
```typescript
export const filterBlogs = query(
  v.object({
    authorId: v.optional(v.string()),
    searchTerm: v.optional(v.string())
  }),
  async ({ authorId, searchTerm }) => {
    const conditions = [];
    
    if (authorId) {
      conditions.push(eq(tables.blog.authorId, authorId));
    }
    
    if (searchTerm) {
      conditions.push(like(tables.blog.title, `%${searchTerm}%`));
    }
    
    const blogs = await db.select()
      .from(tables.blog)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    return blogs;
  }
);
```

## Naming Conventions

### Query Functions
- **Get all**: `getAll{Entities}` - e.g., `getAllBlogs`
- **Get by ID**: `get{Entity}` - e.g., `getBlog`
- **Get by field**: `get{Entities}By{Field}` - e.g., `getBlogsByAuthor`
- **Search**: `search{Entities}By{Field}` - e.g., `searchBlogsByTitle`
- **Filter**: `filter{Entities}` - e.g., `filterBlogs`

### Form Functions
- **Create**: `create{Entity}` - e.g., `createBlog`
- **Update**: `update{Entity}` - e.g., `updateBlog`
- **Delete**: `delete{Entity}` - e.g., `deleteBlog`

## Return Values

### Query Functions
Return data directly:
```typescript
return blogs;           // Array
return blog;            // Single object or undefined
return { blogs, total } // Object with multiple properties
```

### Form Functions
Return created/updated record or success indicator:
```typescript
return newBlog;                    // Created record
return updatedBlog;                // Updated record
return { success: true };          // Success indicator
return { success: true, id };      // With identifier
```

## Error Handling

Remote functions automatically handle validation errors. For custom errors:

```typescript
export const deleteBlog = form(
  v.object({ id: v.string() }),
  async ({ id }) => {
    // Check if exists
    const [existing] = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.id, id));
    
    if (!existing) {
      throw new Error('Blog not found');
    }
    
    await db.delete(tables.blog).where(eq(tables.blog.id, id));
    return { success: true };
  }
);
```

## Type Safety

Functions are automatically typed:

```typescript
// TypeScript knows the return type
const blogs = await getAllBlogs(); // Blog[]
const blog = await getBlog('slug'); // Blog | undefined

// TypeScript enforces parameter types
await createBlog({
  title: "Test",
  content: "Content",
  slug: "test",
  authorId: "user-id"
});
```

## Usage on Client

### Import
```typescript
import { getAllBlogs, getBlog, createBlog } from '$lib/remotes/blog.remote';
```

### Call Query
```typescript
const blogs = await getAllBlogs();
const blog = await getBlog('my-slug');
```

### Call Form
```typescript
const result = await createBlog({
  title: "New Post",
  content: "Content here",
  slug: "new-post",
  authorId: userId
});
```

### With Error Handling
```typescript
try {
  const blog = await createBlog(formData);
  // Success
} catch (error) {
  // Validation or server error
  console.error(error.message);
}
```

## Best Practices

1. **One domain per file**: Group related operations
2. **Validate all inputs**: Use Valibot schemas
3. **Use query() for reads**: Never mutate in query functions
4. **Use form() for writes**: Create, update, delete operations
5. **Generate IDs server-side**: Use `crypto.randomUUID()`
6. **Return created records**: Use `.returning()` for inserts/updates
7. **Type parameters**: Always provide validation schema
8. **Descriptive names**: Follow naming conventions
9. **Error messages**: Provide clear error context
10. **Keep functions focused**: One operation per function

## Common Mistakes

### ❌ Using Date.now() for timestamps
```typescript
createdAt: Date.now()  // Returns number
```

### ✓ Use new Date()
```typescript
createdAt: new Date()  // Returns Date object
```

### ❌ Not validating query parameters
```typescript
export const getBlog = query(async (slug) => {
  // slug is any type, no validation
});
```

### ✓ Always validate
```typescript
export const getBlog = query(v.string(), async (slug) => {
  // slug is validated as string
});
```

### ❌ Multiple operations in one function
```typescript
export const createAndPublishBlog = form(schema, async (data) => {
  // Do multiple things...
});
```

### ✓ Separate concerns
```typescript
export const createBlog = form(schema, async (data) => { /*...*/ });
export const publishBlog = form(schema, async (data) => { /*...*/ });
```

## Dependencies

- `$app/server`: Provides `query` and `form`
- `$lib/server/db`: Database client
- `$lib/server/db/schema`: Table definitions
- `drizzle-orm`: Query operators
- `valibot`: Input validation
- `$lib/server/schemas`: Validation schemas
