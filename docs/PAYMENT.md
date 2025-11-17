# Payment Integration Guide - LiqPay

## Overview

This SvelteKit e-commerce CMS integrates **LiqPay**, Ukraine's leading payment gateway, for secure online payments. The implementation supports both **Cash on Delivery (COD)** and **Card Payments via LiqPay**.

---

## Features

### ✅ Implemented Features

1. **Dual Payment Methods**
   - Cash on Delivery (COD)
   - Online Card Payment (LiqPay)

2. **Complete Payment Flow**
   - Payment creation with LiqPay API
   - Secure redirect to LiqPay checkout page
   - Return URL handling (success/failure)
   - Server-side webhook for real-time status updates

3. **Payment Status Tracking**
   - Database storage of all payment transactions
   - Automatic order status updates based on payment
   - Transaction ID tracking from LiqPay

4. **Security**
   - SHA-1 signature verification for webhooks
   - Base64 encoding/decoding of payment data
   - Environment-based credentials (never hardcoded)
   - Sandbox mode for testing

5. **Refund Support**
   - Admin can initiate refunds via LiqPay API
   - Automatic inventory restoration on refund
   - Manual refund tracking for COD orders

---

## Architecture

### Database Schema

**Payment Table** (`src/lib/server/db/schema.ts`):
```typescript
export const payment = sqliteTable('payment', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => order.id),
  provider: text('provider', { enum: ['liqpay', 'stripe', 'paypal', 'cod'] })
    .notNull()
    .default('cod'),
  transactionId: text('transaction_id'), // External payment ID from provider
  amount: integer('amount').notNull(), // Stored in cents
  currency: text('currency').notNull().default('UAH'),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] })
    .notNull()
    .default('pending'),
  liqpayData: text('liqpay_data'), // JSON - payment_id, status, etc.
  metadata: text('metadata'), // JSON - additional provider-specific data
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});
```

### File Structure

```
src/
├── lib/
│   ├── server/
│   │   └── liqpay-client.ts          # LiqPay API client
│   └── remotes/
│       └── payment.remote.ts         # Payment remote functions
└── routes/
    ├── payment/
    │   ├── [orderId]/+page.svelte    # Payment initiation page
    │   └── result/+page.svelte       # Payment result handler
    └── api/
        └── webhooks/
            └── liqpay/+server.ts     # Webhook endpoint
```

---

## LiqPay Client (`liqpay-client.ts`)

The LiqPay client handles all communication with the LiqPay API:

### Key Methods

#### 1. **createPayment()**
Creates a new payment and returns data/signature for checkout URL.

```typescript
const liqpay = getLiqPayClient();

const response = liqpay.createPayment({
  orderId: 'ORD-12345',
  amount: 100.50, // UAH
  description: 'Order ORD-12345',
  email: 'customer@example.com',
  phone: '+380501234567',
  resultUrl: 'https://yoursite.com/payment/result',
  serverUrl: 'https://yoursite.com/api/webhooks/liqpay'
});

const checkoutUrl = liqpay.getCheckoutUrl(response);
// Redirect user to checkoutUrl
```

#### 2. **checkPaymentStatus()**
Queries LiqPay API for current payment status.

```typescript
const status = await liqpay.checkPaymentStatus('ORD-12345');
// Returns: { status: 'success', payment_id: 123456, amount: 100.50, ... }
```

#### 3. **parseWebhook()**
Verifies and decodes webhook data from LiqPay.

```typescript
const webhookData = liqpay.parseWebhook(data, signature);

if (!webhookData) {
  // Invalid signature - reject webhook
}

// webhookData: { status, payment_id, order_id, amount, ... }
```

#### 4. **createRefund()**
Initiates a refund for a completed payment.

```typescript
const refund = await liqpay.createRefund('ORD-12345', 100.50);
// Returns: { status: 'reversed', ... }
```

### Security

- **SHA-1 Signature**: All requests and webhooks are signed
- **Base64 Encoding**: Payment data is base64-encoded
- **Private Key**: Never exposed to client-side code

---

## Payment Remote Functions

### 1. **createPayment** (command)

Creates a payment record and initiates LiqPay checkout.

```typescript
const result = await createPayment({
  orderId: 'uuid-123',
  paymentMethod: 'liqpay' // or 'cod'
});

if (result.checkoutUrl) {
  // Redirect to LiqPay
  window.location.href = result.checkoutUrl;
}
```

**Database Operations:**
1. Fetch order details
2. Check for existing payment
3. Create payment record
4. Generate LiqPay checkout URL
5. Store payment with LiqPay data

**Returns:**
- `payment`: Payment record
- `checkoutUrl`: URL to redirect user (LiqPay only)

---

### 2. **getPaymentByOrderId** (query)

Retrieves payment record for an order.

```typescript
const payment = await getPaymentByOrderId('order-uuid');
```

---

### 3. **checkPaymentStatus** (command)

Checks payment status with LiqPay and updates database.

```typescript
const status = await checkPaymentStatus('order-uuid');
// Returns: { status: 'completed', details: {...} }
```

**Flow:**
1. Fetch order and payment
2. Query LiqPay API for status
3. Update payment status in DB
4. Update order payment status
5. Change order status if paid

**Status Mapping:**
- `success` → `completed`
- `failure` / `error` → `failed`
- `reversed` → `refunded`
- Other → `pending`

---

### 4. **handlePaymentWebhook** (internal function)

Processes webhooks from LiqPay (called by API endpoint).

```typescript
const result = await handlePaymentWebhook(data, signature);
// Returns: { success: true, paymentStatus, orderStatus }
```

**Webhook Flow:**
1. Verify signature
2. Decode webhook data
3. Find order by order_number
4. Update payment status
5. Update order status
6. Return success response

**Important:** This function is NOT exposed as a remote function. It's called by the webhook endpoint (`/api/webhooks/liqpay/+server.ts`).

---

### 5. **createRefund** (command)

Initiates a refund (admin only).

```typescript
const result = await createRefund('order-uuid');
// Returns: { success: true, message: 'Refund processed successfully' }
```

**Refund Flow:**
1. Check admin permissions
2. Fetch order and completed payment
3. Call LiqPay refund API (or mark manual for COD)
4. Update payment status to 'refunded'
5. Update order status to 'refunded'

---

## Payment Flow (Complete Sequence)

### Scenario 1: Cash on Delivery (COD)

```
1. Customer completes checkout form
   ↓
2. Selects "Cash on Delivery" payment method
   ↓
3. Submits checkout form → checkout() remote function
   ↓
4. Order created with status='pending', paymentStatus='pending'
   ↓
5. Redirect to /order-confirmation/{orderId}
   ↓
6. Customer sees order confirmation
```

**No payment record created initially for COD.**

---

### Scenario 2: Online Card Payment (LiqPay)

```
1. Customer completes checkout form
   ↓
2. Selects "Card Payment" method
   ↓
3. Submits checkout form → checkout() remote function
   ↓
4. Order created with status='pending', paymentStatus='pending'
   ↓
5. Redirect to /payment/{orderId}
   ↓
6. Payment page calls createPayment() remote function
   ↓
7. Payment record created in DB (status='pending')
   ↓
8. LiqPay checkout URL generated
   ↓
9. User redirected to LiqPay payment page (external)
   ↓
10. Customer enters card details on LiqPay site
   ↓
11. LiqPay processes payment
   ↓
12. User redirected to /payment/result?data=...&signature=...
   ↓
13. Payment result page shows success/failure message
   ↓
14. Simultaneously: LiqPay sends webhook to /api/webhooks/liqpay
   ↓
15. Webhook verified and payment status updated
   ↓
16. Order status updated to 'processing' if payment successful
   ↓
17. Customer can view order confirmation
```

---

## Routes

### 1. `/payment/[orderId]` - Payment Initiation

**Purpose**: Initiates LiqPay payment and redirects to checkout.

**Flow:**
- Auto-calls `createPayment()` on mount
- Shows loading spinner
- Redirects to LiqPay checkout URL
- Shows error if payment creation fails

**UI:**
- Loading state with spinner
- Error state with retry button
- Manual "Continue to Payment" button

---

### 2. `/payment/result` - Payment Result Handler

**Purpose**: Handles return from LiqPay after payment.

**URL Parameters:**
- `data`: Base64-encoded payment result
- `signature`: SHA-1 signature for verification

**Flow:**
1. Decode `data` parameter
2. Display payment status:
   - ✅ Success: Green checkmark, order details, "View Order" button
   - ❌ Failure: Red X, error message, "Try Again" button
   - ⏳ Pending: Loading spinner, pending message
   - 🧪 Sandbox: Yellow checkmark, test mode notice

**UI States:**
- Success: `paymentData.status === 'success'`
- Failure: `paymentData.status === 'failure' || 'error'`
- Sandbox: `paymentData.status === 'sandbox'`
- Pending: Other statuses

---

### 3. `/api/webhooks/liqpay` - Webhook Endpoint

**Purpose**: Receives server-to-server payment updates from LiqPay.

**Method:** `POST`

**Request Body (form data):**
- `data`: Base64-encoded payment data
- `signature`: SHA-1 signature

**Response:**
```json
{
  "success": true,
  "result": {
    "paymentStatus": "completed",
    "orderStatus": "processing"
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid webhook signature"
}
```

**Why Webhooks?**
- Ensures payment status is updated even if user closes browser
- More reliable than relying on return URL only
- LiqPay sends webhook regardless of user behavior

---

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# LiqPay Payment Gateway (Ukrainian payment processor)
LIQPAY_PUBLIC_KEY=your_liqpay_public_key_here
LIQPAY_PRIVATE_KEY=your_liqpay_private_key_here
LIQPAY_SANDBOX=true  # Set to false for production

# Site Origin (for payment callbacks)
ORIGIN=http://localhost:5173  # Change to your production URL
```

### Getting LiqPay Credentials

1. **Register at LiqPay:**
   - Visit: https://www.liqpay.ua/
   - Sign up for merchant account
   - Complete business verification (ФОП or ТОВ)

2. **Get API Keys:**
   - Log in to LiqPay dashboard
   - Navigate to "API" section
   - Copy **Public Key** and **Private Key**

3. **Sandbox Mode:**
   - Enable sandbox in LiqPay settings
   - Use test cards for payments
   - Test cards: https://www.liqpay.ua/documentation/en/api/test_cards

4. **Production Mode:**
   - Complete LiqPay verification process
   - Disable sandbox: `LIQPAY_SANDBOX=false`
   - Use real payment credentials

---

## Testing

### Test Cards (Sandbox Mode)

LiqPay provides test cards for sandbox testing:

| Card Number         | Result  | CVV | Expiry |
|---------------------|---------|-----|--------|
| 4242 4242 4242 4242 | Success | 123 | 12/25  |
| 4000 0000 0000 0002 | Decline | 123 | 12/25  |

**Test Flow:**
1. Set `LIQPAY_SANDBOX=true`
2. Complete checkout with card payment
3. Use test card on LiqPay page
4. Verify payment success/failure
5. Check order status updated correctly

### Manual Testing Checklist

- [ ] COD payment creates order without payment record
- [ ] Card payment redirects to LiqPay
- [ ] Successful payment updates order status to 'processing'
- [ ] Failed payment keeps order as 'pending'
- [ ] Webhook updates payment status correctly
- [ ] Refund updates payment and order status
- [ ] Payment amount matches order total
- [ ] Currency is set correctly (UAH)
- [ ] Customer email/phone stored in payment

---

## Security Considerations

### 1. **Signature Verification**

All webhooks MUST be verified:

```typescript
const webhookData = liqpay.parseWebhook(data, signature);

if (!webhookData) {
  // Reject - invalid signature
  return new Response('Invalid signature', { status: 400 });
}
```

### 2. **Environment Variables**

NEVER commit sensitive keys:

```bash
# ❌ NEVER DO THIS
LIQPAY_PRIVATE_KEY=i1234567890abcdef

# ✅ Use environment variables
LIQPAY_PRIVATE_KEY=your_private_key_here
```

### 3. **HTTPS in Production**

LiqPay requires HTTPS for production webhooks:

```bash
# Development
ORIGIN=http://localhost:5173

# Production (must be HTTPS)
ORIGIN=https://yoursite.com
```

### 4. **Webhook Endpoint Protection**

The webhook endpoint (`/api/webhooks/liqpay`) is public but protected by:
- Signature verification
- Form data parsing (not JSON)
- Error handling and logging

**No authentication required** - signature verification is sufficient.

---

## Common Issues & Troubleshooting

### Issue 1: "Failed to create payment"

**Cause:** Missing environment variables

**Solution:**
```bash
# Check .env file
LIQPAY_PUBLIC_KEY=i1234567
LIQPAY_PRIVATE_KEY=abcdef123456
```

---

### Issue 2: Payment page shows error

**Cause:** Order not found or payment already exists

**Solution:**
- Check order exists in database
- Clear existing payment if testing
- Verify `orderId` parameter in URL

---

### Issue 3: Webhook not updating status

**Cause:** Signature verification failed or webhook not received

**Solution:**
1. Check webhook URL in LiqPay dashboard
2. Verify `ORIGIN` environment variable
3. Check server logs for webhook errors
4. Test webhook with LiqPay testing tools

---

### Issue 4: Payment success but order still pending

**Cause:** Webhook not processed or failed

**Solution:**
1. Manually trigger `checkPaymentStatus()`:
   ```typescript
   const status = await checkPaymentStatus('order-uuid');
   ```
2. Check webhook logs
3. Verify signature verification logic

---

## Production Checklist

Before going live with LiqPay:

- [ ] Register and verify LiqPay merchant account
- [ ] Complete business verification (ФОП/ТОВ)
- [ ] Obtain production API keys
- [ ] Set `LIQPAY_SANDBOX=false`
- [ ] Update `ORIGIN` to production URL (HTTPS)
- [ ] Configure webhook URL in LiqPay dashboard
- [ ] Test with real payment (small amount)
- [ ] Verify webhook receives updates
- [ ] Test refund process
- [ ] Set up monitoring/logging for payments
- [ ] Document payment flow for support team

---

## LiqPay API Documentation

Official documentation: https://www.liqpay.ua/documentation/en/

**Key Resources:**
- API Reference: https://www.liqpay.ua/documentation/en/api/
- Test Cards: https://www.liqpay.ua/documentation/en/api/test_cards
- Webhook Info: https://www.liqpay.ua/documentation/en/api/callback
- Signature Calculation: https://www.liqpay.ua/documentation/en/api/signature

---

## Transaction Fees

LiqPay charges per transaction:

- **Standard Rate:** 2.8% + 5 UAH per transaction
- **No monthly fees**
- **Instant settlement** to bank account
- **No setup fees**

---

## Next Steps

After implementing LiqPay:

1. **Checkbox РРО Integration** - Required for Ukrainian law compliance
   - Automatic fiscal receipt generation on successful LiqPay payment
   - Electronic receipt delivery (email/SMS/Viber)

2. **Email Notifications** - Send payment confirmations
   - Order confirmation email
   - Payment success email
   - Payment failed email

3. **Admin Dashboard** - Payment management UI
   - View all payments
   - Filter by status
   - Initiate refunds
   - View transaction details

---

## Support

For LiqPay support:
- **Email:** support@liqpay.ua
- **Phone:** +380 44 209 0909
- **Documentation:** https://www.liqpay.ua/documentation/en/

For technical issues with this integration:
- Check logs in `/api/webhooks/liqpay`
- Review payment records in database
- Test with sandbox mode first
