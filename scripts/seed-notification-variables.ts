/**
 * Seed script for notification variables
 * These are dynamic variables that can be used in notification templates
 * Available for email and SMS templates
 */

import { db } from '../src/lib/server/db/index';
import * as tables from '../src/lib/server/db/schema';

const variables = [
	// ============ ORDER VARIABLES ============
	{
		key: 'order_number',
		label: 'Order Number',
		description: 'Unique order identifier (e.g., ORD-2024-001)',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: 'ORD-2024-001'
	},
	{
		key: 'order_id',
		label: 'Order ID',
		description: 'Internal UUID for the order',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: '550e8400-e29b-41d4-a716-446655440000'
	},
	{
		key: 'order_total',
		label: 'Order Total',
		description: 'Total order amount in currency',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: '1,250 грн.'
	},
	{
		key: 'order_items',
		label: 'Order Items',
		description: 'List of ordered products with quantities and prices',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: '[{name, quantity, price}]'
	},
	{
		key: 'order_date',
		label: 'Order Date',
		description: 'Date when order was created',
		category: 'order' as const,
		dataType: 'date' as const,
		exampleValue: '2024-01-15'
	},
	{
		key: 'order_status',
		label: 'Order Status',
		description: 'Current order status',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: 'pending'
	},

	// ============ CUSTOMER VARIABLES ============
	{
		key: 'customer_first_name',
		label: 'Customer First Name',
		description: "Customer's first name",
		category: 'customer' as const,
		dataType: 'string' as const,
		exampleValue: 'Іван'
	},
	{
		key: 'customer_last_name',
		label: 'Customer Last Name',
		description: "Customer's last name",
		category: 'customer' as const,
		dataType: 'string' as const,
		exampleValue: 'Петренко'
	},
	{
		key: 'customer_email',
		label: 'Customer Email',
		description: "Customer's email address",
		category: 'customer' as const,
		dataType: 'string' as const,
		exampleValue: 'ivan@example.com'
	},
	{
		key: 'customer_phone',
		label: 'Customer Phone',
		description: "Customer's phone number",
		category: 'customer' as const,
		dataType: 'string' as const,
		exampleValue: '+380951234567'
	},

	// ============ PAYMENT VARIABLES ============
	{
		key: 'payment_method',
		label: 'Payment Method',
		description: 'How the customer will pay (cod, iban, liqpay, etc.)',
		category: 'payment' as const,
		dataType: 'string' as const,
		exampleValue: 'IBAN transfer'
	},
	{
		key: 'payment_status',
		label: 'Payment Status',
		description: 'Current payment status',
		category: 'payment' as const,
		dataType: 'string' as const,
		exampleValue: 'pending'
	},
	{
		key: 'iban_number',
		label: 'IBAN Number',
		description: 'Bank account IBAN for transfers',
		category: 'payment' as const,
		dataType: 'string' as const,
		exampleValue: 'UA623052990000026004010405791'
	},
	{
		key: 'edrpou',
		label: 'ЄДРПОУ',
		description: 'Tax registration number',
		category: 'payment' as const,
		dataType: 'string' as const,
		exampleValue: '3337215509'
	},
	{
		key: 'fop_name',
		label: 'FOP Name',
		description: 'Name of individual entrepreneur',
		category: 'payment' as const,
		dataType: 'string' as const,
		exampleValue: 'Чигрін Вікторія Євгенівна'
	},

	// ============ SHIPPING VARIABLES ============
	{
		key: 'shipping_method',
		label: 'Shipping Method',
		description: 'Delivery method (courier, post, etc.)',
		category: 'shipping' as const,
		dataType: 'string' as const,
		exampleValue: 'Нова Пошта'
	},
	{
		key: 'shipping_provider',
		label: 'Shipping Provider',
		description: 'Courier service name',
		category: 'shipping' as const,
		dataType: 'string' as const,
		exampleValue: 'Нова Пошта'
	},
	{
		key: 'tracking_number',
		label: 'Tracking Number',
		description: 'Shipment tracking/TTN number',
		category: 'shipping' as const,
		dataType: 'string' as const,
		exampleValue: '20240115012345'
	},
	{
		key: 'shipping_cost',
		label: 'Shipping Cost',
		description: 'Delivery fee amount',
		category: 'shipping' as const,
		dataType: 'string' as const,
		exampleValue: '100 грн.'
	},
	{
		key: 'estimated_delivery',
		label: 'Estimated Delivery',
		description: 'Expected delivery date/timeframe',
		category: 'shipping' as const,
		dataType: 'date' as const,
		exampleValue: '2024-01-18'
	},

	// ============ PRODUCT VARIABLES ============
	{
		key: 'product_name',
		label: 'Product Name',
		description: 'Name of product in order',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: 'Гарячі спеції Mix 50g'
	},
	{
		key: 'product_price',
		label: 'Product Price',
		description: 'Price per unit',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: '150 грн.'
	},
	{
		key: 'quantity',
		label: 'Quantity',
		description: 'Number of items',
		category: 'order' as const,
		dataType: 'number' as const,
		exampleValue: '2'
	},
	{
		key: 'item_total',
		label: 'Item Total',
		description: 'Line item total (price × quantity)',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: '300 грн.'
	},

	// ============ MISC VARIABLES ============
	{
		key: 'review_link',
		label: 'Review Link',
		description: 'Direct link to leave a review',
		category: 'order' as const,
		dataType: 'string' as const,
		exampleValue: 'https://thespiceroom.com/review/ORD-2024-001'
	},
	{
		key: 'current_date',
		label: 'Current Date',
		description: 'Current date when email/SMS is sent',
		category: 'order' as const,
		dataType: 'date' as const,
		exampleValue: '2024-01-15'
	}
];

async function seedVariables() {
	try {
		console.log('📝 Starting notification variables seed...\n');

		// Check if variables already exist
		const existingCount = await db
			.select({ count: (col) => col(tables.notificationVariable).id })
			.from(tables.notificationVariable);

		if (existingCount[0]?.count > 0) {
			console.log(
				`⚠️  Found ${existingCount[0].count} existing variables. Skipping seed.\n`
			);
			return;
		}

		// Insert variables
		for (const variable of variables) {
			const id = crypto.randomUUID();
			await db.insert(tables.notificationVariable).values({
				id,
				key: variable.key,
				label: variable.label,
				description: variable.description,
				category: variable.category,
				dataType: variable.dataType,
				exampleValue: variable.exampleValue,
				createdAt: new Date()
			});

			console.log(`✅ Created variable: {{${variable.key}}} - ${variable.label}`);
		}

		console.log(`\n✨ Successfully seeded ${variables.length} notification variables!`);
	} catch (error) {
		console.error('❌ Error seeding variables:', error);
		process.exit(1);
	}
}

seedVariables();
