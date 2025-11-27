# Notification Templates Seeding Guide

## Overview

The Spice Room CMS now includes a built-in feature to seed default notification templates directly from the admin panel. This guide explains how to use the seeding functionality based on the order communication flow defined in the business requirements.

## Templates Overview

The system creates **10 default templates** (8 templates + 2 languages support) covering the complete order lifecycle:

### Email Templates (5)

1. **E1 - Order Confirmation** 
   - When: Immediately after order creation
   - For: All payment types
   - Content: Order details, items, total, payment & shipping method

2. **E1a - Order Confirmation with IBAN**
   - When: When payment method is bank transfer
   - For: IBAN payment orders
   - Content: Includes bank account details for payment

3. **E1b - Order Confirmation (Courier)**
   - When: When delivery method is cash-on-delivery courier
   - For: Krivoy Rog cash-on-delivery orders
   - Content: Manager will contact within business hours

4. **E2 - Payment Reminder**
   - When: 24 hours after order (if payment not received)
   - For: IBAN payment orders
   - Content: Payment details reminder

5. **E3 - Order Shipped**
   - When: When order is shipped and tracking number is available
   - For: All orders
   - Content: Tracking number (TTN) and carrier information

6. **E4 - Post-Delivery Review Request**
   - When: 2-3 days after delivery (when order is received)
   - For: All orders
   - Content: Thank you message + review request + Instagram mention offer

### SMS Templates (4)

1. **S1 - SMS Order Confirmation**
   - Content: Order number + reference to email
   - Character count: 71

2. **S2 - SMS Payment Reminder**
   - Content: Payment reminder + order number
   - Sent: After 24 hours if payment not received

3. **S3 - SMS Order Shipped**
   - Content: Order number + tracking number (TTN)
   - Character count: 64

4. **S4 - SMS Post-Delivery Review**
   - Content: Review request
   - Character count: 53

## How to Use

### Option 1: From Admin Panel (Recommended)

1. Navigate to **Admin → Notifications** in the CMS
2. Scroll to the bottom of the page
3. You'll see a section titled "🌿 Setup Notification Templates"
4. Click **"Seed Default Templates"** button
   - This creates all 10 default templates from The Spice Room communication flow
5. Click **"Initialize Variables"** button (if not already initialized)
   - This creates 20+ dynamic variables available for all templates

### Option 2: Command Line

Run the seed command directly:

```bash
pnpm seed:templates
pnpm seed:variables
# Or both at once:
pnpm seed
```

## Dynamic Variables

Each template can use dynamic variables that are automatically populated when sent. Available variables include:

### Order Variables
- `{{order_number}}` - Unique order identifier (e.g., ORD-2024-001)
- `{{order_id}}` - Internal UUID
- `{{order_total}}` - Total amount
- `{{order_subtotal}}` - Subtotal without shipping/tax
- `{{order_status}}` - Current order status
- `{{order_items_list}}` - Formatted list of products

### Customer Variables
- `{{customer_first_name}}` - First name
- `{{customer_last_name}}` - Last name
- `{{customer_email}}` - Email address
- `{{customer_phone}}` - Phone number

### Payment Variables
- `{{payment_method}}` - Payment type (IBAN, LiqPay, COD, etc.)
- `{{payment_status}}` - Payment status (pending, completed, etc.)
- `{{bank_details}}` - Full bank account details for IBAN payments
- `{{iban}}` - IBAN number only

### Shipping Variables
- `{{shipping_method}}` - Delivery method (Nova Poshta, Courier, etc.)
- `{{carrier_name}}` - Courier service name
- `{{tracking_number}}` - TTN for tracking
- `{{shipping_address}}` - Delivery address
- `{{estimated_delivery}}` - Expected delivery timeframe

## Template Customization

After seeding, you can customize templates:

1. Go to **Admin → Notifications**
2. Click the template you want to edit
3. Modify the subject, content, or variables
4. Variables are automatically parsed from your template

## Email Template Structure

All email templates follow this structure:

```html
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 600px; margin: 0 auto;">
      <!-- Content here -->
    </div>
  </body>
</html>
```

- Inline styles for compatibility
- Max-width container for responsive design
- Branded header and footer
- Clear call-to-action buttons

## SMS Best Practices

SMS templates follow Ukrainian language best practices:

- Maximum 160 characters per SMS (standard)
- Use emojis for visual interest (🌿, 🚚, 🌸, etc.)
- Include order number for reference
- Direct links embedded in templates when applicable

## Integration with Order System

When templates are seeded and an order is created:

1. **Order Confirmation** (E1/E1a/E1b + S1)
   - Sent immediately after order creation
   - Email includes payment/shipping details
   - SMS sent as confirmation backup

2. **Payment Reminder** (E2 + S2)
   - Sent 24 hours after order (if payment_status = pending)
   - Only for IBAN payment method

3. **Order Shipped** (E3 + S3)
   - Sent when order status changes to "shipped"
   - Includes tracking number from carrier (Nova Poshta, etc.)

4. **Post-Delivery** (E4 + S4)
   - Sent 2-3 days after delivery
   - Requests review and mentions Instagram handle
   - Can include promotional offer (TBD)

## Troubleshooting

### Templates already exist
If you see "Templates already initialized" message:
- Templates have already been seeded
- To recreate, delete existing templates first in the admin panel

### Variables not showing
If dynamic variables aren't showing in dropdown:
- Click "Initialize Variables" button first
- This populates the notification_variable table

### Email preview not working
- Check that all dynamic variables are properly formatted: `{{variable_name}}`
- Ensure HTML is valid (no unclosed tags)

## Migration Notes

If migrating from another system:

1. Export existing templates
2. Delete the seeded templates if needed
3. Create custom templates via admin panel
4. You can mix default and custom templates

## Localization

Default templates are seeded for Ukrainian (`uk`) language. To add other languages:

1. Create templates with same code but different language in the language field
2. Templates will be selected based on user/order language preference
3. Variables remain the same across languages

## Technical Details

- **Table**: `notification_template`
- **Variables Table**: `notification_variable`
- **Logs Table**: `notification_log` (tracks all sent notifications)
- **Storage**: SQLite with Drizzle ORM
- **Remote Function**: `seedDefaultTemplates` (command type)

## Future Enhancements

Planned features:

- [ ] A/B testing for templates
- [ ] Template versioning and history
- [ ] Scheduled sends for promotional templates
- [ ] Template performance analytics
- [ ] Integration with more SMS providers (SMS Club, Viber, etc.)
- [ ] WhatsApp message templates
- [ ] Telegram notification support
