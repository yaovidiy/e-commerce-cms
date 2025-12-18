# Telegram Admin Section - Quick Reference

## Access

**URL:** `http://localhost:5173/admin/telegram`  
**Sidebar:** System → Telegram Integration  
**Icon:** Send icon  

## Tabs Overview

### 📊 Overview Tab
- Integration status badge
- Feature count cards
- Available features list
- Documentation links

### ⚙️ Settings Tab
- Bot token input
- Channel ID input
- Enable/disable toggle
- Environment variable guide

### 🧪 Test Tab
- Connection test
- Order notification test
- Custom alert test (3 severity levels)
- Stock alert test

## Quick Actions

### Test Connection
1. Go to **Test** tab
2. Click **Test Bot Connection**
3. Wait for response (green = success)

### Send Order Notification
1. Go to **Test** tab → **Order**
2. Enter order ID
3. Click **Send Order Notification**

### Send Custom Alert
1. Go to **Test** tab → **Alert**
2. Enter title and message
3. Select severity (info/warning/error)
4. Click **Send Custom Alert**

### Send Stock Alert
1. Go to **Test** tab → **Stock**
2. Enter product name
3. Set current stock and threshold
4. Click **Send Stock Alert**

## Environment Variables

```bash
# Required
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHANNEL_ID=-1001234567890
```

## Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| Connected | ✅ | Bot working correctly |
| Disconnected | ❌ | Check credentials |
| Checking | ⏳ | Request in progress |

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Bot token invalid" | Verify token from @BotFather |
| "Chat not found" | Check channel ID format |
| "Not enough rights" | Add bot as channel admin |
| "Messages not sending" | Restart server, check env vars |

## File Locations

```
Components:
src/lib/components/admin/features/telegram-management/

Admin Page:
src/routes/admin/telegram/+page.svelte

Sidebar Config:
src/lib/components/admin/layout/admin-sidebar.svelte

Documentation:
docs/TELEGRAM_ADMIN_GUIDE.md
docs/TELEGRAM_ADMIN_SECTION.md
```

## Component Props

None required - all components are self-contained and use remote functions.

## Remote Functions

```typescript
// All in $lib/remotes/telegram.remote.ts

testTelegramConnection({})
// Returns: { success: boolean, message: string, botId?: number, botName?: string }

sendTestOrderNotification({ orderId: string })
// Returns: { success: boolean, message: string }

sendTelegramAlert({
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error'
})
// Returns: { success: boolean, message: string }

sendLowStockAlert({
  productName: string,
  currentStock: number,
  threshold: number
})
// Returns: { success: boolean, message: string }
```

## Keyboard Shortcuts

- `Tab` - Navigate between fields
- `Enter` - Submit form (when focused on button)
- `Space` - Toggle checkbox/button

## Support Resources

| Resource | Link |
|----------|------|
| Setup Guide | `docs/TELEGRAM_QUICK_START.md` |
| Full Guide | `docs/TELEGRAM_INTEGRATION.md` |
| Examples | `docs/TELEGRAM_INTEGRATION_EXAMPLES.md` |
| Admin Guide | `docs/TELEGRAM_ADMIN_GUIDE.md` |
| Telegram Bot API | https://core.telegram.org/bots/api |

## Development Notes

### Adding New Test Type

1. Add new tab in `telegram-test-panel.svelte`
2. Import remote function
3. Create handler function
4. Add UI for inputs
5. Display results with status

### Customizing Messages

Edit `src/lib/server/integrations/telegram.order-notifications.ts`:
- `formatOrderMessage()` - Order layout
- `getStatusEmoji()` - Status icons
- `notifyNewOrder()` - New order format

### Error Logging

Check server logs for:
```
Telegram API Error: [method] [status] [description]
```

---

**Last Updated:** December 18, 2025  
**Version:** 1.0.0
