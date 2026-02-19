/**
 * Migration Script: Populate order_item table from existing orders
 * 
 * This script extracts order items from the JSON 'items' field in the order table
 * and creates separate order_item records for better query performance.
 * 
 * Run with: pnpm tsx scripts/migrate-order-items.ts
 */

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { join } from 'path';
import * as schema from '../src/lib/server/db/schema.js';

const dbPath = join(process.cwd(), 'local.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

interface OrderItemJson {
	productId: string;
	name: string;
	slug: string;
	price: number;
	quantity: number;
	image?: string;
}

async function migrateOrderItems() {
	console.log('🔄 Starting order items migration...\n');

	// Fetch all orders
	const orders = await db
		.select({
			id: schema.order.id,
			items: schema.order.items,
			createdAt: schema.order.createdAt
		})
		.from(schema.order);

	console.log(`📦 Found ${orders.length} orders to process\n`);

	let totalItemsCreated = 0;
	let ordersProcessed = 0;
	let errors = 0;

	for (const order of orders) {
		try {
			// Parse JSON items
			const items: OrderItemJson[] = JSON.parse(order.items);

			// Create order_item records for each item
			for (const item of items) {
				const orderItemId = crypto.randomUUID();

				await db.insert(schema.orderItem).values({
					id: orderItemId,
					orderId: order.id,
					productId: item.productId,
					productName: item.name,
					productSlug: item.slug,
					productImage: item.image || null,
					price: item.price,
					quantity: item.quantity,
					subtotal: item.price * item.quantity,
					createdAt: order.createdAt
				});

				totalItemsCreated++;
			}

			ordersProcessed++;

			// Progress indicator
			if (ordersProcessed % 10 === 0) {
				console.log(`✓ Processed ${ordersProcessed}/${orders.length} orders...`);
			}
		} catch (error) {
			console.error(`❌ Error processing order ${order.id}:`, error);
			errors++;
		}
	}

	console.log('\n' + '='.repeat(60));
	console.log('✅ Migration Complete!');
	console.log('='.repeat(60));
	console.log(`📊 Orders processed: ${ordersProcessed}/${orders.length}`);
	console.log(`📦 Order items created: ${totalItemsCreated}`);
	console.log(`❌ Errors: ${errors}`);
	console.log('='.repeat(60) + '\n');

	// Verify migration
	const orderItemCount = await db
		.select({ count: schema.orderItem.id })
		.from(schema.orderItem);

	console.log(`✓ Verification: ${orderItemCount.length} order items in database\n`);
}

// Run migration
migrateOrderItems()
	.then(() => {
		console.log('🎉 Migration script completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Migration failed:', error);
		process.exit(1);
	});
