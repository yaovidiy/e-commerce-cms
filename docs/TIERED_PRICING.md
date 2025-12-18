# Tiered Pricing & Unit Pricing System

## Overview

The e-commerce CMS now supports advanced pricing strategies:
1. **Unit Pricing** - Specify how products are priced (per unit, per 100g, per kg, per liter, per ml)
2. **Tiered Pricing** - Set different prices based on quantity purchased (e.g., buy 5+ at a discount)

## Database Schema

### Product Table Updates
```sql
ALTER TABLE product ADD price_unit TEXT DEFAULT 'unit' NOT NULL;
ALTER TABLE product ADD weight INTEGER; -- weight in grams for weight-based units
ALTER TABLE product ADD has_multiple_prices INTEGER DEFAULT FALSE NOT NULL;
```

### New Product Tier Table
```sql
CREATE TABLE product_tier (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,  -- minimum quantity for this tier
  price INTEGER NOT NULL,          -- price in cents for this tier
  created_at INTEGER NOT NULL
);
```

## API & Remote Functions

### Query Functions

#### `getProductTiers(productId)`
Returns all price tiers for a product, sorted by minimum quantity ascending.

**Example:**
```typescript
const tiers = await getProductTiers({ productId: 'prod-123' });
// Returns: [
//   { id, productId, minQuantity: 1, price: 1500, createdAt },
//   { id, productId, minQuantity: 5, price: 1350, createdAt },
//   { id, productId, minQuantity: 10, price: 1200, createdAt }
// ]
```

### Form Functions (Mutations)

#### `createProductTier(data)`
Adds a new price tier to a product. Automatically marks product as `hasMultiplePrices = true`.

**Parameters:**
- `productId` - Product ID (string)
- `minQuantity` - Minimum quantity for this tier (number, >= 1)
- `price` - Price in cents (number, >= 0)

**Example:**
```typescript
await createProductTier({
  productId: 'prod-123',
  minQuantity: 5,
  price: 1350  // 13.50 in currency
});
```

#### `updateProductTier(data)`
Updates an existing price tier.

**Parameters:**
- `id` - Tier ID (required, string)
- `minQuantity` - New minimum quantity (optional)
- `price` - New price in cents (optional)

#### `deleteProductTier(data)`
Removes a price tier. If no tiers remain, sets `hasMultiplePrices = false`.

**Parameters:**
- `id` - Tier ID to delete

## Price Unit Types

| Unit | Description | Use Case |
|------|-------------|----------|
| `unit` | Per single unit (default) | Physical products sold individually |
| `per_100g` | Per 100 grams | Bulk goods, spices, flour |
| `per_kg` | Per kilogram | Produce, large quantities |
| `per_liter` | Per liter | Liquids, oils, beverages |
| `per_ml` | Per milliliter | Small liquid quantities |

## UI Components

### Product Tier Manager Component
Located at: `src/lib/components/admin/features/product-management/product-tier-manager.svelte`

**Props:**
- `productId` (string, required) - The product ID to manage tiers for

**Features:**
- Display all price tiers in a table
- Create new tiers with form validation
- Edit existing tiers
- Delete tiers with confirmation
- Automatic sorting by minimum quantity

**Example Usage:**
```svelte
<ProductTierManager productId="prod-123" />
```

## Admin Interface

### Product Edit Page
The product edit page (`/admin/products/[id]/edit`) now includes:

1. **Price Unit Configuration Card**
   - Select price unit (unit, per_100g, per_kg, per_liter, per_ml)
   - Enter weight/size in grams (for weight-based units)

2. **Tiered Pricing Card**
   - View all existing price tiers
   - Add new tiers (requires minimum quantity and price)
   - Edit tier details
   - Delete tiers with confirmation

### Form Fields
- `priceUnit` - Selects price measurement unit
- `weight` - Weight/size in grams (optional, for weight-based units)

## Pricing Calculation

### Utility Functions
Located in: `src/lib/server/pricing.ts`

#### `calculateUnitPrice(basePrice, quantity, tiers)`
Determines the unit price based on quantity and available tiers.

**Algorithm:**
1. Sort tiers by minimum quantity (descending)
2. Find first tier where `quantity >= minQuantity`
3. Return that tier's price, or base price if no tier matches

**Example:**
```typescript
const basePrice = 1500; // 15.00
const quantity = 7;
const tiers = [
  { minQuantity: 1, price: 1500 },
  { minQuantity: 5, price: 1350 },
  { minQuantity: 10, price: 1200 }
];

const unitPrice = calculateUnitPrice(basePrice, quantity, tiers);
// Returns 1350 (matches tier with minQuantity: 5)
```

#### `calculateTotalPrice(basePrice, quantity, tiers)`
Calculates total price for a given quantity.

```typescript
const totalPrice = calculateTotalPrice(basePrice, quantity, tiers);
// Returns 1350 * 7 = 9450 (94.50 in currency)
```

#### `formatPriceUnit(unit)`
Converts unit code to display text.

```typescript
formatPriceUnit('per_100g'); // Returns "per 100g"
```

#### `formatWeight(weight, unit)`
Formats weight display based on unit type.

```typescript
formatWeight(100, 'per_100g'); // Returns "100g"
formatWeight(500, 'per_kg');   // Returns "0.5kg"
```

## Translations

### English Messages (`messages/en.json`)
```json
"product_price_unit": "Price Unit",
"product_price_unit_help": "Specify how the price is measured",
"product_price_unit_per_unit": "Per Unit",
"product_price_unit_per_100g": "Per 100g",
"product_price_unit_per_kg": "Per kg",
"product_price_unit_per_liter": "Per Liter",
"product_price_unit_per_ml": "Per ml",
"product_weight": "Weight/Size",
"product_weight_help": "Enter weight in grams (for weight-based pricing)",
"product_tiered_pricing": "Tiered Pricing",
"product_enable_tiered_pricing": "Enable Quantity-Based Pricing",
"product_enable_tiered_pricing_help": "Set different prices for different quantities",
"product_tiers": "Price Tiers",
"product_no_tiers": "No price tiers added yet",
"product_add_tier": "Add Price Tier",
"product_tier_min_quantity": "Minimum Quantity",
"product_tier_price": "Price (in cents)",
"product_tier_price_help": "Price per unit for this quantity tier",
"product_tier_delete": "Delete Tier",
"product_tier_delete_confirmation": "Are you sure you want to delete this price tier?"
```

### Ukrainian Messages (`messages/uk.json`)
All messages are translated to Ukrainian with appropriate context.

## Integration with Cart/Orders

### Next Steps
The following needs to be implemented to fully integrate tiered pricing:

1. **Cart Calculation** - Update cart logic to apply tiered pricing
2. **Order Items** - Apply tier price when creating order items
3. **Display** - Show applicable discounts in cart/checkout
4. **Checkout** - Calculate final totals with tier pricing

## Example Workflow

### Setting Up a Tiered Product

1. Navigate to `/admin/products/[id]/edit`
2. Scroll to "Price Unit Configuration"
3. Select "Per Unit" (or appropriate unit)
4. Scroll to "Tiered Pricing"
5. Add tiers:
   - 1 unit @ 100.00 grn (1000 cents)
   - 5+ units @ 90.00 grn (900 cents)
   - 10+ units @ 80.00 grn (800 cents)
6. Save product

### Price Lookup

When a customer adds 7 units to cart:
- System finds tier with minQuantity: 5
- Unit price becomes 900 cents (9.00 grn)
- Total: 7 × 900 = 6300 cents (63.00 grn)

## Schema Inference

### Product Type
```typescript
export type Product = typeof product.$inferSelect;
// Includes: priceUnit, weight, hasMultiplePrices
```

### ProductTier Type
```typescript
export type ProductTier = typeof productTier.$inferSelect;
export type InsertProductTier = typeof productTier.$inferInsert;
```

## Error Handling

### Validation
- Minimum quantity must be >= 1
- Price must be >= 0
- Cannot create duplicate minimum quantities for same product
- Deleting last tier automatically sets `hasMultiplePrices = false`

### Authorization
- All tier operations require admin authentication
- Uses `auth.requireAdminUser()` for access control
