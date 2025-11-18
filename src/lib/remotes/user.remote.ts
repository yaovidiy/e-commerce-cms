import { form, query, getRequestEvent, command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import {
	LoginSchema,
	RegisterSchema,
	CreateUserSchema,
	UpdateUserSchema,
	DeleteUserSchema,
	GetUserByIdSchema,
	FilterUsersSchema
} from '$lib/server/schemas';
import { eq, count, like, asc, desc } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import * as v from 'valibot';
import { redirect } from '@sveltejs/kit';
import { applyOffsetPagination } from '$lib/server/pagination';

// Helper function to generate user ID
function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Query functions (read operations)
export const me = query(async () => {
	const event = getRequestEvent();

	if (!event?.locals?.user) {
		return null;
	}

	return {
		id: event.locals.user.id,
		username: event.locals.user.username,
		email: event.locals.user.email,
		role: event.locals.user.role,
		isAdmin: event.locals.user.isAdmin
	};
});

export const getAllUsers = query(FilterUsersSchema, async (data) => {
	auth.requireAdminUser();

	const { username, page, pageSize, sortField, sortDirection } = data;

	// Build base query
	let baseQuery = db
		.select({
			id: tables.user.id,
			username: tables.user.username,
			email: tables.user.email,
			role: tables.user.role,
			isAdmin: tables.user.isAdmin,
			createdAt: tables.user.createdAt
		})
		.from(tables.user);

	// Build count query
	let countQuery = db.select({ count: count() }).from(tables.user);

	// Apply username filter to both queries
	if (username && username.trim() !== '') {
		const filter = like(tables.user.username, `%${username}%`);
		baseQuery = baseQuery.where(filter) as typeof baseQuery;
		countQuery = countQuery.where(filter) as typeof countQuery;
	}

	// Determine sort column
	const sortColumn =
		sortField === 'username'
			? tables.user.username
			: sortField === 'email'
				? tables.user.email
				: tables.user.createdAt;

	// Apply pagination with sorting
	return await applyOffsetPagination({
		query: baseQuery,
		countQuery,
		orderBy: [sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn), desc(tables.user.id)],
		page,
		pageSize
	});
});

export const getUserById = query(GetUserByIdSchema, async (data) => {
	auth.requireAdminUser();

	const [user] = await db
		.select({
			id: tables.user.id,
			username: tables.user.username,
			email: tables.user.email,
			role: tables.user.role,
			isAdmin: tables.user.isAdmin,
			createdAt: tables.user.createdAt
		})
		.from(tables.user)
		.where(eq(tables.user.id, data.id));

	if (!user) {
		throw new Error('User not found');
	}

	return user;
});

export const getUserByUsername = query(v.string(), async (username) => {
	auth.requireAdminUser();

	const [user] = await db
		.select({
			id: tables.user.id,
			username: tables.user.username,
			email: tables.user.email,
			role: tables.user.role,
			isAdmin: tables.user.isAdmin,
			createdAt: tables.user.createdAt
		})
		.from(tables.user)
		.where(eq(tables.user.username, username));

	return user || null;
});

// Auth form functions with session management
export const login = form(LoginSchema, async (data, invalid) => {
	const event = getRequestEvent();
	const { username, password } = data;

	const [existingUser] = await db
		.select()
		.from(tables.user)
		.where(eq(tables.user.username, username));

	if (!existingUser) {
		invalid(invalid.password('Incorrect username or password'));
		console.info('No such user', username);
		return;
	}

	const validPassword = await verify(existingUser.passwordHash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	if (!validPassword) {
		invalid(invalid.password('Incorrect username or password'));
		console.info('Invalid password for user', username);
		return;
	}

	// Create session
	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, existingUser.id);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	redirect(303, '/');
});

export const register = form(RegisterSchema, async (data, invalid) => {
	const event = getRequestEvent();
	const { username, email, password } = data;

	// Check if username already exists
	const [existingUser] = await db
		.select()
		.from(tables.user)
		.where(eq(tables.user.username, username));

	if (existingUser) {
		invalid(invalid.username('Username already taken'));
		return;
	}

	// Check if this is the first user
	const [userCountResult] = await db
		.select({ count: count() })
		.from(tables.user);

	const isFirstUser = userCountResult.count === 0;

	// Generate user ID
	const userId = generateUserId();

	// Hash password
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Create user
	const [newUser] = await db
		.insert(tables.user)
		.values({
			id: userId,
			username,
			email: email || null,
			passwordHash,
			role: isFirstUser ? 'admin' : 'user',
			isAdmin: isFirstUser,
			createdAt: new Date()
		})
		.returning();

	// Create session
	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, newUser.id);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return {
		id: newUser.id,
		username: newUser.username,
		email: newUser.email,
		role: newUser.role,
		isAdmin: newUser.isAdmin
	};
});

export const logout = form(async () => {
	const event = getRequestEvent();

	if (!event?.locals?.session) {
		throw new Error('No active session');
	}

	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	return { success: true };
});

// Admin CRUD operations
export const createUser = form(CreateUserSchema, async (data) => {
	auth.requireAdminUser();

	const event = getRequestEvent();
	const { username, email, password, role, isAdmin } = data;

	// Check if user is admin
	if (!event?.locals?.user?.isAdmin) {
		throw new Error('Admin access required');
	}

	// Check if username already exists
	const [existingUser] = await db
		.select()
		.from(tables.user)
		.where(eq(tables.user.username, username));

	if (existingUser) {
		throw new Error('Username already taken');
	}

	// Generate user ID
	const userId = generateUserId();

	// Hash password
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Create user
	const [newUser] = await db
		.insert(tables.user)
		.values({
			id: userId,
			username,
			email: email || null,
			passwordHash,
			role: role || 'user',
			isAdmin: isAdmin || false,
			createdAt: new Date()
		})
		.returning();

	return {
		id: newUser.id,
		username: newUser.username,
		email: newUser.email,
		role: newUser.role,
		isAdmin: newUser.isAdmin,
		createdAt: newUser.createdAt
	};
});

export const updateUser = form(UpdateUserSchema, async (data) => {
	auth.requireAdminUser();

	const event = getRequestEvent();
	const { id, username, email, password, role, isAdmin } = data;

	// Check authentication
	if (!event?.locals?.user?.id) {
		throw new Error('Unauthorized');
	}

	// Check if user is updating themselves or is admin
	const isOwnProfile = event.locals.user.id === id;

	if (!isOwnProfile && !event.locals.user.isAdmin) {
		throw new Error('Insufficient permissions');
	}

	// Check if user exists
	const [existingUser] = await db
		.select()
		.from(tables.user)
		.where(eq(tables.user.id, id));

	if (!existingUser) {
		throw new Error('User not found');
	}

	// Build update object
	const updateData: Partial<tables.InsertUser> = {};

	if (username !== undefined) {
		// Check if new username is taken
		const [userWithUsername] = await db
			.select()
			.from(tables.user)
			.where(eq(tables.user.username, username));

		if (userWithUsername && userWithUsername.id !== id) {
			throw new Error('Username already taken');
		}
		updateData.username = username;
	}

	if (email !== undefined) {
		updateData.email = email || null;
	}

	if (password !== undefined) {
		updateData.passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
	}

	// Only admins can change role/isAdmin
	if (event.locals.user.isAdmin) {
		if (role !== undefined) {
			updateData.role = role;
		}
		if (isAdmin !== undefined) {
			updateData.isAdmin = isAdmin;
		}
	}

	// Update user
	const [updatedUser] = await db
		.update(tables.user)
		.set(updateData)
		.where(eq(tables.user.id, id))
		.returning();

	return {
		id: updatedUser.id,
		username: updatedUser.username,
		email: updatedUser.email,
		role: updatedUser.role,
		isAdmin: updatedUser.isAdmin,
		createdAt: updatedUser.createdAt
	};
});

export const deleteUser = form(DeleteUserSchema, async (data) => {
	auth.requireAdminUser();

	const event = getRequestEvent();
	const { id } = data;

	// Check if user is admin
	if (!event?.locals?.user?.isAdmin) {
		throw new Error('Admin access required');
	}

	// Prevent deleting yourself
	if (id === event.locals.user.id) {
		throw new Error('Cannot delete your own account');
	}

	// Check if user exists
	const [existingUser] = await db
		.select()
		.from(tables.user)
		.where(eq(tables.user.id, id));

	if (!existingUser) {
		throw new Error('User not found');
	}

	// Delete user sessions first
	await db.delete(tables.session).where(eq(tables.session.userId, id));

	// Delete user
	await db.delete(tables.user).where(eq(tables.user.id, id));

	return { success: true };
});

// Command to toggle admin status
export const toggleAdminStatus = command(
	v.object({
		id: v.string(),
		isAdmin: v.boolean()
	}),
	async (data) => {
		auth.requireAdminUser();

		const { id, isAdmin } = data;

		// Update user
		await db
			.update(tables.user)
			.set({ isAdmin })
			.where(eq(tables.user.id, id));

		// Refresh the query with default parameters
		await getAllUsers({
			username: '',
			page: 1,
			pageSize: 20,
			sortField: 'createdAt',
			sortDirection: 'desc'
		}).refresh();

		return { success: true };
	}
);
