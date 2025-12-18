/**
 * Example: Integrating Telegram Notifications with Order Creation
 * This file demonstrates how to integrate Telegram notifications
 * into your order creation workflow
 */

import { form } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
  createTelegramClient,
  createTelegramOrderNotificationService,
} from '$lib/server/integrations';

// ============================================================
// EXAMPLE 1: Modify existing createOrder remote function
// ============================================================

/**
 * Enhanced order creation with Telegram notification
 *
 * Add this helper function to your order.remote.ts file
 */
async function notifyOrderCreatedViaTelegram(orderId: string) {
  try {
    // Fetch order and items
    const [order] = await db
      .select()
      .from(tables.order)
      .where(eq(tables.order.id, orderId))
      .limit(1);

    if (!order) {
      console.error('Order not found for notification:', orderId);
      return;
    }

    const items = await db
      .select()
      .from(tables.orderItem)
      .where(eq(tables.orderItem.orderId, orderId));

    // Fetch customer info
    const customer = order.userId
      ? await db
          .select()
          .from(tables.user)
          .where(eq(tables.user.id, order.userId))
          .limit(1)
          .then((users) => users[0])
      : null;

    // Send Telegram notification
    const client = createTelegramClient();
    const service = createTelegramOrderNotificationService(client);

    const success = await service.notifyNewOrder({
      order,
      items,
      customerName: customer?.name || 'Customer',
      customerEmail: customer?.email,
      customerPhone: order.phone,
    });

    if (success) {
      console.log(`✅ Telegram notification sent for order ${orderId}`);
    } else {
      console.warn(`⚠️ Failed to send Telegram notification for order ${orderId}`);
    }
  } catch (error) {
    // Don't fail the order creation if notification fails
    console.error('Error sending Telegram notification:', error);
  }
}

// ============================================================
// EXAMPLE 2: Hook into order status updates
// ============================================================

/**
 * Send status update notification
 *
 * Call this when order status changes
 */
async function notifyOrderStatusChangeViaTelegram(
  orderId: string,
  newStatus: string,
  oldStatus?: string
) {
  try {
    const [order] = await db
      .select()
      .from(tables.order)
      .where(eq(tables.order.id, orderId))
      .limit(1);

    if (!order) return;

    const client = createTelegramClient();
    const service = createTelegramOrderNotificationService(client);

    await service.notifyOrderStatusUpdate(
      order,
      oldStatus || order.status,
      newStatus
    );

    console.log(`✅ Status change notification sent: ${oldStatus} → ${newStatus}`);
  } catch (error) {
    console.error('Error sending status update notification:', error);
  }
}

// ============================================================
// EXAMPLE 3: Notify payment received
// ============================================================

/**
 * Send payment notification
 *
 * Call this after successful payment processing
 */
async function notifyPaymentReceivedViaTelegram(
  orderId: string,
  paymentMethod: string
) {
  try {
    const [order] = await db
      .select()
      .from(tables.order)
      .where(eq(tables.order.id, orderId))
      .limit(1);

    if (!order) return;

    const client = createTelegramClient();
    const service = createTelegramOrderNotificationService(client);

    await service.notifyPaymentReceived(order, paymentMethod);

    console.log(`✅ Payment notification sent for order ${orderId}`);
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
}

// ============================================================
// EXAMPLE 4: Integration with order creation form
// ============================================================

/**
 * This is how to modify your existing createOrder form function
 *
 * BEFORE:
 * ```
 * export const createOrder = form(CreateOrderSchema, async (data) => {
 *   const newOrder = await db.insert(tables.order).values(...).returning();
 *   redirect(303, `/orders/${newOrder.id}`);
 * });
 * ```
 *
 * AFTER:
 * ```
 * export const createOrder = form(CreateOrderSchema, async (data) => {
 *   const newOrder = await db.insert(tables.order).values(...).returning();
 *
 *   // Send Telegram notification (don't await, fire-and-forget)
 *   notifyOrderCreatedViaTelegram(newOrder.id).catch(console.error);
 *
 *   redirect(303, `/orders/${newOrder.id}`);
 * });
 * ```
 */

// ============================================================
// EXAMPLE 5: Stock alert on inventory change
// ============================================================

/**
 * Send low stock alert
 *
 * Call this when product stock falls below threshold
 */
async function checkAndNotifyLowStock(productId: string, newStock: number) {
  try {
    const [product] = await db
      .select()
      .from(tables.product)
      .where(eq(tables.product.id, productId))
      .limit(1);

    if (!product) return;

    const stockThreshold = 10; // Configure as needed

    if (newStock <= stockThreshold) {
      const client = createTelegramClient();
      const service = createTelegramOrderNotificationService(client);

      await service.notifyLowStock(product.name, newStock, stockThreshold);

      console.log(`⚠️ Low stock alert sent for product: ${product.name}`);
    }
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
}

// ============================================================
// EXAMPLE 6: Daily sales summary
// ============================================================

/**
 * Send daily sales summary
 *
 * Schedule this to run daily at a specific time
 * (e.g., using a cron job or scheduled task)
 */
async function sendDailySalesSummary() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get orders from today
    const todaysOrders = await db
      .select()
      .from(tables.order)
      .where(
        // Add your date range query here
        // This is pseudocode - adjust to match your DB schema
        sql`DATE(created_at) = ${today}`
      );

    // Calculate metrics
    const totalOrders = todaysOrders.length;
    const totalRevenue = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const newCustomers = await db
      .select()
      .from(tables.user)
      // Filter users created today
      .then((users) => users.filter((u) => {
        const created = new Date(u.createdAt);
        return created >= today && created < tomorrow;
      }).length);

    // Find top product
    const items = await db.select().from(tables.orderItem);
    const topProduct = items.reduce(
      (acc: any, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = { quantity: 0, name: item.productName };
        }
        acc[item.productId].quantity += item.quantity;
        return acc;
      },
      {}
    );

    const topProductName = Object.values(topProduct).reduce(
      (max: any, item: any) => (item.quantity > (max?.quantity || 0) ? item : max),
      null
    )?.name;

    // Send notification
    const client = createTelegramClient();
    const service = createTelegramOrderNotificationService(client);

    await service.sendDailySalesSummary({
      totalOrders,
      totalRevenue,
      newCustomers,
      topProduct: topProductName,
      date: today,
    });

    console.log(`✅ Daily sales summary sent`);
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}

// ============================================================
// EXAMPLE 7: Error alerts for critical issues
// ============================================================

/**
 * Send system alert for critical errors
 *
 * Call this when something goes wrong
 */
async function notifyCriticalError(errorMessage: string, context?: string) {
  try {
    const client = createTelegramClient();
    const service = createTelegramOrderNotificationService(client);

    const message = context
      ? `${context}\n\nError: ${errorMessage}`
      : errorMessage;

    await service.sendAlert(
      'Critical System Error',
      message,
      'error'
    );

    console.log(`🔴 Critical error alert sent`);
  } catch (error) {
    console.error('Error sending alert:', error);
  }
}

// ============================================================
// EXAMPLE 8: Scheduled cron task for daily summary
// ============================================================

/**
 * This is how to set up a scheduled task.
 * Add this to your server startup or use a cron library.
 *
 * Option 1: Using node-schedule
 * ```
 * import schedule from 'node-schedule';
 *
 * // Run at 6 AM every day
 * schedule.scheduleJob('0 6 * * *', sendDailySalesSummary);
 * ```
 *
 * Option 2: Using node-cron
 * ```
 * import cron from 'node-cron';
 *
 * // Run at 6 AM every day
 * cron.schedule('0 6 * * *', sendDailySalesSummary);
 * ```
 *
 * Option 3: Using setTimeout (simple, not recommended for production)
 * ```
 * function scheduleDaily() {
 *   const now = new Date();
 *   const tomorrow = new Date(now);
 *   tomorrow.setDate(tomorrow.getDate() + 1);
 *   tomorrow.setHours(6, 0, 0, 0);
 *
 *   const timeout = tomorrow.getTime() - now.getTime();
 *   setTimeout(() => {
 *     sendDailySalesSummary();
 *     setInterval(sendDailySalesSummary, 24 * 60 * 60 * 1000);
 *   }, timeout);
 * }
 * ```
 */

// ============================================================
// EXAMPLE 9: Testing setup
// ============================================================

/**
 * Test function to verify Telegram is working
 */
export async function testTelegramSetup() {
  try {
    // Test 1: Connection
    console.log('🧪 Testing Telegram connection...');
    const client = createTelegramClient();
    const botInfo = await client.getMe();

    if (!botInfo) {
      throw new Error('Failed to get bot info');
    }
    console.log(`✅ Bot connected: ${botInfo.first_name} (@${botInfo.username})`);

    // Test 2: Send message
    console.log('🧪 Sending test message...');
    const message = await client.sendMessage(
      '<b>✅ Telegram Integration Test</b>\n\n' +
      'All systems are go! Your Telegram notifications are working correctly.'
    );

    if (!message) {
      throw new Error('Failed to send test message');
    }
    console.log(`✅ Test message sent (ID: ${message.message_id})`);

    // Test 3: Send mock order notification
    console.log('🧪 Sending test order notification...');
    const service = createTelegramOrderNotificationService(client);

    const mockOrder = {
      id: 'test-order-123',
      total: 50000, // ₴500
      status: 'pending',
      shippingCost: 2000, // ₴20
      discount: 0,
      notes: 'Test order',
      createdAt: new Date(),
      // Add other required fields with default values
    };

    const mockItems = [
      {
        id: '1',
        orderId: 'test-order-123',
        productId: 'prod-1',
        productName: 'Premium Spice Set',
        quantity: 1,
        price: 30000, // ₴300
      },
      {
        id: '2',
        orderId: 'test-order-123',
        productId: 'prod-2',
        productName: 'Gourmet Blend',
        quantity: 1,
        price: 20000, // ₴200
      },
    ];

    const success = await service.notifyNewOrder({
      order: mockOrder as any,
      items: mockItems as any,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+380001234567',
    });

    if (!success) {
      throw new Error('Failed to send order notification');
    }
    console.log(`✅ Test order notification sent`);

    console.log('\n🎉 All tests passed! Telegram integration is ready to use.');
    return { success: true };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// ============================================================
// Export for use in other files
// ============================================================

export {
  notifyOrderCreatedViaTelegram,
  notifyOrderStatusChangeViaTelegram,
  notifyPaymentReceivedViaTelegram,
  checkAndNotifyLowStock,
  sendDailySalesSummary,
  notifyCriticalError,
};
