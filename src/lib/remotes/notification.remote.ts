/**
 * Notification Template Remote Functions
 * Manages email and SMS notification templates with dynamic variable support
 */

import { query, command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, like, and, count, desc, or } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import {
	CreateNotificationTemplateSchema,
	UpdateNotificationTemplateSchema,
	DeleteNotificationTemplateSchema,
	GetNotificationTemplateSchema,
	FilterNotificationTemplatesSchema,
	GetNotificationLogsSchema
} from '$lib/server/schemas';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
import { sendNotification, buildOrderNotificationContext } from '$lib/server/services/notification';
import * as v from 'valibot';

/**
 * Get all notification templates with filtering and pagination
 */
export const getAllNotificationTemplates = query(FilterNotificationTemplatesSchema, async (data) => {
	auth.requireAdminUser();

	// Build conditions array
	const conditions = [];

	if (data.search) {
		conditions.push(
			like(tables.notificationTemplate.name, `%${data.search}%`)
		);
	}

	if (data.channel !== 'all') {
		conditions.push(eq(tables.notificationTemplate.channel, data.channel as 'email' | 'sms'));
	}

	if (data.eventType !== 'all') {
		conditions.push(eq(tables.notificationTemplate.eventType, data.eventType as typeof data.eventType));
	}

	if (data.isActive !== 'all') {
		const isActive = data.isActive === 'true';
		conditions.push(eq(tables.notificationTemplate.isActive, isActive));
	}

	conditions.push(eq(tables.notificationTemplate.language, data.language));

	// Create count query
	const countResult = await db.select({ count: count() })
		.from(tables.notificationTemplate)
		.where(conditions.length ? and(...conditions) : undefined);

	const totalItems = countResult[0].count;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// Fetch paginated data
	const templates = await db
		.select()
		.from(tables.notificationTemplate)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(desc(tables.notificationTemplate.createdAt))
		.limit(limit)
		.offset(offset);

	return createPaginatedResponse(templates, totalItems, {
		page: data.page,
		pageSize: data.pageSize
	});
});

/**
 * Get single notification template by ID
 */
export const getNotificationTemplate = query(GetNotificationTemplateSchema, async (data) => {
	auth.requireAdminUser();

	const [template] = await db
		.select()
		.from(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.id, data.id));

	if (!template) {
		return null;
	}

	// Parse variables JSON
	return {
		...template,
		variables: JSON.parse(template.variables || '[]')
	};
});

/**
 * Get templates by event type
 */
export const getTemplatesByEventType = query(
	v.object({
		eventType: v.picklist([
			'order_created', 'order_confirmed', 'payment_pending_reminder', 
			'order_shipped', 'order_delivered', 'post_delivery_review'
		]),
		channel: v.picklist(['email', 'sms']),
		language: v.optional(v.string(), 'en')
	}),
	async (data) => {
		const templates = await db
			.select()
			.from(tables.notificationTemplate)
			.where(
				and(
					eq(tables.notificationTemplate.eventType, data.eventType),
					eq(tables.notificationTemplate.channel, data.channel),
					eq(tables.notificationTemplate.language, data.language),
					eq(tables.notificationTemplate.isActive, true)
				)
			);

		return templates.map(t => ({
			...t,
			variables: JSON.parse(t.variables || '[]')
		}));
	}
);

/**
 * Create new notification template
 */
export const createNotificationTemplate = command(CreateNotificationTemplateSchema, async (data) => {
	auth.requireAdminUser();
	const user = auth.getUser();

	// Check if code already exists
	const [existing] = await db
		.select()
		.from(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.code, data.code));

	if (existing) {
		return {
			success: false,
			error: 'Template code already exists'
		};
	}

	// Parse variables
	let parsedVariables = [];
	try {
		parsedVariables = JSON.parse(data.variables || '[]');
	} catch {
		// Continue with empty array
	}

	const [created] = await db
		.insert(tables.notificationTemplate)
		.values({
			id: crypto.randomUUID(),
			code: data.code,
			channel: data.channel,
			eventType: data.eventType,
			name: data.name,
			subject: data.subject || null,
			content: data.content,
			description: data.description || null,
			isActive: data.isActive,
			variables: JSON.stringify(parsedVariables),
			language: data.language,
			createdBy: user!.id,
			updatedBy: user!.id,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// Refresh query
	await getAllNotificationTemplates({
		search: '',
		channel: 'all',
		eventType: 'all',
		isActive: 'all',
		language: data.language,
		page: 1,
		pageSize: 20
	}).refresh();

	return {
		success: true,
		template: {
			...created,
			variables: parsedVariables
		}
	};
});

/**
 * Update notification template
 */
export const updateNotificationTemplate = command(UpdateNotificationTemplateSchema, async (data) => {
	auth.requireAdminUser();
	const user = auth.getUser();

	// Get current template
	const [current] = await db
		.select()
		.from(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.id, data.id));

	if (!current) {
		return {
			success: false,
			error: 'Template not found'
		};
	}

	// Check if updating code and if it already exists
	if (data.code && data.code !== current.code) {
		const [existing] = await db
			.select()
			.from(tables.notificationTemplate)
			.where(eq(tables.notificationTemplate.code, data.code));

		if (existing) {
			return {
				success: false,
				error: 'Template code already exists'
			};
		}
	}

	// Parse variables
	let parsedVariables = [];
	try {
		parsedVariables = JSON.parse(data.variables || '[]');
	} catch {
		parsedVariables = JSON.parse(current.variables || '[]');
	}

	const [updated] = await db
		.update(tables.notificationTemplate)
		.set({
			code: data.code || current.code,
			channel: data.channel || current.channel,
			eventType: data.eventType || current.eventType,
			name: data.name || current.name,
			subject: data.subject !== undefined ? data.subject : current.subject,
			content: data.content || current.content,
			description: data.description !== undefined ? data.description : current.description,
			isActive: data.isActive !== undefined ? data.isActive : current.isActive,
			variables: JSON.stringify(parsedVariables),
			language: data.language || current.language,
			updatedBy: user!.id,
			updatedAt: new Date()
		})
		.where(eq(tables.notificationTemplate.id, data.id))
		.returning();

	// Refresh query
	await getAllNotificationTemplates({
		search: '',
		channel: 'all',
		eventType: 'all',
		isActive: 'all',
		language: data.language || current.language,
		page: 1,
		pageSize: 20
	}).refresh();

	return {
		success: true,
		template: {
			...updated,
			variables: parsedVariables
		}
	};
});

/**
 * Delete notification template
 */
export const deleteNotificationTemplate = command(DeleteNotificationTemplateSchema, async (data) => {
	auth.requireAdminUser();

	const [template] = await db
		.select()
		.from(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.id, data.id));

	if (!template) {
		return {
			success: false,
			error: 'Template not found'
		};
	}

	await db
		.delete(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.id, data.id));

	// Refresh query
	await getAllNotificationTemplates({
		search: '',
		channel: 'all',
		eventType: 'all',
		isActive: 'all',
		language: template.language,
		page: 1,
		pageSize: 20
	}).refresh();

	return {
		success: true,
		message: `Template "${template.name}" deleted successfully`
	};
});

/**
 * Get notification logs with filtering
 */
export const getNotificationLogs = query(GetNotificationLogsSchema, async (data) => {
	auth.requireAdminUser();

	const conditions = [];

	if (data.orderId) {
		conditions.push(eq(tables.notificationLog.orderId, data.orderId));
	}

	if (data.templateId) {
		conditions.push(eq(tables.notificationLog.templateId, data.templateId));
	}

	if (data.channel !== 'all') {
		conditions.push(eq(tables.notificationLog.channel, data.channel as 'email' | 'sms'));
	}

	if (data.status !== 'all') {
		conditions.push(eq(tables.notificationLog.status, data.status as 'pending' | 'sent' | 'failed' | 'bounced'));
	}

	// Create count query
	const countResult = await db.select({ count: count() })
		.from(tables.notificationLog)
		.where(conditions.length ? and(...conditions) : undefined);

	const totalItems = countResult[0].count;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// Fetch paginated data
	const logs = await db
		.select()
		.from(tables.notificationLog)
		.where(conditions.length ? and(...conditions) : undefined)
		.orderBy(desc(tables.notificationLog.createdAt))
		.limit(limit)
		.offset(offset);

	return createPaginatedResponse(logs, totalItems, {
		page: data.page,
		pageSize: data.pageSize
	});
});

/**
 * Get available dynamic variables
 */
export const getAvailableVariables = query(async () => {
	const variables = await db.select().from(tables.notificationVariable).orderBy(tables.notificationVariable.category);
	
	// Group by category
	const grouped = variables.reduce((acc, v) => {
		if (!acc[v.category]) {
			acc[v.category] = [];
		}
		acc[v.category].push(v);
		return acc;
	}, {} as Record<string, typeof variables>);

	return grouped;
});

/**
 * Initialize default variables in database
 * Allows re-seeding if no variables exist
 */
export const initializeDefaultVariables = command(v.object({}), async () => {
	auth.requireAdminUser();

	// Check if variables already exist
	const existing = await db.select().from(tables.notificationVariable);

	if (existing.length > 0) {
		return {
			success: false,
			message: `Variables already initialized (${existing.length} variables found)`,
			count: existing.length
		};
	}

	const defaultVariables: Array<{
		key: string;
		label: string;
		category: string;
		dataType: 'string' | 'number' | 'date' | 'boolean';
		exampleValue: string;
	}> = [
		// Order variables
		{ key: 'order_id', label: 'Order ID', category: 'order', dataType: 'string', exampleValue: '12345' },
		{ key: 'order_number', label: 'Order Number', category: 'order', dataType: 'string', exampleValue: '#ORD-2024-001' },
		{ key: 'order_total', label: 'Order Total', category: 'order', dataType: 'string', exampleValue: '1,250.00 грн.' },
		{ key: 'order_subtotal', label: 'Order Subtotal', category: 'order', dataType: 'string', exampleValue: '1,000.00 грн.' },
		{ key: 'order_status', label: 'Order Status', category: 'order', dataType: 'string', exampleValue: 'pending' },
		{ key: 'order_items_list', label: 'Order Items (formatted list)', category: 'order', dataType: 'string', exampleValue: '1x Product A - 500 грн.' },
		
		// Customer variables
		{ key: 'customer_name', label: 'Customer Name', category: 'customer', dataType: 'string', exampleValue: 'John Doe' },
		{ key: 'customer_first_name', label: 'Customer First Name', category: 'customer', dataType: 'string', exampleValue: 'John' },
		{ key: 'customer_last_name', label: 'Customer Last Name', category: 'customer', dataType: 'string', exampleValue: 'Doe' },
		{ key: 'customer_email', label: 'Customer Email', category: 'customer', dataType: 'string', exampleValue: 'john@example.com' },
		{ key: 'customer_phone', label: 'Customer Phone', category: 'customer', dataType: 'string', exampleValue: '+380 99 999 99 99' },
		
		// Payment variables
		{ key: 'payment_method', label: 'Payment Method', category: 'payment', dataType: 'string', exampleValue: 'Credit Card' },
		{ key: 'payment_status', label: 'Payment Status', category: 'payment', dataType: 'string', exampleValue: 'pending' },
		{ key: 'iban', label: 'IBAN (for bank transfer)', category: 'payment', dataType: 'string', exampleValue: 'UA123456789...' },
		{ key: 'bank_details', label: 'Bank Details', category: 'payment', dataType: 'string', exampleValue: 'Full bank account details' },
		
		// Shipping variables
		{ key: 'shipping_method', label: 'Shipping Method', category: 'shipping', dataType: 'string', exampleValue: 'Nova Poshta' },
		{ key: 'tracking_number', label: 'Tracking Number (TTN)', category: 'shipping', dataType: 'string', exampleValue: '20240001234567' },
		{ key: 'shipping_address', label: 'Shipping Address', category: 'shipping', dataType: 'string', exampleValue: '123 Main St, City' },
		{ key: 'estimated_delivery', label: 'Estimated Delivery Date', category: 'shipping', dataType: 'date', exampleValue: '3-5 business days' },
		{ key: 'carrier_name', label: 'Carrier Name', category: 'shipping', dataType: 'string', exampleValue: 'Nova Poshta' },
		
		// Item-specific variables (for order item templates)
		{ key: 'quantity', label: 'Item Quantity', category: 'item', dataType: 'number', exampleValue: '3' },
		{ key: 'productName', label: 'Product Name', category: 'item', dataType: 'string', exampleValue: 'Cinnamon' },
		{ key: 'productImage', label: 'Product Image URL', category: 'item', dataType: 'string', exampleValue: 'https://example.com/image.jpg' },
		{ key: 'productSlug', label: 'Product Slug', category: 'item', dataType: 'string', exampleValue: 'cinnamon' },
		{ key: 'price', label: 'Item Price (per unit)', category: 'item', dataType: 'string', exampleValue: '150.00 грн.' },
		{ key: 'subtotal', label: 'Item Subtotal', category: 'item', dataType: 'string', exampleValue: '450.00 грн.' }
	];

	const inserted = await db
		.insert(tables.notificationVariable)
		.values(
			defaultVariables.map(v => ({
				id: crypto.randomUUID(),
				key: v.key,
				label: v.label,
				category: v.category,
				dataType: v.dataType,
				exampleValue: v.exampleValue,
				description: `Dynamic variable: ${v.label}`,
				createdAt: new Date()
			}))
		)
		.returning();

	return {
		success: true,
		message: `${inserted.length} default variables initialized (including item-specific variables for order item templates)`,
		variables: inserted,
		count: inserted.length
	};
});

/**
 * Seed default notification templates based on The Spice Room communication flow
 * Only seeds if no templates exist
 */
export const seedDefaultTemplates = command(v.object({}), async () => {
	auth.requireAdminUser();
	const user = auth.getUser();

	// Check if templates already exist
	const existing = await db.select().from(tables.notificationTemplate);

	if (existing.length > 0) {
		return {
			success: false,
			message: `Found ${existing.length} existing templates. Templates already initialized. Delete templates first to re-seed.`,
			count: existing.length
		};
	}

	const defaultTemplates = [
		// E1: Order Confirmation
		{
			code: 'E1',
			channel: 'email' as const,
			eventType: 'order_confirmed' as const,
			name: 'Order Confirmation',
			description: 'Sent when order is created (all payment types)',
			subject: 'Ваше замовлення №{{order_number}} прийнято!',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Вітаємо, {{customer_first_name}}!</h1>
    <p>Дякуємо, що обрали The Spice Room 🌿</p>
    
    <h2>Ваше замовлення №{{order_number}} успішно оформлене</h2>
    
    <h3>Склад замовлення:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        {{order_items_list}}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Сума ітого:</strong> {{order_total}} грн.</p>
      <p><strong>Спосіб оплати:</strong> {{payment_method}}</p>
      <p><strong>Спосіб доставки:</strong> {{shipping_method}}</p>
      <p><strong>Термін відправки:</strong> 1-3 робочих дні</p>
    </div>
    
    <p style="margin-top: 20px; color: #666;">Як тільки замовлення буде передано на відправку — повідомимо Вам додатково.</p>
  </div>
</body>
</html>
			`
		},
		// E1a: Order Confirmation with IBAN
		{
			code: 'E1a',
			channel: 'email' as const,
			eventType: 'order_confirmed' as const,
			name: 'Order Confirmation with IBAN',
			description: 'Sent when order is created with IBAN payment method',
			subject: 'Ваше замовлення №{{order_number}} прийнято!',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Вітаємо, {{customer_first_name}}!</h1>
    <p>Дякуємо, що обрали The Spice Room 🌿</p>
    
    <h2>Ваше замовлення №{{order_number}} успішно оформлене</h2>
    
    <h3>Реквізити для оплати:</h3>
    <div style="padding: 15px; background-color: #fff8f0; border-left: 4px solid #d4a574;">
      {{bank_details}}
    </div>
    
    <p style="margin-top: 20px; color: #666;">Після зарахування коштів ми відправимо замовлення протягом 1-3 робочих днів.</p>
  </div>
</body>
</html>
			`
		},
		// E1b: Order Confirmation - Courier
		{
			code: 'E1b',
			channel: 'email' as const,
			eventType: 'order_confirmed' as const,
			name: 'Order Confirmation - Courier Delivery',
			description: 'Sent for cash-on-delivery courier orders',
			subject: 'Ваше замовлення №{{order_number}} прийнято!',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Вітаємо, {{customer_first_name}}!</h1>
    <p>Дякуємо, що обрали The Spice Room 🌿</p>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50;">
      <h3 style="margin-top: 0; color: #2e7d32;">⏰ Важливо!</h3>
      <p>Менеджер з Вами зв'яжеться протягом робочого дня (пн-пт з 08:00 до 17:00) для погодження дати й часу доставки кур'єром по м. Кривий Ріг.</p>
    </div>
  </div>
</body>
</html>
			`
		},
		// S1: SMS Order Confirmation
		{
			code: 'S1',
			channel: 'sms' as const,
			eventType: 'order_confirmed' as const,
			name: 'SMS Order Confirmation',
			description: 'SMS sent when order is created',
			content: 'Ваше замовлення №{{order_number}} прийнято. Дякуємо 🌿 Деталі — у E-mail.'
		},
		// E2: Payment Reminder
		{
			code: 'E2',
			channel: 'email' as const,
			eventType: 'payment_pending_reminder' as const,
			name: 'Payment Reminder',
			description: 'Sent 24 hours after order if payment not received (IBAN)',
			subject: 'Чи вдалося вам оплатити замовлення №{{order_number}}?',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Доброго дня, {{customer_first_name}}!</h1>
    <p>Нагадуємо, що замовлення №{{order_number}} очікує на оплату.</p>
    
    <h3>Реквізити для оплати:</h3>
    <div style="padding: 15px; background-color: #fff8f0; border-left: 4px solid #d4a574;">
      {{bank_details}}
    </div>
    
    <p style="margin-top: 20px; color: #666;">Після зарахування коштів ми відправимо замовлення протягом 1-3 робочих днів.</p>
  </div>
</body>
</html>
			`
		},
		// S2: SMS Payment Reminder
		{
			code: 'S2',
			channel: 'sms' as const,
			eventType: 'payment_pending_reminder' as const,
			name: 'SMS Payment Reminder',
			description: 'SMS sent 24 hours after order if payment not received',
			content: 'Нагадуємо про оплату замовлення №{{order_number}}. Реквізити у листі.'
		},
		// E3: Order Shipped
		{
			code: 'E3',
			channel: 'email' as const,
			eventType: 'order_shipped' as const,
			name: 'Order Shipped',
			description: 'Sent when order is shipped with tracking number',
			subject: 'Ваше замовлення №{{order_number}} уже в дорозі!',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Вітаємо, {{customer_first_name}}!</h1>
    <h2>Ваше замовлення №{{order_number}} вже прямує до Вас 🌶️</h2>
    
    <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px; text-align: center;">
      <p style="margin: 0; color: #666;">Номер відслідкування (ТТН):</p>
      <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace;">{{tracking_number}}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Перевізник: {{carrier_name}}</p>
    </div>
  </div>
</body>
</html>
			`
		},
		// S3: SMS Order Shipped
		{
			code: 'S3',
			channel: 'sms' as const,
			eventType: 'order_shipped' as const,
			name: 'SMS Order Shipped',
			description: 'SMS sent when order is shipped with tracking',
			content: '🌿 Замовлення №{{order_number}} у дорозі 🚚 ТТН: {{tracking_number}}'
		},
		// E4: Post-Delivery Review Request
		{
			code: 'E4',
			channel: 'email' as const,
			eventType: 'post_delivery_review' as const,
			name: 'Post-Delivery Review Request',
			description: 'Sent 2-3 days after delivery with review request and offer',
			subject: 'Чи все сподобалось? 🌸',
			content: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Доброго дня, {{customer_first_name}}!</h1>
    
    <p>Ви вже отримали своє замовлення — сподіваємось, підняли Вам настрій 🌶️</p>
    
    <div style="margin-top: 30px; padding: 20px; background-color: #f0f8ff; border-left: 4px solid #2196f3; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #1976d2;">Будемо вдячні за Ваш відгук!</h3>
      <p>Кілька слів про Ваше замовлення допоможуть нам стати ще краще. Можете також поділитися фото у сторіс — позначте @the_spiceroom, нам завжди радісно бачити Ваші покупки 💛</p>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px;">Дякуємо, що обираєте корисне та смачне! 🌿</p>
  </div>
</body>
</html>
			`
		},
		// S4: SMS Post-Delivery Review
		{
			code: 'S4',
			channel: 'sms' as const,
			eventType: 'post_delivery_review' as const,
			name: 'SMS Post-Delivery Review',
			description: 'SMS sent asking for review after delivery',
			content: '🌸 Налишіть, будь ласка, відгук про Ваше замовлення.'
		}
	];

	const inserted = await db
		.insert(tables.notificationTemplate)
		.values(
			defaultTemplates.map(t => ({
				id: crypto.randomUUID(),
				code: t.code,
				channel: t.channel,
				eventType: t.eventType,
				name: t.name,
				subject: t.subject || null,
				content: t.content,
				description: t.description || null,
				variables: JSON.stringify([
					'order_number',
					'customer_first_name',
					'payment_method',
					'shipping_method',
					'order_items_list',
					'order_total',
					'bank_details',
					'tracking_number',
					'carrier_name'
				]),
				language: 'uk',
				isActive: true,
				createdBy: user!.id,
				updatedBy: user!.id,
				createdAt: new Date(),
				updatedAt: new Date()
			}))
		)
		.returning();

	// Refresh query
	await getAllNotificationTemplates({
		search: '',
		channel: 'all',
		eventType: 'all',
		isActive: 'all',
		language: 'uk',
		page: 1,
		pageSize: 20
	}).refresh();

	return {
		success: true,
		message: `Successfully seeded ${inserted.length} default notification templates from The Spice Room communication flow. You can now customize order item templates for each email template.`,
		templatesCount: inserted.length,
		note: 'Email templates can have custom order item templates - edit each template and click "Edit Items Template" to customize item formatting.'
	};
});

/**
 * Send test notification using real or generated order data
 */
export const sendTestNotification = command(
	v.object({
		templateId: v.string(),
		orderId: v.optional(v.string()),
		orderItemIds: v.optional(v.array(v.string()), []),
		generateRandomOrder: v.optional(v.boolean(), false)
	}),
	async (data) => {
		auth.requireAdminUser();

		// Get template
		const [template] = await db
			.select()
			.from(tables.notificationTemplate)
			.where(eq(tables.notificationTemplate.id, data.templateId));

		if (!template) {
			return {
				success: false,
				error: 'Template not found'
			};
		}

		let order;
		let orderItems: typeof tables.orderItem.$inferSelect[] = [];

		if (data.generateRandomOrder) {
			// Generate a fake order for testing
			const products = await db.select().from(tables.product).limit(5);
			
			if (products.length === 0) {
				return {
					success: false,
					error: 'No products found in database. Please create products first.'
				};
			}

			// Create fake order data
			const fakeOrder = {
				id: crypto.randomUUID(),
				orderNumber: `TEST-${Date.now()}`,
				customerFirstName: 'Test',
				customerLastName: 'Customer',
				customerEmail: 'yaovdiy@gmail.com',
				customerPhone: '+380687235365',
				total: 15000, // 150.00 UAH in cents
				subtotal: 12500,
				status: 'pending' as const,
				paymentStatus: 'pending' as const,
				paymentMethod: 'cod',
				shippingMethod: 'nova_poshta',
				shippingAddress: JSON.stringify({
					address1: '123 Test Street',
					city: 'Kyiv',
					state: 'Kyiv Oblast',
					country: 'Ukraine',
					postalCode: '03150'
				}),
				billingAddress: JSON.stringify({
					address1: '123 Test Street',
					city: 'Kyiv',
					state: 'Kyiv Oblast',
					country: 'Ukraine',
					postalCode: '03150'
				}),
				userId: null,
				items: '[]',
				notes: 'This is a test notification',
				shippedAt: null,
				deliveredAt: null,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Insert test order into database
			const [insertedOrder] = await db.insert(tables.order).values(fakeOrder).returning();
			order = insertedOrder;

			// Generate fake order items and insert them
			const numItems = Math.min(3, products.length);
			for (let i = 0; i < numItems; i++) {
				const product = products[i];
				const itemData = {
					id: crypto.randomUUID(),
					orderId: order.id,
					productId: product.id,
					productName: product.name,
					productSlug: product.slug,
					productImage: product.images ? JSON.parse(product.images)[0] : null,
					price: product.price,
					quantity: Math.floor(Math.random() * 3) + 1,
					subtotal: product.price * (Math.floor(Math.random() * 3) + 1),
					createdAt: new Date()
				};
				const [insertedItem] = await db.insert(tables.orderItem).values(itemData).returning();
				orderItems.push(insertedItem);
			}
		} else if (data.orderId) {
			// Get real order from database
			const [foundOrder] = await db
				.select()
				.from(tables.order)
				.where(eq(tables.order.id, data.orderId));

			if (!foundOrder) {
				return {
					success: false,
					error: 'Order not found'
				};
			}

			order = foundOrder;

			// Get order items
			const allItems = await db.select().from(tables.orderItem).where(eq(tables.orderItem.orderId, data.orderId));

			if (data.orderItemIds.length > 0) {
				// Filter by selected item IDs
				orderItems = allItems.filter((item) => data.orderItemIds.includes(item.id));
			} else {
				orderItems = allItems;
			}
		} else {
			return {
				success: false,
				error: 'Either orderId or generateRandomOrder must be provided'
			};
		}

		if (!order) {
			return {
				success: false,
				error: 'Order not found'
			};
		}

		if (orderItems.length === 0) {
			return {
				success: false,
				error: 'No order items found'
			};
		}

		// Fetch order item template for this notification
		const [itemTemplate] = await db
			.select()
			.from(tables.orderItemTemplate)
			.where(eq(tables.orderItemTemplate.notificationTemplateId, data.templateId));

		// Build notification context with item template
		const context = buildOrderNotificationContext(
			order,
			orderItems,
			{},
			itemTemplate?.itemTemplate,
			itemTemplate?.itemSeparator,
			itemTemplate?.wrapperTemplate,
			itemTemplate?.useHtmlFormatting
		);

		// Send notification
		const result = await sendNotification(data.templateId, context);

		if (result.success) {
			return {
				success: true,
				message: `Test notification sent successfully to ${context.customerEmail}`,
				logId: result.logId
			};
		} else {
			return {
				success: false,
				error: result.error || 'Failed to send notification'
			};
		}
	}
);

/**
 * Get orders for test notification selection
 */
export const getOrdersForTesting = query(
	v.object({
		search: v.optional(v.string(), ''),
		limit: v.optional(v.number(), 50)
	}),
	async (data) => {
		auth.requireAdminUser();

		const conditions = [];

		if (data.search) {
			conditions.push(
				or(
					like(tables.order.orderNumber, `%${data.search}%`),
					like(tables.order.customerEmail, `%${data.search}%`),
					like(tables.order.customerFirstName, `%${data.search}%`)
				)
			);
		}

		let baseQuery = db.select().from(tables.order);

		if (conditions.length > 0) {
			baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
		}

		const orders = await baseQuery.orderBy(desc(tables.order.createdAt)).limit(data.limit);

		return orders;
	}
);

/**
 * Get order items for test notification selection
 */
export const getOrderItemsForTesting = query(
	v.object({
		orderId: v.string(),
		search: v.optional(v.string(), '')
	}),
	async (data) => {
		auth.requireAdminUser();

		const conditions = [eq(tables.orderItem.orderId, data.orderId)];

		if (data.search) {
			conditions.push(like(tables.orderItem.productName, `%${data.search}%`));
		}

		const items = await db.select().from(tables.orderItem).where(and(...conditions));

		return items;
	}
);

/**
 * Get order item template for a notification template
 */
export const getOrderItemTemplate = query(
	v.object({
		notificationTemplateId: v.string()
	}),
	async (data) => {
		auth.requireAdminUser();

		const [itemTemplate] = await db
			.select()
			.from(tables.orderItemTemplate)
			.where(eq(tables.orderItemTemplate.notificationTemplateId, data.notificationTemplateId));

		return itemTemplate || null;
	}
);

/**
 * Create order item template
 */
export const createOrderItemTemplate = command(
	v.object({
		notificationTemplateId: v.string(),
		itemTemplate: v.pipe(v.string(), v.minLength(1)),
		itemSeparator: v.optional(v.string(), '\n'),
		wrapperTemplate: v.optional(v.string()),
		useHtmlFormatting: v.optional(v.boolean(), false)
	}),
	async (data) => {
		auth.requireAdminUser();

		// Check if item template already exists
		const [existing] = await db
			.select()
			.from(tables.orderItemTemplate)
			.where(eq(tables.orderItemTemplate.notificationTemplateId, data.notificationTemplateId));

		if (existing) {
			return {
				success: false,
				error: 'Order item template already exists for this notification template'
			};
		}

		const [created] = await db
			.insert(tables.orderItemTemplate)
			.values({
				id: crypto.randomUUID(),
				notificationTemplateId: data.notificationTemplateId,
				itemTemplate: data.itemTemplate,
				itemSeparator: data.itemSeparator,
				wrapperTemplate: data.wrapperTemplate || null,
				useHtmlFormatting: data.useHtmlFormatting,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return {
			success: true,
			itemTemplate: created
		};
	}
);

/**
 * Update order item template
 */
export const updateOrderItemTemplate = command(
	v.object({
		id: v.string(),
		itemTemplate: v.pipe(v.string(), v.minLength(1)),
		itemSeparator: v.optional(v.string(), '\n'),
		wrapperTemplate: v.optional(v.string()),
		useHtmlFormatting: v.optional(v.boolean(), false)
	}),
	async (data) => {
		auth.requireAdminUser();

		const [existing] = await db
			.select()
			.from(tables.orderItemTemplate)
			.where(eq(tables.orderItemTemplate.id, data.id));

		if (!existing) {
			return {
				success: false,
				error: 'Order item template not found'
			};
		}

		const [updated] = await db
			.update(tables.orderItemTemplate)
			.set({
				itemTemplate: data.itemTemplate,
				itemSeparator: data.itemSeparator,
				wrapperTemplate: data.wrapperTemplate || null,
				useHtmlFormatting: data.useHtmlFormatting,
				updatedAt: new Date()
			})
			.where(eq(tables.orderItemTemplate.id, data.id))
			.returning();

		return {
			success: true,
			itemTemplate: updated
		};
	}
);

/**
 * Delete order item template
 */
export const deleteOrderItemTemplate = command(
	v.object({
		id: v.string()
	}),
	async (data) => {
		auth.requireAdminUser();

		const [existing] = await db
			.select()
			.from(tables.orderItemTemplate)
			.where(eq(tables.orderItemTemplate.id, data.id));

		if (!existing) {
			return {
				success: false,
				error: 'Order item template not found'
			};
		}

		await db.delete(tables.orderItemTemplate).where(eq(tables.orderItemTemplate.id, data.id));

		return {
			success: true,
			message: 'Order item template deleted successfully'
		};
	}
);
