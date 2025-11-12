# Validation Domain Implementation

## Overview
Validation uses Valibot for schema-based validation of form inputs and query parameters. Schemas are integrated with remote functions for automatic validation.

## Schema Location
All validation schemas in: `src/lib/server/schemas/index.ts`

## Valibot Basics

### Import
```typescript
import * as v from 'valibot';
```

### Object Schema Pattern
```typescript
export const SchemaName = v.object({
  field1: v.string(),
  field2: v.pipe(v.string(), v.minLength(1)),
  field3: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  field4: v.optional(v.string())
});
```

## Actual Schemas

### CreateBlogSchema
```typescript
export const CreateBlogSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  authorId: v.string()
});
```

**Validations:**
- `title`: 1-200 characters
- `content`: At least 1 character
- `slug`: 1-200 characters
- `authorId`: Any string (UUID expected)

### UpdateBlogSchema
```typescript
export const UpdateBlogSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});
```

**Key Difference:** Includes `id` for identifying which blog to update

## Validation Patterns

### String Validation
```typescript
// Required string
v.string()

// With length constraints
v.pipe(v.string(), v.minLength(3))
v.pipe(v.string(), v.maxLength(100))
v.pipe(v.string(), v.minLength(3), v.maxLength(100))

// With pattern matching
v.pipe(v.string(), v.regex(/^[a-z0-9_-]+$/))

// Email
v.pipe(v.string(), v.email())

// URL
v.pipe(v.string(), v.url())
```

### Number Validation
```typescript
// Required number
v.number()

// With range
v.pipe(v.number(), v.minValue(0))
v.pipe(v.number(), v.maxValue(100))
v.pipe(v.number(), v.minValue(0), v.maxValue(100))

// Integer only
v.pipe(v.number(), v.integer())
```

### Optional Fields
```typescript
// Optional string
v.optional(v.string())

// Optional with default
v.optional(v.string(), "default value")

// Nullable
v.nullable(v.string())

// Optional or null
v.optional(v.nullable(v.string()))
```

### Array Validation
```typescript
// Array of strings
v.array(v.string())

// Array with min/max length
v.pipe(v.array(v.string()), v.minLength(1))
v.pipe(v.array(v.string()), v.maxLength(10))

// Array of objects
v.array(v.object({
  id: v.string(),
  name: v.string()
}))
```

### Boolean Validation
```typescript
v.boolean()

// With literal check
v.literal(true)  // Must be exactly true
```

### Enum/Literal
```typescript
// Specific values only
v.picklist(['draft', 'published', 'archived'])

// Union of literals
v.union([v.literal('yes'), v.literal('no')])
```

### Date Validation
```typescript
// Date object
v.date()

// With min/max
v.pipe(v.date(), v.minValue(new Date('2024-01-01')))
v.pipe(v.date(), v.maxValue(new Date()))
```

## Integration with Remote Functions

### With form() Function
```typescript
import { form } from "$app/server";
import { CreateBlogSchema } from "$lib/server/schemas";

export const createBlog = form(CreateBlogSchema, async (data) => {
  // data is typed and validated automatically
  // data.title, data.content, data.slug, data.authorId are all available
  
  const newBlog = await db.insert(tables.blog).values({
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date()
  }).returning();

  return newBlog;
});
```

**Key Points:**
- Schema passed as first argument
- `data` parameter is automatically typed from schema
- Validation happens before function executes
- Returns validation errors if fails

### With query() Function
```typescript
import { query } from "$app/server";
import * as v from 'valibot';

// Single parameter validation
export const getBlog = query(v.string(), async (slug) => {
  // slug is validated as string
  const [blog] = await db.select()
    .from(tables.blog)
    .where(eq(tables.blog.slug, slug));
  return blog;
});

// Object parameter validation
export const searchBlogs = query(
  v.object({
    query: v.string(),
    limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10)
  }),
  async ({ query, limit }) => {
    const blogs = await db.select()
      .from(tables.blog)
      .where(like(tables.blog.title, `%${query}%`))
      .limit(limit);
    return blogs;
  }
);
```

## Type Inference

Valibot schemas automatically infer TypeScript types:

```typescript
const UserSchema = v.object({
  username: v.pipe(v.string(), v.minLength(3)),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.number())
});

// Infer type from schema
type User = v.InferOutput<typeof UserSchema>;
// Type is: { username: string; email: string; age?: number }
```

## Custom Validation

### Custom Validators
```typescript
// Custom validator function
const isSlug = v.pipe(
  v.string(),
  v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  v.check((value) => !value.startsWith('-') && !value.endsWith('-'))
);

export const BlogSchema = v.object({
  slug: isSlug
});
```

### Transform Values
```typescript
// Transform to lowercase
const lowercaseString = v.pipe(
  v.string(),
  v.transform((value) => value.toLowerCase())
);

// Trim whitespace
const trimmedString = v.pipe(
  v.string(),
  v.transform((value) => value.trim())
);
```

## Error Handling

Validation errors are automatically returned by remote functions:

```typescript
// In a form action
export const createBlog = form(CreateBlogSchema, async (data) => {
  // If validation fails, error is returned automatically
  // If this code runs, data is valid
});
```

Accessing errors on client:
```svelte
<script>
  import { createBlog } from '$lib/remotes/blog.remote';
  
  let error = $state(null);
  
  async function handleSubmit(formData) {
    const result = await createBlog(formData);
    if (result.error) {
      error = result.error.message;
    }
  }
</script>
```

## Best Practices

1. **Define schemas server-side**: In `$lib/server/schemas/`
2. **Use pipe for chaining**: `v.pipe(v.string(), v.minLength(1))`
3. **Validate all inputs**: Both query params and form data
4. **Specific error messages**: Use descriptive field names
5. **Type inference**: Let TypeScript infer types from schemas
6. **Reuse common validators**: Extract to constants
7. **Transform data**: Use `v.transform()` for normalization
8. **Optional vs nullable**: Use `v.optional()` for missing, `v.nullable()` for null
9. **Server-side only**: Never skip server validation
10. **Match database constraints**: Align with schema.ts constraints

## Common Patterns

### User Registration Schema
```typescript
export const RegisterSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31),
    v.regex(/^[a-z0-9_-]+$/)
  ),
  password: v.pipe(
    v.string(),
    v.minLength(6),
    v.maxLength(255)
  ),
  email: v.pipe(v.string(), v.email())
});
```

### Search/Filter Schema
```typescript
export const SearchSchema = v.object({
  query: v.optional(v.string(), ''),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10),
  sortBy: v.optional(v.picklist(['created', 'updated', 'title']))
});
```

### ID Parameter Schema
```typescript
export const IdSchema = v.pipe(
  v.string(),
  v.uuid() // Or v.length(26) for custom IDs
);
```

## Dependencies

- `valibot`: Schema validation library
- Integrated with `$app/server` query() and form() functions
- No additional dependencies needed
