# Checkbox РРО Testing Guide

This guide covers testing the Checkbox fiscal receipt integration in development mode.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Testing Checklist](#testing-checklist)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Checkbox Account
- Register at https://checkbox.ua (sandbox available)
- Create a cashier account
- Obtain license key from admin panel
- Note your cash register ID (if using specific register)

### 2. Test Credentials
For sandbox testing, use test credentials provided by Checkbox support.

### 3. Active Cash Register Shift
Checkbox requires an open shift before creating receipts. The system auto-opens shifts when needed.

---

## Environment Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Checkbox РРО Configuration
CHECKBOX_LOGIN=test@example.com           # Your Checkbox login
CHECKBOX_PASSWORD=your_password_here       # Your Checkbox password
CHECKBOX_LICENSE_KEY=your_license_key      # License key from Checkbox admin
CHECKBOX_CASH_REGISTER_ID=                 # Optional: specific register ID
CHECKBOX_PRODUCTION=false                  # Use false for sandbox testing
```

### 2. Verify Database Schema

Ensure migrations are applied:

```bash
pnpm db:push
```

This creates:
- `checkbox_receipt` table (fiscal receipts)
- `checkbox_shift` table (cash register shifts)

### 3. Start Development Server

```bash
pnpm dev
```

Server runs at http://localhost:5173

---

## Testing Checklist

### Backend Integration Tests

- [ ] **Authentication**
  - [ ] System can authenticate with Checkbox API
  - [ ] Access token is cached and reused
  - [ ] Token auto-refreshes when expired

- [ ] **Shift Management**
  - [ ] Can open a new shift via admin UI
  - [ ] Can view current shift status
  - [ ] Can close active shift
  - [ ] System auto-opens shift if creating receipt when closed
  - [ ] Shift data persists in database

- [ ] **Receipt Creation**
  - [ ] Receipts auto-generate after successful LiqPay payment
  - [ ] Receipt includes correct order items and amounts
  - [ ] Receipt links to order and payment correctly
  - [ ] Fiscal code is stored in database
  - [ ] Receipt URL is captured

- [ ] **Error Handling**
  - [ ] Failed receipt creation logs error
  - [ ] Order continues even if receipt fails
  - [ ] Admin can view error details
  - [ ] System retries on network failures

### Admin UI Tests

- [ ] **Receipt List Page (`/admin/receipts`)**
  - [ ] Displays all receipts with pagination
  - [ ] Search by order number works
  - [ ] Status filter (all/created/sent/error/cancelled) works
  - [ ] Shows current shift status at top
  - [ ] Open/close shift buttons work
  - [ ] Clicking external link opens receipt URL

- [ ] **Receipt Details**
  - [ ] Fiscal code displayed correctly
  - [ ] Order information shown
  - [ ] Payment amount matches order total
  - [ ] Timestamp formatted properly
  - [ ] Error message visible for failed receipts

### End-to-End Payment Flow

- [ ] **Successful Payment with Receipt**
  1. [ ] Create order with LiqPay payment method
  2. [ ] Complete payment on LiqPay checkout
  3. [ ] Payment webhook triggers successfully
  4. [ ] Fiscal receipt auto-creates
  5. [ ] Receipt appears in admin UI
  6. [ ] Receipt sent to customer email/phone (check Checkbox dashboard)

- [ ] **COD Orders (No Receipt)**
  - [ ] COD orders don't trigger receipt creation
  - [ ] Only card payments generate receipts

---

## Test Scenarios

### Scenario 1: First-Time Setup

**Objective:** Verify system works from fresh state

**Steps:**
1. Configure `.env` with Checkbox credentials
2. Start dev server: `pnpm dev`
3. Login as admin
4. Navigate to `/admin/receipts`
5. Click "Open Shift"

**Expected Results:**
- Shift opens successfully
- Green "Shift Open" badge appears
- Shift ID and timestamp displayed
- No errors in browser console
- Database has record in `checkbox_shift` table

**Troubleshooting:**
- If shift fails: Check credentials in `.env`
- If 401 error: Verify login/password are correct
- If license error: Ensure license key is valid
- Check server logs for detailed error messages

---

### Scenario 2: Manual Receipt Creation

**Objective:** Test creating receipt without payment webhook

**Prerequisites:**
- Active shift open
- At least one order in database

**Steps:**
1. Use database or API to get order ID
2. Call `createReceipt()` remote function from browser console:
   ```javascript
   // From browser console (must be logged in as admin)
   const { createReceipt } = await import('/src/lib/remotes/checkbox.remote.ts');
   await createReceipt({ orderId: 'your-order-id-here' });
   ```

**Expected Results:**
- Receipt created in Checkbox system
- Database record in `checkbox_receipt` table
- Fiscal code generated
- Receipt URL available
- Status set to "sent" if email/phone provided

**Troubleshooting:**
- If "No active shift": Open shift first
- If "Order not found": Verify order ID
- If "Payment not found": Ensure order has payment record
- Check receipt status column for error details

---

### Scenario 3: End-to-End Payment Flow

**Objective:** Test complete checkout → payment → receipt flow

**Prerequisites:**
- Active shift open
- Products in catalog
- LiqPay configured (can use sandbox)

**Steps:**
1. Add products to cart
2. Go to checkout
3. Fill customer info (include valid email)
4. Select "Card Payment" (LiqPay)
5. Complete payment (use test card in sandbox)
6. Wait for webhook callback
7. Check `/admin/receipts` page

**Expected Results:**
- Payment completes successfully
- Order status updates to "paid"
- Receipt auto-creates within seconds
- Receipt visible in admin UI
- Customer receives email with receipt link

**Test Card Numbers (Sandbox):**
```
Success: 4242424242424242
Decline: 4000000000000002
```

**Troubleshooting:**
- If no receipt appears: Check server logs for webhook errors
- If webhook fails: Verify `ORIGIN` env var matches your domain
- If receipt creation fails but payment succeeds: Check Checkbox API logs in their dashboard
- Ensure shift is open before payment

---

### Scenario 4: Shift Operations

**Objective:** Test shift lifecycle

**Steps:**
1. **Open Shift**
   - Go to `/admin/receipts`
   - Click "Open Shift"
   - Verify shift badge shows "Shift Open"

2. **Create Receipt During Shift**
   - Perform payment flow (Scenario 3)
   - Verify receipt created successfully

3. **Check Shift Data**
   - Verify shift ID displayed
   - Check opened_at timestamp
   - Note cash register ID

4. **Close Shift**
   - Click "Close Shift"
   - Confirm dialog
   - Verify badge shows "No Active Shift"

5. **Auto-Reopen Test**
   - Create another order and pay
   - Verify system auto-opens shift
   - Verify receipt still creates

**Expected Results:**
- All shift operations succeed
- Database records persist
- Auto-reopen works seamlessly
- No orphaned receipts

---

### Scenario 5: Error Handling

**Objective:** Test system behavior during failures

**Test Cases:**

**A. Invalid Credentials**
1. Set wrong password in `.env`
2. Try opening shift
3. Expected: Error message, no crash

**B. Network Failure**
1. Disconnect internet during receipt creation
2. Complete payment
3. Expected: Receipt status = "error", error message logged

**C. Closed Shift Receipt**
1. Ensure no active shift
2. Trigger payment webhook
3. Expected: System auto-opens shift, creates receipt

**D. Missing Customer Info**
1. Create order without email/phone
2. Complete payment
3. Expected: Receipt created but status = "created" (not "sent")

---

## Troubleshooting

### Common Issues

#### 1. Authentication Fails (401 Error)

**Symptoms:**
- "Authentication failed" in console
- Cannot open shift

**Solutions:**
- Verify credentials in `.env`
- Check Checkbox account is active
- Ensure license key is valid
- Try logging into Checkbox web dashboard

#### 2. Shift Already Open Error

**Symptoms:**
- "Shift already opened" when clicking "Open Shift"

**Solutions:**
- Close existing shift first
- Check `checkbox_shift` table for active shift
- If orphaned: Manually close in Checkbox dashboard

#### 3. Receipt Creation Fails

**Symptoms:**
- Payment succeeds but no receipt
- Receipt status = "error"

**Solutions:**
- Check server logs for detailed error
- Verify shift is open
- Check order has valid payment record
- Ensure items have correct format

#### 4. Receipt URL Not Working

**Symptoms:**
- Fiscal code generated but URL is null

**Solutions:**
- Receipt URL may take time to generate
- Check Checkbox dashboard
- Refresh page after a few seconds

#### 5. Webhook Not Triggering

**Symptoms:**
- Payment completes but receipt never creates

**Solutions:**
- Verify `ORIGIN` env var matches your URL
- Check LiqPay callback URL configuration
- Review server logs for webhook errors
- Test webhook manually using payment test tools

---

## Database Queries for Testing

### Check Receipt Records
```sql
SELECT * FROM checkbox_receipt ORDER BY created_at DESC LIMIT 10;
```

### Check Active Shift
```sql
SELECT * FROM checkbox_shift WHERE closed_at IS NULL;
```

### Check Payment + Receipt Link
```sql
SELECT 
  o.order_number,
  p.status as payment_status,
  r.fiscal_code,
  r.status as receipt_status
FROM "order" o
LEFT JOIN payment p ON p.order_id = o.id
LEFT JOIN checkbox_receipt r ON r.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 10;
```

---

## Sandbox vs Production

### Sandbox Mode (`CHECKBOX_PRODUCTION=false`)
- Uses Checkbox sandbox API
- Test credentials work
- No real fiscal reporting
- Safe for development

### Production Mode (`CHECKBOX_PRODUCTION=true`)
- Uses live Checkbox API
- Requires valid business license
- Creates legal fiscal receipts
- Reported to tax authorities

⚠️ **Warning:** Only use production mode with real business credentials and for actual sales.

---

## Monitoring in Production

### Key Metrics to Track

1. **Receipt Success Rate**
   - Monitor `checkbox_receipt.status` distribution
   - Alert on error rate > 5%

2. **Shift Operations**
   - Track open/close times
   - Alert on shifts open > 24 hours

3. **Webhook Latency**
   - Measure payment → receipt creation time
   - Target: < 5 seconds

4. **Error Patterns**
   - Group errors by type
   - Address common failures

### Health Checks

Create monitoring endpoints:
- `/api/health/checkbox` - Check Checkbox API connectivity
- `/api/health/shift` - Verify active shift exists
- `/api/health/receipts` - Check recent receipt success rate

---

## Support Resources

- **Checkbox Documentation:** https://dev.checkbox.ua/
- **Checkbox Support:** support@checkbox.ua
- **LiqPay Documentation:** https://www.liqpay.ua/documentation/api/home
- **Project Docs:** See `docs/PAYMENT.md` for LiqPay integration details

---

## Next Steps

After completing manual tests:

1. **Write Automated Tests**
   - Add Playwright e2e tests for payment flow
   - Unit tests for Checkbox API client
   - Integration tests for remote functions

2. **Load Testing**
   - Test concurrent payment webhooks
   - Verify shift locking works correctly
   - Check database performance with many receipts

3. **Production Preparation**
   - Get production Checkbox credentials
   - Configure monitoring and alerts
   - Set up error logging (e.g., Sentry)
   - Review fiscal compliance requirements

4. **User Training**
   - Train admin staff on shift management
   - Document receipt troubleshooting procedures
   - Create runbook for common issues
