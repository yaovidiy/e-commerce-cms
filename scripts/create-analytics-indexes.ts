/**
 * Create Database Indexes for Analytics Performance
 * 
 * This script creates indexes on the order_item and order tables
 * to optimize analytics query performance.
 * 
 * Run with: bun tsx scripts/create-analytics-indexes.ts
 */

import { Database } from "bun:sqlite";
import { join } from 'path';

const dbPath = join(process.cwd(), 'local.db');
const rawDb = new Database(dbPath);

function createIndexes() {
	console.log('🔧 Creating analytics indexes...\n');

	const indexes = [
		// Order table indexes
		{
			name: 'idx_order_created_at',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_created_at ON "order"(created_at)'
		},
		{
			name: 'idx_order_status',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status)'
		},
		{
			name: 'idx_order_status_created_at',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_status_created_at ON "order"(status, created_at)'
		},
		{
			name: 'idx_order_customer_email',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_customer_email ON "order"(customer_email)'
		},

		// Order item table indexes
		{
			name: 'idx_order_item_order_id',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id)'
		},
		{
			name: 'idx_order_item_product_id',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_item_product_id ON order_item(product_id)'
		},
		{
			name: 'idx_order_item_created_at',
			sql: 'CREATE INDEX IF NOT EXISTS idx_order_item_created_at ON order_item(created_at)'
		},

		// Product table indexes
		{
			name: 'idx_product_status',
			sql: 'CREATE INDEX IF NOT EXISTS idx_product_status ON product(status)'
		},
		{
			name: 'idx_product_category_id',
			sql: 'CREATE INDEX IF NOT EXISTS idx_product_category_id ON product(category_id)'
		},

		// Category table indexes
		{
			name: 'idx_category_is_visible',
			sql: 'CREATE INDEX IF NOT EXISTS idx_category_is_visible ON category(is_visible)'
		}
	];

	let created = 0;
	let errors = 0;

	for (const index of indexes) {
		try {
			rawDb.exec(index.sql);
			console.log(`✓ Created index: ${index.name}`);
			created++;
		} catch (error) {
			console.error(`❌ Error creating ${index.name}:`, error);
			errors++;
		}
	}

	console.log('\n' + '='.repeat(60));
	console.log('✅ Index Creation Complete!');
	console.log('='.repeat(60));
	console.log(`✓ Indexes created: ${created}/${indexes.length}`);
	console.log(`❌ Errors: ${errors}`);
	console.log('='.repeat(60) + '\n');
}

// Run index creation
try {
	createIndexes();
	console.log('🎉 Analytics indexes created successfully!');
	process.exit(0);
} catch (error) {
	console.error('💥 Index creation failed:', error);
	process.exit(1);
}
