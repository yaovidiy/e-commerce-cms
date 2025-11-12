# Authentication with Remote Functions

This document explains how authentication works in this SvelteKit E-commerce CMS using remote functions.

## Overview

Authentication is handled via:
1. **Session-based auth** with SHA-256 hashed tokens
2. **Argon2 password hashing** for user credentials
3. **Remote function helpers** (`getUser()` and `requireAdminUser()`)
4. **Automatic redirects** to login page when not authenticated

## Authentication Helpers

Located in `src/lib/server/auth.ts`, these helpers are used inside remote functions:

### `getUser()`

Requires authentication. If user is not logged in, automatically redirects to `/auth/login`.

```typescript
import { query } from '$app/server';
import { getUser } from '$lib/server/auth';

export const getProtectedData = query(async () => {
  const user = getUser(); // Redirects if not authenticated
  
  return {
    data: 'protected content',
    userId: user.id,
    username: user.username
  };
});
```

### `requireAdminUser()`

Requires admin privileges. If user is not logged in or not an admin, automatically redirects to `/auth/login`.

```typescript
import { query } from '$app/server';
import { requireAdminUser } from '$lib/server/auth';

export const getAdminData = query(async () => {
  const user = requireAdminUser(); // Redirects if not admin
  
  return {
    data: 'admin only content',
    userId: user.id
  };
});
```

## Complete Example: Protected Dashboard

### 1. Create Remote Function

File: `src/lib/remotes/dashboard.remote.ts`

```typescript
import { query } from '$app/server';
import { getUser } from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const getDashboardData = query(async () => {
  // Require authentication - redirects to login if not logged in
  const user = getUser();
  
  // Fetch user-specific data
  const [userData] = await db
    .select()
    .from(tables.user)
    .where(eq(tables.user.id, user.id));
  
  return {
    user: userData,
    stats: {
      // ... dashboard stats
    }
  };
});
```

### 2. Use in Component

File: `src/routes/dashboard/+page.svelte`

```svelte
<script lang="ts">
  import { getDashboardData } from '$lib/remotes/dashboard.remote';
  import { LogoutButton } from '$lib/components/client/features/auth';
  import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
  <title>{m.dashboard()}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#await getDashboardData()}
    <p>Loading...</p>
  {:then data}
    <h1>{m.dashboard()}</h1>
    <p>Welcome, {data.user.username}!</p>
    
    <div>
      <!-- Dashboard content -->
    </div>
    
    <LogoutButton />
  {:catch error}
    <p>Error: {error.message}</p>
  {/await}
</div>
```

## Complete Example: Admin Page

### 1. Create Remote Function

File: `src/lib/remotes/user.remote.ts`

```typescript
import { query } from '$app/server';
import { requireAdminUser } from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';

export const getAllUsers = query(async () => {
  // Require admin privileges - redirects if not admin
  requireAdminUser();
  
  return await db
    .select({
      id: tables.user.id,
      username: tables.user.username,
      email: tables.user.email,
      role: tables.user.role,
      isAdmin: tables.user.isAdmin,
      createdAt: tables.user.createdAt
    })
    .from(tables.user);
});
```

### 2. Use in Component

File: `src/routes/admin/users/+page.svelte`

```svelte
<script lang="ts">
  import { getAllUsers } from '$lib/remotes/user.remote';
  import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
  <title>User Management - Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1>User Management</h1>
  
  {#await getAllUsers()}
    <p>Loading users...</p>
  {:then users}
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr>
            <td>{user.username}</td>
            <td>{user.email || '—'}</td>
            <td>{user.role}</td>
            <td>{user.isAdmin ? 'Yes' : 'No'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:catch error}
    <p>Error: {error.message}</p>
  {/await}
</div>
```

## Authentication Flow

### Login Flow

1. User submits login form
2. `login` form function validates credentials
3. If valid, creates session and sets cookie
4. Checks for `?redirect=` parameter in URL
5. Redirects to original page or home

### Protected Page Flow

1. User navigates to protected page (e.g., `/dashboard`)
2. Component calls remote function (e.g., `getDashboardData()`)
3. Remote function calls `getUser()` or `requireAdminUser()`
4. Helper checks `event.locals.user` via `getRequestEvent()`
5. If not authenticated, redirects to `/auth/login?redirect=/dashboard`
6. If authenticated, returns user data
7. Component receives data and renders

### Logout Flow

1. User clicks logout button
2. `logout` form function invalidates session
3. Deletes session cookie
4. User is logged out

## Session Management

Sessions are managed automatically by the `hooks.server.ts` middleware:

- **Duration**: 30 days
- **Auto-renewal**: Sessions are renewed if less than 15 days remaining
- **Cookie name**: `auth-session`
- **Storage**: SQLite database (`session` table)

## Security Features

1. **Password Hashing**: Argon2 with secure parameters
2. **Session Tokens**: SHA-256 hashed, base32-encoded
3. **Secure Cookies**: HttpOnly, Secure (in production), SameSite=Lax
4. **Automatic Expiration**: Sessions expire after 30 days
5. **Server-Side Validation**: All auth checks happen on server
6. **CSRF Protection**: Built-in SvelteKit CSRF protection for forms

## Best Practices

### ✅ Do This

```typescript
// Use getUser() in remote functions
export const getData = query(async () => {
  const user = getUser(); // Automatic redirect
  return { userId: user.id };
});

// Use await in components
{#await getData() as data}
  <div>{data.userId}</div>
{/await}
```

### ❌ Don't Do This

```typescript
// DON'T create +page.server.ts files
export const load: PageServerLoad = async (event) => {
  // This pattern is not used in this project
};

// DON'T check authentication in components
// This should be done in remote functions
if (!user) redirect('/auth/login');
```

## Testing Authentication

### Test User Authentication

1. Log out if currently logged in
2. Navigate to protected page: `http://localhost:5173/dashboard`
3. Should redirect to: `/auth/login?redirect=%2Fdashboard`
4. Log in with valid credentials
5. Should redirect back to: `/dashboard`

### Test Admin Authentication

1. Log in as non-admin user
2. Navigate to: `http://localhost:5173/admin/users`
3. Should redirect to: `/auth/login`
4. Log in as admin user
5. Should see admin page

### Test Session Expiration

1. Log in
2. Open DevTools > Application > Cookies
3. Delete `auth-session` cookie
4. Try to access protected page
5. Should redirect to login

## Related Files

- **Auth Module**: `src/lib/server/auth.ts`
- **Auth Hooks**: `src/hooks.server.ts`
- **Auth Remote Functions**: `src/lib/remotes/user.remote.ts`
- **Auth Components**: `src/lib/components/client/features/auth/`
- **Database Schema**: `src/lib/server/db/schema.ts` (user & session tables)

## Summary

Authentication in this project follows these principles:

1. **Remote Functions First**: All data fetching happens via remote functions
2. **Server-Side Auth**: Authentication checks happen on the server using helpers
3. **Automatic Redirects**: `getUser()` and `requireAdminUser()` handle redirects
4. **No Load Functions**: We don't use `+page.server.ts` files for data loading
5. **Type Safety**: Full TypeScript support throughout the auth flow
6. **Progressive Enhancement**: Forms work without JavaScript

This pattern keeps authentication logic centralized, type-safe, and easy to maintain.
