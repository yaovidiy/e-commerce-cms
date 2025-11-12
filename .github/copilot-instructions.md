# GitHub Copilot Instructions

## Overview

This file provides AI coding assistants with comprehensive guidance for generating features aligned with this SvelteKit E-commerce CMS project's architecture, patterns, and conventions. All information is derived from actual codebase analysis—not invented practices.

**Purpose**: Enable consistent, convention-following code generation by understanding:
- Technology stack and architectural patterns
- File organization and naming conventions
- Domain-specific implementation patterns
- Integration rules and constraints

---

## Technology Stack

### Core Framework
- **SvelteKit v2** with **Svelte 5** (runes API: `$props`, `$state`, `$bindable`, `{@render}`)
- **TypeScript 5** throughout entire codebase
- **Vite 5** for build tooling

### Database & ORM
- **Drizzle ORM v0.33** with **better-sqlite3**
- SQLite database (development: `local.db`)
- Type-safe queries with `$inferSelect` and `$inferInsert`

### Styling & UI
- **Tailwind CSS v4** (utility-first, configured via CSS)
- **shadcn-svelte** component pattern
- **tailwind-variants** for component variants
- **clsx + tailwind-merge** via `cn()` utility
- **@lucide/svelte** for icons

### Authentication
- Custom session-based auth (SHA-256 hashed tokens)
- **Argon2** password hashing (@node-rs/argon2)
- **@oslojs/crypto** and **@oslojs/encoding** for cryptographic utilities

### Validation & i18n
- **Valibot v1.1** for schema validation
- **@inlang/paraglide-sveltekit** for compile-time internationalization

### State Management
- No centralized store (Redux/Zustand)
- Server-first with SvelteKit load functions
- Client reactivity via Svelte 5 runes
- Request-scoped state via `event.locals`

---

## File Categories Reference

### UI Components (`src/lib/components/ui/`)
shadcn-svelte style components with:
- Module script for types and variants (`tv()`)
- Regular script for props (`$props()`)
- `cn()` utility for class merging
- Barrel exports via `index.ts`

**Key Files:**
- `src/lib/components/ui/button/button.svelte`
- `src/lib/components/ui/button/index.ts`

**Conventions:**
- Use `tailwind-variants` `tv()` for variant systems
- Export `ComponentProps`, `ComponentVariant`, `ComponentSize` types
- Support `ref` via `$bindable()`
- Render children with `{@render children?.()}`
- Polymorphic components (button/anchor based on `href`)

### Remote Functions (`src/lib/remotes/`)
Server-side functions using SvelteKit's experimental remoteFunctions:

**Key Files:**
- `src/lib/remotes/blog.remote.ts`
- `src/lib/remotes/product.remote.ts`

**Conventions:**
- Use `query()` for read operations (no validation or with Valibot schema)
- Use `form()` for write operations (always with Valibot schema)
- Name patterns: `getAll{Entities}`, `get{Entity}By{Field}`, `create{Entity}`, `update{Entity}`
- Return created records with `.returning()`
- Generate IDs with `crypto.randomUUID()`

### Database Schema (`src/lib/server/db/`)
Drizzle ORM schemas with SQLite:

**Key Files:**
- `src/lib/server/db/schema.ts` - All table definitions
- `src/lib/server/db/index.ts` - Database client

**Conventions:**
- Use `sqliteTable()` from `drizzle-orm/sqlite-core`
- Primary keys: `text('id').primaryKey()` with UUIDs
- Timestamps: `integer('created_at', { mode: 'timestamp' })` - insert with `new Date()`
- Foreign keys: `.references(() => parentTable.id)`
- Export types: `typeof table.$inferSelect` and `typeof table.$inferInsert`
- snake_case for DB columns, camelCase for TypeScript

### Validation Schemas (`src/lib/server/schemas/`)
Valibot schemas for input validation:

**Key File:**
- `src/lib/server/schemas/index.ts`

**Conventions:**
- Import as `import * as v from 'valibot'`
- Use `v.object()` for schema definition
- Chain validators with `v.pipe(v.string(), v.minLength(1), v.maxLength(200))`
- Name with "Schema" suffix: `CreateBlogSchema`, `UpdateBlogSchema`
- Integrate with `form()` and `query()` remote functions

### Server Load Functions & Actions (`src/routes/**/*.server.ts`)
Server-side data loading and form handling:

**Key Files:**
- `src/routes/demo/lucia/+page.server.ts`
- `src/routes/demo/lucia/login/+page.server.ts`

**Conventions:**
- Type with `PageServerLoad` and `Actions` from `./$types`
- Check `event.locals.user` for authentication
- Use `redirect(302, path)` for navigation
- Use `fail(statusCode, data)` for validation errors
- Access form data with `await event.request.formData()`

### Page Components (`src/routes/**/*.svelte`)
SvelteKit page components:

**Key Files:**
- `src/routes/+layout.svelte` - Root layout with i18n wrapper
- `src/routes/+page.svelte` - Home page

**Conventions:**
- Import global CSS in root layout
- Wrap app with `<ParaglideJS {i18n}>` for i18n
- Use `$props()` to receive `children`
- Render with `{@render children()}`

---

## Feature Scaffold Guide

### Adding a New Feature

When creating a new feature (e.g., "Add product management"), follow this structure:

#### 1. **Database Schema** (`src/lib/server/db/schema.ts`)
```typescript
export const product = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Product = typeof product.$inferSelect;
export type InsertProduct = typeof product.$inferInsert;
```

Run: `pnpm db:push`

#### 2. **Validation Schemas** (`src/lib/server/schemas/index.ts`)
```typescript
export const CreateProductSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  price: v.pipe(v.number(), v.minValue(0)),
  slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200))
});
```

#### 3. **Remote Functions** (`src/lib/remotes/product.remote.ts`)
```typescript
import { form, query } from "$app/server";
import { db } from "$lib/server/db";
import * as tables from "$lib/server/db/schema";
import { CreateProductSchema } from "$lib/server/schemas";

export const getAllProducts = query(async () => {
  return await db.select().from(tables.product);
});

export const createProduct = form(CreateProductSchema, async (data) => {
  const newProduct = await db.insert(tables.product).values({
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date()
  }).returning();
  return newProduct;
});
```

#### 4. **Page Route** (`src/routes/products/+page.server.ts`)
```typescript
import { getAllProducts } from '$lib/remotes/product.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const products = await getAllProducts();
  return { products };
};
```

#### 5. **Page Component** (`src/routes/products/+page.svelte`)
```svelte
<script lang="ts">
  let { data } = $props();
</script>

<h1>Products</h1>
<ul>
  {#each data.products as product}
    <li>{product.name} - ${product.price}</li>
  {/each}
</ul>
```

#### 6. **UI Component** (if needed: `src/lib/components/ui/product-card/`)
Follow shadcn-svelte pattern with module script, variants, and barrel exports.

---

## Integration Rules

### Authentication Constraints
- **Session tokens**: Generate with `auth.generateSessionToken()` (base32-encoded)
- **Session duration**: 30 days, auto-renew at 15 days
- **Password hashing**: Must use Argon2 with exact params:
  ```typescript
  { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 }
  ```
- **Protected routes**: Check `event.locals.user` in load functions, redirect if null
- **Cookie name**: 'auth-session'
- **Validation**: Username 3-31 chars (lowercase/numbers/dashes), password 6-255 chars

### Database Constraints
- **SQLite only**: No PostgreSQL/MySQL patterns
- **Primary keys**: Text-based UUIDs or base32-encoded bytes
- **Timestamps**: Use `integer` with `{ mode: 'timestamp' }`, insert `new Date()`
- **Foreign keys**: Always define `.references()`
- **Server-only**: All DB code in `$lib/server/*`
- **Migrations**: `pnpm db:push` (dev) or `pnpm drizzle-kit generate` (prod)

### UI/Styling Constraints
- **Tailwind v4 only**: No inline styles or component-scoped CSS
- **Class merging**: Always use `cn()` utility
- **Variants**: Use `tailwind-variants` `tv()`
- **Svelte 5 runes**: No legacy `export let`, use `$props()`, `$state`, `$bindable`
- **Children rendering**: `{@render children?.()}` not `<slot>`

### i18n Constraints
- **Compile-time only**: No runtime translation loading
- **Messages**: JSON files in `messages/{locale}.json`
- **Generated code**: Auto-generated in `src/lib/paraglide/`
- **Route localization**: Enabled via `i18n.reroute()` in `hooks.ts`
- **Wrapper**: Must wrap app with `<ParaglideJS>` in root layout
- **No hardcoded text**: Always use translation keys (`import * as m from '$lib/paraglide/messages'`)
- **Update all languages**: When adding translations, update ALL message files (`en.json`, `uk.json`)

### Validation Constraints
- **Server-side mandatory**: Never skip validation
- **Valibot only**: No Zod/Yup/Joi
- **Chain validators**: Use `v.pipe()`
- **Match DB constraints**: Align with schema.ts
- **Integration**: Use with `query()` and `form()` functions

---

## Example Prompt Usage

### Prompt: "Create a searchable product catalog"

**Copilot generates:**

**1. Database schema** (`src/lib/server/db/schema.ts`):
```typescript
export const product = sqliteTable('product', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: text('category_id').references(() => category.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

**2. Validation schema** (`src/lib/server/schemas/index.ts`):
```typescript
export const SearchProductsSchema = v.object({
  query: v.optional(v.string(), ''),
  categoryId: v.optional(v.string()),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number())
});
```

**3. Remote functions** (`src/lib/remotes/product.remote.ts`):
```typescript
export const searchProducts = query(SearchProductsSchema, async ({ query, categoryId, minPrice, maxPrice }) => {
  const conditions = [];
  if (query) conditions.push(like(tables.product.name, `%${query}%`));
  if (categoryId) conditions.push(eq(tables.product.categoryId, categoryId));
  if (minPrice) conditions.push(gte(tables.product.price, minPrice));
  if (maxPrice) conditions.push(lte(tables.product.price, maxPrice));
  
  return await db.select()
    .from(tables.product)
    .where(conditions.length ? and(...conditions) : undefined);
});
```

**4. Page component** (`src/routes/products/+page.svelte`):
```svelte
<script lang="ts">
  import { searchProducts } from '$lib/remotes/product.remote';
  import { Button } from '$lib/components/ui/button';
  
  let searchQuery = $state('');
  let products = $state([]);
  
  async function handleSearch() {
    products = await searchProducts({ query: searchQuery });
  }
</script>

<div>
  <input bind:value={searchQuery} placeholder="Search products..." />
  <Button onclick={handleSearch}>Search</Button>
  
  <ul>
    {#each products as product}
      <li>{product.name} - ${product.price}</li>
    {/each}
  </ul>
</div>
```

---

## Requirements

### ⚠️ What NOT to Do

**Do NOT:**
- Use class-based components or legacy Svelte syntax
- Implement client-side state management libraries (Redux/Zustand)
- Add REST API endpoints (use remote functions instead)
- Use runtime i18n libraries
- Implement CSS-in-JS or component-scoped styles
- Use different databases (PostgreSQL/MongoDB)
- Skip server-side validation
- Use `Date.now()` for timestamps (use `new Date()`)
- Create multiple schema files (use single `schema.ts`)

### ✓ Always Do

- Use Svelte 5 runes (`$props`, `$state`, `$bindable`, `{@render}`)
- Validate all inputs server-side with Valibot
- Use `cn()` for className merging
- Generate UUIDs server-side with `crypto.randomUUID()`
- Type all functions properly (PageServerLoad, Actions, etc.)
- Check authentication in load functions
- Use `new Date()` for timestamp fields
- Follow shadcn-svelte pattern for UI components
- Wrap database operations in remote functions
- Export types from schemas (`$inferSelect`, `$inferInsert`)
- **Always use translation keys** - Never hardcode text in components/pages
- **Update all message files** - When adding translations, update `en.json`, `uk.json`
- **Check https://www.shadcn-svelte.com/llms.txt before creating new UI components**
- **Update .results/ documentation when adding features**
- **Use remote functions pattern for all UI data interactions**

---

## Quick Reference

### Common Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm db:push          # Sync schema to DB (dev)
pnpm db:migrate       # Run migrations (prod)
pnpm db:studio        # Open Drizzle Studio
pnpm test:e2e         # Run Playwright tests
```

### Documentation Requirements
When adding new features or components:

1. **Update .results folder** - Keep architectural documentation current:
   - Update `2-file-categorization.json` with new files
   - Add domain documentation if introducing new patterns
   - Update relevant style guides in `5-style-guides/`

2. **UI Component Sourcing** - Before creating new UI components:
   - **ALWAYS check https://www.shadcn-svelte.com/llms.txt first**
   - Search for existing shadcn-svelte components that meet requirements
   - Only create custom components if no suitable shadcn-svelte component exists
   - Follow shadcn-svelte patterns when creating custom components

3. **Remote Functions Pattern** - UI design must use server-side data:
   - Always fetch/mutate data via remote functions (not direct DB access)
   - Use `query()` for read operations
   - Use `form()` for write operations with validation
   - Never bypass remote functions layer in UI components

### File Locations
- UI Components: `src/lib/components/ui/{name}/`
- Remote Functions: `src/lib/remotes/{domain}.remote.ts`
- Database: `src/lib/server/db/`
- Schemas: `src/lib/server/schemas/index.ts`
- Routes: `src/routes/`
- Auth: `src/lib/server/auth.ts`
- i18n: `src/lib/i18n.ts`, `messages/{locale}.json`

### Import Patterns
```typescript
import { Button } from '$lib/components/ui/button';
import { cn } from '$lib/utils';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { query, form } from '$app/server';
import * as v from 'valibot';
import * as m from '$lib/paraglide/messages';
import { i18n } from '$lib/i18n';
```

---

This instruction file is generated from actual codebase analysis and reflects current project conventions. When generating new features, follow these patterns to ensure consistency and architectural alignment.
