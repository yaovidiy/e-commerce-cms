# Database Schema Style Guide

## Overview
Database schemas are defined using Drizzle ORM with SQLite. All schemas live in a single file and use type inference for TypeScript types.

## File Location
```
src/lib/server/db/schema.ts
```

**Important**: Single file for all schemas to enable proper foreign key references.

## File Template

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Table definitions
export const tableName = sqliteTable('table_name', {
	id: text('id').primaryKey(),
	field: text('field').notNull(),
	optionalField: text('optional_field'),
	uniqueField: text('unique_field').notNull().unique(),
	foreignKey: text('foreign_key')
		.notNull()
		.references(() => parentTable.id),
	timestamp: integer('timestamp', { mode: 'timestamp' }).notNull()
});

// Type inference
export type TableName = typeof tableName.$inferSelect;
export type InsertTableName = typeof tableName.$inferInsert;
```

## Imports

```typescript
// Core Drizzle imports
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Additional types if needed
import { sql } from 'drizzle-orm';
```

## Table Definition

### Basic Pattern
```typescript
export const user = sqliteTable('user', {
	// columns here
});
```

### Naming Convention
- **Variable name**: camelCase (`user`, `blogPost`)
- **Table name**: snake_case (`user`, `blog_post`)
- **Column names**: snake_case (`user_id`, `created_at`)

## Column Types

### Text Columns

#### Basic Text
```typescript
// Nullable
text('column_name')

// Required (NOT NULL)
text('column_name').notNull()

// Unique
text('column_name').notNull().unique()

// Primary key
text('id').primaryKey()

// With default
text('status').notNull().default('draft')
```

#### Text Examples from Project
```typescript
id: text('id').primaryKey(),
username: text('username').notNull().unique(),
passwordHash: text('password_hash').notNull(),
title: text('title').notNull(),
slug: text('slug').notNull().unique(),
content: text('content').notNull()
```

### Integer Columns

#### Regular Integer
```typescript
// Nullable integer
integer('age')

// Required integer
integer('count').notNull()

// With default
integer('views').notNull().default(0)
```

#### Timestamp (Date) Integer
```typescript
integer('created_at', { mode: 'timestamp' }).notNull()
integer('expires_at', { mode: 'timestamp' }).notNull()
integer('updated_at', { mode: 'timestamp' })
```

**Important**: 
- Use `{ mode: 'timestamp' }` for dates
- Insert with `new Date()` object
- Retrieved as `Date` object
- Stored as Unix timestamp in milliseconds

#### Boolean Integer
```typescript
integer('is_active', { mode: 'boolean' }).notNull().default(true)
integer('is_published', { mode: 'boolean' })
```

Stored as 0 (false) or 1 (true).

## Foreign Keys

### Basic Foreign Key
```typescript
userId: text('user_id')
	.notNull()
	.references(() => user.id)
```

### With ON DELETE/UPDATE
```typescript
userId: text('user_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade' })
```

Options:
- `onDelete: 'cascade'` - Delete children when parent deleted
- `onDelete: 'set null'` - Set to null when parent deleted
- `onUpdate: 'cascade'` - Update children when parent updated

### Multiple Foreign Keys
```typescript
export const post = sqliteTable('post', {
	id: text('id').primaryKey(),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	categoryId: text('category_id')
		.references(() => category.id)
});
```

## Primary Keys

### Text Primary Key (UUID)
```typescript
id: text('id').primaryKey()
```

Usage when inserting:
```typescript
id: crypto.randomUUID()
```

### Text Primary Key (Base32)
```typescript
id: text('id').primaryKey()
```

Usage when inserting:
```typescript
import { encodeBase32LowerCase } from '@oslojs/encoding';

const bytes = crypto.getRandomValues(new Uint8Array(15));
const id = encodeBase32LowerCase(bytes);
```

### Composite Primary Key
Not commonly used in this project, but supported:
```typescript
export const table = sqliteTable('table', {
	id1: text('id1'),
	id2: text('id2')
}, (table) => ({
	pk: primaryKey({ columns: [table.id1, table.id2] })
}));
```

## Complete Table Examples

### User Table
```typescript
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});
```

### Session Table
```typescript
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});
```

### Blog Table
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
```

## Type Inference

### Export Types
Always export select and insert types:

```typescript
// For reading from database
export type User = typeof user.$inferSelect;

// For inserting into database (optional fields allowed)
export type InsertUser = typeof user.$inferInsert;
```

### Type Usage
```typescript
// In function signatures
function createUser(data: InsertUser): Promise<User> {
	// ...
}

function getUser(id: string): Promise<User | undefined> {
	// ...
}

// With arrays
function getAllUsers(): Promise<User[]> {
	// ...
}
```

## Indexes

### Basic Index
```typescript
export const user = sqliteTable('user', {
	// columns
}, (table) => ({
	usernameIdx: index('username_idx').on(table.username)
}));
```

### Unique Index
Prefer `.unique()` on column definition:
```typescript
username: text('username').notNull().unique()
```

Or explicitly:
```typescript
export const user = sqliteTable('user', {
	// columns
}, (table) => ({
	usernameIdx: uniqueIndex('username_idx').on(table.username)
}));
```

## Best Practices

### 1. Column Naming
```typescript
// ✓ Good - snake_case
user_id: text('user_id')
created_at: integer('created_at')
is_active: integer('is_active')

// ✗ Bad - camelCase in DB
userId: text('userId')
createdAt: integer('createdAt')
```

### 2. NOT NULL by Default
Make fields required unless they're truly optional:

```typescript
// ✓ Good - explicit about nullability
title: text('title').notNull()
subtitle: text('subtitle')  // Optional

// ✗ Bad - unclear if null allowed
title: text('title')
```

### 3. Foreign Key Names
Suffix with `Id`:

```typescript
// ✓ Good
authorId: text('author_id').notNull().references(() => user.id)

// ✗ Bad
author: text('author').notNull().references(() => user.id)
```

### 4. Timestamp Fields
Use consistent names:

```typescript
createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
updatedAt: integer('updated_at', { mode: 'timestamp' })
expiresAt: integer('expires_at', { mode: 'timestamp' })
```

### 5. Boolean Fields
Prefix with `is_` or `has_`:

```typescript
isActive: integer('is_active', { mode: 'boolean' })
isPublished: integer('is_published', { mode: 'boolean' })
hasAccess: integer('has_access', { mode: 'boolean' })
```

### 6. Unique Constraints
Add on fields that should be unique:

```typescript
username: text('username').notNull().unique()
email: text('email').notNull().unique()
slug: text('slug').notNull().unique()
```

### 7. Type Exports
Always export both types:

```typescript
export type TableName = typeof tableName.$inferSelect;
export type InsertTableName = typeof tableName.$inferInsert;
```

## Common Patterns

### Audit Fields
```typescript
export const post = sqliteTable('post', {
	id: text('id').primaryKey(),
	// ... other fields
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
	createdBy: text('created_by').notNull().references(() => user.id),
	updatedBy: text('updated_by').references(() => user.id)
});
```

### Soft Delete
```typescript
deletedAt: integer('deleted_at', { mode: 'timestamp' })
```

Query non-deleted:
```typescript
.where(isNull(table.deletedAt))
```

### Status Enum (as text)
```typescript
status: text('status').notNull().default('draft')
```

Validate in application:
```typescript
const validStatuses = ['draft', 'published', 'archived'] as const;
type Status = typeof validStatuses[number];
```

### JSON Columns
SQLite stores as text:
```typescript
metadata: text('metadata')  // Store JSON.stringify()
```

In application:
```typescript
// Inserting
metadata: JSON.stringify({ key: 'value' })

// Reading
const data = JSON.parse(record.metadata || '{}');
```

## Migration Workflow

### After Schema Changes
```bash
# Development (direct push)
pnpm db:push

# Production (generate migration)
pnpm drizzle-kit generate
pnpm db:migrate
```

### View Database
```bash
pnpm db:studio
```

Opens Drizzle Studio in browser to view/edit data.

## Common Mistakes

### ❌ Using wrong timestamp syntax
```typescript
createdAt: integer('created_at')  // Will be number, not Date
```

### ✓ Use timestamp mode
```typescript
createdAt: integer('created_at', { mode: 'timestamp' })
```

### ❌ Forgetting .notNull()
```typescript
username: text('username')  // Allows NULL
```

### ✓ Add .notNull() for required fields
```typescript
username: text('username').notNull()
```

### ❌ Wrong case in database names
```typescript
export const user = sqliteTable('User', {
  userId: text('userId')
});
```

### ✓ Use snake_case
```typescript
export const user = sqliteTable('user', {
  userId: text('user_id')
});
```

### ❌ Not exporting types
```typescript
export const user = sqliteTable('user', { /* ... */ });
// Missing type exports
```

### ✓ Always export types
```typescript
export const user = sqliteTable('user', { /* ... */ });
export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
```

## Dependencies

- `drizzle-orm/sqlite-core`: SQLite table definitions
- `drizzle-orm`: SQL helpers
- `better-sqlite3`: SQLite driver (used in db/index.ts)
- `drizzle-kit`: CLI for migrations
