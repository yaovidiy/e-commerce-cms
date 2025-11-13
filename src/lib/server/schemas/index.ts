import * as v from 'valibot';

// Blog schemas
export const CreateBlogSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    authorId: v.string()
});

export const UpdateBlogSchema = v.object({
    id: v.string(),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    content: v.pipe(v.string(), v.minLength(1)),
    slug: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
});

// Auth schemas
export const LoginSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )
});

export const RegisterSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )
});

export const CreateUserSchema = v.object({
    username: v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    ),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    ),
    role: v.optional(v.picklist(['admin', 'user']), 'user'),
    isAdmin: v.optional(v.boolean(), false)
});

export const UpdateUserSchema = v.object({
    id: v.string(),
    username: v.optional(v.pipe(
        v.string(),
        v.minLength(3, 'Username must be at least 3 characters'),
        v.maxLength(31, 'Username must be at most 31 characters'),
        v.regex(/^[a-z0-9_-]+$/, 'Username must contain only lowercase letters, numbers, dashes, and underscores')
    )),
    email: v.optional(v.pipe(v.string(), v.email('Invalid email address'))),
    password: v.optional(v.pipe(
        v.string(),
        v.minLength(6, 'Password must be at least 6 characters'),
        v.maxLength(255, 'Password must be at most 255 characters')
    )),
    role: v.optional(v.picklist(['admin', 'user'])),
    isAdmin: v.optional(v.boolean())
});

export const DeleteUserSchema = v.object({
    id: v.string()
});

export const GetUserByIdSchema = v.object({
    id: v.string()
});

export const FilterUsersSchema = v.object({
    username: v.optional(v.string(), ''),
    page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
    pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
    sortField: v.optional(v.picklist(['username', 'email', 'createdAt']), 'createdAt'),
    sortDirection: v.optional(v.picklist(['asc', 'desc']), 'desc')
});