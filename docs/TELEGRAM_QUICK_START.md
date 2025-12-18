# Telegram Integration - Quick Start Guide

Get your Telegram bot notifications up and running in 5 minutes! 🚀

## Step 1: Create Bot (2 minutes)

1. Open Telegram and go to [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Answer the questions:
   - Bot name: e.g., "MyStore Bot"
   - Username: e.g., "mystore_notifications_bot"
4. Copy the **API Token** you receive
5. Send `/setuserpic` to upload a profile picture (optional)

## Step 2: Create Channel (1 minute)

1. In Telegram, create a new **Channel** (not group)
2. Name it: e.g., "MyStore Notifications"
3. Click your bot (found via @username)
4. Click "Add to Channel"
5. Make your bot an **Administrator**

Get your channel ID:
- **Option A (Username):** Use the channel's @username without the @ sign
- **Option B (ID):** Send a test message to the channel, then use the numeric ID

## Step 3: Configure Environment (1 minute)

In your `.env.local` file, add:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
```

Replace:
- `YOUR_BOT_TOKEN_HERE` with the token from BotFather
- `YOUR_CHANNEL_ID_HERE` with your channel username (e.g., `my_store_channel`) or numeric ID

## Step 4: Test Connection (1 minute)

In your browser console or a component:

```typescript
import { testTelegramConnection } from '$lib/remotes/telegram.remote';

const result = await testTelegramConnection({});
console.log(result);
```

If successful, you'll see:
```
✅ Telegram bot connection verified successfully
```

## Step 5: Send Test Order Notification

```typescript
import { sendTestOrderNotification } from '$lib/remotes/telegram.remote';

const result = await sendTestOrderNotification({
  orderId: 'your-order-id-here'
});
```

You should see a formatted order message in your Telegram channel! 🎉

## Common Channel ID Formats

| Type | Format | Example |
|------|--------|---------|
| Channel Username | `@username` → just username | `my_store_notifications` |
| Numeric ID | With dash prefix | `-1001234567890` |
| Public Channel | @username | `@mystore` |

## What You Can Now Do

✅ Send order notifications when new orders come in  
✅ Send status updates (pending → confirmed → shipped)  
✅ Send payment confirmations  
✅ Send low stock alerts  
✅ Send daily sales summaries  
✅ Send custom alerts and errors  

## Integrate into Order Creation

In your `order.remote.ts` file, add this to your `createOrder` form:

```typescript
import { notifyOrderCreatedViaTelegram } from 'path/to/your/notifications';

export const createOrder = form(CreateOrderSchema, async (data) => {
  // ... create order logic ...
  const newOrder = await db.insert(tables.order).values(...).returning();

  // Send Telegram notification (fire-and-forget)
  notifyOrderCreatedViaTelegram(newOrder.id).catch(console.error);

  redirect(303, `/orders/${newOrder.id}`);
});
```

## Troubleshooting

### "Telegram API Error: 404 Not Found"
- Check your bot token is correct
- Check your channel ID is correct
- Make sure bot is added to the channel

### "Bot API Error: 403 Forbidden"
- Add your bot as **Administrator** to the channel
- Give it permission to post messages

### Messages not appearing
- Check the channel ID points to a **channel**, not a user chat
- Verify bot is an admin with message permissions

### Help!
Refer to the full guide: [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md)

## Next Steps

1. ✅ Complete the 5-step setup above
2. 📖 Read [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md) for detailed API reference
3. 💡 See [TELEGRAM_INTEGRATION_EXAMPLES.md](./TELEGRAM_INTEGRATION_EXAMPLES.md) for integration patterns
4. 🎨 Customize notification messages for your brand
5. 🔔 Add notifications to more events (payment, shipment, returns, etc.)

## API Quick Reference

```typescript
import {
  createTelegramClient,
  createTelegramOrderNotificationService
} from '$lib/server/integrations';

const client = createTelegramClient();
const service = createTelegramOrderNotificationService(client);

// Send new order
await service.notifyNewOrder({ order, items, customerName, ... });

// Send status update
await service.notifyOrderStatusUpdate(order, oldStatus, newStatus);

// Send payment notification
await service.notifyPaymentReceived(order, paymentMethod);

// Send delivery confirmation
await service.notifyDeliveryConfirmation(order, trackingNumber, deliveryDate);

// Send low stock alert
await service.notifyLowStock(productName, currentStock, threshold);

// Send custom alert
await service.sendAlert(title, message, severity);

// Send daily summary
await service.sendDailySalesSummary({
  totalOrders,
  totalRevenue,
  newCustomers,
  topProduct,
  date
});
```

## Formatting Tips

Messages support HTML formatting:

```html
<b>Bold text</b>
<i>Italic text</i>
<u>Underlined text</u>
<s>Strikethrough text</s>
<code>Monospace text</code>
<a href="https://example.com">Link text</a>
```

## Security Notes

🔒 Keep your `TELEGRAM_BOT_TOKEN` secret  
🔒 Don't commit `.env.local` to git  
🔒 Use environment variables in production  
🔒 All user input is automatically HTML-escaped  

## Need Help?

- 📚 Full Documentation: [TELEGRAM_INTEGRATION.md](./TELEGRAM_INTEGRATION.md)
- 💻 Code Examples: [TELEGRAM_INTEGRATION_EXAMPLES.md](./TELEGRAM_INTEGRATION_EXAMPLES.md)
- 🤖 Telegram Bot API: https://core.telegram.org/bots/api
- 🐛 Report Issues: Check the documentation or create an issue

---

**That's it! You're all set up.** Start getting real-time notifications for your orders! 🎉
