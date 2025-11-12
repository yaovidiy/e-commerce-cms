# Technology Stack Analysis

## Core Technology Analysis

### Programming Language
- **TypeScript** (v5.0+) - Strongly typed JavaScript used throughout the entire codebase
- Module system: ESM (type: "module" in package.json)

### Primary Framework
- **SvelteKit v2** - Full-stack framework for building Svelte applications
  - Using Svelte 5 with new runes API (`$props`, `$bindable`, `@render`)
  - Adapter: `@sveltejs/adapter-auto` for automatic deployment configuration
  - Vite 5 as the build tool
  - Experimental features enabled:
    - `remoteFunctions: true` - Server-side function calling from client
    - Compiler option `async: true` - Async component support

### Secondary Frameworks & Libraries

**Authentication & Security:**
- Custom session-based authentication system (not using Lucia directly, but inspired by it)
- `@node-rs/argon2` - Password hashing
- `@oslojs/crypto` & `@oslojs/encoding` - Cryptographic utilities for session tokens

**Database & ORM:**
- **Drizzle ORM v0.33** - TypeScript ORM
- **better-sqlite3** - SQLite database driver
- Database dialect: SQLite
- Migration tools: `drizzle-kit` for schema management

**Validation:**
- **Valibot v1.1** - Schema validation library for form data and API inputs

**Internationalization (i18n):**
- **@inlang/paraglide-sveltekit v0.11** - Compile-time i18n with zero runtime overhead
- Supports multiple languages (en, uk based on messages/ folder)

**UI & Styling:**
- **Tailwind CSS v4** - Utility-first CSS framework (recently migrated from v3)
- **@tailwindcss/vite** - Vite plugin for Tailwind v4
- **shadcn-svelte** inspired component system (button component detected)
- **tailwind-variants** - For creating variant-based component APIs
- **tailwind-merge** & **clsx** - For conditional class merging
- **tw-animate-css** - Animation utilities
- **@lucide/svelte** - Icon library

**Testing:**
- **Playwright** - End-to-end testing framework

**Code Quality:**
- **ESLint v9** with TypeScript and Svelte plugins
- **Prettier v3** with Svelte and Tailwind plugins
- **svelte-check** - Type checking for Svelte files

### State Management Approach
- **No centralized state management library** (no Redux, Zustand, Pinia, etc.)
- Uses SvelteKit's built-in patterns:
  - Server-side: `PageServerLoad` functions and form actions
  - Client-side: Svelte's reactive `$state` runes (Svelte 5)
  - Shared state: `event.locals` for request-scoped data (user, session)
- Remote functions pattern enabled for server-client communication

## Domain Specificity Analysis

### Problem Domain
This is a **SvelteKit E-commerce CMS** application that targets:
- **Content management** for blog/article publishing
- **E-commerce** capabilities (indicated by project name)
- **Multi-language support** for international audiences
- **User authentication and authorization**

### Core Business Concepts

**Content Management:**
- Blog posts with title, content, slug, author relationships
- Content creation and editing workflows
- Author attribution

**User Management:**
- User registration and login
- Session-based authentication (30-day expiry with 15-day renewal)
- Password security with Argon2 hashing

**Data Models:**
- `User`: id, username, passwordHash, age (optional)
- `Session`: id, userId (FK), expiresAt
- `Blog`: id, title, content, slug, authorId (FK), createdAt

### User Interaction Types

1. **Authentication Flows:**
   - User registration with validation (username 3-31 chars, password 6-255 chars)
   - Login/logout functionality
   - Session management with automatic renewal

2. **Content Management:**
   - Create blog posts (with schema validation)
   - Update blog posts
   - Search blogs by title (LIKE queries)
   - Filter blogs by author
   - View individual blog by slug

3. **Internationalization:**
   - Language switching (compile-time i18n)
   - Localized content display

### Primary Data Structures

**Database Schema Types:**
```typescript
User: { id: string, username: string, passwordHash: string, age?: number }
Session: { id: string, userId: string, expiresAt: Date }
Blog: { id: string, title: string, content: string, slug: string, authorId: string, createdAt: Date }
```

**Validation Schemas (Valibot):**
- `CreateBlogSchema`: Validates title (1-200 chars), content (min 1 char), slug (1-200 chars), authorId
- `UpdateBlogSchema`: Validates id, title, content, slug

**Remote Functions (Query/Form Patterns):**
- `query()` - Server-side data fetching with optional input validation
- `form()` - Server-side form actions with schema validation

## Application Boundaries

### Features Clearly Within Scope

1. **Blog/Content Management:**
   - CRUD operations for blog posts
   - Author-based content organization
   - Slug-based routing
   - Search and filtering

2. **Authentication System:**
   - Username/password authentication
   - Session management with secure tokens (SHA-256 hashed)
   - Cookie-based session persistence

3. **Internationalization:**
   - Multi-language UI support
   - Compile-time translation generation

4. **Database Management:**
   - SQLite-based data persistence
   - Schema migrations via Drizzle
   - Type-safe database queries

5. **UI Component System:**
   - shadcn-svelte style components
   - Variant-based component APIs
   - Tailwind-based styling

### Features Architecturally Consistent

- Adding more content types (products, pages, categories) following the blog pattern
- Implementing more UI components following the shadcn-svelte pattern
- Adding more remote functions for server-side logic
- Extending authentication (roles, permissions) on the existing session system
- Adding more validation schemas using Valibot
- E-commerce features (products, cart, checkout) would fit the existing patterns

### Features Potentially Inconsistent

- **Real-time features** (WebSockets, SSE) - Would require architectural additions
- **Client-side only state management** (Redux, Zustand) - Project uses server-first approach
- **GraphQL** - Project uses SvelteKit's load functions and remote functions pattern
- **Different database** (PostgreSQL, MongoDB) - Would require Drizzle dialect changes
- **CSS-in-JS** (styled-components, emotion) - Project uses Tailwind utility classes
- **Class-based components** - Project uses Svelte's functional component style
- **REST API endpoints** - Project uses SvelteKit's form actions and remote functions instead

### Specialized Technologies & Constraints

**Security Constraints:**
- Passwords must be hashed with Argon2 (specific parameters: memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1)
- Session tokens use SHA-256 hashing
- Sessions expire after 30 days, renew at 15 days

**Database Constraints:**
- SQLite only (no connection pooling needed)
- Timestamps stored as integers with `{ mode: 'timestamp' }` 
- Primary keys are text-based UUIDs or base32-encoded random bytes
- Foreign key constraints enforced (user references)

**i18n Constraints:**
- Translations must be compile-time (paraglide-sveltekit)
- Message files in `/messages/{locale}.json`
- i18n handle must wrap app in `+layout.svelte`

**Styling Constraints:**
- Must use Tailwind v4 utility classes
- Component variants via `tailwind-variants`
- Class merging via `cn()` utility (clsx + tailwind-merge)
- No inline styles or component-scoped CSS encouraged

**Svelte 5 Constraints:**
- Must use runes: `$props`, `$state`, `$derived`, `$effect`, `$bindable`
- No legacy `export let` syntax
- Render blocks: `{@render children?.()}`
- Module context: `<script lang="ts" module>`
