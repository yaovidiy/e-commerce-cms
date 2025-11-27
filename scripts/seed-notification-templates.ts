/**
 * Seed script for notification templates based on The Spice Room communication flow
 * Creates default email and SMS templates for order lifecycle
 * 
 * Templates included:
 * - E1: Order confirmation (all payment types)
 * - E1a: Order confirmation with IBAN details
 * - E1b: Order confirmation for courier delivery
 * - S1: SMS order confirmation
 * - E2: Payment reminder
 * - S2: SMS payment reminder
 * - E3: Order shipped with tracking
 * - S3: SMS order shipped
 * - E4: Post-delivery review request
 * - S4: SMS post-delivery review request
 */

import { db } from '../src/lib/server/db/index';
import * as tables from '../src/lib/server/db/schema';

// Get or create default admin user for seed
async function getAdminUser() {
	const [admin] = await db.select().from(tables.user).where((u) => u.isAdmin);
	if (!admin) {
		const userId = crypto.randomUUID();
		await db.insert(tables.user).values({
			id: userId,
			username: 'admin',
			passwordHash: '', // Will be set separately
			role: 'admin',
			isAdmin: true,
			createdAt: new Date()
		});
		return userId;
	}
	return admin.id;
}

const templates = [
	// ============ ORDER CONFIRMATION ============
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
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th style="text-align: left; padding: 8px;">Товар</th>
          <th style="text-align: center; padding: 8px;">Кількість</th>
          <th style="text-align: right; padding: 8px;">Ціна</th>
          <th style="text-align: right; padding: 8px;">Сума</th>
        </tr>
      </thead>
      <tbody>
        {{#each order_items}}
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">{{product_name}}</td>
          <td style="text-align: center; padding: 8px;">{{quantity}}</td>
          <td style="text-align: right; padding: 8px;">{{product_price}}</td>
          <td style="text-align: right; padding: 8px;">{{item_total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Сума ітого:</strong> {{order_total}} грн.</p>
      <p><strong>Спосіб оплати:</strong> {{payment_method}}</p>
      <p><strong>Спосіб доставки:</strong> {{shipping_method}}</p>
      <p><strong>Термін відправки:</strong> 1-3 робочих дні</p>
    </div>
    
    <p style="margin-top: 20px; color: #666;">Як тільки замовлення буде передано на відправку — повідомимо Вам додатково.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
      <a href="https://instagram.com/the_spiceroom" style="color: #e4405f; text-decoration: none; font-weight: bold;">Перейти в Instagram</a>
    </div>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}. Якщо ви не замовляли це, ігноруйте цей лист.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'order_number',
			'customer_first_name',
			'customer_email',
			'order_items',
			'product_name',
			'quantity',
			'product_price',
			'item_total',
			'order_total',
			'payment_method',
			'shipping_method'
		])
	},
	// ============ IBAN PAYMENT DETAILS ============
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
    
    <h3>Склад замовлення:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th style="text-align: left; padding: 8px;">Товар</th>
          <th style="text-align: center; padding: 8px;">Кількість</th>
          <th style="text-align: right; padding: 8px;">Ціна</th>
          <th style="text-align: right; padding: 8px;">Сума</th>
        </tr>
      </thead>
      <tbody>
        {{#each order_items}}
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">{{product_name}}</td>
          <td style="text-align: center; padding: 8px;">{{quantity}}</td>
          <td style="text-align: right; padding: 8px;">{{product_price}}</td>
          <td style="text-align: right; padding: 8px;">{{item_total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Сума ітого:</strong> {{order_total}} грн.</p>
      <p><strong>Спосіб доставки:</strong> {{shipping_method}}</p>
    </div>
    
    <h3 style="margin-top: 20px; color: #d4a574;">Реквізити для оплати:</h3>
    <div style="padding: 15px; background-color: #fff8f0; border-left: 4px solid #d4a574;">
      <p><strong>ЄДРПОУ:</strong> 3337215509</p>
      <p><strong>ФОП:</strong> Чигрін Вікторія Євгенівна</p>
      <p><strong>IBAN:</strong> UA623052990000026004010405791</p>
      <p><strong>Призначення платежу:</strong> оплата за товар, {{customer_last_name}} {{customer_first_name}}</p>
    </div>
    
    <p style="margin-top: 20px; color: #666;">Після зарахування коштів ми відправимо замовлення протягом 1-3 робочих днів.</p>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}. Якщо ви не замовляли це, ігноруйте цей лист.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'order_number',
			'customer_first_name',
			'customer_last_name',
			'customer_email',
			'order_items',
			'product_name',
			'quantity',
			'product_price',
			'item_total',
			'order_total',
			'shipping_method'
		])
	},
	// ============ COURIER DELIVERY CONFIRMATION ============
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
    
    <h2>Ваше замовлення №{{order_number}} успішно оформлене</h2>
    
    <h3>Склад замовлення:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th style="text-align: left; padding: 8px;">Товар</th>
          <th style="text-align: center; padding: 8px;">Кількість</th>
          <th style="text-align: right; padding: 8px;">Ціна</th>
          <th style="text-align: right; padding: 8px;">Сума</th>
        </tr>
      </thead>
      <tbody>
        {{#each order_items}}
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">{{product_name}}</td>
          <td style="text-align: center; padding: 8px;">{{quantity}}</td>
          <td style="text-align: right; padding: 8px;">{{product_price}}</td>
          <td style="text-align: right; padding: 8px;">{{item_total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Сума ітого:</strong> {{order_total}} грн.</p>
      <p><strong>Спосіб оплати:</strong> Готівкою кур'єру</p>
      <p><strong>Спосіб доставки:</strong> {{shipping_method}}</p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50;">
      <h3 style="margin-top: 0; color: #2e7d32;">⏰ Важливо!</h3>
      <p>Менеджер з Вами зв'яжеться протягом робочого дня (пн-пт з 08:00 до 17:00) для погодження дати й часу доставки кур'єром по м. Кривий Ріг.</p>
    </div>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}. Якщо ви не замовляли це, ігноруйте цей лист.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'order_number',
			'customer_first_name',
			'customer_email',
			'order_items',
			'product_name',
			'quantity',
			'product_price',
			'item_total',
			'order_total',
			'shipping_method'
		])
	},
	// ============ SMS ORDER CONFIRMATION ============
	{
		code: 'S1',
		channel: 'sms' as const,
		eventType: 'order_confirmed' as const,
		name: 'SMS Order Confirmation',
		description: 'SMS sent when order is created',
		content:
			'Ваше замовлення №{{order_number}} прийнято. Дякуємо 🌿 Деталі — у E-mail.',
		variables: JSON.stringify(['order_number'])
	},
	// ============ PAYMENT REMINDER EMAIL ============
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
    
    <h3 style="color: #d4a574;">Реквізити для оплати:</h3>
    <div style="padding: 15px; background-color: #fff8f0; border-left: 4px solid #d4a574;">
      <p><strong>ЄДРПОУ:</strong> 3337215509</p>
      <p><strong>ФОП:</strong> Чигрін Вікторія Євгенівна</p>
      <p><strong>IBAN:</strong> UA623052990000026004010405791</p>
      <p><strong>Призначення платежу:</strong> оплата за товар, {{customer_last_name}} {{customer_first_name}}</p>
    </div>
    
    <p style="margin-top: 20px; color: #666;">Після зарахування коштів ми відправимо замовлення протягом 1-3 робочих днів.</p>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}. Якщо ви не замовляли це, ігноруйте цей лист.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'order_number',
			'customer_first_name',
			'customer_last_name',
			'customer_email'
		])
	},
	// ============ SMS PAYMENT REMINDER ============
	{
		code: 'S2',
		channel: 'sms' as const,
		eventType: 'payment_pending_reminder' as const,
		name: 'SMS Payment Reminder',
		description: 'SMS sent 24 hours after order if payment not received',
		content:
			'Доброго дня, {{customer_first_name}}! Нагадуємо про оплату замовлення №{{order_number}}. Реквізити: UA623052990000026004010405791',
		variables: JSON.stringify(['customer_first_name', 'order_number'])
	},
	// ============ ORDER SHIPPED EMAIL ============
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
      <p style="margin: 0; color: #666;">Номер відслідкування:</p>
      <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; font-family: monospace;">{{tracking_number}}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Перевізник: {{shipping_provider}}</p>
    </div>
    
    <h3 style="margin-top: 20px;">Ваше замовлення:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tbody>
        {{#each order_items}}
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">{{product_name}}</td>
          <td style="text-align: center; padding: 8px;">{{quantity}}</td>
          <td style="text-align: right; padding: 8px;">{{item_total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Сума ітого:</strong> {{order_total}} грн.</p>
      <p><strong>Спосіб оплати:</strong> {{payment_method}}</p>
      <p><strong>Спосіб доставки:</strong> {{shipping_method}}</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
      <a href="https://instagram.com/the_spiceroom" style="color: #e4405f; text-decoration: none; font-weight: bold;">Перейти в Instagram</a>
    </div>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}. Якщо ви не замовляли це, ігноруйте цей лист.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'order_number',
			'customer_first_name',
			'customer_email',
			'tracking_number',
			'shipping_provider',
			'order_items',
			'product_name',
			'quantity',
			'item_total',
			'order_total',
			'payment_method',
			'shipping_method'
		])
	},
	// ============ SMS ORDER SHIPPED ============
	{
		code: 'S3',
		channel: 'sms' as const,
		eventType: 'order_shipped' as const,
		name: 'SMS Order Shipped',
		description: 'SMS sent when order is shipped with tracking',
		content: '🌿 Замовлення №{{order_number}} у дорозі 🚚 ТТН: {{tracking_number}}',
		variables: JSON.stringify(['order_number', 'tracking_number'])
	},
	// ============ POST-DELIVERY REVIEW REQUEST EMAIL ============
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
      
      <a href="{{review_link}}" style="display: inline-block; margin-top: 15px; padding: 12px 30px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Залишити відгук</a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px;">Дякуємо, що обираєте корисне та смачне! 🌿</p>
    
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      Це повідомлення було надіслано на {{customer_email}}.
    </p>
  </div>
</body>
</html>
		`,
		variables: JSON.stringify([
			'customer_first_name',
			'customer_email',
			'review_link',
			'order_number'
		])
	},
	// ============ SMS POST-DELIVERY REVIEW REQUEST ============
	{
		code: 'S4',
		channel: 'sms' as const,
		eventType: 'post_delivery_review' as const,
		name: 'SMS Post-Delivery Review',
		description: 'SMS sent asking for review after delivery',
		content: '🌸 Налишіть, будь ласка, відгук про Ваше замовлення.',
		variables: JSON.stringify([])
	}
];

async function seedTemplates() {
	try {
		console.log('🌿 Starting notification template seed...\n');

		const adminUserId = await getAdminUser();

		// Check if templates already exist
		const existingCount = await db
			.select({ count: (col) => col(tables.notificationTemplate).id })
			.from(tables.notificationTemplate);

		if (existingCount[0]?.count > 0) {
			console.log(
				`⚠️  Found ${existingCount[0].count} existing templates. Skipping seed.\n`
			);
			return;
		}

		// Insert templates
		for (const template of templates) {
			const id = crypto.randomUUID();
			await db.insert(tables.notificationTemplate).values({
				id,
				code: template.code,
				channel: template.channel,
				eventType: template.eventType,
				name: template.name,
				description: template.description || '',
				subject: template.subject || null,
				content: template.content,
				variables: template.variables,
				language: 'uk',
				isActive: true,
				createdBy: adminUserId,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			console.log(`✅ Created template: ${template.code} - ${template.name}`);
		}

		console.log(`\n✨ Successfully seeded ${templates.length} notification templates!`);
	} catch (error) {
		console.error('❌ Error seeding templates:', error);
		process.exit(1);
	}
}

seedTemplates();
