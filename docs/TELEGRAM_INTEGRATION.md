# Telegram Integration Guide

This document explains how to set up and use the Telegram Bot API integration for sending order notifications and alerts to a Telegram channel.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Core Components](#core-components)
4. [Usage Examples](#usage-examples)
5. [API Methods](#api-methods)
6. [Notification Types](#notification-types)
7. [Environment Configuration](#environment-configuration)
8. [Error Handling](#error-handling)

---

## Overview

The Telegram integration consists of three main components:

1. **TelegramClient** - Low-level API client for communicating with Telegram Bot API
2. **TelegramOrderNotificationService** - High-level service for formatting and sending order notifications
3. **Remote Functions** - SvelteKit remote functions for client-server communication

### What You Can Do

- ✅ Send text messages to a Telegram channel
- ✅ Send photos and documents
- ✅ Send formatted order notifications
- ✅ Send status updates and alerts
- ✅ Pin/unpin messages
- ✅ Edit previously sent messages
- ✅ Forward messages
- ✅ Send location data
- ✅ Send media groups
- ✅ Manage chat members

---

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send the command `/newbot`
3. Follow the prompts to create your bot
4. Copy the **API Token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### 2. Create a Telegram Channel

1. Create a new channel in Telegram
2. Add your bot as an admin to the channel
3. Send a test message to the channel (so bot can see the channel ID)
4. Get your channel ID using one of these methods:
   - Send `/start` to your bot privately, then use `@username` of your channel (without @): `your_channel_name`
   - Or use the channel numeric ID (e.g., `-1001234567890`)

### 3. Set Environment Variables

Add these to your `.env.local` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHANNEL_ID=-1001234567890
# OR use channel username:
# TELEGRAM_CHANNEL_ID=your_channel_name
```

### 4. Verify Connection

Test your setup using the remote function:

```typescript
import { testTelegramConnection } from '$lib/remotes/telegram.remote';

const result = await testTelegramConnection({});
if (result.success) {
  console.log('✅ Telegram bot is connected!');
  console.log('Bot ID:', result.botId);
  console.log('Bot Name:', result.botName);
}
```

---

## Core Components

### TelegramClient

Low-level API client providing type-safe methods to interact with Telegram Bot API.

```typescript
import { createTelegramClient } from '$lib/server/integrations';

const client = createTelegramClient();

// Test connection
const botInfo = await client.getMe();

// Send a message
await client.sendMessage('Hello, Telegram! 👋');

// Send a photo
await client.sendPhoto('https://example.com/image.jpg', {
  caption: 'Beautiful photo! 📸',
});

// Edit a message
const msg = await client.sendMessage('Initial message');
await client.editMessage(msg.message_id, 'Updated message');

// Delete a message
await client.deleteMessage(msg.message_id);
```

### TelegramOrderNotificationService

High-level service for formatting and sending order-related notifications.

```typescript
import {
  createTelegramClient,
  createTelegramOrderNotificationService,
} from '$lib/server/integrations';

const client = createTelegramClient();
const service = createTelegramOrderNotificationService(client);

// Send new order notification
await service.notifyNewOrder({
  order: orderData,
  items: orderItems,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+380001234567',
});

// Send status update
await service.notifyOrderStatusUpdate(orderData, 'pending', 'confirmed');

// Send payment notification
await service.notifyPaymentReceived(orderData, 'Credit Card');

// Send delivery confirmation
await service.notifyDeliveryConfirmation(orderData, 'UA123456789', new Date());
```

---

## Usage Examples

### Example 1: Send Order Notification

```typescript
// In a remote function or server-side code
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
  createTelegramClient,
  createTelegramOrderNotificationService,
} from '$lib/server/integrations';

async function handleNewOrder(orderId: string) {
  // Fetch order and items
  const [order] = await db
    .select()
    .from(tables.order)
    .where(eq(tables.order.id, orderId));

  const items = await db
    .select()
    .from(tables.orderItem)
    .where(eq(tables.orderItem.orderId, orderId));

  // Send notification
  const client = createTelegramClient();
  const service = createTelegramOrderNotificationService(client);

  await service.notifyNewOrder({
    order,
    items,
    customerName: 'Customer Name',
    customerEmail: 'email@example.com',
    customerPhone: '+380001234567',
  });
}
```

### Example 2: Send Custom Alert

```typescript
// Send a warning alert
await sendTelegramAlert({
  title: 'Low Inventory Warning',
  message: 'Product XYZ stock is below threshold',
  severity: 'warning',
});
```

### Example 3: Integration with Order Creation

```typescript
// In your order creation remote function
export const createOrder = form(CreateOrderSchema, async (data) => {
  // ... create order logic ...

  const newOrder = await db.insert(tables.order).values({...}).returning();

  // Send Telegram notification
  try {
    await sendOrderNotificationToTelegram(newOrder.id);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    // Don't fail the order creation if notification fails
  }

  return { success: true, orderId: newOrder.id };
});
```

---

## API Methods

### Message Methods

#### `sendMessage(text, params?)`
Sends a text message to the configured channel.

```typescript
await client.sendMessage('Hello! 👋', {
  parse_mode: 'HTML',
  disable_notification: false,
});
```

**Parameters:**
- `text` (string): Message text, 1-4096 characters
- `parse_mode` ('HTML' | 'Markdown' | 'MarkdownV2'): Formatting style
- `disable_web_page_preview` (boolean): Disable link previews
- `disable_notification` (boolean): Send silently
- `protect_content` (boolean): Prevent forwarding

#### `editMessage(messageId, text, params?)`
Edits a previously sent message.

```typescript
await client.editMessage(123456, 'Updated text');
```

#### `deleteMessage(messageId)`
Deletes a message.

```typescript
await client.deleteMessage(123456);
```

### Media Methods

#### `sendPhoto(photoUrl, params?)`
Sends a photo.

```typescript
await client.sendPhoto('https://example.com/image.jpg', {
  caption: 'Beautiful photo!',
  parse_mode: 'HTML',
});
```

#### `sendDocument(fileUrl, params?)`
Sends a document (PDF, spreadsheet, etc.).

```typescript
await client.sendDocument('https://example.com/invoice.pdf', {
  caption: 'Order Invoice',
});
```

#### `sendMediaGroup(media)`
Sends multiple media items as a group.

```typescript
await client.sendMediaGroup([
  {
    type: 'photo',
    media: 'https://example.com/image1.jpg',
    caption: 'Photo 1',
  },
  {
    type: 'photo',
    media: 'https://example.com/image2.jpg',
    caption: 'Photo 2',
  },
]);
```

### Channel Management

#### `pinMessage(messageId, params?)`
Pins a message in the channel.

```typescript
await client.pinMessage(123456, {
  disable_notification: true,
});
```

#### `unpinMessage(messageId)`
Unpins a message.

```typescript
await client.unpinMessage(123456);
```

#### `getChat()`
Gets information about the channel.

```typescript
const chatInfo = await client.getChat();
```

#### `setChannelDescription(description)`
Sets the channel description.

```typescript
await client.setChannelDescription('Our online store');
```

### Other Methods

#### `sendChatAction(action)`
Shows a typing indicator or upload progress.

```typescript
await client.sendChatAction('typing');
// Actions: 'typing', 'upload_photo', 'record_video', 'upload_video', etc.
```

#### `forwardMessage(fromChatId, messageId, params?)`
Forwards a message from another chat.

```typescript
await client.forwardMessage(userChatId, 123456);
```

#### `getMe()`
Gets bot information.

```typescript
const botInfo = await client.getMe();
console.log(botInfo.first_name); // Your bot's name
```

---

## Notification Types

### New Order Notification

Displays order details, items, totals, and customer information.

```typescript
await service.notifyNewOrder({
  order: orderData,
  items: orderItems,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+380001234567',
});
```

**Output:**
```
📦 New Order
Order ID: order-123
Status: ✅ confirmed

👤 Customer: John Doe
📧 Email: john@example.com
📞 Phone: +380001234567

📋 Items:
• Product 1 x2 - ₴50.00
• Product 2 x1 - ₴30.00

💰 Totals:
Shipping: ₴10.00
Discount: -₴5.00
Total: ₴85.00

Date: 12/18/2025, 2:30:45 PM
```

### Status Update Notification

Shows order status changes.

```typescript
await service.notifyOrderStatusUpdate(orderData, 'pending', 'shipped');
```

### Payment Received

Confirms payment with amount and method.

```typescript
await service.notifyPaymentReceived(orderData, 'Credit Card');
```

### Delivery Confirmation

Provides tracking and estimated delivery info.

```typescript
await service.notifyDeliveryConfirmation(
  orderData,
  'UA123456789',
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
);
```

### Low Stock Alert

Alerts when product inventory falls below threshold.

```typescript
await service.notifyLowStock('Premium Spice Bundle', 5, 20);
```

### Sales Summary

Daily summary of sales metrics.

```typescript
await service.sendDailySalesSummary({
  totalOrders: 15,
  totalRevenue: 2500000, // in kopiyky (₴25,000)
  newCustomers: 8,
  topProduct: 'Premium Spice Set',
  date: new Date(),
});
```

### Custom Alert

Send arbitrary alerts with severity levels.

```typescript
await service.sendAlert(
  'System Alert',
  'Database backup completed successfully',
  'info'
);
```

---

## Environment Configuration

### Required Variables

```env
# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# Channel ID (numeric or @username)
TELEGRAM_CHANNEL_ID=-1001234567890
# OR
TELEGRAM_CHANNEL_ID=my_channel_name
```

### Optional Configuration

You can extend the configuration by modifying `TelegramClientConfig`:

```typescript
interface TelegramClientConfig {
  botToken: string;
  channelId: string | number;
  // Add more options as needed:
  // timeout?: number;
  // retryAttempts?: number;
}
```

---

## Error Handling

All Telegram operations return typed responses or `null` on failure. Always check the return value:

```typescript
const message = await client.sendMessage('Hello');

if (!message) {
  console.error('Failed to send message');
  // Handle error
} else {
  console.log('Message sent:', message.message_id);
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Bot token invalid` | Wrong bot token | Verify token from @BotFather |
| `Chat not found` | Invalid channel ID | Check channel ID format |
| `Not enough rights` | Bot isn't admin | Add bot as channel admin |
| `Message too long` | Text > 4096 chars | Split message or use document |
| `File too large` | File > 50MB | Compress file or use URL |

### Logging

The client logs errors to console automatically:

```typescript
// Enable more detailed logging
process.env.DEBUG = 'telegram:*';
```

---

## Best Practices

1. **Always verify bot connection on startup:**
   ```typescript
   const botInfo = await client.getMe();
   if (!botInfo) throw new Error('Telegram bot connection failed');
   ```

2. **Don't fail order operations if notifications fail:**
   ```typescript
   try {
     await notifyOrderCreated(orderId);
   } catch (error) {
     console.error('Notification failed:', error);
     // Continue with order processing
   }
   ```

3. **Batch notifications for better performance:**
   ```typescript
   const promises = orders.map(order =>
     service.notifyNewOrder(order)
   );
   await Promise.all(promises);
   ```

4. **Use HTML formatting for consistency:**
   ```typescript
   // Good ✅
   await client.sendMessage(
     '<b>Bold</b> and <i>italic</i>',
     { parse_mode: 'HTML' }
   );

   // Also works but less readable
   await client.sendMessage(
     '*Bold* and _italic_',
     { parse_mode: 'Markdown' }
   );
   ```

5. **Escape user input in messages:**
   ```typescript
   // Service methods do this automatically
   const notes = '<script>alert("xss")</script>';
   await service.sendAlert('Note', notes); // Safely escaped
   ```

6. **Use notifications for important events:**
   - New orders ✅
   - Payment received ✅
   - Status changes ✅
   - Stock warnings ✅
   - System errors ✅

   Avoid spamming with:
   - Page views
   - Login attempts
   - Every API call

---

## API Reference

For complete Telegram Bot API documentation, visit:
https://core.telegram.org/bots/api

### Useful Resources

- **Bot Management:** https://t.me/botfather
- **Inline Keyboard Markup:** https://core.telegram.org/bots/features#inline-keyboards
- **HTML Formatting:** https://core.telegram.org/bots/api#formatting-options
- **Sticker Sets:** https://core.telegram.org/stickers

---

## Support & Troubleshooting

### Test Connection

Use the remote function to verify setup:

```typescript
import { testTelegramConnection } from '$lib/remotes/telegram.remote';

const result = await testTelegramConnection({});
console.log(result);
```

### Send Test Notification

```typescript
import { sendTestOrderNotification } from '$lib/remotes/telegram.remote';

const result = await sendTestOrderNotification({ orderId: 'test-123' });
console.log(result);
```

### Debug Mode

Enable detailed logging:

```typescript
// In telegram.client.ts, add after each API call:
console.log('API Response:', response);
```

### Common Issues

**Issue:** "Telegram API Error: 404 Not Found"
- **Cause:** Invalid channel ID or bot token
- **Solution:** Double-check environment variables

**Issue:** "Telegram API Error: 403 Forbidden"
- **Cause:** Bot doesn't have permission in channel
- **Solution:** Add bot as admin to channel

**Issue:** Messages not appearing in channel
- **Cause:** Channel ID might be a user's private chat
- **Solution:** Ensure TELEGRAM_CHANNEL_ID points to a channel, not a user ID

---

## Next Steps

1. ✅ Set up bot and get token
2. ✅ Create channel and add bot as admin
3. ✅ Configure environment variables
4. ✅ Test connection with `testTelegramConnection()`
5. ✅ Send test notification with `sendTestOrderNotification()`
6. ✅ Integrate into order creation flow
7. ✅ Add more notification types as needed

---

Last Updated: December 18, 2025
Version: 1.0.0
