import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	email: text('email'),
	passwordHash: text('password_hash').notNull(),
	role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	firstName: text('first_name'),
	lastName: text('last_name'),
	phone: text('phone'),
	marketingOptIn: integer('marketing_opt_in', { mode: 'boolean' }).default(false),
	lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
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

export const orderItem = sqliteTable('order_item', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => order.id, { onDelete: 'cascade' }),
	productId: text('product_id')
		.notNull()
		.references(() => product.id),
	productName: text('product_name').notNull(), // Snapshot at time of order
	productSlug: text('product_slug').notNull(),
	productImage: text('product_image'), // Single image URL/ID
	price: integer('price').notNull(), // Price at time of order (in cents)
	quantity: integer('quantity').notNull(),
	subtotal: integer('subtotal').notNull(), // price * quantity (in cents)
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const payment = sqliteTable('payment', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => order.id),
	provider: text('provider', { enum: ['liqpay', 'stripe', 'paypal', 'cod'] })
		.notNull()
		.default('cod'),
	transactionId: text('transaction_id'), // external payment ID from provider
	amount: integer('amount').notNull(), // stored in cents
	currency: text('currency').notNull().default('UAH'),
	status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] })
		.notNull()
		.default('pending'),
	liqpayData: text('liqpay_data'), // JSON - payment_id, status, etc.
	metadata: text('metadata'), // JSON - additional provider-specific data
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const checkboxReceipt = sqliteTable('checkbox_receipt', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => order.id),
	paymentId: text('payment_id').references(() => payment.id),
	receiptId: text('receipt_id'), // from Checkbox API
	fiscalCode: text('fiscal_code'), // фіскальний номер чека
	receiptUrl: text('receipt_url'), // link to electronic receipt
	status: text('status', { enum: ['created', 'sent', 'error', 'cancelled'] })
		.notNull()
		.default('created'),
	checkboxData: text('checkbox_data'), // JSON - full receipt data
	shiftId: text('shift_id'), // касова зміна ID
	cashRegisterId: text('cash_register_id'), // каса ID
	errorMessage: text('error_message'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const checkboxShift = sqliteTable('checkbox_shift', {
	id: text('id').primaryKey(),
	shiftId: text('shift_id').notNull(), // from Checkbox API
	cashRegisterId: text('cash_register_id').notNull(),
	status: text('status', { enum: ['opened', 'closed'] })
		.notNull()
		.default('opened'),
	openedBy: text('opened_by')
		.notNull()
		.references(() => user.id),
	closedBy: text('closed_by').references(() => user.id),
	balance: text('balance'), // JSON - готівка, безготівка
	openedAt: integer('opened_at', { mode: 'timestamp' }).notNull(),
	closedAt: integer('closed_at', { mode: 'timestamp' })
});

// Email settings table - stores email configuration
export const emailSettings = sqliteTable('email_settings', {
	id: text('id').primaryKey(),
	fromEmail: text('from_email').notNull(), // Sender email address
	fromName: text('from_name').notNull(), // Sender name
	replyToEmail: text('reply_to_email'), // Reply-to address (optional)
	
	// Email type toggles
	enableOrderConfirmation: integer('enable_order_confirmation', { mode: 'boolean' }).notNull().default(true),
	enableOrderShipped: integer('enable_order_shipped', { mode: 'boolean' }).notNull().default(true),
	enableOrderDelivered: integer('enable_order_delivered', { mode: 'boolean' }).notNull().default(true),
	enableOrderCancelled: integer('enable_order_cancelled', { mode: 'boolean' }).notNull().default(true),
	enablePasswordReset: integer('enable_password_reset', { mode: 'boolean' }).notNull().default(true),
	enableWelcome: integer('enable_welcome', { mode: 'boolean' }).notNull().default(true),
	
	// SMTP/API settings (optional - for future use)
	provider: text('provider').default('resend'), // resend, sendgrid, smtp
	apiKey: text('api_key'), // Encrypted API key
	smtpHost: text('smtp_host'),
	smtpPort: integer('smtp_port'),
	smtpUsername: text('smtp_username'),
	smtpPassword: text('smtp_password'), // Encrypted
	
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
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

export type OrderItem = typeof orderItem.$inferSelect;
export type InsertOrderItem = typeof orderItem.$inferInsert;

export type Payment = typeof payment.$inferSelect;
export type InsertPayment = typeof payment.$inferInsert;

export type CheckboxReceipt = typeof checkboxReceipt.$inferSelect;
export type InsertCheckboxReceipt = typeof checkboxReceipt.$inferInsert;

export type CheckboxShift = typeof checkboxShift.$inferSelect;
export type InsertCheckboxShift = typeof checkboxShift.$inferInsert;

export type EmailSettings = typeof emailSettings.$inferSelect;
export type InsertEmailSettings = typeof emailSettings.$inferInsert;

export const address = sqliteTable('address', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	company: text('company'),
	address1: text('address_1').notNull(),
	address2: text('address_2'),
	city: text('city').notNull(),
	state: text('state').notNull(),
	postalCode: text('postal_code').notNull(),
	country: text('country').notNull().default('Ukraine'),
	phone: text('phone').notNull(),
	isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Address = typeof address.$inferSelect;
export type InsertAddress = typeof address.$inferInsert;

export const shippingZone = sqliteTable('shipping_zone', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	countries: text('countries').notNull(), // JSON array of country codes
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const shippingRate = sqliteTable('shipping_rate', {
	id: text('id').primaryKey(),
	zoneId: text('zone_id')
		.notNull()
		.references(() => shippingZone.id),
	name: text('name').notNull(),
	description: text('description'),
	price: integer('price').notNull(), // stored in cents
	minOrderAmount: integer('min_order_amount'), // stored in cents, null = no minimum
	maxOrderAmount: integer('max_order_amount'), // stored in cents, null = no maximum
	estimatedDays: text('estimated_days'), // e.g. "3-5" or "1-2"
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type ShippingZone = typeof shippingZone.$inferSelect;
export type InsertShippingZone = typeof shippingZone.$inferInsert;

export type ShippingRate = typeof shippingRate.$inferSelect;
export type InsertShippingRate = typeof shippingRate.$inferInsert;

export const discount = sqliteTable('discount', {
	id: text('id').primaryKey(),
	code: text('code').notNull().unique(),
	type: text('type', { enum: ['percentage', 'fixed', 'free_shipping'] })
		.notNull()
		.default('percentage'),
	value: integer('value').notNull(), // percentage (0-100) or fixed amount in cents
	minOrderAmount: integer('min_order_amount'), // stored in cents, null = no minimum
	maxUsesTotal: integer('max_uses_total'), // null = unlimited
	maxUsesPerCustomer: integer('max_uses_per_customer').default(1), // null = unlimited
	currentUses: integer('current_uses').notNull().default(0),
	startsAt: integer('starts_at', { mode: 'timestamp' }).notNull(),
	endsAt: integer('ends_at', { mode: 'timestamp' }), // null = no expiration
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	applicableProducts: text('applicable_products'), // JSON array of product IDs, null = all products
	applicableCategories: text('applicable_categories'), // JSON array of category IDs, null = all categories
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Discount = typeof discount.$inferSelect;
export type InsertDiscount = typeof discount.$inferInsert;

export const wishlist = sqliteTable('wishlist', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id)
		.unique(), // One wishlist per user
	items: text('items').notNull().default('[]'), // JSON array of product IDs
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

export const siteSetting = sqliteTable('site_setting', {
	key: text('key').primaryKey(), // unique key like 'store_name', 'store_logo', etc.
	value: text('value').notNull(), // stored as string, parse based on type
	type: text('type', { enum: ['string', 'number', 'boolean', 'json'] })
		.notNull()
		.default('string'), // data type for proper parsing
	category: text('category', {
		enum: ['general', 'store', 'checkout', 'email', 'seo', 'advanced']
	})
		.notNull()
		.default('general'), // grouping for admin UI
	label: text('label'), // human-readable label
	description: text('description'), // help text
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type SiteSetting = typeof siteSetting.$inferSelect;
export type InsertSiteSetting = typeof siteSetting.$inferInsert;

export const banner = sqliteTable('banner', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	imageId: text('image_id').references(() => asset.id), // reference to asset table
	imageUrl: text('image_url'), // fallback if not using asset
	link: text('link'), // click-through URL
	linkText: text('link_text'), // call-to-action text
	position: text('position', {
		enum: ['home_hero', 'home_secondary', 'category_top', 'product_sidebar', 'footer']
	})
		.notNull()
		.default('home_hero'),
	displayOrder: integer('display_order').notNull().default(0), // for ordering multiple banners in same position
	startsAt: integer('starts_at', { mode: 'timestamp' }), // null = immediately active
	endsAt: integer('ends_at', { mode: 'timestamp' }), // null = never expires
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Banner = typeof banner.$inferSelect;
export type InsertBanner = typeof banner.$inferInsert;

// Page table for custom page builder
export const page = sqliteTable('page', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	content: text('content'), // JSON string of content blocks
	template: text('template').notNull().default('default'), // page template type
	status: text('status', { enum: ['draft', 'published'] })
		.notNull()
		.default('draft'),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	publishedAt: integer('published_at', { mode: 'timestamp' })
});

export type Page = typeof page.$inferSelect;
export type InsertPage = typeof page.$inferInsert;

// FTS5 virtual table for product search
// Note: This needs to be created manually with SQL after schema is pushed
// CREATE VIRTUAL TABLE product_fts USING fts5(id, name, description, sku, content='product', content_rowid='id');
// 
// Triggers to keep FTS table in sync:
// CREATE TRIGGER product_fts_insert AFTER INSERT ON product BEGIN
//   INSERT INTO product_fts(rowid, id, name, description, sku) VALUES (new.id, new.id, new.name, new.description, new.sku);
// END;
// 
// CREATE TRIGGER product_fts_delete AFTER DELETE ON product BEGIN
//   INSERT INTO product_fts(product_fts, rowid, id, name, description, sku) VALUES('delete', old.id, old.id, old.name, old.description, old.sku);
// END;
// 
// CREATE TRIGGER product_fts_update AFTER UPDATE ON product BEGIN
//   INSERT INTO product_fts(product_fts, rowid, id, name, description, sku) VALUES('delete', old.id, old.id, old.name, old.description, old.sku);
//   INSERT INTO product_fts(rowid, id, name, description, sku) VALUES (new.id, new.id, new.name, new.description, new.sku);
// END;
