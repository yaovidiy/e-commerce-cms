# Notification System Documentation

## Overview

The notification system provides a comprehensive solution for managing email and SMS notifications when customers place orders. It includes:

- **Template Management UI** - Admin panel to create, edit, and manage notification templates
- **Dynamic Variable Support** - Insert customer, order, payment, and shipping data into messages
- **Multi-Channel Support** - Email and SMS templates
- **Event-Based Triggering** - Templates tied to specific order lifecycle events
- **Notification Logging** - Track all sent notifications
- **Variable Catalog** - Pre-built library of available variables with examples

## Based On Project Requirements

The notification system is built based on the CSV specification that defines the following notification events:

### Order Events

1. **E1** - Order Confirmation (Email)
   - Channel: Email
   - Event: `order_created`
   - Content: Order details, shipping/billing address, payment method

2. **S1** - Order Confirmation SMS
   - Channel: SMS
   - Event: `order_confirmed`
   - Content: Brief confirmation with order number

3. **E1a** - IBAN Payment Instructions (Email)
   - Channel: Email
   - Event: `order_confirmed`
   - Content: Bank transfer details when payment method is bank transfer

4. **E1b** - Courier Delivery Notice (Email)
   - Channel: Email
   - Event: `order_confirmed`
   - Content: Manager will contact customer to confirm delivery time

5. **E2** - Payment Reminder (Email)
   - Channel: Email
   - Event: `payment_pending_reminder`
   - Content: Reminder to complete payment with bank details

6. **S2** - Payment Reminder SMS
   - Channel: SMS
   - Event: `payment_pending_reminder`
   - Content: Reminder notification

7. **E3** - Shipment Notification (Email)
   - Channel: Email
   - Event: `order_shipped`
   - Content: Tracking number (TTN), carrier info, order details

8. **S3** - Shipment Notification SMS
   - Channel: SMS
   - Event: `order_shipped`
   - Content: Brief notification with tracking number

9. **E4** - Post-Delivery Review Request (Email)
   - Channel: Email
   - Event: `post_delivery_review`
   - Content: Thank you message with request for review and offer of incentive

10. **S4** - Post-Delivery Review Request SMS
    - Channel: SMS
    - Event: `post_delivery_review`
    - Content: Request for review

## Database Schema

### Tables

#### `notification_template`
Stores notification templates for different channels and events.

```sql
CREATE TABLE `notification_template` (
    `id` TEXT PRIMARY KEY,
    `code` TEXT UNIQUE NOT NULL,         -- E1, S1, E1a, etc.
    `channel` TEXT NOT NULL,              -- 'email' or 'sms'
    `event_type` TEXT NOT NULL,           -- order_created, order_shipped, etc.
    `subject` TEXT,                       -- For email templates
    `content` TEXT NOT NULL,              -- HTML for email, plain text for SMS
    `name` TEXT NOT NULL,                 -- Display name
    `description` TEXT,                   -- Admin notes
    `is_active` BOOLEAN DEFAULT true,     -- Enable/disable template
    `variables` TEXT DEFAULT '[]',        -- JSON array of variable keys used
    `language` TEXT DEFAULT 'en',         -- Language version
    `created_by` TEXT NOT NULL,           -- User ID who created
    `updated_by` TEXT,                    -- User ID who last updated
    `created_at` INTEGER NOT NULL,        -- Timestamp
    `updated_at` INTEGER NOT NULL         -- Timestamp
);
```

#### `notification_log`
Records all sent notifications for tracking and auditing.

```sql
CREATE TABLE `notification_log` (
    `id` TEXT PRIMARY KEY,
    `template_id` TEXT NOT NULL,          -- Reference to template
    `order_id` TEXT,                      -- Associated order
    `user_id` TEXT,                       -- Associated user
    `channel` TEXT NOT NULL,              -- 'email' or 'sms'
    `recipient` TEXT NOT NULL,            -- Email/phone address
    `subject` TEXT,                       -- Rendered subject
    `content` TEXT NOT NULL,              -- Rendered content
    `status` TEXT DEFAULT 'pending',      -- pending, sent, failed, bounced
    `error` TEXT,                         -- Error message if failed
    `provider_id` TEXT,                   -- ID from email/SMS provider
    `created_at` INTEGER NOT NULL,
    `sent_at` INTEGER,                    -- When actually sent
    `failed_at` INTEGER                   -- When failed
);
```

#### `notification_variable`
Catalog of available dynamic variables that can be used in templates.

```sql
CREATE TABLE `notification_variable` (
    `id` TEXT PRIMARY KEY,
    `key` TEXT UNIQUE NOT NULL,           -- Variable key (order_id, customer_name, etc.)
    `label` TEXT NOT NULL,                -- Display name
    `description` TEXT,                   -- Help text
    `category` TEXT NOT NULL,             -- order, customer, payment, shipping
    `data_type` TEXT NOT NULL,            -- string, number, date, boolean
    `example_value` TEXT,                 -- Example for preview
    `created_at` INTEGER NOT NULL
);
```

## Available Dynamic Variables

### Order Variables
- `order_id` - Unique order identifier
- `order_number` - Customer-facing order number (e.g., #ORD-2024-001)
- `order_total` - Formatted total amount
- `order_subtotal` - Formatted subtotal
- `order_status` - Current status (pending, processing, shipped, etc.)
- `order_items_list` - Formatted list of items with quantities and prices

### Customer Variables
- `customer_name` - Full name (first + last)
- `customer_first_name` - First name only
- `customer_last_name` - Last name only
- `customer_email` - Email address
- `customer_phone` - Phone number

### Payment Variables
- `payment_method` - Payment type (card, bank transfer, cod, etc.)
- `payment_status` - Payment status (pending, completed, failed)
- `iban` - Bank account IBAN for transfers
- `bank_details` - Full bank details text

### Shipping Variables
- `shipping_method` - Shipping provider (Nova Poshta, etc.)
- `tracking_number` - Tracking/TTN number
- `shipping_address` - Formatted delivery address
- `estimated_delivery` - Estimated delivery timeframe
- `carrier_name` - Carrier name

## Remote Functions

### Query Functions

#### `getAllNotificationTemplates(data)`
Get paginated list of notification templates with filtering.

**Parameters:**
```typescript
{
    search?: string;           // Search in name/code
    channel?: 'email' | 'sms' | 'all';
    eventType?: string | 'all';
    isActive?: 'true' | 'false' | 'all';
    language?: string;
    page?: number;
    pageSize?: number;
}
```

**Returns:** Paginated response with templates

#### `getNotificationTemplate(data)`
Get single template by ID.

**Parameters:**
```typescript
{ id: string }
```

#### `getTemplatesByEventType(data)`
Get templates for specific event and channel.

**Parameters:**
```typescript
{
    eventType: string;
    channel: 'email' | 'sms';
    language?: string;
}
```

#### `getAvailableVariables()`
Get catalog of available variables grouped by category.

**Returns:**
```typescript
{
    [category: string]: NotificationVariable[]
}
```

#### `getNotificationLogs(data)`
Get notification delivery logs with filtering.

**Parameters:**
```typescript
{
    orderId?: string;
    templateId?: string;
    channel?: 'email' | 'sms' | 'all';
    status?: 'pending' | 'sent' | 'failed' | 'bounced' | 'all';
    page?: number;
    pageSize?: number;
}
```

### Form Functions

#### `createNotificationTemplate(data)`
Create new notification template.

**Parameters:**
```typescript
{
    code: string;                 // Unique code (E1, S1, etc.)
    channel: 'email' | 'sms';
    eventType: string;
    name: string;
    subject?: string;             // For email only
    content: string;              // Template content
    description?: string;
    isActive?: boolean;
    variables?: string;           // JSON array
    language?: string;
}
```

#### `updateNotificationTemplate(data)`
Update existing template.

**Parameters:** Same as create, with required `id` field

#### `deleteNotificationTemplate(data)`
Delete template by ID.

**Parameters:**
```typescript
{ id: string }
```

### Command Functions

#### `initializeDefaultVariables()`
Initialize the default variable catalog. Run this once on first setup.

**Parameters:** None

## Notification Service

The `src/lib/server/services/notification.ts` file provides helper functions for sending notifications:

### Functions

#### `renderTemplateContent(template, variables): string`
Replaces `{{variable_name}}` placeholders with actual values.

#### `renderNotification(template, context): RenderedNotification`
Renders complete notification with subject (for email) and content.

#### `sendNotification(templateId, context): Promise`
Sends a notification and creates a log entry.

#### `buildOrderNotificationContext(order, orderItems?, additionalVars?): NotificationContext`
Builds complete context object from order data.

**Usage Example:**
```typescript
import { sendNotification, buildOrderNotificationContext } from '$lib/server/services/notification';

// When order is created
const context = buildOrderNotificationContext(order, orderItems);
await sendNotification(templateId, context);
```

## Admin Panel

### Location
`/admin/notifications`

### Features

#### Template List
- View all templates with filtering by:
  - Channel (Email/SMS)
  - Event Type
  - Status (Active/Inactive)
  - Search by name/code
- Pagination
- Quick edit/delete actions

#### Template Editor
- Create or edit templates
- Visual content editor with variable insertion
- Live preview of rendered content
- Variable panel with:
  - Category filtering
  - Double-click to insert
  - Example values
  - Variable usage tracking

#### Variable Initialization
- One-click setup of default variable catalog
- Pre-populated with common variables

## Integration with Order Flow

To integrate notifications into order creation and updates:

### In Order Creation
```typescript
import { sendNotification, buildOrderNotificationContext } from '$lib/server/services/notification';
import { getTemplatesByEventType } from '$lib/remotes/notification.remote';

// After order is created
const templates = await getTemplatesByEventType({
    eventType: 'order_created',
    channel: 'email',
    language: 'en'
});

if (templates.length > 0) {
    const template = templates[0];
    const context = buildOrderNotificationContext(order, orderItems);
    await sendNotification(template.id, context);
}
```

### In Order Status Update
```typescript
// When order is shipped
const templates = await getTemplatesByEventType({
    eventType: 'order_shipped',
    channel: 'email',
    language: 'en'
});

if (templates.length > 0) {
    const context = buildOrderNotificationContext(order, orderItems, {
        tracking_number: order.trackingNumber,
        carrier_name: order.carrier
    });
    await sendNotification(templates[0].id, context);
}
```

## Example Template Content

### Order Confirmation Email
```html
Вітаємо, {{customer_first_name}}!

Дякуємо, що обрали The Spice Room 🌿

Ваше замовлення №{{order_number}} успішно оформлене.

Склад замовлення:
{{order_items_list}}

Сума ітого: {{order_total}} грн.
Спосіб оплати: {{payment_method}}
Спосіб доставки: {{shipping_method}}

Термін відправки 1-3 робочих дні. Як тільки замовлення буде передано на відправку — повідомимо Вам додатково.

З повагою,
The Spice Room Team
```

### Payment Reminder SMS
```
Доброго дня, {{customer_first_name}}!

Нагадуємо, що замовлення №{{order_number}} очікує на оплату.

Реквізити: {{iban}}

Після зарахування коштів ми відправимо замовлення протягом 1-3 робочих днів.
```

### Shipment SMS
```
🌿 Замовлення №{{order_number}} у дорозі 🚚
ТТН: {{tracking_number}}
{{carrier_name}}
```

## Limitations & Future Enhancements

### Current Limitations
1. Notifications are created as "pending" - actual sending requires integration with email/SMS providers
2. Manual sending only - no automatic scheduling (can be triggered from order remotes)
3. Single language support per template (need to create separate templates for Ukrainian, English, etc.)

### Recommended Integrations
1. **Email Provider**: Resend or SendGrid
2. **SMS Provider**: SMS Club (already configured)
3. **Scheduling**: Add cron job to trigger reminder emails after payment deadline

### Future Enhancements
1. Scheduled template sending (e.g., 24 hours after order)
2. A/B testing of template content
3. Delivery analytics and retry logic
4. Template versioning and rollback
5. Bulk template updates
6. Email/SMS provider status monitoring

## Setting Up Notifications for Your Store

### Step 1: Navigate to Admin Panel
Go to `/admin/notifications`

### Step 2: Initialize Variables
Click "Initialize Default Variables" button to set up the variable catalog.

### Step 3: Create Templates
1. Click "New Template"
2. Fill in template details:
   - Code: Use format from CSV (E1, S1, E1a, etc.)
   - Name: Descriptive name
   - Channel: Select Email or SMS
   - Event Type: Choose when to send
3. Write template content using {{variable}} syntax
4. Use the variable panel to insert available variables
5. Preview rendered content
6. Save template

### Step 4: Set Active Status
Templates are active by default. Toggle "Template is active" to enable/disable without deleting.

### Step 5: Test Sending
After integrating with provider, test by creating a test order.

## Development Notes

### File Structure
```
src/
├── lib/
│   ├── components/admin/features/notification-management/
│   │   ├── template-list.svelte       # List component
│   │   ├── template-editor.svelte     # Editor component
│   │   └── index.ts                   # Exports
│   ├── remotes/
│   │   └── notification.remote.ts     # Query/form functions
│   ├── server/
│   │   ├── db/schema.ts               # Database schema
│   │   ├── schemas/index.ts           # Validation schemas
│   │   └── services/notification.ts   # Rendering service
│   └── paraglide/messages.ts          # i18n (auto-generated)
├── messages/
│   ├── en.json                        # English messages
│   └── uk.json                        # Ukrainian messages
└── routes/admin/notifications/
    └── +page.svelte                   # Admin page
```

### Key Technologies
- **Valibot** - Schema validation
- **Drizzle ORM** - Database queries
- **SvelteKit Remote Functions** - Server communication
- **Tailwind CSS** - Styling
- **Paraglide** - i18n

### Adding New Variables
1. Create migration if needed
2. Add to `getAvailableVariables()` return or database
3. Use in templates with `{{variable_key}}` syntax
4. Document in this file

### Creating Custom Templates
Templates support any HTML (for email) or plain text (for SMS). You can:
- Use Tailwind classes in HTML email templates
- Add inline CSS
- Include images via URLs
- Format variables with Markdown-like syntax

Example:
```html
<h1>Order {{order_number}}</h1>
<p>Dear {{customer_first_name}},</p>

<table>
  <tr>
    <td>Total:</td>
    <td><strong>{{order_total}}</strong></td>
  </tr>
</table>
```
