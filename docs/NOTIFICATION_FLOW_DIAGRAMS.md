# Notification Templates Flow Diagram

## Order Lifecycle with Auto-Sent Notifications

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER PLACES ORDER                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │   ORDER CONFIRMATION SENT        │
        ├──────────────────────────────────┤
        │  E1 / E1a / E1b (email)          │
        │  S1 (SMS)                        │
        │                                  │
        │  Content:                        │
        │  • Order #                       │
        │  • Items list                    │
        │  • Total price                   │
        │  • Shipping method               │
        │  • Payment method                │
        └──────────────────────────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │ Payment Method?    │
              └────────────────────┘
                    │       │       │
          ┌─────────┴──┬───┴──┬────┴─────────┐
          │            │      │              │
      IBAN          LiqPay   COD        Courier
          │            │      │              │
          ▼            ▼      ▼              ▼
    ┌─────────────┐ ✓       ✓         ┌──────────────┐
    │ UNPAID?     │ (paid)  (paid)     │ Manager will │
    │ 24h later   │                    │ call customer│
    │             │                    └──────────────┘
    ▼             │                           │
  ┌─────────────┐ │                           │
  │ E2 (email)  │ │                           ▼
  │ S2 (SMS)    │ │                     Delivery arranged
  │ Content:    │ │                           │
  │ • IBAN      │ │                           │
  │ • Details   │ │                           │
  └─────────────┘ │                           │
        │         │                           │
        └─────────┴──────────────┬────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │   PACKAGE SHIPPED         │
                   ├───────────────────────────┤
                   │   E3 (email)              │
                   │   S3 (SMS)                │
                   │                           │
                   │   Content:                │
                   │   • Tracking number (TTN) │
                   │   • Carrier name          │
                   │   • Estimated delivery    │
                   └──────────┬────────────────┘
                              │
                              │ (2-3 days after receipt)
                              │
                   ┌──────────▼──────────┐
                   │ PACKAGE DELIVERED   │
                   ├─────────────────────┤
                   │  E4 (email)         │
                   │  S4 (SMS)           │
                   │                     │
                   │  Content:           │
                   │  • Thank you         │
                   │  • Review request    │
                   │  • Instagram link    │
                   │  • Offer (TBD)      │
                   └─────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  CUSTOMER LEAVES     │
                   │  REVIEW / FEEDBACK   │
                   └──────────────────────┘
```

## Template Selection Logic

```
┌─────────────────────┐
│ Order Created Event │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ Select Template  │
    │ by Payment Type  │
    └──────┬───────────┘
           │
     ┌─────┴─────────┬────────────┬─────────────┐
     │               │            │             │
  Payment=       Payment=      Payment=      Payment=
   IBAN          LiqPay         COD         (other)
     │               │            │             │
     ▼               ▼            ▼             ▼
  ┌──────┐       ┌──────┐     ┌──────┐     ┌──────┐
  │ E1a  │       │ E1   │     │ E1b  │     │ E1   │
  │ +    │       │ +    │     │ +    │     │ +    │
  │ S1   │       │ S1   │     │ S1   │     │ S1   │
  └──────┘       └──────┘     └──────┘     └──────┘
     │               │            │             │
     ▼               ▼            ▼             ▼
  Bank         Liqpay        Manager      Standard
  Details      Check         Calls        Order
  Sent         Sent          Customer     Email
```

## Variable Injection Example

```
┌─────────────────────────────────────┐
│   Raw Template (E1)                 │
├─────────────────────────────────────┤
│ Subject: Ваше замовлення             │
│ №{{order_number}} прийнято!         │
│                                     │
│ Body:                               │
│ Вітаємо, {{customer_first_name}}!  │
│ Сума ітого: {{order_total}} грн.    │
│ Спосіб оплати: {{payment_method}}   │
│ Спосіб доставки: {{shipping_method}}│
└────────────┬────────────────────────┘
             │ (Render with DB values)
             ▼
┌─────────────────────────────────────┐
│   Rendered Email (E1)               │
├─────────────────────────────────────┤
│ Subject: Ваше замовлення             │
│ №ORD-2024-001 прийнято!            │
│                                     │
│ Body:                               │
│ Вітаємо, Іван!                     │
│ Сума ітого: 1,250 грн.              │
│ Спосіб оплати: IBAN transfer        │
│ Спосіб доставки: Nova Poshta        │
└─────────────────────────────────────┘
```

## Admin Seeding Interface

```
┌─────────────────────────────────────────────────┐
│  🌿 Setup Notification Templates                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Initialize default email and SMS templates   │
│  for The Spice Room order communication flow  │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ ⚡ Seed Default │  │ ✓ Initialize        │ │
│  │    Templates    │  │   Variables         │ │
│  └─────────────────┘  └─────────────────────┘ │
│                                                 │
│  This will create 8 default templates          │
│  (E1, E1a, E1b, S1, E2, S2, E3, S3, E4, S4)   │
│  based on the order communication workflow.    │
│                                                 │
└─────────────────────────────────────────────────┘
        │                              │
        └──────────┬───────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
 Templates              Variables
 Created               Initialized
 (10)                  (20+)
    │                             │
    └──────────────┬──────────────┘
                   │
                   ▼
    ✅ Toast: "Successfully seeded
       10 default notification
       templates from The Spice Room
       communication flow"
```

## Data Model

```
notification_template (10 records)
├── code: "E1" | "E1a" | "E1b" | "S1" | "E2" | "S2" | "E3" | "S3" | "E4" | "S4"
├── channel: "email" | "sms"
├── eventType: "order_confirmed" | "payment_pending_reminder" | "order_shipped" | "post_delivery_review"
├── name: Template name
├── subject: Email subject (nullable for SMS)
├── content: HTML/text template with {{variables}}
├── variables: JSON array of variable keys used
├── language: "uk" | "en" (currently "uk")
├── isActive: boolean (true)
├── createdBy: admin user ID
└── createdAt: timestamp

notification_variable (20+ records)
├── key: "order_number" | "customer_first_name" | etc.
├── label: "Order Number" | "Customer First Name" | etc.
├── category: "order" | "customer" | "payment" | "shipping"
├── dataType: "string" | "number" | "date" | "boolean"
├── exampleValue: "ORD-2024-001" | "Іван" | etc.
└── createdAt: timestamp

notification_log (future - tracks sent notifications)
├── templateId: references notification_template
├── orderId: references order
├── channel: "email" | "sms"
├── recipient: email or phone
├── status: "pending" | "sent" | "failed" | "bounced"
└── sentAt: timestamp
```

## Key Features

✅ **One-Click Initialization** - Seed all templates with one button click from admin panel
✅ **Based on Real Business Rules** - Templates match The Spice Room CSV communication flow
✅ **Professional Design** - Styled HTML emails with inline CSS for compatibility
✅ **SMS Optimized** - Character-limited SMS templates with emojis
✅ **Dynamic Variables** - 20+ variables for personalization
✅ **Idempotent** - Can be run safely multiple times (checks for existing templates)
✅ **Admin-Editable** - All templates can be customized after seeding
✅ **Full Documentation** - Complete guide available in docs folder
