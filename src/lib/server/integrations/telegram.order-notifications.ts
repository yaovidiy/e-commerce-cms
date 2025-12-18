import { TelegramClient } from './telegram.client';
import * as tables from '$lib/server/db/schema';
import * as m from '$lib/paraglide/messages';

export interface OrderNotificationPayload {
  order: typeof tables.order.$inferSelect;
  items: (typeof tables.orderItem.$inferSelect)[];
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
    const origin = process.env.ORIGIN || 'http://localhost:5173';
    const orderPageUrl = `${origin}/admin/orders/${order.id}`;

    const itemsList = items
      .map((item) => {
        const itemTotal = (item.quantity * item.price) / 100;
        return `• <b>${item.productName}</b> x${item.quantity} - <i>₴${itemTotal.toFixed(2)}</i>`;
      })
      .join('\n');

    const orderTotal = (order.total || 0) / 100;
    const shippingCost = (order.shippingCost || 0) / 100;
    const discount = (order.discount || 0) / 100;

    let message = `<b>${m.telegram_order_new()}</b>\n`;
    message += `<b>${m.telegram_order_id()}:</b> <a href="${orderPageUrl}"><code>${order.id}</code></a>\n`;
    message += `<b>${m.telegram_order_status()}:</b> ${this.getStatusEmoji(order.status)} ${order.status}\n\n`;

    if (customerName) {
      message += `<b>${m.telegram_customer()}:</b> ${customerName}\n`;
    }
    if (customerEmail) {
      message += `<b>${m.telegram_customer_email()}:</b> <code>${customerEmail}</code>\n`;
    }
    if (customerPhone) {
      message += `<b>${m.telegram_customer_phone()}:</b> <code>${customerPhone}</code>\n`;
    }

    if (customerEmail || customerPhone || customerName) {
      message += '\n';
    }

    message += `<b>${m.telegram_items()}:</b>\n${itemsList}\n\n`;

    message += `<b>${m.telegram_totals()}:</b>\n`;
    if (shippingCost > 0) {
      message += `${m.telegram_shipping()}: ₴${shippingCost.toFixed(2)}\n`;
    }
    if (discount > 0) {
      message += `${m.telegram_discount()}: -₴${discount.toFixed(2)}\n`;
    }
    message += `<b>${m.telegram_total()}: ₴${orderTotal.toFixed(2)}</b>\n`;

    if (order.notes) {
      message += `\n<b>${m.telegram_notes()}:</b>\n<i>${this.escapeHtml(order.notes)}</i>`;
    }

    message += `\n<b>${m.telegram_date()}:</b> ${new Date(order.createdAt).toLocaleString()}\n`;
    message += `\n<a href="${orderPageUrl}">${m.telegram_view_order()}</a>`;

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
    order: typeof tables.order.$inferSelect,
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
    order: typeof tables.order.$inferSelect,
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
    order: typeof tables.order.$inferSelect,
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
    order: typeof tables.order.$inferSelect,
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
