# Order Item Table Integration

## Overview

This document describes the integration of the `order_item` table into the order management system to support efficient analytics queries.

## Changes Made

### 1. Database Schema (`src/lib/server/db/schema.ts`)

Added new `order_item` table:
```typescript
export const orderItem = sqliteTable('order_item', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => order.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => product.id),
  productName: text('product_name').notNull(),
  productSlug: text('product_slug').notNull(),
  productImage: text('product_image'),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: integer('subtotal').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

**Key Features:**
- `ON DELETE CASCADE` - Automatically deletes order_item records when order is deleted
- Historical snapshot - Stores product name, slug, and price at time of order
- Indexed foreign keys for fast joins with order and product tables

### 2. Order Creation (`src/lib/remotes/order.remote.ts`)

**Updated `checkout()` function:**
```typescript
// Create order
const orderId = crypto.randomUUID();
const now = new Date();

const [order] = await db.insert(tables.order).values({
  id: orderId,
  // ... other fields
}).returning();

// NEW: Create order_item records for analytics
for (const item of items) {
  await db.insert(tables.orderItem).values({
    id: crypto.randomUUID(),
    orderId: orderId,
    productId: item.productId,
    productName: item.name,
    productSlug: item.slug,
    productImage: item.image || null,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
    createdAt: now
  });
}
```

**What This Does:**
1. Creates an order in the `order` table (existing behavior)
2. **NEW**: Creates individual `order_item` records for each cart item
3. Preserves product details as they were at time of purchase
4. Links order_items to order via `orderId` foreign key

### 3. Order Cancellation (`cancelOrder()`)

**Important Notes:**
- Cancellation updates order status to `'cancelled'` but **does NOT delete** the order
- Order and order_item records are preserved for historical tracking
- Analytics queries filter by `status NOT IN ('cancelled', 'refunded')`
- Inventory is restored when order is cancelled

**Why Not Delete?**
- Preserves order history for customer support
- Analytics reports can show cancellation trends
- Legal/accounting requirements for order records
- Refunds may need original order data

### 4. Order Deletion (CASCADE Behavior)

If an order is ever hard-deleted from the database:
```sql
DELETE FROM "order" WHERE id = 'order-id';
```

The `ON DELETE CASCADE` foreign key will automatically delete associated order_item records:
```sql
-- This happens automatically:
DELETE FROM order_item WHERE order_id = 'order-id';
```

**Current Implementation:**
- No hard delete functionality exists in the codebase
- Orders are soft-deleted via status changes (`'cancelled'`, `'refunded'`)
- If hard delete is needed in the future, CASCADE handles cleanup

## Migration Guide

### Step 1: Push Schema Changes

Already completed:
```bash
pnpm db:push
```

Created `order_item` table with proper foreign keys.

### Step 2: Create Database Indexes

Already completed:
```bash
pnpm tsx scripts/create-analytics-indexes.ts
```

Created 10 indexes including:
- `idx_order_item_order_id` - Fast order joins
- `idx_order_item_product_id` - Fast product joins
- `idx_order_item_created_at` - Time-based queries

### Step 3: Migrate Existing Orders (PENDING)

Run when ready with production data:
```bash
pnpm tsx scripts/migrate-order-items.ts
```

This script:
1. Reads all existing orders
2. Parses JSON `items` field
3. Creates `order_item` records for each item
4. Shows progress and error handling
5. Verifies migration success

**Important:** Run this ONCE after deploying the new schema.

### Step 4: Deploy Application Code

Order creation now automatically creates order_item records. No manual intervention needed for new orders.

## Data Flow

### New Order Flow

```
Customer Checkout
     ↓
1. Create order record (order table)
     ↓
2. Create order_item records (order_item table)
     ↓
3. Update inventory
     ↓
4. Clear cart
     ↓
5. Redirect to confirmation/payment
```

### Analytics Query Flow

```
Analytics Request
     ↓
1. Query order_item table with SQL joins
     ↓
2. JOIN with product table (for current info)
     ↓
3. JOIN with order table (for status filter)
     ↓
4. Aggregate with SUM/COUNT (database-level)
     ↓
5. Return sorted, limited results
```

**Before (JSON parsing):**
```typescript
// Slow: Load all orders, parse JSON, aggregate in memory
const orders = await db.select().from(tables.order);
// ~500-2000ms for 10K orders
```

**After (SQL joins):**
```typescript
// Fast: Database aggregation with indexes
SELECT p.id, SUM(oi.quantity) as total_sold
FROM order_item oi
JOIN product p ON oi.product_id = p.id
WHERE o.status NOT IN ('cancelled', 'refunded')
// ~10-50ms for 10K orders
```

## Analytics Integration

### Top Products Query

```sql
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.images,
  SUM(oi.quantity) as total_sold,
  SUM(oi.subtotal) as total_revenue
FROM order_item oi
JOIN product p ON oi.product_id = p.id
JOIN "order" o ON oi.order_id = o.id
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY p.id, p.name, p.slug, p.price, p.images
ORDER BY total_sold DESC
LIMIT 5
```

### Top Categories Query

```sql
SELECT 
  c.id,
  c.name,
  c.slug,
  COUNT(DISTINCT p.id) as product_count,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(SUM(oi.subtotal), 0) as total_revenue
FROM category c
JOIN product p ON p.category_id = c.id
LEFT JOIN order_item oi ON oi.product_id = p.id
LEFT JOIN "order" o ON oi.order_id = o.id 
  AND o.status NOT IN ('cancelled', 'refunded')
WHERE c.is_visible = 1
GROUP BY c.id, c.name, c.slug
ORDER BY total_sold DESC
LIMIT 5
```

## Testing Checklist

### Order Creation
- [ ] Create new order via checkout
- [ ] Verify order record created in `order` table
- [ ] Verify order_item records created in `order_item` table
- [ ] Verify order_item count matches cart items count
- [ ] Verify product details captured correctly

### Order Cancellation
- [ ] Cancel an order
- [ ] Verify order status changed to 'cancelled'
- [ ] Verify order record still exists (not deleted)
- [ ] Verify order_item records still exist
- [ ] Verify inventory restored correctly

### Analytics
- [ ] Visit `/admin/analytics`
- [ ] Verify Top Products widget loads
- [ ] Verify Top Categories widget loads
- [ ] Verify cancelled orders excluded from analytics
- [ ] Check query performance (should be <100ms)

### Migration (When Run)
- [ ] Run migration script on test data
- [ ] Verify all orders migrated
- [ ] Verify item counts match JSON items
- [ ] Verify no duplicate order_items
- [ ] Verify analytics queries work correctly

## Troubleshooting

### Issue: Duplicate order_item records

**Symptom:** Multiple order_item records with same order_id and product_id

**Cause:** Migration script run multiple times

**Fix:**
```sql
-- Check for duplicates
SELECT order_id, product_id, COUNT(*) 
FROM order_item 
GROUP BY order_id, product_id 
HAVING COUNT(*) > 1;

-- Delete all order_items and re-run migration
DELETE FROM order_item;
-- Then run: pnpm tsx scripts/migrate-order-items.ts
```

### Issue: Analytics showing zero sales

**Symptom:** Top Products/Categories show "No data available"

**Cause:** order_item table is empty

**Fix:**
```bash
# Run migration to populate order_item table
pnpm tsx scripts/migrate-order-items.ts
```

### Issue: Foreign key constraint error

**Symptom:** Error creating order_item: "FOREIGN KEY constraint failed"

**Cause:** Product or order deleted before order_item created

**Fix:**
```typescript
// Verify product exists before creating order
const [product] = await db.select()
  .from(tables.product)
  .where(eq(tables.product.id, item.productId));

if (!product) {
  throw new Error(`Product ${item.productId} not found`);
}
```

## Future Enhancements

### 1. Soft Delete with Timestamps
Add deleted_at column to order table:
```typescript
deletedAt: integer('deleted_at', { mode: 'timestamp' })
```

Filter queries:
```sql
WHERE deleted_at IS NULL
```

### 2. Order Item Refunds
Add refund tracking to order_item:
```typescript
refundedQuantity: integer('refunded_quantity').notNull().default(0),
refundedAmount: integer('refunded_amount').notNull().default(0)
```

### 3. Bulk Order Operations
Add admin endpoint to bulk delete/archive old orders:
```typescript
export const bulkArchiveOrders = form(schema, async (data) => {
  // Archive orders older than N days
  // CASCADE will handle order_item cleanup
});
```

## Related Documentation

- [Analytics System](./ANALYTICS.md) - Full analytics documentation
- [Database Schema](../src/lib/server/db/schema.ts) - Complete schema definitions
- [Order Remote Functions](../src/lib/remotes/order.remote.ts) - Order management API

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0
