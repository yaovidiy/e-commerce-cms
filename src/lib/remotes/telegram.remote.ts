import { command } from '$app/server';
import * as v from 'valibot';
import { createTelegramClient } from '$lib/server/integrations/telegram.client';
import { createTelegramOrderNotificationService } from '$lib/server/integrations/telegram.order-notifications';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Sends a Telegram test message to verify bot is working
 */
export const testTelegramConnection = command(v.object({}), async () => {
  try {
    const client = createTelegramClient();
    const user = await client.getMe();

    if (!user) {
      throw new Error('Failed to get bot info');
    }

    const testMessage = await client.sendMessage(
      `<b>🤖 Bot Connection Test Successful</b>\n\n` +
      `<b>Bot Name:</b> ${user.first_name}\n` +
      `<b>Bot ID:</b> <code>${user.id}</code>\n` +
      `<b>Test Time:</b> ${new Date().toLocaleString()}`
    );

    if (!testMessage) {
      throw new Error('Failed to send test message');
    }

    return {
      success: true,
      message: 'Telegram bot connection verified successfully',
      botId: user.id,
      botName: user.first_name,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
});

/**
 * Sends a test order notification to Telegram
 */
export const sendTestOrderNotification = command(
  v.object({
    orderId: v.pipe(v.string(), v.minLength(1)),
  }),
  async (data) => {
    try {
      const order = await db
        .select()
        .from(tables.order)
        .where(eq(tables.order.id, data.orderId))
        .limit(1);

      if (!order.length) {
        throw new Error('Order not found');
      }

      const orderData = order[0];
      const items = await db
        .select()
        .from(tables.orderItem)
        .where(eq(tables.orderItem.orderId, data.orderId));

      const client = createTelegramClient();
      const service = createTelegramOrderNotificationService(client);

      const success = await service.notifyNewOrder({
        order: orderData,
        items,
        customerEmail: 'test@example.com',
        customerPhone: '+380001234567',
        customerName: 'Test Customer',
      });

      return {
        success,
        message: success
          ? 'Order notification sent successfully'
          : 'Failed to send order notification',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);

/**
 * Sends an order status update notification
 */
export const notifyOrderStatusChange = command(
  v.object({
    orderId: v.pipe(v.string(), v.minLength(1)),
    newStatus: v.pipe(
      v.string(),
      v.picklist(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    ),
  }),
  async (data) => {
    try {
      const order = await db
        .select()
        .from(tables.order)
        .where(eq(tables.order.id, data.orderId))
        .limit(1);

      if (!order.length) {
        throw new Error('Order not found');
      }

      const orderData = order[0];
      const oldStatus = orderData.status;

      // Update order status
      await db
        .update(tables.order)
        .set({ status: data.newStatus })
        .where(eq(tables.order.id, data.orderId));

      const client = createTelegramClient();
      const service = createTelegramOrderNotificationService(client);

      const success = await service.notifyOrderStatusUpdate(orderData, oldStatus, data.newStatus);

      return {
        success,
        message: success
          ? `Order status updated to ${data.newStatus} and notification sent`
          : 'Status updated but failed to send notification',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);

/**
 * Sends a custom Telegram alert
 */
export const sendTelegramAlert = command(
  v.object({
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    message: v.pipe(v.string(), v.minLength(1), v.maxLength(1000)),
    severity: v.optional(v.picklist(['info', 'warning', 'error']), 'warning'),
  }),
  async (data) => {
    try {
      const client = createTelegramClient();
      const service = createTelegramOrderNotificationService(client);

      const success = await service.sendAlert(data.title, data.message, data.severity as 'info' | 'warning' | 'error');

      return {
        success,
        message: success
          ? 'Alert sent successfully'
          : 'Failed to send alert',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);

/**
 * Sends a low stock alert to Telegram
 */
export const sendLowStockAlert = command(
  v.object({
    productName: v.pipe(v.string(), v.minLength(1)),
    currentStock: v.pipe(v.number(), v.minValue(0)),
    threshold: v.pipe(v.number(), v.minValue(0)),
  }),
  async (data) => {
    try {
      const client = createTelegramClient();
      const service = createTelegramOrderNotificationService(client);

      const success = await service.notifyLowStock(
        data.productName,
        data.currentStock,
        data.threshold
      );

      return {
        success,
        message: success
          ? 'Low stock alert sent'
          : 'Failed to send low stock alert',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);
