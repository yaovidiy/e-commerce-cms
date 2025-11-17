#!/usr/bin/env tsx
/**
 * Create Additional Database Indexes for Performance Optimization
 * 
 * This script creates indexes based on query analysis to optimize:
 * - Product queries (search, filters, relationships)
 * - Cart queries (user/session lookups)
 * - Order queries (user history, order number lookups)
 * - Category/Brand queries (hierarchy, visibility)
 * - Blog queries (author, slug lookups)
 * - User queries (authentication, lookups)
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const DB_PATH = resolve(__dirname, '../local.db');

interface IndexDefinition {
	name: string;
	sql: string;
	description: string;
}

const indexes: IndexDefinition[] = [
	// === Product Indexes ===
	{
		name: 'idx_product_slug',
		sql: 'CREATE INDEX IF NOT EXISTS idx_product_slug ON product(slug)',
		description: 'Product slug lookups (customer pages)'
	},
	{
		name: 'idx_product_sku',
		sql: 'CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku)',
		description: 'Product SKU searches'
	},
	{
		name: 'idx_product_brand_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_product_brand_id ON product(brand_id)',
		description: 'Products by brand filter'
	},
	{
		name: 'idx_product_name',
		sql: 'CREATE INDEX IF NOT EXISTS idx_product_name ON product(name)',
		description: 'Product name searches'
	},
	{
		name: 'idx_product_status_category',
		sql: 'CREATE INDEX IF NOT EXISTS idx_product_status_category ON product(status, category_id)',
		description: 'Active products by category (compound index)'
	},

	// === Cart Indexes ===
	{
		name: 'idx_cart_user_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)',
		description: 'User cart lookups'
	},
	{
		name: 'idx_cart_session_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_cart_session_id ON cart(session_id)',
		description: 'Guest cart lookups'
	},

	// === Order Indexes ===
	{
		name: 'idx_order_user_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"(user_id)',
		description: 'User order history'
	},
	{
		name: 'idx_order_number',
		sql: 'CREATE INDEX IF NOT EXISTS idx_order_number ON "order"(order_number)',
		description: 'Order number lookups'
	},
	{
		name: 'idx_order_payment_status',
		sql: 'CREATE INDEX IF NOT EXISTS idx_order_payment_status ON "order"(payment_status)',
		description: 'Payment status filtering'
	},
	{
		name: 'idx_order_shipped_at',
		sql: 'CREATE INDEX IF NOT EXISTS idx_order_shipped_at ON "order"(shipped_at)',
		description: 'Shipped orders filtering'
	},

	// === Category Indexes ===
	{
		name: 'idx_category_parent_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_category_parent_id ON category(parent_id)',
		description: 'Category hierarchy queries'
	},
	{
		name: 'idx_category_slug',
		sql: 'CREATE INDEX IF NOT EXISTS idx_category_slug ON category(slug)',
		description: 'Category slug lookups'
	},
	{
		name: 'idx_category_visible_order',
		sql: 'CREATE INDEX IF NOT EXISTS idx_category_visible_order ON category(is_visible, display_order)',
		description: 'Visible categories ordered'
	},

	// === Brand Indexes ===
	{
		name: 'idx_brand_slug',
		sql: 'CREATE INDEX IF NOT EXISTS idx_brand_slug ON brand(slug)',
		description: 'Brand slug lookups'
	},
	{
		name: 'idx_brand_is_visible',
		sql: 'CREATE INDEX IF NOT EXISTS idx_brand_is_visible ON brand(is_visible)',
		description: 'Visible brands filter'
	},

	// === Blog Indexes ===
	{
		name: 'idx_blog_slug',
		sql: 'CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug)',
		description: 'Blog slug lookups'
	},
	{
		name: 'idx_blog_author_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_blog_author_id ON blog(author_id)',
		description: 'Posts by author'
	},
	{
		name: 'idx_blog_created_at',
		sql: 'CREATE INDEX IF NOT EXISTS idx_blog_created_at ON blog(created_at DESC)',
		description: 'Recent posts ordering'
	},

	// === User Indexes ===
	{
		name: 'idx_user_username',
		sql: 'CREATE INDEX IF NOT EXISTS idx_user_username ON user(username)',
		description: 'Username lookups (login)'
	},
	{
		name: 'idx_user_email',
		sql: 'CREATE INDEX IF NOT EXISTS idx_user_email ON user(email)',
		description: 'Email lookups (password reset)'
	},
	{
		name: 'idx_user_role',
		sql: 'CREATE INDEX IF NOT EXISTS idx_user_role ON user(role)',
		description: 'Admin user filtering'
	},

	// === Session Indexes ===
	{
		name: 'idx_session_user_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id)',
		description: 'User sessions lookup'
	},
	{
		name: 'idx_session_expires_at',
		sql: 'CREATE INDEX IF NOT EXISTS idx_session_expires_at ON session(expires_at)',
		description: 'Expired sessions cleanup'
	},

	// === Address Indexes ===
	{
		name: 'idx_address_user_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_address_user_id ON address(user_id)',
		description: 'User addresses lookup'
	},
	{
		name: 'idx_address_default',
		sql: 'CREATE INDEX IF NOT EXISTS idx_address_default ON address(user_id, is_default)',
		description: 'Default address lookup'
	},

	// === Asset Indexes ===
	{
		name: 'idx_asset_uploaded_by',
		sql: 'CREATE INDEX IF NOT EXISTS idx_asset_uploaded_by ON asset(uploaded_by)',
		description: 'Assets by uploader'
	},
	{
		name: 'idx_asset_mime_type',
		sql: 'CREATE INDEX IF NOT EXISTS idx_asset_mime_type ON asset(mime_type)',
		description: 'Assets by type filter'
	},
	{
		name: 'idx_asset_created_at',
		sql: 'CREATE INDEX IF NOT EXISTS idx_asset_created_at ON asset(created_at DESC)',
		description: 'Recent assets ordering'
	},

	// === Payment Indexes ===
	{
		name: 'idx_payment_order_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_payment_order_id ON payment(order_id)',
		description: 'Order payments lookup'
	},
	{
		name: 'idx_payment_status',
		sql: 'CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status)',
		description: 'Payment status filtering'
	},
	{
		name: 'idx_payment_transaction_id',
		sql: 'CREATE INDEX IF NOT EXISTS idx_payment_transaction_id ON payment(transaction_id)',
		description: 'External transaction lookups'
	}
];

async function createIndexes() {
	console.log('🔧 Creating Additional Database Indexes...\n');

	const db = new Database(DB_PATH);

	let successCount = 0;
	let skippedCount = 0;
	let errorCount = 0;

	for (const index of indexes) {
		try {
			// Check if index already exists
			const existing = db
				.prepare(
					`SELECT name FROM sqlite_master WHERE type='index' AND name=?`
				)
				.get(index.name);

			if (existing) {
				console.log(`⏭️  Skipped: ${index.name} (already exists)`);
				skippedCount++;
				continue;
			}

			// Create the index
			db.exec(index.sql);
			console.log(`✓ Created index: ${index.name}`);
			console.log(`  └─ ${index.description}`);
			successCount++;
		} catch (error) {
			console.error(`✗ Error creating ${index.name}:`, error);
			errorCount++;
		}
	}

	db.close();

	console.log('\n' + '='.repeat(60));
	console.log('✅ Index Creation Complete!');
	console.log(`✓ Indexes created: ${successCount}/${indexes.length}`);
	console.log(`⏭️  Indexes skipped: ${skippedCount}/${indexes.length}`);
	if (errorCount > 0) {
		console.log(`✗ Errors: ${errorCount}/${indexes.length}`);
	}
	console.log('='.repeat(60));
}

// Run the script
createIndexes().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
