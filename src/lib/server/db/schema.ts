import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email'),
	passwordHash: text('password_hash').notNull(),
	role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const blog = sqliteTable('blog', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	slug: text('slug').notNull().unique(),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const asset = sqliteTable('asset', {
	id: text('id').primaryKey(),
	filename: text('filename').notNull(),
	originalFilename: text('original_filename').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	url: text('url').notNull(),
	thumbnailUrl: text('thumbnail_url'),
	uploadedBy: text('uploaded_by')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;

export type Blog = typeof blog.$inferSelect;

export type Asset = typeof asset.$inferSelect;
export type InsertAsset = typeof asset.$inferInsert;
