# Test Notification Feature - Workflow Summary

## User Flow

```
Admin Panel - Notifications Tab
         ↓
    Template List
         ↓
    [Test Button] ← NEW
         ↓
    TestNotificationDialog Opens
         ├─ Step 1: Order Selection
         │   ├─ Browse Existing Orders
         │   │  └─ Search by: order number, email, name
         │   └─ Generate Random Order
         │      └─ Auto-created with test data
         │
         ├─ Step 2: Items Selection (if real order)
         │   ├─ OrderItemsBrowser
         │   ├─ Search items
         │   ├─ Multi-select with checkboxes
         │   └─ Select All / Deselect All
         │
         └─ Step 3: Send
             └─ sendTestNotification()
                └─ Notification created and logged
                   ↓
                Toast Success/Error
```

## Data Flow

### Random Order Flow
```
Test Button Clicked
    ↓
TestNotificationDialog (Order Selection)
    ↓
Select "Generate Random"
    ↓
handleGenerateRandom() calls sendTestNotification({
  templateId: string,
  generateRandomOrder: true
})
    ↓
Server: Creates fake order with:
  - Random 1-3 products from database
  - Test customer data
  - Random quantities
    ↓
buildOrderNotificationContext() builds variables
    ↓
sendNotification() creates log and sends
    ↓
Toast: "Test notification sent successfully to test@example.com"
```

### Real Order Flow
```
Test Button Clicked
    ↓
TestNotificationDialog (Order Selection)
    ↓
[Select Order] Opens OrdersBrowser
    ↓
Search and select existing order
    ↓
Move to Items Selection
    ↓
[Select Items] Opens OrderItemsBrowser
    ↓
Search and multi-select items
    ↓
Click "Send Test"
    ↓
sendTestNotification({
  templateId: string,
  orderId: string,
  orderItemIds: string[]
})
    ↓
buildOrderNotificationContext() builds variables
    ↓
sendNotification() creates log and sends
    ↓
Toast: "Test notification sent successfully to {customerEmail}"
```

## Key Features

| Feature | Details |
|---------|---------|
| **Two Test Modes** | Real orders or generated random orders |
| **Multi-Item Selection** | Choose specific items or use all items |
| **Search** | Find orders by number/email, items by name |
| **Variable Rendering** | All template placeholders filled with test data |
| **Channel Support** | Works with both Email and SMS templates |
| **Logging** | All test notifications logged in database |
| **Error Handling** | Validates selections, handles missing products |
| **Admin Only** | Requires admin authentication |
| **UI/UX** | Step-by-step dialogs, toast feedback, loading states |

## Files Modified/Created

### New Components
- `orders-browser.svelte` - Order selection interface
- `order-items-browser.svelte` - Multi-select items interface  
- `test-notification-dialog.svelte` - Main test workflow orchestrator

### Updated Components
- `template-list.svelte` - Added Test button to each template row

### Updated Remote Functions (`notification.remote.ts`)
- `sendTestNotification()` - Send test with real or random order
- `getOrdersForTesting()` - Fetch existing orders for selection
- `getOrderItemsForTesting()` - Fetch items for selected order

## Testing the Feature

### Step 1: Navigate to Notifications
1. Go to Admin Panel > Notifications
2. You should see a "Test" button on each template

### Step 2: Test with Real Order
1. Click "Test" on any template
2. Select "Browse Orders"
3. Search for an order or scroll through list
4. Click on an order to select
5. Click "Next"
6. Select items (or "Select All")
7. Click "Send Test"
8. Check toast for success message

### Step 3: Test with Random Order
1. Click "Test" on any template
2. Select "Generate Random"
3. Click "Generate Test Order"
4. Notification sends immediately
5. Check toast for confirmation

### Verification
- Check notification logs in database (notification_log table)
- Look for test notifications marked as pending/sent
- Verify recipient email is test@example.com (for random) or real customer email
- Check that all variables were properly rendered in content

## Future Enhancements

- [ ] Preview rendered notification before sending
- [ ] Send test to admin's own email instead of customer
- [ ] Batch test multiple templates at once
- [ ] Test different language versions
- [ ] Custom variable overrides for testing
- [ ] Template validation warnings
