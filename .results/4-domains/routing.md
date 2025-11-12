# Routing Domain Implementation

## Overview
The routing domain uses SvelteKit's file-based routing system with server-side data loading, form actions, and internationalization support. Routes are protected via authentication middleware.

## File Structure

### Route Files
```
src/routes/
├── +layout.svelte           # Root layout (wraps all pages)
├── +page.svelte             # Home page
├── demo/
│   ├── +page.svelte         # Demo index
│   ├── lucia/
│   │   ├── +page.svelte      # Protected auth demo page
│   │   ├── +page.server.ts   # Server load + logout action
│   │   └── login/
│   │       ├── +page.svelte
│   │       └── +page.server.ts  # Login/register actions
```

## File Naming Conventions

- `+layout.svelte`: Shared layout for nested routes
- `+page.svelte`: Page component (client + server)
- `+page.server.ts`: Server-only load functions and actions
- `+server.ts`: API endpoints (not currently used in this project)

## Server Load Functions

### Pattern
```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Access locals (user, session)
  if (!event.locals.user) {
    return redirect(302, '/demo/lucia/login');
  }
  
  // Return data to page
  return { 
    user: event.locals.user 
  };
};
```

### Key Points
- Type with `PageServerLoad` from `./$types`
- Access request via `event` parameter
- Check `event.locals.user` for authentication
- Use `redirect()` for navigation
- Return object becomes page data

### Example from `demo/lucia/+page.server.ts`:
```typescript
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/lucia/login');
	}
	return { user: event.locals.user };
};
```

## Form Actions

### Pattern
```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  actionName: async (event) => {
    const formData = await event.request.formData();
    const field = formData.get('fieldName');
    
    // Validate
    if (!validate(field)) {
      return fail(400, { message: 'Invalid input' });
    }
    
    // Process
    // ...
    
    return redirect(302, '/success');
  }
};
```

### Key Points
- Type with `Actions` from `./$types`
- Each action is a named function in the object
- Get form data with `await event.request.formData()`
- Return `fail(statusCode, data)` for errors
- Return `redirect(302, path)` for success

### Example from `demo/lucia/login/+page.server.ts`:
```typescript
export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		// Check credentials
		const results = await db.select()
      .from(table.user)
      .where(eq(table.user.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		// Create session
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/demo/lucia');
	},
	
	register: async (event) => {
		// Similar pattern...
	}
};
```

## Protected Routes Pattern

### Server-Side Protection
Check authentication in load function:

```typescript
export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    return redirect(302, '/login');
  }
  // User is authenticated, proceed
  return { user: event.locals.user };
};
```

### Logout Action Pattern
```typescript
export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await auth.invalidateSession(event.locals.session.id);
    auth.deleteSessionTokenCookie(event);
    return redirect(302, '/login');
  }
};
```

## Layouts

### Root Layout (`+layout.svelte`)
```svelte
<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
```

### Key Layout Patterns
- Import global CSS in root layout
- Wrap app with i18n provider
- Use `$props()` to get children
- Render children with `{@render children()}`
- No explicit `<slot>` in Svelte 5

## Internationalization Routing

### Setup in `hooks.ts`
```typescript
import { i18n } from '$lib/i18n';
export const reroute = i18n.reroute();
```

This enables:
- `/en/page` - English version
- `/uk/page` - Ukrainian version
- `/page` - Default locale

### i18n Config
```typescript
// src/lib/i18n.ts
import * as runtime from '$lib/paraglide/runtime';
import { createI18n } from '@inlang/paraglide-sveltekit';
export const i18n = createI18n(runtime);
```

## Navigation Patterns

### Redirects
```typescript
import { redirect } from '@sveltejs/kit';

// In load or actions
return redirect(302, '/target/path');
```

### Status Codes
- `302`: Temporary redirect (default for most cases)
- `301`: Permanent redirect
- `303`: See Other (recommended after POST)
- `307`: Temporary redirect preserving method

### Form Failures
```typescript
import { fail } from '@sveltejs/kit';

return fail(400, { 
  message: 'Error description',
  field: 'fieldValue' 
});
```

## Event Object

The `event` parameter provides:
- `event.request`: Standard Request object
- `event.cookies`: Cookie management
- `event.locals`: Request-scoped data (user, session)
- `event.params`: Route parameters
- `event.url`: URL object
- `event.route.id`: Current route ID

## Validation Helpers

### Example from Login Page
```typescript
function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && 
	       password.length >= 6 && 
	       password.length <= 255;
}
```

## Best Practices

1. **Always type your functions**: Use `PageServerLoad` and `Actions`
2. **Check authentication early**: In load functions before any data fetching
3. **Use fail() for validation**: Return structured error data
4. **Redirect after POST**: Use `redirect(302, ...)` after successful actions
5. **Access user data**: Via `event.locals.user` (set in hooks.server.ts)
6. **Form data parsing**: Always `await event.request.formData()`
7. **Status codes matter**: 400 for validation, 401 for auth, 500 for server errors

## Dependencies

- `@sveltejs/kit`: Core routing and utilities
- Automatic type generation via `./$types`
- No additional routing libraries needed
