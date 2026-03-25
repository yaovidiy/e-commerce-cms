import { form, query, getRequestEvent, command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { auth, getUser as authGetUser, requireAdminUser } from '$lib/server/auth';
import {
	CreateUserSchema,
	UpdateUserSchema,
	DeleteUserSchema,
	GetUserByIdSchema,
	FilterUsersSchema
} from '$lib/server/schemas';
import { eq, count, like, asc, desc, and } from 'drizzle-orm';
import * as v from 'valibot';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';

// Query functions (read operations)
export const me = query(async () => {
	const event = getRequestEvent();

	if (!event?.locals?.user) {
		return null;
	}

	return {
		id: event.locals.user.id,
		username: event.locals.user.username,
		name: event.locals.user.name,
		email: event.locals.user.email,
		role: event.locals.user.role,
		isAdmin: event.locals.user.isAdmin
	};
});

export const getAllUsers = query(FilterUsersSchema, async (data) => {
	requireAdminUser();

	const { username, page, pageSize, sortField, sortDirection } = data;

	// 1. Start with base query
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

	// 2. Build conditions separately
	const conditions = [];

	if (username && username.trim() !== '') {
		conditions.push(like(tables.user.username, `%${username}%`));
	}

	// 3. Apply conditions
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// 4. Determine sort column
	const sortColumn =
		sortField === 'username'
			? tables.user.username
			: sortField === 'email'
				? tables.user.email
				: tables.user.createdAt;

	// 5. Add ordering
	baseQuery = baseQuery.orderBy(
		sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn),
		desc(tables.user.id)
	) as typeof baseQuery;

	// 6. Create count query with same conditions
	let countQuery = db.select({ count: count() }).from(tables.user);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	// 7. Execute count query
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// 8. Calculate pagination
	const { offset, limit } = calculatePagination(page, pageSize);

	// 9. Execute data query with pagination
	const users = await baseQuery.limit(limit).offset(offset);

	// 10. Return using utility
	return createPaginatedResponse(users, totalCount, {
		page,
		pageSize
	});
});

export const getUserById = query(GetUserByIdSchema, async (data) => {
	requireAdminUser();

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
	requireAdminUser();

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

// Admin CRUD operations
export const createUser = form(CreateUserSchema, async (data) => {
	requireAdminUser();

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

	// Use better-auth to create user (handles password hashing and account creation)
	const response = await auth.api.signUpEmail({
		body: {
			name: username,
			email: email || `${username}@placeholder.local`,
			password,
			username
		},
		headers: new Headers()
	});

	const newUser = response.user;

	// Update user with admin-specific fields
	if (role || isAdmin !== undefined) {
		await db
			.update(tables.user)
			.set({
				role: role || 'user',
				isAdmin: isAdmin || false,
				updatedAt: new Date()
			})
			.where(eq(tables.user.id, newUser.id));
	}

	const [updatedUser] = await db
		.select({
			id: tables.user.id,
			username: tables.user.username,
			name: tables.user.name,
			email: tables.user.email,
			role: tables.user.role,
			isAdmin: tables.user.isAdmin,
			createdAt: tables.user.createdAt
		})
		.from(tables.user)
		.where(eq(tables.user.id, newUser.id));

	return {
		id: updatedUser.id,
		username: updatedUser.username,
		name: updatedUser.name,
		email: updatedUser.email,
		role: updatedUser.role,
		isAdmin: updatedUser.isAdmin,
		createdAt: updatedUser.createdAt
	};
});

export const updateUser = form(UpdateUserSchema, async (data) => {
	requireAdminUser();

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

	// Build update object for user table
	const updateData: Partial<tables.InsertUser> = {
		updatedAt: new Date()
	};

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
		updateData.name = username;
	}

	if (email !== undefined) {
		updateData.email = email || existingUser.email;
	}

	// If password provided, update the account record with properly hashed password
	if (password !== undefined) {
		const { hashPassword } = await import('better-auth/crypto');
		const hashedPassword = await hashPassword(password);
		await db
			.update(tables.account)
			.set({ password: hashedPassword, updatedAt: new Date() })
			.where(
				and(eq(tables.account.userId, id), eq(tables.account.providerId, 'credential'))
			);
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
	requireAdminUser();

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

	// Delete user accounts (credentials)
	await db.delete(tables.account).where(eq(tables.account.userId, id));

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
		requireAdminUser();

		const { id, isAdmin } = data;

		// Update user
		await db
			.update(tables.user)
			.set({ isAdmin, updatedAt: new Date() })
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
