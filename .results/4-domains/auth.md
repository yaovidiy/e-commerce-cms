# Authentication Domain Implementation

## Overview
The authentication system uses custom session-based authentication with Argon2 password hashing and SHA-256 hashed session tokens. All authentication logic runs server-side via hooks.

## Architecture

### Core Files
- `src/lib/server/auth.ts`: Authentication utilities
- `src/hooks.server.ts`: Request handling and session validation
- Database tables: `user` and `session`

## Session Management

### Session Token Generation
```typescript
export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const token = encodeBase32LowerCase(bytes);
	return token;
}
```

**Key Points:**
- 20 bytes of entropy (160 bits)
- Base32 lowercase encoding
- Uses Web Crypto API
- Returns token like: "abcd1234efgh5678ijkl"

### Session Creation
```typescript
export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token))
  );
  
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	
	await db.insert(table.session).values(session);
	return session;
}
```

**Key Points:**
- Session ID is SHA-256 hash of token (prevents token exposure in DB)
- 30-day expiration
- Returns session object with `expiresAt` as Date

### Session Validation
```typescript
export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token))
  );
  
	const [result] = await db
		.select({
			user: { id: table.user.id, username: table.user.username },
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	
	const { session, user } = result;

	// Check expiration
	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	// Auto-renew if within 15 days of expiry
	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}
```

**Key Points:**
- Hash token to get session ID
- Join with user table
- Delete expired sessions
- Auto-renew sessions within 15 days of expiry
- Return both session and user data

### Session Invalidation
```typescript
export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}
```

## Cookie Management

### Setting Session Cookie
```typescript
export function setSessionTokenCookie(
  event: RequestEvent, 
  token: string, 
  expiresAt: Date
) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}
```

### Deleting Session Cookie
```typescript
export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
```

### Cookie Name
```typescript
export const sessionCookieName = 'auth-session';
```

## Password Hashing

### Hash Password (Registration)
```typescript
import { hash } from '@node-rs/argon2';

const passwordHash = await hash(password, {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
});
```

**Parameters (MUST use these exact values):**
- `memoryCost: 19456` (19 MiB)
- `timeCost: 2` iterations
- `outputLen: 32` bytes
- `parallelism: 1` thread

### Verify Password (Login)
```typescript
import { verify } from '@node-rs/argon2';

const validPassword = await verify(existingUser.passwordHash, password, {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
});

if (!validPassword) {
	return fail(400, { message: 'Incorrect username or password' });
}
```

## User ID Generation

```typescript
function generateUserId() {
	// 120 bits of entropy (similar to UUID v4)
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
```

**Key Points:**
- 15 bytes = 120 bits of entropy
- Base32 lowercase encoding
- Comparable security to UUID v4 (122 bits)

## Request Hooks

### Hooks Setup (`src/hooks.server.ts`)
```typescript
import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth.js';
import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';

const handleParaglide: Handle = i18n.handle();

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
```

**Key Points:**
- Runs before every request
- Validates session token from cookie
- Sets `event.locals.user` and `event.locals.session`
- Refreshes cookie if session renewed
- Deletes cookie if session invalid
- i18n handle must run before auth handle

## Locals Type Definition (`src/app.d.ts`)

```typescript
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
	}
}
```

## Login Flow

### 1. Display Login Form
```svelte
<form method="POST" action="?/login">
  <input name="username" />
  <input name="password" type="password" />
  <button type="submit">Login</button>
</form>
```

### 2. Process Login (+page.server.ts)
```typescript
export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// Validate input
		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		// Get user from database
		const results = await db.select()
      .from(table.user)
      .where(eq(table.user.username, username));
      
		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		// Verify password
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

		return redirect(302, '/dashboard');
	}
};
```

## Registration Flow

### 1. Display Registration Form
```svelte
<form method="POST" action="?/register">
  <input name="username" />
  <input name="password" type="password" />
  <button type="submit">Register</button>
</form>
```

### 2. Process Registration (+page.server.ts)
```typescript
export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// Validate input
		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		// Generate user ID and hash password
		const userId = generateUserId();
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Insert user
		try {
			await db.insert(table.user).values({ 
        id: userId, 
        username, 
        passwordHash 
      });

			// Create session
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		
		return redirect(302, '/dashboard');
	}
};
```

## Logout Flow

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

## Validation Functions

### Username Validation
```typescript
function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}
```

**Rules:**
- 3-31 characters
- Lowercase letters, numbers, underscores, hyphens only
- No spaces or special characters

### Password Validation
```typescript
function validatePassword(password: unknown): password is string {
	return (
		typeof password === 'string' && 
		password.length >= 6 && 
		password.length <= 255
	);
}
```

**Rules:**
- 6-255 characters
- No character restrictions (allows special chars)

## Protected Route Pattern

```typescript
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	
	// User is authenticated
	return { user: event.locals.user };
};
```

## Security Constants

```typescript
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Session duration
const SESSION_DURATION = DAY_IN_MS * 30;  // 30 days

// Renewal threshold
const RENEWAL_THRESHOLD = DAY_IN_MS * 15;  // 15 days before expiry
```

## Dependencies

- `@node-rs/argon2`: Password hashing
- `@oslojs/crypto`: SHA-256 hashing
- `@oslojs/encoding`: Base32/hex encoding
- `drizzle-orm`: Database queries
- `@sveltejs/kit`: Cookies, redirects, hooks

## Best Practices

1. **Never log tokens**: Session tokens are sensitive
2. **Hash before storing**: Never store raw tokens
3. **Use constants**: Argon2 parameters must be consistent
4. **Validate input**: Always validate username/password format
5. **Generic errors**: Don't reveal if username exists
6. **Auto-renewal**: Sessions renew to improve UX
7. **Clean expired**: Delete expired sessions on validation
8. **Set locals**: Always set user/session in hooks
9. **Check auth early**: Validate in load functions
10. **Secure cookies**: Use httpOnly, secure in production
