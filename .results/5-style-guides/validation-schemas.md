# Validation Schemas Style Guide

## Overview
Validation schemas use Valibot for type-safe input validation. Schemas are integrated with remote functions and define the shape and constraints of data.

## File Location
```
src/lib/server/schemas/index.ts
```

All validation schemas in a single barrel file.

## File Template

```typescript
import * as v from 'valibot';

// Schema definition
export const SchemaName = v.object({
  field1: v.string(),
  field2: v.pipe(v.string(), v.minLength(1)),
  field3: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  field4: v.optional(v.string())
});

// Type inference (optional, but useful)
export type SchemaNameInput = v.InferOutput<typeof SchemaName>;
```

## Import

```typescript
import * as v from 'valibot';
```

**Always import as namespace** to keep validators organized.

## Schema Patterns

### Basic Object Schema
```typescript
export const UserSchema = v.object({
  username: v.string(),
  email: v.string(),
  age: v.number()
});
```

### With Validation Chains
Use `v.pipe()` to chain multiple validators:

```typescript
export const UserSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31),
    v.regex(/^[a-z0-9_-]+$/)
  ),
  email: v.pipe(
    v.string(),
    v.email()
  ),
  age: v.pipe(
    v.number(),
    v.minValue(18),
    v.maxValue(120)
  )
});
```

## String Validators

### Basic String
```typescript
v.string()  // Any string
```

### Length Constraints
```typescript
v.pipe(v.string(), v.minLength(1))              // At least 1 char
v.pipe(v.string(), v.maxLength(200))            // At most 200 chars
v.pipe(v.string(), v.minLength(3), v.maxLength(31))  // Between 3-31
```

### Pattern Matching
```typescript
// Regex pattern
v.pipe(v.string(), v.regex(/^[a-z0-9_-]+$/))

// Starts with
v.pipe(v.string(), v.startsWith('https://'))

// Ends with
v.pipe(v.string(), v.endsWith('.com'))

// Includes
v.pipe(v.string(), v.includes('@'))
```

### Format Validation
```typescript
v.pipe(v.string(), v.email())         // Email format
v.pipe(v.string(), v.url())           // URL format
v.pipe(v.string(), v.uuid())          // UUID format
v.pipe(v.string(), v.ip())            // IP address
v.pipe(v.string(), v.ipv4())          // IPv4 address
v.pipe(v.string(), v.ipv6())          // IPv6 address
```

### String Transformations
```typescript
// Trim whitespace
v.pipe(v.string(), v.trim())

// To lowercase
v.pipe(v.string(), v.toLowerCase())

// To uppercase
v.pipe(v.string(), v.toUpperCase())

// Combined
v.pipe(
  v.string(),
  v.trim(),
  v.toLowerCase(),
  v.minLength(3)
)
```

## Number Validators

### Basic Number
```typescript
v.number()  // Any number
```

### Range Constraints
```typescript
v.pipe(v.number(), v.minValue(0))               // >= 0
v.pipe(v.number(), v.maxValue(100))             // <= 100
v.pipe(v.number(), v.minValue(1), v.maxValue(100))  // 1-100
```

### Number Types
```typescript
v.pipe(v.number(), v.integer())     // Must be integer
v.pipe(v.number(), v.finite())      // No Infinity/NaN
```

## Boolean Validators

```typescript
v.boolean()            // true or false
v.literal(true)        // Must be exactly true
v.literal(false)       // Must be exactly false
```

## Optional & Nullable

### Optional Fields
```typescript
// Optional (can be undefined)
v.optional(v.string())

// Optional with default
v.optional(v.string(), 'default value')
v.optional(v.number(), 0)

// Optional with transform
v.optional(v.pipe(v.string(), v.trim()))
```

### Nullable Fields
```typescript
// Can be null
v.nullable(v.string())

// Can be null or undefined
v.optional(v.nullable(v.string()))
```

## Array Validators

### Basic Array
```typescript
v.array(v.string())          // Array of strings
v.array(v.number())          // Array of numbers
```

### Array Length
```typescript
v.pipe(v.array(v.string()), v.minLength(1))      // At least 1 item
v.pipe(v.array(v.string()), v.maxLength(10))     // At most 10 items
v.pipe(v.array(v.string()), v.length(5))         // Exactly 5 items
```

### Array of Objects
```typescript
v.array(v.object({
  id: v.string(),
  name: v.string()
}))
```

## Enum/Picklist

### Fixed Values
```typescript
// One of these values
v.picklist(['draft', 'published', 'archived'])

// With type inference
const StatusSchema = v.picklist(['draft', 'published', 'archived']);
type Status = v.InferOutput<typeof StatusSchema>; // 'draft' | 'published' | 'archived'
```

### Union of Literals
```typescript
v.union([
  v.literal('yes'),
  v.literal('no'),
  v.literal('maybe')
])
```

## Date Validators

```typescript
v.date()                                    // Any date

v.pipe(v.date(), v.minValue(new Date('2024-01-01')))  // After date
v.pipe(v.date(), v.maxValue(new Date()))               // Before now
```

## Custom Validation

### Custom Check
```typescript
v.pipe(
  v.string(),
  v.check((value) => value !== 'admin', 'Username cannot be "admin"')
)
```

### Custom Transform
```typescript
v.pipe(
  v.string(),
  v.transform((value) => value.toLowerCase().trim())
)
```

### Complex Validation
```typescript
export const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, 'Password must be at least 8 characters'),
  v.check(
    (value) => /[A-Z]/.test(value),
    'Password must contain uppercase letter'
  ),
  v.check(
    (value) => /[a-z]/.test(value),
    'Password must contain lowercase letter'
  ),
  v.check(
    (value) => /[0-9]/.test(value),
    'Password must contain number'
  )
);
```

## Actual Project Schemas

### CreateBlogSchema
```typescript
export const CreateBlogSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  authorId: v.string()
});
```

### UpdateBlogSchema
```typescript
export const UpdateBlogSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  content: v.pipe(v.string(), v.minLength(1)),
  slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});
```

## Naming Conventions

### Schema Names
- PascalCase with "Schema" suffix
- Descriptive of purpose

```typescript
CreateBlogSchema     // For creation
UpdateBlogSchema     // For updates
LoginSchema          // For login
SearchSchema         // For search
```

### Field Names
- camelCase
- Match database field names (in camelCase)

```typescript
username       // ✓
email         // ✓
firstName     // ✓
user_name     // ✗ (use camelCase)
```

## Usage with Remote Functions

### With form()
```typescript
import { form } from "$app/server";
import { CreateBlogSchema } from "$lib/server/schemas";

export const createBlog = form(CreateBlogSchema, async (data) => {
  // data is typed and validated
  // data.title, data.content, etc.
  return await db.insert(tables.blog).values(data);
});
```

### With query()
```typescript
import { query } from "$app/server";
import * as v from 'valibot';

export const getBlog = query(v.string(), async (slug) => {
  // slug is validated as string
  return await db.select().from(tables.blog).where(eq(tables.blog.slug, slug));
});
```

## Type Inference

### Infer Output Type
```typescript
const UserSchema = v.object({
  username: v.string(),
  email: v.string()
});

type User = v.InferOutput<typeof UserSchema>;
// { username: string; email: string }
```

### Infer Input Type
```typescript
type UserInput = v.InferInput<typeof UserSchema>;
// Usually same as output, different with transforms
```

## Error Messages

### Default Messages
Valibot provides default error messages.

### Custom Messages
```typescript
v.pipe(
  v.string(),
  v.minLength(3, 'Username must be at least 3 characters'),
  v.maxLength(31, 'Username cannot exceed 31 characters')
)
```

### Error Object Structure
```typescript
{
  issues: [
    {
      path: ['username'],
      message: 'Username must be at least 3 characters'
    }
  ]
}
```

## Common Patterns

### Login Schema
```typescript
export const LoginSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31)
  ),
  password: v.pipe(
    v.string(),
    v.minLength(6)
  )
});
```

### Register Schema
```typescript
export const RegisterSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3),
    v.maxLength(31),
    v.regex(/^[a-z0-9_-]+$/)
  ),
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(
    v.string(),
    v.minLength(6),
    v.maxLength(255)
  )
});
```

### Search Schema
```typescript
export const SearchSchema = v.object({
  query: v.optional(v.string(), ''),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10)
});
```

### Filter Schema
```typescript
export const FilterBlogsSchema = v.object({
  authorId: v.optional(v.string()),
  status: v.optional(v.picklist(['draft', 'published'])),
  startDate: v.optional(v.date()),
  endDate: v.optional(v.date())
});
```

## Best Practices

1. **Validate all inputs**: Server-side validation is mandatory
2. **Use pipe for chains**: `v.pipe(v.string(), v.minLength(1))`
3. **Provide constraints**: Min/max lengths, value ranges
4. **Match database**: Align with schema.ts constraints
5. **Custom messages**: For user-facing validations
6. **Type inference**: Let TypeScript infer types
7. **Reuse schemas**: Extract common patterns
8. **Transform data**: Normalize input (trim, lowercase)
9. **Descriptive names**: Clear schema and field names
10. **Test schemas**: Validate edge cases

## Common Mistakes

### ❌ Not using pipe for chains
```typescript
v.string().minLength(1).maxLength(200)  // Doesn't work
```

### ✓ Use pipe
```typescript
v.pipe(v.string(), v.minLength(1), v.maxLength(200))
```

### ❌ Forgetting v. prefix
```typescript
string()  // undefined
```

### ✓ Use namespace
```typescript
v.string()
```

### ❌ Wrong order in pipe
```typescript
v.pipe(v.minLength(1), v.string())  // minLength before type
```

### ✓ Correct order
```typescript
v.pipe(v.string(), v.minLength(1))  // Type first
```

### ❌ Not exporting schema
```typescript
const CreateBlogSchema = v.object({ /* ... */ });
// Not exported
```

### ✓ Export schema
```typescript
export const CreateBlogSchema = v.object({ /* ... */ });
```

## Dependencies

- `valibot`: Schema validation library
- No additional dependencies needed
