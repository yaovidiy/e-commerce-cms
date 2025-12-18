import { TelegramClient } from './telegram.client';
import type { Order, OrderItem } from '$lib/server/db/schema';

export interface OrderNotificationPayload {
  order: typeof Order.$inferSelect;
  items: (typeof OrderItem.$inferSelect)[];
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

/**
 * Telegram Order Notification Service
 * Sends formatted order information to a Telegram channel
 */
export class TelegramOrderNotificationService {
  private client: TelegramClient;

  constructor(telegramClient: TelegramClient) {
    this.client = telegramClient;
  }

  /**
   * Formats an order for Telegram display
   */
  private formatOrderMessage(payload: OrderNotificationPayload): string {
    const { order, items, customerEmail, customerPhone, customerName } = payload;

    const itemsList = items
      .map((item) => {
        const itemTotal = (item.quantity * item.price) / 100;
        return `• <b>${item.productName}</b> x${item.quantity} - <i>₴${itemTotal.toFixed(2)}</i>`;
      })
      .join('\n');

    const orderTotal = (order.total || 0) / 100;
    const shippingCost = (order.shippingCost || 0) / 100;
    const discount = (order.discount || 0) / 100;

    let message = `<b>📦 New Order</b>\n`;
    message += `<b>Order ID:</b> <code>${order.id}</code>\n`;
    message += `<b>Status:</b> ${this.getStatusEmoji(order.status)} ${order.status}\n\n`;

    if (customerName) {
      message += `<b>👤 Customer:</b> ${customerName}\n`;
    }
    if (customerEmail) {
      message += `<b>📧 Email:</b> <code>${customerEmail}</code>\n`;
    }
    if (customerPhone) {
      message += `<b>📞 Phone:</b> <code>${customerPhone}</code>\n`;
    }

    if (customerEmail || customerPhone || customerName) {
      message += '\n';
    }

    message += `<b>📋 Items:</b>\n${itemsList}\n\n`;

    message += `<b>💰 Totals:</b>\n`;
    if (shippingCost > 0) {
      message += `Shipping: ₴${shippingCost.toFixed(2)}\n`;
    }
    if (discount > 0) {
      message += `Discount: -₴${discount.toFixed(2)}\n`;
    }
    message += `<b>Total: ₴${orderTotal.toFixed(2)}</b>\n`;

    if (order.notes) {
      message += `\n<b>📝 Notes:</b>\n<i>${this.escapeHtml(order.notes)}</i>`;
    }

    message += `\n<b>Date:</b> ${new Date(order.createdAt).toLocaleString()}`;

    return message;
  }

  /**
   * Gets an emoji for the order status
   */
  private getStatusEmoji(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '🎁',
      cancelled: '❌',
      refunded: '💸',
    };
    return statusMap[status] || '📦';
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Sends a new order notification
   */
  async notifyNewOrder(payload: OrderNotificationPayload): Promise<boolean> {
    try {
      const message = this.formatOrderMessage(payload);
      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send order notification:', error);
      return false;
    }
  }

  /**
   * Sends an order status update
   */
  async notifyOrderStatusUpdate(
    order: typeof Order.$inferSelect,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      const message = `<b>📦 Order Status Update</b>\n\n` +
        `<b>Order ID:</b> <code>${order.id}</code>\n` +
        `<b>Status:</b> ${this.getStatusEmoji(oldStatus)} ${oldStatus} → ${this.getStatusEmoji(newStatus)} ${newStatus}\n\n` +
        `<b>Updated:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send status update notification:', error);
      return false;
    }
  }

  /**
   * Sends an order cancellation notification
   */
  async notifyOrderCancellation(
    order: typeof Order.$inferSelect,
    reason?: string
  ): Promise<boolean> {
    try {
      let message = `<b>❌ Order Cancelled</b>\n\n` +
        `<b>Order ID:</b> <code>${order.id}</code>\n`;

      if (reason) {
        message += `<b>Reason:</b> ${this.escapeHtml(reason)}\n`;
      }

      message += `<b>Cancelled:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
      return false;
    }
  }

  /**
   * Sends an order payment received notification
   */
  async notifyPaymentReceived(
    order: typeof Order.$inferSelect,
    paymentMethod?: string
  ): Promise<boolean> {
    try {
      const total = (order.total || 0) / 100;
      let message = `<b>💳 Payment Received</b>\n\n` +
        `<b>Order ID:</b> <code>${order.id}</code>\n` +
        `<b>Amount:</b> ₴${total.toFixed(2)}\n`;

      if (paymentMethod) {
        message += `<b>Method:</b> ${paymentMethod}\n`;
      }

      message += `<b>Time:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send payment notification:', error);
      return false;
    }
  }

  /**
   * Sends a low stock alert
   */
  async notifyLowStock(
    productName: string,
    currentStock: number,
    threshold: number
  ): Promise<boolean> {
    try {
      const message = `<b>⚠️ Low Stock Alert</b>\n\n` +
        `<b>Product:</b> ${this.escapeHtml(productName)}\n` +
        `<b>Current Stock:</b> ${currentStock}\n` +
        `<b>Threshold:</b> ${threshold}\n` +
        `<b>Alert Time:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      return false;
    }
  }

  /**
   * Sends a daily sales summary
   */
  async sendDailySalesSummary(data: {
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
    topProduct?: string;
    date: Date;
  }): Promise<boolean> {
    try {
      const revenue = (data.totalRevenue / 100).toFixed(2);
      let message = `<b>📊 Daily Sales Summary</b>\n\n` +
        `<b>Date:</b> ${data.date.toLocaleDateString()}\n` +
        `<b>Total Orders:</b> ${data.totalOrders}\n` +
        `<b>Revenue:</b> ₴${revenue}\n` +
        `<b>New Customers:</b> ${data.newCustomers}\n`;

      if (data.topProduct) {
        message += `<b>Top Product:</b> ${this.escapeHtml(data.topProduct)}\n`;
      }

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send sales summary:', error);
      return false;
    }
  }

  /**
   * Sends a delivery confirmation notification
   */
  async notifyDeliveryConfirmation(
    order: typeof Order.$inferSelect,
    trackingNumber?: string,
    estimatedDeliveryDate?: Date
  ): Promise<boolean> {
    try {
      let message = `<b>🚚 Delivery Confirmation</b>\n\n` +
        `<b>Order ID:</b> <code>${order.id}</code>\n`;

      if (trackingNumber) {
        message += `<b>Tracking Number:</b> <code>${trackingNumber}</code>\n`;
      }

      if (estimatedDeliveryDate) {
        message += `<b>Estimated Delivery:</b> ${estimatedDeliveryDate.toLocaleDateString()}\n`;
      }

      message += `<b>Status:</b> Your order is on its way!\n` +
        `<b>Updated:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(message);
      return !!result;
    } catch (error) {
      console.error('Failed to send delivery confirmation:', error);
      return false;
    }
  }

  /**
   * Sends an error/alert message
   */
  async sendAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'warning'): Promise<boolean> {
    try {
      const severityMap = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🔴',
      };

      const fullMessage = `<b>${severityMap[severity]} ${this.escapeHtml(title)}</b>\n\n` +
        `${this.escapeHtml(message)}\n\n` +
        `<b>Time:</b> ${new Date().toLocaleString()}`;

      const result = await this.client.sendMessage(fullMessage);
      return !!result;
    } catch (error) {
      console.error('Failed to send alert:', error);
      return false;
    }
  }
}

/**
 * Factory function to create the notification service
 */
export function createTelegramOrderNotificationService(client: TelegramClient): TelegramOrderNotificationService {
  return new TelegramOrderNotificationService(client);
}
