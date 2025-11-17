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

export const category = sqliteTable('category', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	parentId: text('parent_id'),
	image: text('image'), // asset ID
	displayOrder: integer('display_order').notNull().default(0),
	isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const brand = sqliteTable('brand', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	logo: text('logo'), // asset ID
	isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const product = sqliteTable('product', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	slug: text('slug').notNull().unique(),
	price: integer('price').notNull(), // stored in cents
	compareAtPrice: integer('compare_at_price'), // stored in cents
	sku: text('sku'),
	barcode: text('barcode'),
	quantity: integer('quantity').notNull().default(0),
	trackInventory: integer('track_inventory', { mode: 'boolean' }).notNull().default(true),
	lowStockThreshold: integer('low_stock_threshold').default(10),
	allowBackorders: integer('allow_backorders', { mode: 'boolean' }).notNull().default(false),
	status: text('status', { enum: ['draft', 'active', 'archived'] })
		.notNull()
		.default('draft'),
	categoryId: text('category_id').references(() => category.id),
	brandId: text('brand_id').references(() => brand.id),
	images: text('images'), // JSON array of asset IDs
	variants: text('variants'), // JSON for size/color variations
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const cart = sqliteTable('cart', {
	id: text('id').primaryKey(),
	sessionId: text('session_id'), // for guest users
	userId: text('user_id').references(() => user.id), // for logged-in users
	items: text('items').notNull(), // JSON array of cart items
	subtotal: integer('subtotal').notNull().default(0), // stored in cents
	total: integer('total').notNull().default(0), // stored in cents
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const order = sqliteTable('order', {
	id: text('id').primaryKey(),
	orderNumber: text('order_number').notNull().unique(),
	userId: text('user_id').references(() => user.id), // optional for guest checkout
	status: text('status', {
		enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
	})
		.notNull()
		.default('pending'),
	items: text('items').notNull(), // JSON array of order items
	shippingAddress: text('shipping_address').notNull(), // JSON object
	billingAddress: text('billing_address').notNull(), // JSON object
	customerEmail: text('customer_email').notNull(),
	customerPhone: text('customer_phone'),
	customerFirstName: text('customer_first_name').notNull(),
	customerLastName: text('customer_last_name').notNull(),
	subtotal: integer('subtotal').notNull(), // stored in cents
	shippingCost: integer('shipping_cost').notNull().default(0), // stored in cents
	tax: integer('tax').notNull().default(0), // stored in cents
	discount: integer('discount').notNull().default(0), // stored in cents
	total: integer('total').notNull(), // stored in cents
	paymentMethod: text('payment_method'), // liqpay, stripe, cod, etc.
	paymentStatus: text('payment_status', { enum: ['pending', 'completed', 'failed', 'refunded'] })
		.notNull()
		.default('pending'),
	shippingMethod: text('shipping_method'),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	shippedAt: integer('shipped_at', { mode: 'timestamp' }),
	deliveredAt: integer('delivered_at', { mode: 'timestamp' })
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;

export type Blog = typeof blog.$inferSelect;

export type Asset = typeof asset.$inferSelect;
export type InsertAsset = typeof asset.$inferInsert;

export type Category = typeof category.$inferSelect;
export type InsertCategory = typeof category.$inferInsert;

export type Brand = typeof brand.$inferSelect;
export type InsertBrand = typeof brand.$inferInsert;

export type Product = typeof product.$inferSelect;
export type InsertProduct = typeof product.$inferInsert;

export type Cart = typeof cart.$inferSelect;
export type InsertCart = typeof cart.$inferInsert;

export type Order = typeof order.$inferSelect;
export type InsertOrder = typeof order.$inferInsert;
