<!-- Integration Guide: Notifications with Order Flow -->

# Quick Start: Integrating Notifications with Orders

This guide shows how to trigger notifications when orders are created and updated.

## Step 1: Check Order Remote Functions

Location: `src/lib/remotes/order.remote.ts`

You'll need to identify functions for:
- Creating orders
- Updating order status
- Updating payment status
- Marking as shipped
- Marking as delivered

## Step 2: Import Notification Utilities

Add these imports to your order remote file:

```typescript
import { sendNotification, buildOrderNotificationContext } from '$lib/server/services/notification';
import { getTemplatesByEventType } from '$lib/remotes/notification.remote';
```

## Step 3: Send Notifications on Order Events

### When Order is Created

```typescript
export const createOrder = form(CreateOrderSchema, async (data) => {
    // ... existing order creation logic ...
    
    const [newOrder] = await db.insert(tables.order).values({
        id: crypto.randomUUID(),
        // ... order fields ...
        createdAt: new Date()
    }).returning();
    
    // Get order items for context
    const orderItems = await db.select()
        .from(tables.orderItem)
        .where(eq(tables.orderItem.orderId, newOrder.id));
    
    // Send order confirmation email
    try {
        const emailTemplates = await getTemplatesByEventType({
            eventType: 'order_created',
            channel: 'email',
            language: 'en'
        });
        
        if (emailTemplates.length > 0) {
            const context = buildOrderNotificationContext(newOrder, orderItems);
            await sendNotification(emailTemplates[0].id, context);
        }
        
        // Send confirmation SMS if phone exists
        if (newOrder.customerPhone) {
            const smsTemplates = await getTemplatesByEventType({
                eventType: 'order_confirmed',
                channel: 'sms',
                language: 'en'
            });
            
            if (smsTemplates.length > 0) {
                const context = buildOrderNotificationContext(newOrder, orderItems);
                await sendNotification(smsTemplates[0].id, context);
            }
        }
    } catch (error) {
        console.error('Failed to send order notifications:', error);
        // Don't fail order creation if notification fails
    }
    
    redirect(303, `/orders/${newOrder.orderNumber}`);
});
```

### When Payment Status Changes

```typescript
export const updatePaymentStatus = form(UpdatePaymentStatusSchema, async (data) => {
    auth.requireAdminUser();
    
    const [updatedPayment] = await db.update(tables.payment)
        .set({
            status: data.status,
            updatedAt: new Date()
        })
        .where(eq(tables.payment.id, data.paymentId))
        .returning();
    
    // Get associated order
    const [order] = await db.select()
        .from(tables.order)
        .where(eq(tables.order.id, updatedPayment.orderId));
    
    // Send notification if payment is pending and needs reminder
    if (data.status === 'pending' && order.paymentMethod === 'bank_transfer') {
        try {
            const emailTemplates = await getTemplatesByEventType({
                eventType: 'payment_pending_reminder',
                channel: 'email',
                language: 'en'
            });
            
            if (emailTemplates.length > 0) {
                const orderItems = await db.select()
                    .from(tables.orderItem)
                    .where(eq(tables.orderItem.orderId, order.id));
                
                const context = buildOrderNotificationContext(order, orderItems, {
                    iban: 'UA623052990000026004010405791', // From settings
                    bank_details: 'Full bank details...'
                });
                
                await sendNotification(emailTemplates[0].id, context);
            }
        } catch (error) {
            console.error('Failed to send payment reminder:', error);
        }
    }
    
    return updatedPayment;
});
```

### When Order is Shipped

```typescript
export const updateOrderStatus = form(UpdateOrderStatusSchema, async (data) => {
    auth.requireAdminUser();
    
    const [order] = await db.select()
        .from(tables.order)
        .where(eq(tables.order.id, data.orderId));
    
    const [updatedOrder] = await db.update(tables.order)
        .set({
            status: data.status,
            shippedAt: data.status === 'shipped' ? new Date() : undefined,
            updatedAt: new Date()
        })
        .where(eq(tables.order.id, data.orderId))
        .returning();
    
    // Send shipment notification
    if (data.status === 'shipped' && order.status !== 'shipped') {
        try {
            const orderItems = await db.select()
                .from(tables.orderItem)
                .where(eq(tables.orderItem.orderId, updatedOrder.id));
            
            // Send email
            const emailTemplates = await getTemplatesByEventType({
                eventType: 'order_shipped',
                channel: 'email',
                language: 'en'
            });
            
            if (emailTemplates.length > 0) {
                const context = buildOrderNotificationContext(updatedOrder, orderItems, {
                    tracking_number: data.trackingNumber || '',
                    carrier_name: data.carrier || 'Nova Poshta'
                });
                
                await sendNotification(emailTemplates[0].id, context);
            }
            
            // Send SMS
            if (updatedOrder.customerPhone) {
                const smsTemplates = await getTemplatesByEventType({
                    eventType: 'order_shipped',
                    channel: 'sms',
                    language: 'en'
                });
                
                if (smsTemplates.length > 0) {
                    const context = buildOrderNotificationContext(updatedOrder, orderItems, {
                        tracking_number: data.trackingNumber || ''
                    });
                    
                    await sendNotification(smsTemplates[0].id, context);
                }
            }
        } catch (error) {
            console.error('Failed to send shipment notification:', error);
        }
    }
    
    return updatedOrder;
});
```

### When Order is Delivered

```typescript
export const markOrderDelivered = form(MarkOrderDeliveredSchema, async (data) => {
    auth.requireAdminUser();
    
    const [order] = await db.select()
        .from(tables.order)
        .where(eq(tables.order.id, data.orderId));
    
    const [updatedOrder] = await db.update(tables.order)
        .set({
            status: 'delivered',
            deliveredAt: new Date(),
            updatedAt: new Date()
        })
        .where(eq(tables.order.id, data.orderId))
        .returning();
    
    // Send post-delivery review request
    if (order.status !== 'delivered') {
        try {
            const orderItems = await db.select()
                .from(tables.orderItem)
                .where(eq(tables.orderItem.orderId, updatedOrder.id));
            
            // Send email
            const emailTemplates = await getTemplatesByEventType({
                eventType: 'post_delivery_review',
                channel: 'email',
                language: 'en'
            });
            
            if (emailTemplates.length > 0) {
                const context = buildOrderNotificationContext(updatedOrder, orderItems);
                await sendNotification(emailTemplates[0].id, context);
            }
            
            // Send SMS
            if (updatedOrder.customerPhone) {
                const smsTemplates = await getTemplatesByEventType({
                    eventType: 'post_delivery_review',
                    channel: 'sms',
                    language: 'en'
                });
                
                if (smsTemplates.length > 0) {
                    const context = buildOrderNotificationContext(updatedOrder, orderItems);
                    await sendNotification(smsTemplates[0].id, context);
                }
            }
        } catch (error) {
            console.error('Failed to send post-delivery notification:', error);
        }
    }
    
    return updatedOrder;
});
```

## Step 4: Create Default Templates

Navigate to `/admin/notifications` and create the following templates based on your CSV:

### Email Templates
- **E1**: Order Confirmation
- **E1a**: IBAN Payment Instructions (if payment method = bank transfer)
- **E1b**: Courier Delivery Notice (if shipping method = courier)
- **E2**: Payment Reminder (24 hours after order if unpaid)
- **E3**: Shipment Notification
- **E4**: Post-Delivery Review

### SMS Templates
- **S1**: Order Confirmation
- **S2**: Payment Reminder
- **S3**: Shipment Notification
- **S4**: Post-Delivery Review

## Step 5: Test Integration

1. Create a test order in the admin panel
2. Check notification logs at `/admin/notifications` (once added)
3. Verify templates render with correct variable substitution
4. Test status updates trigger appropriate notifications

## Step 6: Provider Integration (Future)

Once you have the notification logs working, integrate with actual providers:

### For Email (Resend)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In sendNotification function:
const emailResult = await resend.emails.send({
    from: 'noreply@thespiceroom.com',
    to: rendered.recipient,
    subject: rendered.subject,
    html: rendered.content
});

// Update log with provider ID
await db.update(tables.notificationLog)
    .set({
        status: 'sent',
        providerId: emailResult.id,
        sentAt: new Date()
    })
    .where(eq(tables.notificationLog.id, log.id));
```

### For SMS (SMS Club)
```typescript
import { getSMSClubClient } from '$lib/server/services/sms-club';

// In sendNotification function:
const client = getSMSClubClient();
const smsResult = await client.sendSms({
    phone: rendered.recipient,
    message: rendered.content,
    senderName: 'SpiceRoom' // From settings
});

// Update log
await db.update(tables.notificationLog)
    .set({
        status: 'sent',
        providerId: smsResult.messageId,
        sentAt: new Date()
    })
    .where(eq(tables.notificationLog.id, log.id));
```

## Testing Checklist

- [ ] Initialize default variables
- [ ] Create test templates for each event type
- [ ] Create test order and verify confirmation email/SMS template renders
- [ ] Update order status and verify shipment notification renders
- [ ] Check notification logs show all sent messages
- [ ] Test variable substitution with sample data
- [ ] Verify active/inactive toggle works
- [ ] Test editing existing template
- [ ] Test deleting template

## Troubleshooting

### Variables not rendering
- Check variable key spelling (case-sensitive)
- Verify variable exists in catalog
- Ensure context object includes the variable

### Templates not sending
- Check template is marked as active
- Verify event_type matches trigger event
- Check language setting matches order

### Wrong recipient
- Verify customer email/phone in order
- Check template recipient selection logic
- Test with manual test order

## Next Steps

1. Implement provider integrations (Resend for email, SMS Club for SMS)
2. Add retry logic for failed notifications
3. Add scheduled reminders (e.g., payment reminder after 24 hours)
4. Add notification templates to order detail view
5. Add bulk notification sending for admin
6. Add customer notification preferences
