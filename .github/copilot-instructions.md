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
- **Authentication helpers** in remote functions via `getUser()` and `requireAdminUser()`

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

### Component Architecture (4-Tier Structure)

Components are organized into **4 top-level folders** following separation of concerns:

```
src/lib/components/
├── ui/              # shadcn-svelte base components (NO business logic)
├── admin/           # Admin panel specific components
├── client/          # Customer-facing components
└── common/          # Shared components across admin/client
```

**Decision Tree - Where does this component go?**
```
Base UI primitive (button, input, dialog)? → /ui
Contains business logic or fetches data?
  ├─ Admin panel only? → /admin
  ├─ Customer-facing only? → /client
  └─ Used in both? → /common
```

📖 **Full guide**: `docs/COMPONENTS_STRUCTURE.md`

#### 1. UI Components (`src/lib/components/ui/`)
shadcn-svelte base primitives with:
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
- **NO business logic or API calls**
- **Use shadcn-svelte CLI to add components**: `pnpm dlx shadcn-svelte@latest add <component-name>`
- **Never create UI components manually** - always use the CLI to ensure consistency with shadcn-svelte patterns

#### 2. Admin Components (`src/lib/components/admin/`)
Admin dashboard/CMS components organized by:
- **`layout/`** - Sidebars, headers, navigation
- **`features/`** - Domain-grouped modules (product-management/, blog-management/, order-management/)
- **`widgets/`** - Dashboard widgets, stats cards

**Example Structure:**
```
admin/features/product-management/
├── product-list-table.svelte
├── product-form.svelte
├── product-quick-edit.svelte
└── index.ts

admin/features/blog-management/
├── blog-list-table.svelte
├── blog-form.svelte
├── delete-blog-dialog.svelte
└── index.ts
```

**Conventions:**
- Use remote functions for data fetching
- Check `event.locals.user` for authentication
- Group by feature domain
- NO customer-facing UI code

**Admin Layout Components:**
- **`admin-sidebar.svelte`** - Admin panel navigation sidebar with blogs and users menu
  - Uses same Sidebar component structure as main app
  - Shows active route highlighting
  - Displays admin user info in footer
  - Menu items: Blogs (`/admin/blogs`), Users (`/admin/users`)
  - Uses `me()` remote function to get current user

#### 3. Client Components (`src/lib/components/client/`)
Customer-facing e-commerce components organized by:
- **`layout/`** - Site headers, footers, navigation
- **`features/`** - Product catalog, cart, checkout, user account, blog
- **`widgets/`** - Marketing widgets, promos, newsletters

**Example Structure:**
```
client/features/product-catalog/
├── product-card.svelte
├── product-grid.svelte
├── product-filters.svelte
└── index.ts
```

**Conventions:**
- Optimize for SEO and performance
- Group by customer journey
- Use i18n for multi-language support
- NO admin logic

#### 4. Common Components (`src/lib/components/common/`)
Shared components used across both admin and client:
- **`layout/`** - Generic page layouts, containers
- **`data-display/`** - Tables, pagination, empty states
- **`forms/`** - Rich text editors, image uploads, date pickers
- **`feedback/`** - Toasts, confirmations, loading spinners
- **`navigation/`** - Tabs, steppers, breadcrumbs
- **`utility/`** - Error boundaries, SEO, language switchers

**Conventions:**
- Context-agnostic (works in admin and client)
- Higher-level than `/ui`, more generic than `/admin` or `/client`
- Can compose `/ui` components
- NO admin-only or client-only logic

### Remote Functions (`src/lib/remotes/`)
Server-side functions using SvelteKit's experimental remoteFunctions. These provide type-safe communication between client and server, always executing on the server with access to server-only modules.

**Key Files:**
- `src/lib/remotes/blog.remote.ts`
- `src/lib/remotes/product.remote.ts`
- `src/lib/remotes/user.remote.ts`

**Four Types of Remote Functions:**
1. **`query()`** - Read dynamic data from the server
2. **`form()`** - Write data via forms (progressive enhancement)
3. **`command()`** - Write data programmatically (client-side only)
4. **`prerender()`** - Static data computed at build time

📖 **Full guide**: See "Remote Functions Deep Dive" section below

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

### Page Components (`src/routes/**/*.svelte`)
SvelteKit page components:

**Key Files:**
- `src/routes/+layout.svelte` - Root layout with i18n wrapper
- `src/routes/+page.svelte` - Home page
- `src/routes/admin/+layout.svelte` - Admin panel layout with sidebar
- `src/routes/admin/+page.svelte` - Admin dashboard
- `src/routes/admin/blogs/+page.svelte` - Blog management page
- `src/routes/admin/users/+page.svelte` - User management page

**Conventions:**
- Import global CSS in root layout
- Wrap app with `<ParaglideJS {i18n}>` for i18n
- Use `$props()` to receive `children`
- Render with `{@render children()}`
- Admin routes use `AdminSidebar` from `$lib/components/admin/layout`

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

#### 4. **Page Component** (`src/routes/products/+page.svelte`)
```svelte
<script lang="ts">
  import { getAllProducts } from '$lib/remotes/product.remote';
  import { Button } from '$lib/components/ui/button';
</script>

<h1>Products</h1>
<ul>
  {#each await getAllProducts() as product}
    <li>{product.name} - ${product.price}</li>
  {/each}
</ul>
```

#### 5. **Components** (based on 4-tier architecture)

**If creating base UI component** (`src/lib/components/ui/`):
- Check https://www.shadcn-svelte.com/llms.txt first
- Follow shadcn-svelte pattern with module script, variants, and barrel exports
- NO business logic

**If creating admin feature component** (`src/lib/components/admin/features/product-management/`):
```svelte
<!-- product-form.svelte -->
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { createProduct } from '$lib/remotes/product.remote';
  import * as m from '$lib/paraglide/messages';
  
  let { product = $bindable() } = $props();
</script>

<form {...createProduct}>
  <Input {...createProduct.fields.name.as('text')} placeholder={m.productName()} />
  <Button type="submit">{m.save()}</Button>
</form>
```

**If creating client feature component** (`src/lib/components/client/features/product-catalog/`):
```svelte
<!-- product-card.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import * as m from '$lib/paraglide/messages';
  
  let { product } = $props();
</script>

<Card>
  <h3>{product.name}</h3>
  <p>${product.price}</p>
  <Button>{m.addToCart()}</Button>
</Card>
```

**If creating shared component** (`src/lib/components/common/data-display/`):
```svelte
<!-- data-table.svelte -->
<script lang="ts">
  import { Table } from '$lib/components/ui/table';
  
  let { data, columns } = $props();
</script>

<Table>
  <!-- Generic table used in both admin and client -->
</Table>
```

---

## Remote Functions Deep Dive

### Overview

Remote functions are SvelteKit's experimental feature for type-safe client-server communication. They enable calling server-side functions from anywhere in your app with full TypeScript safety, automatic serialization, and progressive enhancement.

**Key Benefits:**
- Type-safe communication between client and server
- Access to server-only modules (environment variables, database clients)
- Works with or without JavaScript (progressive enhancement for forms)
- Automatic data serialization (supports `Date`, `Map`, custom types via transport hook)
- Built-in validation via Standard Schema (Valibot)

**Configuration** (`svelte.config.js`):
```javascript
export default {
  kit: {
    experimental: {
      remoteFunctions: true  // Required
    }
  },
  compilerOptions: {
    experimental: {
      async: true  // Optional: enables await in components
    }
  }
};
```

---

### 1. query() - Reading Data

Use `query()` for fetching data from the server. Queries can be called anywhere and work as Promises.

#### Basic Query

**Definition** (`src/lib/remotes/blog.remote.ts`):
```typescript
import { query } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';

export const getPosts = query(async () => {
  return await db.select().from(tables.post);
});
```

**Usage in Component**:
```svelte
<script lang="ts">
  import { getPosts } from '$lib/remotes/blog.remote';
</script>

<h1>Recent posts</h1>

<ul>
  {#each await getPosts() as post}
    <li><a href="/blog/{post.slug}">{post.title}</a></li>
  {/each}
</ul>
```

#### Query with Validation

Always validate arguments using Valibot schemas:

**Definition**:
```typescript
import * as v from 'valibot';
import { query } from '$app/server';
import { error } from '@sveltejs/kit';

export const getPost = query(v.string(), async (slug) => {
  const [post] = await db.select()
    .from(tables.post)
    .where(eq(tables.post.slug, slug));
  
  if (!post) error(404, 'Not found');
  return post;
});
```

**Usage**:
```svelte
<script lang="ts">
  import { getPost } from '../blog.remote';
  
  let { params } = $props();
  const post = $derived(await getPost(params.slug));
</script>

<h1>{post.title}</h1>
<div>{@html post.content}</div>
```

#### Query Properties

Queries have multiple ways to access data:

**Using `await` (recommended)**:
```svelte
{#each await getPosts() as post}
  <li>{post.title}</li>
{/each}
```

**Using properties**:
```svelte
<script lang="ts">
  const query = getPosts();
</script>

{#if query.error}
  <p>Error loading posts</p>
{:else if query.loading}
  <p>Loading...</p>
{:else}
  <ul>
    {#each query.current as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{/if}
```

#### Refreshing Queries

Update query data on demand:

```svelte
<button onclick={() => getPosts().refresh()}>
  Check for new posts
</button>
```

**Important**: Queries are cached while on the page, so `getPosts() === getPosts()` is true. No need for references to update.

#### Batched Queries (query.batch)

Solve N+1 problems by batching simultaneous queries:

**Definition**:
```typescript
import { query } from '$app/server';
import * as v from 'valibot';

export const getWeather = query.batch(v.string(), async (cities) => {
  // Single database call with all cities
  const weather = await db.select()
    .from(tables.weather)
    .where(inArray(tables.weather.city, cities));
  
  const lookup = new Map(weather.map(w => [w.city, w]));
  
  // Return resolver function
  return (city) => lookup.get(city);
});
```

**Usage** (multiple calls batched automatically):
```svelte
{#each cities.slice(0, limit) as city}
  <h3>{city.name}</h3>
  <CityWeather weather={await getWeather(city.id)} />
{/each}
```

---

### 2. form() - Writing Data with Forms

Use `form()` for mutations via HTML forms. Supports progressive enhancement (works without JavaScript).

#### Basic Form Function

**Definition** (`src/lib/remotes/blog.remote.ts`):
```typescript
import * as v from 'valibot';
import { form } from '$app/server';
import { error, redirect } from '@sveltejs/kit';

export const createPost = form(
  v.object({
    title: v.pipe(v.string(), v.nonEmpty()),
    content: v.pipe(v.string(), v.nonEmpty())
  }),
  async (data) => {
    // Validate authentication
    const user = await auth.getUser();
    if (!user) error(401, 'Unauthorized');
    
    const slug = data.title.toLowerCase().replace(/ /g, '-');
    
    await db.insert(tables.post).values({
      id: crypto.randomUUID(),
      slug,
      title: data.title,
      content: data.content,
      createdAt: new Date()
    });
    
    redirect(303, `/blog/${slug}`);
  }
);
```

**Usage in Component**:
```svelte
<script lang="ts">
  import { createPost } from '../blog.remote';
</script>

<h1>Create a new post</h1>

<form {...createPost}>
  <label>
    <h2>Title</h2>
    <input {...createPost.fields.title.as('text')} />
  </label>
  
  <label>
    <h2>Content</h2>
    <textarea {...createPost.fields.content.as('text')}></textarea>
  </label>
  
  <button>Publish!</button>
</form>
```

#### Field Types and Methods

The `fields` object provides type-safe access to form inputs:

**Text/Textarea/Email/etc.**:
```svelte
<input {...createPost.fields.title.as('text')} />
<input {...createPost.fields.email.as('email')} />
<textarea {...createPost.fields.content.as('text')}></textarea>
```

**Numbers**:
```svelte
<input {...form.fields.height.as('number')} />
```

**Checkboxes** (single boolean):
```svelte
<input {...form.fields.likesDogs.as('checkbox')} />
```

**Schema for optional boolean**:
```typescript
likesDogs: v.optional(v.boolean(), false)  // Default false if unchecked
```

**Radio buttons**:
```svelte
{#each ['windows', 'mac', 'linux'] as os}
  <label>
    <input {...survey.fields.operatingSystem.as('radio', os)}>
    {os}
  </label>
{/each}
```

**Checkboxes** (multiple values as array):
```svelte
{#each ['html', 'css', 'js'] as language}
  <label>
    <input {...survey.fields.languages.as('checkbox', language)}>
    {language}
  </label>
{/each}
```

**Schema for checkbox array**:
```typescript
languages: v.optional(v.array(v.picklist(['html', 'css', 'js'])), [])
```

**Select dropdown**:
```svelte
<select {...survey.fields.operatingSystem.as('select')}>
  <option>windows</option>
  <option>mac</option>
  <option>linux</option>
</select>
```

**File uploads**:
```svelte
<form {...createProfile} enctype="multipart/form-data">
  <input {...createProfile.fields.photo.as('file')} />
</form>
```

**Schema for file**:
```typescript
photo: v.file()  // or v.file('image/*') for content type validation
```

#### Nested Fields

Support for deeply nested objects and arrays:

**Schema**:
```typescript
const schema = v.object({
  name: v.string(),
  info: v.object({
    height: v.number(),
    likesDogs: v.optional(v.boolean(), false)
  }),
  attributes: v.array(v.string())
});
```

**Usage**:
```svelte
<script>
  import { createProfile } from './data.remote';
  const { name, info, attributes } = createProfile.fields;
</script>

<form {...createProfile}>
  <input {...name.as('text')} />
  <input {...info.height.as('number')} />
  <input {...info.likesDogs.as('checkbox')} />
  
  <input {...attributes[0].as('text')} />
  <input {...attributes[1].as('text')} />
  <input {...attributes[2].as('text')} />
</form>
```

#### Validation

**Display validation errors**:
```svelte
<form {...createPost}>
  <label>
    <h2>Title</h2>
    
    {#each createPost.fields.title.issues() as issue}
      <p class="error">{issue.message}</p>
    {/each}
    
    <input {...createPost.fields.title.as('text')} />
  </label>
</form>
```

**All validation errors**:
```svelte
{#each createPost.fields.allIssues() as issue}
  <p class="error">{issue.message}</p>
{/each}
```

**Programmatic validation**:
```svelte
<!-- Validate on input -->
<form {...createPost} oninput={() => createPost.validate()}>

<!-- Validate on change -->
<form {...createPost} onchange={() => createPost.validate()}>

<!-- Validate all fields (including untouched) -->
<button onclick={() => createPost.validate({ includeUntouched: true })}>
  Validate All
</button>
```

**Client-side preflight validation**:
```svelte
<script>
  import * as v from 'valibot';
  import { createPost } from '../data.remote';
  
  const schema = v.object({
    title: v.pipe(v.string(), v.nonEmpty()),
    content: v.pipe(v.string(), v.nonEmpty())
  });
</script>

<form {...createPost.preflight(schema)}>
  <!-- Validation runs client-side before server submission -->
</form>
```

**Programmatic validation in form handler**:
```typescript
export const buyHotcakes = form(
  v.object({
    qty: v.pipe(v.number(), v.minValue(1, 'you must buy at least one'))
  }),
  async (data, invalid) => {
    try {
      await db.buy(data.qty);
    } catch (e) {
      if (e.code === 'OUT_OF_STOCK') {
        // Mark field as invalid programmatically
        invalid(invalid.qty(`we don't have enough hotcakes`));
      }
    }
  }
);
```

**Nested field validation**:
```typescript
invalid.profile.email('Email already exists')
invalid.items[0].qty('Insufficient stock')
invalid('General form error')  // Form-level error
```

#### Getting/Setting Values

**Get current values**:
```svelte
<form {...createPost}>
  <!-- form inputs -->
</form>

<div class="preview">
  <h2>{createPost.fields.title.value()}</h2>
  <div>{@html render(createPost.fields.content.value())}</div>
</div>
```

**Get all values as object**:
```typescript
const formData = createPost.fields.value();  // { title, content }
```

**Set values programmatically**:
```typescript
// Set entire object
createPost.fields.set({
  title: 'My new blog post',
  content: 'Lorem ipsum...'
});

// Set individual fields
createPost.fields.title.set('My new blog post');
createPost.fields.content.set('Lorem ipsum...');
```

#### Handling Sensitive Data

Fields with leading underscore won't repopulate on validation errors (no value sent back):

```svelte
<form {...register}>
  <label>
    Username
    <input {...register.fields.username.as('text')} />
  </label>
  
  <label>
    Password
    <input {...register.fields._password.as('password')} />
  </label>
</form>
```

If validation fails, only `username` will be populated on page reload.

#### Single-Flight Mutations

**Server-side refresh** (inside form handler):
```typescript
export const createPost = form(schema, async (data) => {
  // ... create post logic
  
  // Refresh getPosts() on server and send with result
  await getPosts().refresh();
  
  redirect(303, `/blog/${slug}`);
});

export const updatePost = form(schema, async (data) => {
  const result = await externalApi.update(post);
  
  // Set query data directly (no refetch needed)
  await getPost(post.id).set(result);
});
```

**Client-side refresh** (using enhance):
```svelte
<form {...createPost.enhance(async ({ submit }) => {
  // Refresh specific query on submit
  await submit().updates(getPosts());
})}>
```

**With optimistic updates**:
```svelte
<form {...createPost.enhance(async ({ submit }) => {
  await submit().updates(
    getPosts().withOverride((posts) => [newPost, ...posts])
  );
})}>
```

Override applies immediately and releases when submission completes.

#### Returns and Redirects

**Returning data**:
```typescript
export const createPost = form(schema, async (data) => {
  // ... logic
  return { success: true };
});
```

**Accessing returned data**:
```svelte
<form {...createPost}>
  <!-- ... -->
</form>

{#if createPost.result?.success}
  <p>Successfully published!</p>
{/if}
```

**Important**: `result` is ephemeral (vanishes on navigation/reload/resubmit).

**Redirecting**:
```typescript
export const createPost = form(schema, async (data) => {
  // ... logic
  redirect(303, `/blog/${slug}`);
});
```

#### Form Enhancement

Customize submission behavior:

```svelte
<form {...createPost.enhance(async ({ form, data, submit }) => {
  try {
    await submit();
    form.reset();  // Clear inputs
    showToast('Successfully published!');
  } catch (error) {
    showToast('Oh no! Something went wrong');
  }
})}>
```

**Properties**:
- `form` - The HTMLFormElement
- `data` - FormData object
- `submit()` - Function to perform submission

**Note**: When using `enhance`, forms don't auto-reset. Call `form.reset()` manually.

#### Form Submission States

```svelte
<form {...createPost}>
  <button disabled={!!createPost.pending}>
    {createPost.pending ? 'Publishing...' : 'Publish'}
  </button>
</form>

{#if createPost.result}
  <p>Success: {createPost.result.message}</p>
{/if}
```

**Note**: Server-side errors thrown with `error()` will trigger error boundaries. Use the `invalid()` function to mark field-specific validation errors that appear in `fields.{field}.issues()`.

#### Multiple Form Instances

Isolate forms in lists using `.for()`:

```svelte
<script lang="ts">
  import { getTodos, modifyTodo } from '../data.remote';
</script>

<h1>Todos</h1>

{#each await getTodos() as todo}
  {@const modify = modifyTodo.for(todo.id)}
  <form {...modify}>
    <!-- ... -->
    <button disabled={!!modify.pending}>save changes</button>
  </form>
{/each}
```

#### Alternative Submit Buttons

Use different actions for different buttons:

```svelte
<script lang="ts">
  import { login, register } from '$lib/auth';
</script>

<form {...login}>
  <label>
    Username
    <input {...login.fields.username.as('text')} />
  </label>
  
  <label>
    Password
    <input {...login.fields._password.as('password')} />
  </label>
  
  <button>login</button>
  <button {...register.buttonProps}>register</button>
</form>
```

The second button submits to `register` instead of `login`. `buttonProps` also has an `enhance` method.

---

### 3. command() - Programmatic Mutations

Use `command()` for mutations called programmatically (not via form submission). **Prefers `form()` when possible** for progressive enhancement.

#### Basic Command

**Definition**:
```typescript
import * as v from 'valibot';
import { command } from '$app/server';

export const addLike = command(v.string(), async (id) => {
  await db.update(tables.item)
    .set({ likes: sql`likes + 1` })
    .where(eq(tables.item.id, id));
});
```

**Usage**:
```svelte
<script lang="ts">
  import { addLike } from './likes.remote';
  
  let { item } = $props();
</script>

<button onclick={async () => {
  try {
    await addLike(item.id);
  } catch (error) {
    showToast('Something went wrong!');
  }
}}>
  add like
</button>
```

**Important**: Commands cannot be called during render (only in event handlers).

#### Updating Queries from Commands

**Server-side refresh**:
```typescript
export const addLike = command(v.string(), async (id) => {
  await db.update(tables.item)
    .set({ likes: sql`likes + 1` })
    .where(eq(tables.item.id, id));
  
  getLikes(id).refresh();
});
```

**Client-side refresh**:
```typescript
await addLike(item.id).updates(getLikes(item.id));
```

**With optimistic updates**:
```typescript
await addLike(item.id).updates(
  getLikes(item.id).withOverride((n) => n + 1)
);
```

---

### 4. prerender() - Static Data

Use `prerender()` for data that changes at most once per deployment. Computed at build time and cached on CDN.

#### Basic Prerender

**Definition**:
```typescript
import { prerender } from '$app/server';

export const getPosts = prerender(async () => {
  const posts = await db.select().from(tables.post);
  return posts;
});
```

**Usage** (same as query):
```svelte
{#each await getPosts() as post}
  <li>{post.title}</li>
{/each}
```

Data is cached using Cache API and survives reloads. Cleared when user visits new deployment.

#### Prerender with Arguments

**Definition**:
```typescript
import * as v from 'valibot';

export const getPost = prerender(v.string(), async (slug) => {
  const [post] = await db.select()
    .from(tables.post)
    .where(eq(tables.post.slug, slug));
  
  if (!post) error(404, 'Not found');
  return post;
});
```

**Specify inputs to prerender**:
```typescript
export const getPost = prerender(
  v.string(),
  async (slug) => { /* ... */ },
  {
    inputs: () => [
      'first-post',
      'second-post',
      'third-post'
    ]
  }
);
```

**Dynamic prerender** (allows runtime calls with non-prerendered args):
```typescript
export const getPost = prerender(
  v.string(),
  async (slug) => { /* ... */ },
  {
    dynamic: true,
    inputs: () => ['first-post', 'second-post']
  }
);
```

---

### Using getRequestEvent()

Access `RequestEvent` inside remote functions:

```typescript
import { getRequestEvent, query } from '$app/server';
import { findUser } from '$lib/server/database';

export const getProfile = query(async () => {
  const user = await getUser();
  
  return {
    name: user.name,
    avatar: user.avatar
  };
});

// Reusable helper - runs once per request (cached)
const getUser = query(async () => {
  const { cookies } = getRequestEvent();
  return await findUser(cookies.get('session_id'));
});
```

**Important notes**:
- Cannot set headers (except cookies in `form`/`command`)
- `route`, `params`, `url` relate to the page calling the function, not the endpoint URL
- Never use these values for authorization checks (they persist across navigation)

**Setting cookies** (in `form` and `command` only):
```typescript
import { form, getRequestEvent } from '$app/server';

export const login = form(LoginSchema, async (data) => {
  const event = getRequestEvent();
  
  // ... auth logic
  
  event.cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30  // 30 days
  });
  
  return { success: true };
});
```

---

### Validation Error Handling

**Custom error handler** (`src/hooks.server.ts`):
```typescript
import type { HandleValidationError } from '@sveltejs/kit';

export const handleValidationError: HandleValidationError = ({ event, issues }) => {
  // Log for monitoring
  console.error('Validation error:', issues);
  
  return {
    message: 'Invalid request'
  };
};
```

**Unchecked validation** (opt-out):
```typescript
import { query } from '$app/server';

export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
  // TypeScript shape might not match actual runtime arguments
  // Use with caution - bypasses validation
});
```

---

### Redirects

Use `redirect()` in `query`, `form`, and `prerender`:

```typescript
import { redirect } from '@sveltejs/kit';

export const createPost = form(schema, async (data) => {
  // ... logic
  redirect(303, `/blog/${slug}`);
});
```

**Not supported in `command`**. If needed, return redirect object and handle client-side:

```typescript
export const doSomething = command(schema, async (data) => {
  // ... logic
  return { redirect: '/success' };
});
```

```svelte
<button onclick={async () => {
  const result = await doSomething(data);
  if (result.redirect) {
    goto(result.redirect);
  }
}}>
```

---

### Remote Functions Naming Conventions

**Queries** (read operations):
- `getAll{Entities}` - List all: `getAllProducts()`, `getAllPosts()`
- `get{Entity}By{Field}` - Find by field: `getPostBySlug()`, `getUserById()`
- `get{Entity}` - Find one: `getPost()`, `getUser()` (when argument is obvious)

**Forms** (write via forms):
- `create{Entity}` - Create new: `createPost()`, `createUser()`
- `update{Entity}` - Update existing: `updatePost()`, `updateUser()`
- `delete{Entity}` - Delete: `deletePost()`, `deleteUser()`
- Use present tense verbs: `login()`, `register()`, `checkout()`

**Commands** (programmatic writes):
- Action verbs: `addLike()`, `removeFavorite()`, `markAsRead()`
- Present tense: `toggleVisibility()`, `incrementCounter()`

**Prerender** (static data):
- Same as queries but for build-time data
- Often used for navigation, metadata, static content

---

### Complete Example: Authentication

**Schema** (`src/lib/server/schemas/index.ts`):
```typescript
import * as v from 'valibot';

export const LoginSchema = v.object({
  username: v.pipe(v.string(), v.minLength(3), v.maxLength(31)),
  password: v.pipe(v.string(), v.minLength(6), v.maxLength(255))
});

export const RegisterSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31),
    v.regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, and dashes')
  ),
  password: v.pipe(v.string(), v.minLength(6), v.maxLength(255))
});
```

**Remote Functions** (`src/lib/remotes/user.remote.ts`):
```typescript
import { form, query, getRequestEvent } from '$app/server';
import { hash, verify } from '@node-rs/argon2';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { LoginSchema, RegisterSchema } from '$lib/server/schemas';

export const login = form(LoginSchema, async (data, invalid) => {
  const event = getRequestEvent();
  
  const [user] = await db.select()
    .from(tables.user)
    .where(eq(tables.user.username, data.username));
  
  if (!user) {
    invalid(invalid.username('Incorrect username or password'));
    return;
  }
  
  const validPassword = await verify(user.hashedPassword, data.password);
  if (!validPassword) {
    invalid(invalid.password('Incorrect username or password'));
    return;
  }
  
  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, user.id);
  
  auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  
  redirect(303, '/dashboard');
});

export const register = form(RegisterSchema, async (data, invalid) => {
  const event = getRequestEvent();
  
  // Check if username exists
  const [existing] = await db.select()
    .from(tables.user)
    .where(eq(tables.user.username, data.username));
  
  if (existing) {
    invalid(invalid.username('Username already taken'));
    return;
  }
  
  // Hash password
  const hashedPassword = await hash(data.password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
  
  // Check if first user (make admin)
  const userCount = await db.select({ count: count() })
    .from(tables.user);
  const isFirstUser = userCount[0].count === 0;
  
  // Create user
  const [newUser] = await db.insert(tables.user).values({
    id: crypto.randomUUID(),
    username: data.username,
    hashedPassword,
    role: isFirstUser ? 'admin' : 'user',
    isAdmin: isFirstUser,
    createdAt: new Date()
  }).returning();
  
  // Create session
  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, newUser.id);
  
  auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  
  redirect(303, '/dashboard');
});

export const logout = form(v.object({}), async () => {
  const event = getRequestEvent();
  
  const sessionId = event.cookies.get('auth-session');
  if (sessionId) {
    await auth.invalidateSession(sessionId);
    auth.deleteSessionTokenCookie(event);
  }
  
  redirect(303, '/');
});

export const getCurrentUser = query(async () => {
  const event = getRequestEvent();
  return event.locals.user;
});
```

**Login Form** (`src/lib/components/client/features/auth/login-form.svelte`):
```svelte
<script lang="ts">
  import { login } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as m from '$lib/paraglide/messages';
</script>

<form {...login}>
  <div>
    <Label for={login.fields.username.name}>
      {m.username()}
    </Label>
    <Input {...login.fields.username.as('text')} />
    {#each login.fields.username.issues() as issue}
      <p class="text-destructive text-sm">{issue.message}</p>
    {/each}
  </div>
  
  <div>
    <Label for={login.fields.password.name}>
      {m.password()}
    </Label>
    <Input {...login.fields.password.as('password')} />
    {#each login.fields.password.issues() as issue}
      <p class="text-destructive text-sm">{issue.message}</p>
    {/each}
  </div>
  
  <Button type="submit" disabled={!!login.pending}>
    {login.pending ? m.loggingIn() : m.login()}
  </Button>
</form>
```

**Signup Form** (`src/lib/components/client/features/auth/signup-form.svelte`):
```svelte
<script lang="ts">
  import { register } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as m from '$lib/paraglide/messages';
  
  let confirmPassword = $state('');
  let passwordMismatch = $state(false);
  
  function checkPasswords() {
    const password = register.fields.password.value();
    passwordMismatch = password !== confirmPassword && confirmPassword.length > 0;
  }
</script>

<form {...register}>
  <div>
    <Label for={register.fields.username.name}>
      {m.username()}
    </Label>
    <Input {...register.fields.username.as('text')} />
    {#each register.fields.username.issues() as issue}
      <p class="text-destructive text-sm">{issue.message}</p>
    {/each}
  </div>
  
  <div>
    <Label for={register.fields.password.name}>
      {m.password()}
    </Label>
    <Input
      {...register.fields.password.as('password')}
      oninput={checkPasswords}
    />
    {#each register.fields.password.issues() as issue}
      <p class="text-destructive text-sm">{issue.message}</p>
    {/each}
  </div>
  
  <div>
    <Label>{m.confirmPassword()}</Label>
    <Input
      type="password"
      bind:value={confirmPassword}
      oninput={checkPasswords}
    />
    {#if passwordMismatch}
      <p class="text-destructive text-sm">{m.passwordsMustMatch()}</p>
    {/if}
  </div>
  
  <Button
    type="submit"
    disabled={!!register.pending || passwordMismatch}
  >
    {register.pending ? m.registering() : m.register()}
  </Button>
</form>
```

**Logout Button** (`src/lib/components/client/features/auth/logout-button.svelte`):
```svelte
<script lang="ts">
  import { logout } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import * as m from '$lib/paraglide/messages';
</script>

<form {...logout}>
  <Button type="submit" disabled={!!logout.pending} variant="ghost">
    {logout.pending ? m.loggingOut() : m.logout()}
  </Button>
</form>
```

---

### Best Practices

1. **Always Validate Arguments**
   - Use Valibot schemas for all `query`, `form`, `command` with arguments
   - Never trust client input
   - Schema validation runs before your callback

2. **Use Appropriate Function Type**
   - `query()` - Reading data (GET-like)
   - `form()` - Mutations via forms (supports no-JS)
   - `command()` - Programmatic mutations (requires JS)
   - `prerender()` - Static/build-time data

3. **Progressive Enhancement**
   - Prefer `form()` over `command()` when possible
   - Forms work without JavaScript using `method` and `action` attributes
   - Use `enhance()` to customize behavior when JS is available

4. **Authentication & Authorization**
   - Use `getRequestEvent()` to access cookies
   - Check `event.locals.user` for authentication
   - Perform authorization checks in remote functions, not in components
   - Never rely on `params` or `url` from `getRequestEvent()` for auth

5. **Error Handling**
   - Use `error(statusCode, message)` for user-facing errors
   - Implement `handleValidationError` hook for custom error responses
   - Show validation errors with `fields.{field}.issues()`

6. **Performance**
   - Use `query.batch()` to solve N+1 problems
   - Implement single-flight mutations with `refresh()` or `set()`
   - Use `prerender()` for data that changes per deployment
   - Queries are cached per page - no need for manual caching

7. **Type Safety**
   - Export types from schemas: `$inferSelect`, `$inferInsert`
   - TypeScript infers form field types from schema
   - Use proper typing for `PageServerLoad` and `Actions`

8. **Naming Conventions**
   - Use descriptive, action-oriented names
   - Follow `get{Entity}`, `create{Entity}`, `update{Entity}` patterns
   - Keep names consistent across the codebase

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
- Do not create Summary files
- **Create `+page.server.ts` or `+layout.server.ts` files** - Use remote functions with `query()` and `form()` instead
- **Use load functions for data fetching** - All data should be fetched via remote functions called from components

### ✓ Always Do

- Use Svelte 5 runes (`$props`, `$state`, `$bindable`, `{@render}`)
- Validate all inputs server-side with Valibot
- Use `cn()` for className merging
- Generate UUIDs server-side with `crypto.randomUUID()`
- Type all functions properly
- Use `new Date()` for timestamp fields
- Follow shadcn-svelte pattern for UI components
- Wrap database operations in remote functions
- Export types from schemas (`$inferSelect`, `$inferInsert`)
- **Always use translation keys** - Never hardcode text in components/pages
- **Update all message files** - When adding translations, update `en.json`, `uk.json`
- **Check https://www.shadcn-svelte.com/llms.txt before creating new UI components**
- **Update .results/ documentation when adding features**
- **Use remote functions pattern for all UI data interactions**
- **Use `await` in components to call remote functions** - `{#each await getAllProducts() as product}`
- **If .results folder is updated check if instruction file needs update**

**Remote Functions Specific:**
- **Use `query()` for all read operations** - Never call DB directly from components
- **Use `form()` for mutations via forms** - Prefer over `command()` for progressive enhancement
- **Use `command()` for programmatic actions** - For simple state toggles, quick updates without form submission
- **Spread form objects onto form elements** - `<form {...formFunction}>`
- **Use fields API for inputs** - `<input {...form.fields.name.as('text')} />`
- **Display validation errors** - `{#each form.fields.name.issues() as issue}`
- **Always validate arguments** - Pass Valibot schema to `query()`, `form()`, `command()`
- **Use `getRequestEvent()` to access cookies** - Never use `params` or `url` for auth
- **Implement single-flight mutations** - Use `refresh()` or `set()` to update queries
- **Use `query.batch()` for N+1 problems** - Batch simultaneous queries
- **Auto-refresh queries after mutations** - Call `query().refresh()` inside `command()` handlers (server-side) or use `$effect()` for form-based mutations
- **Handle submission states** - Check `form.pending`, `form.result` (use `invalid()` for errors)
- **Call `form.reset()` when using enhance** - Forms don't auto-reset with custom enhancement

**UI Component Data Interaction Pattern (MANDATORY):**
This is the required approach for all admin/client feature components:

1. **Direct `await` in Templates** - Use `{#await query() then data}` pattern for rendering data:
   ```svelte
   {#await getAllUsers({ username: searchQuery })}
     <div>Loading...</div>
   {:then users}
     {#each users as user}
       <!-- render user -->
     {/each}
   {:catch error}
     <div>Error: {error.message}</div>
   {/await}
   ```

2. **Reactive Query Parameters** - Queries re-execute when their parameters change:
   ```svelte
   <script lang="ts">
     import { getAllUsers } from '$lib/remotes/user.remote';
     
     let searchQuery = $state('');  // Changes to this re-trigger query
   </script>
   
   {#await getAllUsers({ username: searchQuery }) then users}
     <!-- Data automatically refreshes when searchQuery changes -->
   {/await}
   ```

3. **Command-Based Actions with Server-Side Refresh** - For quick actions without forms:
   ```svelte
   <script lang="ts">
     import { toggleAdminStatus, getAllUsers } from '$lib/remotes/user.remote';
     
     async function handleToggleAdmin(user) {
       await toggleAdminStatus({
         id: user.id,
         isAdmin: !user.isAdmin
       });
       // No client-side refresh needed - server handles it via query().refresh()
     }
   </script>
   ```

4. **Form-Based Mutations with Dialog State** - For complex edits via dialogs:
   ```svelte
   <script lang="ts">
     import { updateUser } from '$lib/remotes/user.remote';
     
     let editingUser = $state(null);
     let dialogOpen = $state(false);
     
     function openDialog(user) {
       editingUser = user;
       dialogOpen = true;
     }
     
     // Use $effect to auto-refresh query after form submission
     $effect(() => {
       if (updateUser.result) {
         dialogOpen = false;
         getAllUsers({ username: '' }).refresh();
       }
     });
   </script>
   
   <EditUserDialog user={editingUser} bind:open={dialogOpen} />
   ```

5. **No Manual State Management** - Never store query results in local state:
   ```svelte
   <!-- ❌ WRONG - Don't do this -->
   <script lang="ts">
     let users = $state([]);
     
     $effect(() => {
       getAllUsers().then(data => users = data);  // NO!
     });
   </script>
   
   <!-- ✅ CORRECT - Use await directly -->
   <script lang="ts">
     let searchQuery = $state('');
   </script>
   
   {#await getAllUsers({ username: searchQuery }) then users}
     {#each users as user}
       <!-- render -->
     {/each}
   {/await}
   ```

6. **Server-Side Query Refresh in Commands** - Commands should refresh related queries on server:
   ```typescript
   // In remote function file
   export const toggleAdminStatus = command(schema, async (data) => {
     auth.requireAdminUser();
     
     // Perform mutation
     await db.update(tables.user)
       .set({ isAdmin: data.isAdmin })
       .where(eq(tables.user.id, data.id));
     
     // Refresh related query on server (critical!)
     await getAllUsers({ username: '' }).refresh();
     
     return { success: true };
   });
   ```

**Why This Approach:**
- **Eliminates duplicate state** - Query results aren't copied to component state
- **Automatic reactivity** - Parameter changes auto-trigger re-queries
- **Server-side refresh** - Mutations refresh queries on server, reducing client logic
- **Type safety** - Direct query calls maintain TypeScript inference
- **Simpler code** - No manual useEffect-style patterns or state synchronization

**Complete Example - User List Table:**

Remote functions (`src/lib/remotes/user.remote.ts`):
```typescript
import { query, command, form } from '$app/server';
import * as v from 'valibot';
import { auth } from '$lib/server/auth';

export const getAllUsers = query(
  v.object({ username: v.optional(v.string(), '') }),
  async (data) => {
    auth.requireAdminUser();
    
    let query = db.select().from(tables.user);
    
    if (data.username) {
      query = query.where(like(tables.user.username, `%${data.username}%`));
    }
    
    return await query;
  }
);

export const toggleAdminStatus = command(
  v.object({ id: v.string(), isAdmin: v.boolean() }),
  async (data) => {
    auth.requireAdminUser();
    
    await db.update(tables.user)
      .set({ isAdmin: data.isAdmin })
      .where(eq(tables.user.id, data.id));
    
    // Critical: Refresh query on server
    await getAllUsers({ username: '' }).refresh();
    
    return { success: true };
  }
);

export const updateUser = form(UpdateUserSchema, async (data) => {
  auth.requireAdminUser();
  
  const [updated] = await db.update(tables.user)
    .set(data)
    .where(eq(tables.user.id, data.id))
    .returning();
  
  return updated;
});

export const deleteUser = form(DeleteUserSchema, async (data) => {
  auth.requireAdminUser();
  
  await db.delete(tables.user)
    .where(eq(tables.user.id, data.id));
  
  return { success: true };
});
```

Component (`user-list-table.svelte`):
```svelte
<script lang="ts">
  import { getAllUsers, toggleAdminStatus } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import EditUserDialog from './edit-user-dialog.svelte';
  import DeleteUserDialog from './delete-user-dialog.svelte';
  
  // Reactive search parameter
  let searchQuery = $state('');
  
  // Dialog state
  let editingUser = $state(null);
  let deletingUser = $state(null);
  let editDialogOpen = $state(false);
  let deleteDialogOpen = $state(false);
  
  function openEditDialog(user) {
    editingUser = user;
    editDialogOpen = true;
  }
  
  function openDeleteDialog(user) {
    deletingUser = user;
    deleteDialogOpen = true;
  }
  
  async function handleToggleAdmin(user) {
    await toggleAdminStatus({
      id: user.id,
      isAdmin: !user.isAdmin
    });
    // No client-side refresh - server handles it
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Search input - changes trigger automatic re-query -->
  <Input
    type="text"
    placeholder="Search users..."
    bind:value={searchQuery}
  />
  
  <!-- Direct await pattern - no manual state management -->
  {#await getAllUsers({ username: searchQuery })}
    <div>Loading...</div>
  {:then users}
    {#each users as user}
      <div class="user-row">
        <span>{user.username}</span>
        <span>{user.email}</span>
        
        <Button onclick={() => openEditDialog(user)}>
          Edit
        </Button>
        
        <Button onclick={() => handleToggleAdmin(user)}>
          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
        </Button>
        
        <Button onclick={() => openDeleteDialog(user)}>
          Delete
        </Button>
      </div>
    {/each}
  {:catch error}
    <div>Error: {error.message}</div>
  {/await}
</div>

<!-- Dialogs handle their own form submissions -->
<EditUserDialog user={editingUser} bind:open={editDialogOpen} />
<DeleteUserDialog user={deletingUser} bind:open={deleteDialogOpen} />
```

Edit User Dialog (`edit-user-dialog.svelte`):
```svelte
<script lang="ts">
  import { updateUser, getAllUsers } from '$lib/remotes/user.remote';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  
  let { user, open = $bindable() } = $props();
  
  // Auto-refresh query and close dialog after successful submission
  $effect(() => {
    if (updateUser.result) {
      open = false;
      getAllUsers({ username: '' }).refresh();
    }
  });
  
  // Pre-populate form when dialog opens
  $effect(() => {
    if (open && user) {
      updateUser.fields.set({
        id: user.id,
        username: user.username,
        email: user.email || ''
      });
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit User</Dialog.Title>
    </Dialog.Header>
    
    <form {...updateUser}>
      <Input {...updateUser.fields.username.as('text')} />
      {#each updateUser.fields.username.issues() as issue}
        <p class="error">{issue.message}</p>
      {/each}
      
      <Input {...updateUser.fields.email.as('email')} />
      
      <Button type="submit" disabled={!!updateUser.pending}>
        {updateUser.pending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
```

**Key Patterns Demonstrated:**
1. ✅ Direct `await` in template - no intermediate state
2. ✅ Reactive query parameters - `searchQuery` changes auto-refresh
3. ✅ Command with server-side refresh - `toggleAdminStatus()` calls `query().refresh()`
4. ✅ Form submission detection - `$effect()` watches `updateUser.result`
5. ✅ Dialog state management - `$bindable()` for two-way binding
6. ✅ Form pre-population - `fields.set()` when dialog opens

**Authentication in Remote Functions:**
- **Use `getUser()` helper** - Call in remote functions to require authentication (redirects to `/auth/login` if not logged in)
- **Use `requireAdminUser()` helper** - Call in remote functions to require admin privileges (redirects to `/auth/login` if not admin)
- **Both helpers automatically redirect** - No need for manual authentication checks
- **Import from auth module** - `import { getUser, requireAdminUser } from '$lib/server/auth'`

Example protected remote function:
```typescript
import { query } from '$app/server';
import { getUser, requireAdminUser } from '$lib/server/auth';

export const getProtectedData = query(async () => {
  const user = getUser(); // Redirects to login if not authenticated
  return { data: 'protected', userId: user.id };
});

export const getAdminData = query(async () => {
  const user = requireAdminUser(); // Redirects to login if not admin
  return { data: 'admin only', userId: user.id };
});
```

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
- **UI Components**: `src/lib/components/ui/{name}/` (shadcn-svelte primitives)
- **Admin Components**: `src/lib/components/admin/{layout|features|widgets}/`
- **Client Components**: `src/lib/components/client/{layout|features|widgets}/`
- **Common Components**: `src/lib/components/common/{layout|data-display|forms|feedback|navigation|utility}/`
- **Remote Functions**: `src/lib/remotes/{domain}.remote.ts`
- **Database**: `src/lib/server/db/`
- **Schemas**: `src/lib/server/schemas/index.ts`
- **Routes**: `src/routes/`
- **Auth**: `src/lib/server/auth.ts`
- **i18n**: `src/lib/i18n.ts`, `messages/{locale}.json`

### Import Patterns
```typescript
// UI Components (shadcn-svelte)
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

// Admin Components
import { ProductForm } from '$lib/components/admin/features/product-management';
import { BlogListTable, BlogForm } from '$lib/components/admin/features/blog-management';
import { AdminSidebar } from '$lib/components/admin/layout';

// Client Components
import { ProductCard } from '$lib/components/client/features/product-catalog';
import { CartDrawer } from '$lib/components/client/features/cart';

// Common Components
import { DataTable } from '$lib/components/common/data-display';
import { RichTextEditor } from '$lib/components/common/forms';

// Utilities & Server
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
