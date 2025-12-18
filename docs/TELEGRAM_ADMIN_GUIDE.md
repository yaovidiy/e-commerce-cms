# Telegram Admin Section - Usage Guide

## Overview

The Telegram admin section provides a complete management interface for your Telegram bot integration. Access it at `/admin/telegram` in your admin panel.

## Features

### 1. Overview Tab

Displays:
- **Integration Status** - Real-time connection status to Telegram
- **Quick Stats** - Shows enabled features and API version
- **Available Features** - Complete list of enabled notification types
- **Documentation Links** - Quick access to setup and integration guides

### 2. Settings Tab

Configure your Telegram bot:
- **Bot Token** - Telegram bot API token from @BotFather (stored securely)
- **Channel ID** - Target channel for notifications (username or numeric ID)
- **Enable/Disable** - Toggle notifications on/off globally

### 3. Test Tab

Test all notification types:
- **Connection Test** - Verify bot token and channel configuration
- **Order Notification** - Send sample order notification
- **Custom Alert** - Send custom alerts with severity levels
- **Stock Alert** - Test low inventory warnings

## Using the Admin Panel

### Initial Setup

1. **Get Your Bot Token**
   - Go to [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot`
   - Follow instructions to create bot
   - Copy the API token

2. **Create Telegram Channel**
   - Create a new channel in Telegram
   - Add your bot as administrator
   - Ensure bot has message posting permissions

3. **Configure Environment**
   - Go to Settings tab in admin panel
   - Enter bot token and channel ID
   - Or set environment variables:
     ```
     TELEGRAM_BOT_TOKEN=your_token
     TELEGRAM_CHANNEL_ID=your_channel
     ```

4. **Test Connection**
   - Go to Test tab
   - Click "Test Bot Connection"
   - Verify success message appears

### Testing Notifications

#### Connection Test
- **Purpose**: Verify bot can communicate with Telegram API
- **What it does**: Sends a test message with bot info
- **Expected result**: Message appears in channel with bot name and ID

#### Order Notification
- **Purpose**: Test order notification format
- **What it does**: Sends sample order with items and totals
- **Expected result**: Formatted message appears with:
  - Order ID
  - Customer info
  - Item list with prices
  - Total amount

#### Custom Alert
- **Purpose**: Test system alerts and errors
- **What it does**: Sends custom message with severity level
- **Severity options**:
  - ℹ️ **Info** - General information
  - ⚠️ **Warning** - Important warnings
  - 🔴 **Error** - Critical errors
- **Expected result**: Message with appropriate emoji and formatting

#### Stock Alert
- **Purpose**: Test inventory warnings
- **What it does**: Sends low stock alert
- **Fields**:
  - Product name
  - Current stock count
  - Threshold value
- **Expected result**: Warning message with product details

## Integration with Your App

### Automatic Notifications

Once configured, notifications are automatically sent for:

1. **New Orders** - When customer creates order
2. **Status Updates** - When order status changes
3. **Payment Received** - After successful payment
4. **Delivery Confirmation** - When order ships
5. **Low Stock** - When inventory below threshold
6. **Daily Summary** - Scheduled sales report

### Manual Integration

To send custom notifications from your code:

```typescript
import { sendTelegramAlert } from '$lib/remotes/telegram.remote';

// Send alert
await sendTelegramAlert({
  title: 'Order Issue',
  message: 'High-value order needs review',
  severity: 'warning'
});
```

## Troubleshooting

### Connection Test Fails

**Error: "Bot token invalid"**
- Double-check token from @BotFather
- Ensure no extra spaces
- Verify token is still active

**Error: "Chat not found"**
- Verify channel ID format
- For usernames, don't include @ symbol
- For numeric IDs, must start with -100

**Error: "Not enough rights"**
- Add bot as channel administrator
- Ensure bot has message posting permission

### Messages Not Appearing

1. **Check integration is enabled**
   - Go to Settings tab
   - Verify "Enable Telegram Notifications" is checked

2. **Verify channel access**
   - Send test message from admin panel
   - Check if message appears in channel

3. **Check environment variables**
   - Restart server after changing env vars
   - Verify values are correct

4. **Review server logs**
   - Check for error messages
   - Look for API response details

## Best Practices

1. **Test Before Going Live**
   - Use test channel first
   - Verify all notification types work
   - Test with realistic data

2. **Monitor Notifications**
   - Check channel regularly
   - Set up channel pinned messages for important alerts
   - Archive old notifications periodically

3. **Manage Permissions**
   - Only add trusted admins to notification channel
   - Consider separate channels for different alert types
   - Use mute for non-critical notifications

4. **Handle Errors Gracefully**
   - Notifications are non-blocking (won't fail orders)
   - Check logs if notifications aren't appearing
   - Don't rely solely on Telegram for critical alerts

## API Reference

### Available Methods

All methods are accessible via remote functions in `$lib/remotes/telegram.remote.ts`:

```typescript
// Test connection
testTelegramConnection({})

// Send test order notification
sendTestOrderNotification({ orderId: string })

// Send custom alert
sendTelegramAlert({
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error'
})

// Send low stock alert
sendLowStockAlert({
  productName: string,
  currentStock: number,
  threshold: number
})

// Update order status (automatic)
notifyOrderStatusChange({
  orderId: string,
  newStatus: string
})
```

## Advanced Configuration

### Rate Limiting

Telegram has these rate limits:
- 30 messages/second (default)
- 1000 messages/second (with verification)

Our integration respects these limits automatically.

### Message Formatting

Messages use HTML formatting:
- `<b>Bold text</b>`
- `<i>Italic text</i>`
- `<code>Monospace</code>`
- `<u>Underlined</u>`

All user input is automatically escaped for security.

### Customizing Notifications

To customize notification templates:

1. Edit `src/lib/server/integrations/telegram.order-notifications.ts`
2. Modify message formatting in methods like `formatOrderMessage()`
3. Redeploy server

### Scheduling Daily Summaries

To enable daily sales summaries:

1. Set up cron job or scheduled task
2. Call `sendDailySalesSummary()` at desired time
3. See `TELEGRAM_INTEGRATION_EXAMPLES.md` for setup examples

## Support

- 📚 [Full Integration Guide](./TELEGRAM_INTEGRATION.md)
- 💡 [Code Examples](./TELEGRAM_INTEGRATION_EXAMPLES.md)
- 🚀 [Quick Start](./TELEGRAM_QUICK_START.md)
- 🤖 [Telegram Bot API Docs](https://core.telegram.org/bots/api)

---

**Telegram Admin Section Version:** 1.0.0  
**Last Updated:** December 18, 2025
