# Data Layer Domain Implementation

## Overview
The data layer uses Drizzle ORM with SQLite for type-safe database operations. All data access happens server-side and is exposed via remote functions using SvelteKit's experimental remoteFunctions feature.

## Database Configuration

### Connection Setup (`src/lib/server/db/index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);
export const db = drizzle(client);
```

### Drizzle Config (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	verbose: true,
	strict: true,
	dialect: 'sqlite'
});
```

## Schema Definition

### Table Definition Pattern (`src/lib/server/db/schema.ts`)
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tableName = sqliteTable('table_name', {
	id: text('id').primaryKey(),
	textField: text('text_field').notNull(),
	optionalField: text('optional_field'),
	uniqueField: text('unique_field').notNull().unique(),
	foreignKey: text('foreign_key')
		.notNull()
		.references(() => otherTable.id),
	timestamp: integer('timestamp', { mode: 'timestamp' }).notNull()
});

// Type inference
export type TableName = typeof tableName.$inferSelect;
export type InsertTableName = typeof tableName.$inferInsert;
```

### Actual Schema Examples

**User Table:**
```typescript
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export type User = typeof user.$inferSelect;
```

**Session Table:**
```typescript
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
```

**Blog Table:**
```typescript
export const blog = sqliteTable('blog', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	slug: text('slug').notNull().unique(),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Blog = typeof blog.$inferSelect;
```

## Column Types

### Text Columns
```typescript
text('column_name')                    // Nullable text
text('column_name').notNull()          // Required text
text('column_name').notNull().unique() // Unique text
text('column_name').primaryKey()       // Primary key
```

### Integer Columns
```typescript
integer('column_name')                            // Regular integer
integer('column_name', { mode: 'timestamp' })     // Date stored as timestamp
integer('column_name', { mode: 'boolean' })       // Boolean stored as 0/1
```

### Timestamp Handling
When using `{ mode: 'timestamp' }`:
- **Insert**: Pass `new Date()` object
- **Select**: Receives `Date` object
- **Storage**: Stored as Unix timestamp (milliseconds)

```typescript
// Insert
await db.insert(blog).values({
  createdAt: new Date()  // Pass Date object
});

// Select
const result = await db.select().from(blog);
result[0].createdAt // Returns Date object
```

### Foreign Keys
```typescript
foreignKey: text('foreign_key')
  .notNull()
  .references(() => parentTable.id)
```

## Remote Functions Pattern

### Location
Remote functions in `src/lib/remotes/*.remote.ts`

### Query Pattern (Read Operations)
```typescript
import { query } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import * as v from 'valibot';

// No input validation
export const getAllBlogs = query(async () => {
    const blogs = await db.select().from(tables.blog);
    return blogs;
});

// With input validation
export const getBlog = query(v.string(), async (slug) => {
    const [blog] = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.slug, slug));
    return blog;
});

// With multiple parameters
export const getBlogsByAuthor = query(v.string(), async (authorId) => {
    const blogs = await db.select()
      .from(tables.blog)
      .where(eq(tables.blog.authorId, authorId));
    return blogs;
});
```

### Form Pattern (Write Operations)
```typescript
import { form } from "$app/server";
import { CreateBlogSchema } from "$lib/server/schemas";

export const createBlog = form(CreateBlogSchema, async (data) => {
    const newBlog = await db.insert(tables.blog).values({
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        slug: data.slug,
        authorId: data.authorId,
        createdAt: new Date()  // Important: Use Date object, not Date.now()
    }).returning();

    return newBlog;
});

export const updateBlog = form(UpdateBlogSchema, async ({ id, title, content, slug }) => {
    const updatedBlog = await db.update(tables.blog)
      .set({ title, content, slug })
      .where(eq(tables.blog.id, id));

    return updatedBlog;
});
```

## Query Builders

### Select Queries
```typescript
// Select all
const all = await db.select().from(table);

// Select specific columns
const partial = await db.select({
  id: table.id,
  name: table.name
}).from(table);

// With where clause
const filtered = await db.select()
  .from(table)
  .where(eq(table.id, 'value'));

// With joins
const joined = await db.select()
  .from(table1)
  .innerJoin(table2, eq(table1.foreignKey, table2.id));
```

### Insert Queries
```typescript
// Insert single
await db.insert(table).values({
  id: crypto.randomUUID(),
  field: 'value',
  createdAt: new Date()
});

// Insert with returning
const [newRecord] = await db.insert(table)
  .values({ /* data */ })
  .returning();

// Insert multiple
await db.insert(table).values([
  { /* record 1 */ },
  { /* record 2 */ }
]);
```

### Update Queries
```typescript
// Update with where
await db.update(table)
  .set({ field: 'newValue' })
  .where(eq(table.id, 'id'));

// Update with returning
const updated = await db.update(table)
  .set({ field: 'value' })
  .where(eq(table.id, 'id'))
  .returning();
```

### Delete Queries
```typescript
// Delete with where
await db.delete(table).where(eq(table.id, 'id'));
```

## Query Operators

### Comparison
```typescript
import { eq, ne, gt, gte, lt, lte } from 'drizzle-orm';

eq(column, value)   // Equal
ne(column, value)   // Not equal
gt(column, value)   // Greater than
gte(column, value)  // Greater than or equal
lt(column, value)   // Less than
lte(column, value)  // Less than or equal
```

### Pattern Matching
```typescript
import { like, ilike } from 'drizzle-orm';

like(column, '%pattern%')  // LIKE (case-sensitive)
ilike(column, '%pattern%') // ILIKE (case-insensitive, if supported)
```

### Logical
```typescript
import { and, or, not } from 'drizzle-orm';

where(and(
  eq(table.field1, value1),
  eq(table.field2, value2)
))

where(or(
  eq(table.field, value1),
  eq(table.field, value2)
))
```

## Migration Workflow

### Commands
```bash
# Push schema changes directly (development)
pnpm db:push

# Generate migration files
pnpm drizzle-kit generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Schema Change Process
1. Modify `src/lib/server/db/schema.ts`
2. Run `pnpm db:push` for development
3. For production: `pnpm drizzle-kit generate` → `pnpm db:migrate`

## Type Safety

### Inferred Types
```typescript
// Select type (reading from DB)
export type User = typeof user.$inferSelect;

// Insert type (writing to DB)
export type InsertUser = typeof user.$inferInsert;
```

### Usage
```typescript
// Function accepting insert data
async function createUser(data: InsertUser) {
  await db.insert(user).values(data);
}

// Function returning select data
async function getUser(id: string): Promise<User | undefined> {
  const [result] = await db.select()
    .from(user)
    .where(eq(user.id, id));
  return result;
}
```

## Best Practices

1. **Always use server-side**: Never import db in client code
2. **Type inference**: Use `$inferSelect` and `$inferInsert`
3. **Timestamps**: Use `integer('field', { mode: 'timestamp' })` and pass `new Date()`
4. **Primary keys**: Use text IDs with UUIDs or base32-encoded random bytes
5. **Foreign keys**: Always define `.references()` for relationships
6. **Validation**: Combine with Valibot schemas for input validation
7. **Remote functions**: Wrap all DB operations in `query()` or `form()`
8. **Transactions**: Use `db.transaction()` for atomic operations
9. **Env variables**: Always check for `DATABASE_URL`
10. **Migrations**: Use `db:push` for dev, migrations for production

## Error Handling

### Unique Constraint Violations
```typescript
try {
  await db.insert(user).values({ username: 'existing' });
} catch (e) {
  // Handle duplicate username
  return fail(500, { message: 'Username already exists' });
}
```

### Not Found
```typescript
const [blog] = await db.select()
  .from(tables.blog)
  .where(eq(tables.blog.id, id));

if (!blog) {
  return fail(404, { message: 'Blog not found' });
}
```

## Dependencies

- `drizzle-orm`: ORM library
- `drizzle-kit`: Migration and schema management CLI
- `better-sqlite3`: SQLite driver
- Query operators from `drizzle-orm`
