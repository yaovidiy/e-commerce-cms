# Analytics System Documentation

## Overview

The analytics system provides comprehensive business intelligence for the e-commerce platform. Built with SvelteKit remote functions and SQLite aggregations, it offers real-time insights into revenue, orders, products, and customer behavior.

**Key Features:**
- 📊 30-day revenue tracking with trend analysis
- 📈 Order volume metrics with period comparison
- 🏆 Top-performing products and categories
- 👥 Customer engagement tracking
- 🎨 Interactive dashboard with visual charts
- 🌍 Multi-language support (English, Ukrainian)

---

## Architecture

### Remote Functions (`src/lib/remotes/analytics.remote.ts`)

All analytics data is fetched server-side using SvelteKit's `query()` remote functions. This ensures:
- Secure database access (no client-side DB queries)
- Type-safe data contracts
- Authentication/authorization enforcement
- Performance optimization via server-side aggregations

#### Authentication

All analytics functions require admin privileges:
```typescript
import { requireAdminUser } from '$lib/server/auth';

export const getDashboardStats = query(async () => {
  requireAdminUser(); // Throws error and redirects if not admin
  // ... query logic
});
```

---

## Remote Functions API

### 1. getDashboardStats()

**Purpose:** Returns key metrics for the last 30 days compared to the previous 30 days.

**Signature:**
```typescript
getDashboardStats(): Promise<{
  revenue: { value: number; change: number; trend: 'up' | 'down' };
  orders: { value: number; change: number; trend: 'up' | 'down' };
  products: { value: number };
  customers: { value: number };
}>
```

**Returns:**
- `revenue.value` - Total revenue in cents (excludes cancelled/refunded orders)
- `revenue.change` - Percentage change vs previous 30 days
- `revenue.trend` - 'up' or 'down' based on change direction
- `orders.value` - Total order count (excludes cancelled/refunded)
- `orders.change` - Percentage change vs previous 30 days
- `orders.trend` - 'up' or 'down'
- `products.value` - Count of active products (status = 'active')
- `customers.value` - Count of unique customer emails

**Usage:**
```svelte
<script lang="ts">
  import { getDashboardStats } from '$lib/remotes/analytics.remote';
</script>

{#await getDashboardStats() then stats}
  <StatCard
    title="Total Revenue"
    value={stats.revenue.value}
    change={stats.revenue.change}
    trend={stats.revenue.trend}
    formatValue={(v) => formatCurrency(Number(v))}
  />
{/await}
```

**Implementation Details:**
- **Current Period:** `WHERE createdAt >= date('now', '-30 days')`
- **Previous Period:** `WHERE createdAt >= date('now', '-60 days') AND createdAt < date('now', '-30 days')`
- **Order Filtering:** Excludes orders with status 'cancelled' or 'refunded'
- **Change Calculation:** `((current - previous) / previous) * 100`
- **Trend Logic:** 'up' if change > 0, 'down' if change < 0

---

### 2. getRevenueChart()

**Purpose:** Returns daily revenue and order count for the last 30 days.

**Signature:**
```typescript
getRevenueChart(): Promise<Array<{
  date: string;        // Format: 'YYYY-MM-DD'
  revenue: number;     // Total revenue in cents for that day
  orders: number;      // Order count for that day
}>>
```

**Returns:** Array of 30 objects, one per day (may have gaps if no orders on certain days).

**Usage:**
```svelte
<script lang="ts">
  import { getRevenueChart } from '$lib/remotes/analytics.remote';
</script>

{#await getRevenueChart() then data}
  <RevenueChart data={data} />
{/await}
```

**Implementation Details:**
- **Raw SQL Query:** Uses `DATE(createdAt / 1000, 'unixepoch')` for grouping
- **Aggregations:** `SUM(total)` for revenue, `COUNT(*)` for order count
- **Filtering:** Excludes cancelled/refunded orders
- **Date Range:** Last 30 days from today
- **Sorting:** Ordered by date ASC

**SQL Query:**
```sql
SELECT 
  DATE(createdAt / 1000, 'unixepoch') as date,
  SUM(total) as revenue,
  COUNT(*) as orders
FROM "order"
WHERE 
  createdAt >= strftime('%s', date('now', '-30 days')) * 1000
  AND status NOT IN ('cancelled', 'refunded')
GROUP BY date
ORDER BY date ASC
```

---

### 3. getTopProducts({ limit = 5 })

**Purpose:** Returns best-selling products ranked by units sold.

**Signature:**
```typescript
getTopProducts({ limit?: number }): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  price: number;       // Price in cents
  images: string[];    // Array of asset IDs
  total_sold: number;  // Total units sold
  total_revenue: number; // Total revenue in cents
}>>
```

**Parameters:**
- `limit` (optional) - Number of results to return (default: 5)

**Returns:** Array of products ordered by `total_sold` DESC.

**Usage:**
```svelte
<script lang="ts">
  import { getTopProducts } from '$lib/remotes/analytics.remote';
</script>

{#await getTopProducts({ limit: 10 }) then products}
  <TopProducts data={products} />
{/await}
```

**Implementation Details:**
- **Joins:** `order_item` → `product` → `order`
- **Aggregations:**
  - `total_sold` - `SUM(order_item.quantity)`
  - `total_revenue` - `SUM(order_item.quantity * order_item.price)`
- **Filtering:** Excludes cancelled/refunded orders
- **Grouping:** By product (id, name, slug, price, images)
- **Sorting:** By `total_sold` DESC
- **Limit:** Specified by parameter (default 5)

---

### 4. getTopCategories({ limit = 5 })

**Purpose:** Returns top-performing categories ranked by total units sold.

**Signature:**
```typescript
getTopCategories({ limit?: number }): Promise<Array<{
  id: string;
  name: string;
  slug: string;
  product_count: number;   // Number of products in category
  total_sold: number;      // Total units sold across all products
  total_revenue: number;   // Total revenue in cents
}>>
```

**Parameters:**
- `limit` (optional) - Number of results to return (default: 5)

**Returns:** Array of categories ordered by `total_sold` DESC.

**Usage:**
```svelte
<script lang="ts">
  import { getTopCategories } from '$lib/remotes/analytics.remote';
</script>

{#await getTopCategories() then categories}
  <TopCategories data={categories} />
{/await}
```

**Implementation Details:**
- **Joins:** `category` → `product` → `order_item` → `order`
- **Aggregations:**
  - `product_count` - `COUNT(DISTINCT product.id)`
  - `total_sold` - `SUM(order_item.quantity)`
  - `total_revenue` - `SUM(order_item.quantity * order_item.price)`
- **Filtering:**
  - Only visible categories (`category.is_visible = 1`)
  - Excludes cancelled/refunded orders
- **Grouping:** By category (id, name, slug)
- **Sorting:** By `total_sold` DESC
- **Limit:** Specified by parameter (default 5)

---

### 5. getRecentOrders({ limit = 10 })

**Purpose:** Returns most recent orders with customer information.

**Signature:**
```typescript
getRecentOrders({ limit?: number }): Promise<Array<{
  id: string;
  orderNumber: string;
  total: number;           // Total in cents
  status: string;          // Order status
  customerName: string;    // firstName + lastName
  email: string;           // customerEmail
  createdAt: Date;         // Order creation timestamp
}>>
```

**Parameters:**
- `limit` (optional) - Number of results to return (default: 10)

**Returns:** Array of orders ordered by `createdAt` DESC.

**Usage:**
```svelte
<script lang="ts">
  import { getRecentOrders } from '$lib/remotes/analytics.remote';
</script>

{#await getRecentOrders({ limit: 20 }) then orders}
  <RecentOrders data={orders} />
{/await}
```

**Implementation Details:**
- **Concatenation:** `customerFirstName || ' ' || customerLastName as customerName`
- **Sorting:** By `createdAt` DESC
- **Limit:** Specified by parameter (default 10)
- **No Filtering:** Includes all order statuses

---

### 6. getOrderStatusDistribution()

**Purpose:** Returns count of orders grouped by status.

**Signature:**
```typescript
getOrderStatusDistribution(): Promise<Array<{
  status: string;
  count: number;
}>>
```

**Returns:** Array of status/count pairs.

**Usage:**
```svelte
<script lang="ts">
  import { getOrderStatusDistribution } from '$lib/remotes/analytics.remote';
</script>

{#await getOrderStatusDistribution() then distribution}
  {#each distribution as { status, count }}
    <Badge>{status}: {count}</Badge>
  {/each}
{/await}
```

**Implementation Details:**
- **Grouping:** By order status
- **Aggregation:** `COUNT(*)`
- **No Filtering:** Includes all orders
- **Ordering:** By count DESC (most common status first)

---

## Widget Components

### StatCard (`src/lib/components/admin/widgets/stat-card.svelte`)

**Purpose:** Displays a single metric with icon, value, change percentage, and trend indicator.

**Props:**
```typescript
{
  title: string;                            // Metric name
  value: number | string;                   // Main metric value
  change?: number;                          // Percentage change (optional)
  trend?: 'up' | 'down';                    // Trend direction (optional)
  icon?: Component<any>;                    // Lucide icon component (optional)
  formatValue?: (v: number | string) => string; // Custom formatter (optional)
}
```

**Features:**
- Icon in rounded circle with primary/10 background
- Large value display (text-3xl, font-bold)
- Trend badge with color coding (green for up, red for down)
- TrendingUp/TrendingDown arrow icons
- Percentage display (absolute value)

**Usage:**
```svelte
<script lang="ts">
  import { DollarSign } from '@lucide/svelte/icons';
  import { StatCard } from '$lib/components/admin/widgets';
  
  const stats = await getDashboardStats();
</script>

<StatCard
  title="Total Revenue"
  value={stats.revenue.value}
  change={stats.revenue.change}
  trend={stats.revenue.trend as 'up' | 'down'}
  icon={DollarSign}
  formatValue={(v) => formatCurrency(Number(v))}
/>
```

---

### RevenueChart (`src/lib/components/admin/widgets/revenue-chart.svelte`)

**Purpose:** Visualizes 30-day revenue with bar chart and summary statistics.

**Props:**
```typescript
{
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}
```

**Features:**
- Height-scaled bars (h-48 container)
- Hover tooltips with formatted currency and order count
- X-axis labels (every 7th date to prevent crowding)
- Summary stats: Total revenue, total orders, average order value
- Empty state for no data
- Responsive flex layout

**Usage:**
```svelte
<script lang="ts">
  import { RevenueChart } from '$lib/components/admin/widgets';
  
  const chartData = await getRevenueChart();
</script>

<RevenueChart data={chartData} />
```

**Implementation Details:**
- **Bar Height:** `height: (revenue / maxRevenue) * 100%`
- **Currency Conversion:** Divides by 100 (cents to dollars)
- **Average Order:** `totalRevenue / totalOrders`
- **Date Formatting:** Shows every 7th label to avoid crowding

---

### TopProducts (`src/lib/components/admin/widgets/top-products.svelte`)

**Purpose:** Displays ranked list of best-selling products.

**Props:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    total_sold: number;
    total_revenue: number;
  }>;
}
```

**Features:**
- Rank numbers (#1, #2, #3, etc.) in large muted text
- Product images (12x12, rounded) or Package icon fallback
- Product name (truncated with ellipsis)
- Units sold count with translation
- Total revenue and unit price display
- Empty state messaging

**Usage:**
```svelte
<script lang="ts">
  import { TopProducts } from '$lib/components/admin/widgets';
  
  const products = await getTopProducts();
</script>

<TopProducts data={products} />
```

---

### TopCategories (`src/lib/components/admin/widgets/top-categories.svelte`)

**Purpose:** Displays ranked list of top-performing categories.

**Props:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    slug: string;
    product_count: number;
    total_sold: number;
    total_revenue: number;
  }>;
}
```

**Features:**
- Rank numbers
- FolderOpen icon in primary/10 background
- Category name (truncated)
- Product count and units sold
- Total revenue display
- Empty state messaging

**Usage:**
```svelte
<script lang="ts">
  import { TopCategories } from '$lib/components/admin/widgets';
  
  const categories = await getTopCategories();
</script>

<TopCategories data={categories} />
```

---

### RecentOrders (`src/lib/components/admin/widgets/recent-orders.svelte`)

**Purpose:** Displays list of recent orders with status badges.

**Props:**
```typescript
{
  data: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    customerName: string;
    email: string;
    createdAt: Date;
  }>;
}
```

**Features:**
- Order number with status badge
- Customer name and email
- Formatted date/time (MMM DD, HH:MM)
- Total amount in large font
- Status badge colors:
  - `delivered`: default (primary)
  - `shipped`: secondary
  - `processing`: outline
  - `cancelled` / `refunded`: destructive (red)
- "View All" button linking to `/admin/orders`
- Empty state messaging

**Usage:**
```svelte
<script lang="ts">
  import { RecentOrders } from '$lib/components/admin/widgets';
  
  const orders = await getRecentOrders();
</script>

<RecentOrders data={orders} />
```

---

## Dashboard Page (`/admin/analytics`)

### Layout Structure

The analytics dashboard uses a responsive grid layout with 4 main sections:

1. **Stats Grid** (4-column responsive grid)
   - Revenue (with trend)
   - Orders (with trend)
   - Active Products
   - Total Customers

2. **Revenue Chart** (full-width)
   - 30-day revenue bar chart
   - Summary statistics

3. **Products/Categories Grid** (2-column responsive grid)
   - Top Products (left)
   - Top Categories (right)

4. **Recent Orders** (full-width)
   - Last 10 orders with status badges

### Responsive Breakpoints

```css
/* Mobile: 1 column */
grid-cols-1

/* Tablet: 2 columns */
sm:grid-cols-2

/* Desktop: 4 columns */
lg:grid-cols-4
```

### Loading States

Each widget shows a loading skeleton while fetching data:
```svelte
{#await getDashboardStats()}
  <div class="h-32 bg-muted animate-pulse rounded-lg"></div>
{:then stats}
  <StatCard {...stats.revenue} />
{:catch error}
  <div class="p-6 border border-destructive rounded-lg bg-destructive/10">
    <p class="text-destructive">Error: {error.message}</p>
  </div>
{/await}
```

### Error Handling

Each widget has independent error boundaries. If one widget fails, others continue to function:
```svelte
{#await getRevenueChart()}
  <!-- Loading -->
{:then data}
  <!-- Success -->
{:catch error}
  <!-- Error boundary - only affects this widget -->
  <div class="error-state">{error.message}</div>
{/await}
```

---

## Translations

### English Keys (`messages/en.json`)

```json
{
  "analytics": "Analytics",
  "analytics_dashboard": "Analytics Dashboard",
  "total_revenue": "Total Revenue",
  "total_orders": "Total Orders",
  "active_products": "Active Products",
  "total_customers": "Total Customers",
  "revenue_over_time": "Revenue Over Time",
  "top_products": "Top Products",
  "top_categories": "Top Categories",
  "recent_orders": "Recent Orders",
  "units_sold": "units sold",
  "sold": "sold",
  "no_sales_data": "No sales data available",
  "no_category_data": "No category data available",
  "no_orders_yet": "No orders yet",
  "no_data_available": "No data available",
  "view_all": "View All",
  "average_order": "Average Order",
  "error_loading_stats": "Error loading stats",
  "error_loading_chart": "Error loading chart",
  "error_loading_products": "Error loading products",
  "error_loading_categories": "Error loading categories",
  "error_loading_orders": "Error loading orders",
  "orders": "orders",
  "products": "products"
}
```

### Ukrainian Keys (`messages/uk.json`)

```json
{
  "analytics": "Аналітика",
  "analytics_dashboard": "Панель аналітики",
  "total_revenue": "Загальний дохід",
  "total_orders": "Всього замовлень",
  "active_products": "Активні товари",
  "total_customers": "Всього клієнтів",
  "revenue_over_time": "Дохід за періодом",
  "top_products": "Топ товари",
  "top_categories": "Топ категорії",
  "recent_orders": "Останні замовлення",
  "units_sold": "одиниць продано",
  "sold": "продано",
  "no_sales_data": "Немає даних про продажі",
  "no_category_data": "Немає даних про категорії",
  "no_orders_yet": "Ще немає замовлень",
  "no_data_available": "Немає даних",
  "view_all": "Переглянути всі",
  "average_order": "Середнє замовлення",
  "error_loading_stats": "Помилка завантаження статистики",
  "error_loading_chart": "Помилка завантаження графіка",
  "error_loading_products": "Помилка завантаження товарів",
  "error_loading_categories": "Помилка завантаження категорій",
  "error_loading_orders": "Помилка завантаження замовлень",
  "orders": "замовлень",
  "products": "товари"
}
```

---

## Customization Guide

### Adding New Metrics

**Step 1:** Create remote function in `analytics.remote.ts`
```typescript
export const getNewMetric = query(async () => {
  requireAdminUser();
  
  const result = await db.select()
    .from(tables.yourTable)
    .where(/* conditions */);
  
  return result;
});
```

**Step 2:** Create widget component
```svelte
<!-- src/lib/components/admin/widgets/new-metric.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<Card>
  <CardHeader>
    <CardTitle>New Metric</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Render data -->
  </CardContent>
</Card>
```

**Step 3:** Add to dashboard page
```svelte
<div class="grid grid-cols-1 gap-6">
  {#await getNewMetric()}
    <div class="h-64 bg-muted animate-pulse rounded-lg"></div>
  {:then data}
    <NewMetric data={data} />
  {:catch error}
    <div class="error-state">{error.message}</div>
  {/await}
</div>
```

### Changing Time Windows

The default 30-day window can be adjusted in `analytics.remote.ts`:

**Before:**
```typescript
const currentStart = sql`date('now', '-30 days')`;
const previousStart = sql`date('now', '-60 days')`;
const previousEnd = sql`date('now', '-30 days')`;
```

**After (60-day window):**
```typescript
const currentStart = sql`date('now', '-60 days')`;
const previousStart = sql`date('now', '-120 days')`;
const previousEnd = sql`date('now', '-60 days')`;
```

### Customizing Chart Colors

**RevenueChart colors** are in Tailwind classes:
```svelte
<div class="bg-primary/20 hover:bg-primary/30">
  <!-- Bar -->
</div>
```

**StatCard trend colors:**
```svelte
<Badge variant={trend === 'up' ? 'default' : 'destructive'}>
  <!-- Green for up, red for down -->
</Badge>
```

---

## Performance Considerations

### Database Architecture

The analytics system uses a dedicated `order_item` table for optimal query performance:

**Table Structure:**
```sql
CREATE TABLE order_item (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES product(id),
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_image TEXT,
  price INTEGER NOT NULL,        -- Price at time of order (cents)
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,     -- price * quantity (cents)
  created_at INTEGER NOT NULL
);
```

**Why a Separate Table?**
- ✅ **Fast SQL Joins** - Direct table joins instead of JSON parsing
- ✅ **Efficient Aggregations** - `SUM()`, `COUNT()` operations at database level
- ✅ **Indexable Columns** - Product/order lookups use indexes
- ✅ **Better Performance** - ~10-100x faster for large datasets

### Database Indexes

All required indexes are automatically created via the setup script:

```bash
pnpm tsx scripts/create-analytics-indexes.ts
```

**Created Indexes:**
```sql
-- Order table
CREATE INDEX idx_order_created_at ON "order"(created_at);
CREATE INDEX idx_order_status ON "order"(status);
CREATE INDEX idx_order_status_created_at ON "order"(status, created_at);
CREATE INDEX idx_order_customer_email ON "order"(customer_email);

-- Order item table
CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_product_id ON order_item(product_id);
CREATE INDEX idx_order_item_created_at ON order_item(created_at);

-- Product table
CREATE INDEX idx_product_status ON product(status);
CREATE INDEX idx_product_category_id ON product(category_id);

-- Category table
CREATE INDEX idx_category_is_visible ON category(is_visible);
```

### Data Migration

To populate the `order_item` table from existing orders:

```bash
pnpm tsx scripts/migrate-order-items.ts
```

This script:
1. Reads all orders from the database
2. Parses the JSON `items` field
3. Creates individual `order_item` records
4. Preserves historical pricing and product info

**Note:** Run this once after deploying the new schema.

### Caching Strategy

The analytics system implements in-memory caching for dashboard stats:

**Cache Configuration:**
```typescript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface DashboardStats {
  revenue: { value: number; change: number; trend: 'up' | 'down' };
  orders: { value: number; change: number; trend: 'up' | 'down' };
  products: { value: number };
  customers: { value: number };
}

let dashboardStatsCache: {
  data: DashboardStats;
  timestamp: number;
} | null = null;
```

**How It Works:**
1. First request calculates stats from database (~50-200ms)
2. Result cached in memory with timestamp
3. Subsequent requests within 5 minutes return cached data (~1-5ms)
4. Cache expires after TTL, next request refreshes

**Cache Invalidation:**
- Automatic: 5 minute TTL
- Manual: Restart server or modify cache TTL
- Future: Add cache-busting endpoint for real-time updates

### Performance Benchmarks

**Before (JSON parsing in memory):**
- `getTopProducts()`: ~500-2000ms (10K orders)
- `getTopCategories()`: ~800-3000ms (10K orders)
- Memory usage: High (entire dataset loaded)

**After (SQL with order_item table):**
- `getTopProducts()`: ~10-50ms (10K orders)
- `getTopCategories()`: ~15-60ms (10K orders)
- Memory usage: Low (only results loaded)

**Cache Performance:**
- First load: ~150ms (aggregates 4 queries)
- Cached load: ~2ms (memory read)
- Hit rate: ~95% (5 minute TTL)

### Query Optimization

**Use SQL aggregations** instead of fetching all rows and calculating client-side:

❌ **Bad:**
```typescript
const orders = await db.select().from(tables.order);
const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
```

✅ **Good:**
```typescript
const [result] = await db.select({
  totalRevenue: sql<number>`SUM(total)`
}).from(tables.order);
```

---

## Testing

### Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] All 4 stat cards display correct values
- [ ] Revenue and orders show trend indicators
- [ ] Revenue chart renders 30 days of data
- [ ] Chart bars scale correctly based on maxRevenue
- [ ] Hover tooltips show formatted currency
- [ ] Top products widget shows up to 5 items
- [ ] Product images load or fallback to Package icon
- [ ] Top categories widget shows up to 5 items
- [ ] Recent orders widget shows up to 10 items
- [ ] Order status badges use correct colors
- [ ] "View All" button navigates to /admin/orders
- [ ] Empty states display when no data
- [ ] Error boundaries catch and display errors
- [ ] Loading skeletons appear during fetch
- [ ] Analytics menu item in sidebar is highlighted
- [ ] Translations work in both English and Ukrainian
- [ ] Non-admin users are redirected to login
- [ ] Dashboard is responsive on mobile/tablet/desktop

### E2E Test Example (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });
  
  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Wait for stats to load
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Active Products')).toBeVisible();
    await expect(page.locator('text=Total Customers')).toBeVisible();
  });
  
  test('should render revenue chart', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    await expect(page.locator('text=Revenue Over Time')).toBeVisible();
    
    // Check for chart bars
    const bars = page.locator('.revenue-bar');
    await expect(bars).toHaveCountGreaterThan(0);
  });
  
  test('should show top products', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    await expect(page.locator('text=Top Products')).toBeVisible();
    
    // Check for product list items
    const products = page.locator('.product-item');
    await expect(products).toHaveCountGreaterThanOrEqual(1);
  });
});
```

---

## Troubleshooting

### Dashboard Shows Zero Revenue

**Possible Causes:**
1. No orders in the last 30 days
2. All orders are cancelled/refunded
3. Order `createdAt` timestamps incorrect

**Solution:**
```sql
-- Check recent orders
SELECT * FROM "order" 
WHERE createdAt >= strftime('%s', date('now', '-30 days')) * 1000
LIMIT 10;

-- Check order statuses
SELECT status, COUNT(*) 
FROM "order" 
GROUP BY status;
```

### Chart Not Rendering

**Possible Causes:**
1. No data returned from `getRevenueChart()`
2. All revenue values are 0
3. TypeScript errors in component

**Solution:**
```svelte
<!-- Add debug logging -->
{#await getRevenueChart()}
  Loading...
{:then data}
  <pre>{JSON.stringify(data, null, 2)}</pre>
  <RevenueChart data={data} />
{:catch error}
  Error: {error.message}
{/await}
```

### "Unauthorized" Error

**Cause:** User is not logged in as admin.

**Solution:**
```typescript
// Check user role in browser console
const user = await getCurrentUser();
console.log('User:', user);
console.log('Is Admin:', user?.isAdmin);
```

### Slow Dashboard Load

**Causes:**
1. Missing database indexes
2. Large dataset without pagination
3. No query optimization

**Solutions:**
1. Add indexes (see Performance Considerations)
2. Limit result sets (`LIMIT 10`)
3. Use SQL aggregations instead of client-side calculations

---

## Future Enhancements

### Phase 1: Advanced Analytics
- [ ] Custom date range picker
- [ ] Export to CSV/PDF
- [ ] Scheduled email reports
- [ ] Real-time updates with WebSockets
- [ ] Cohort analysis
- [ ] Customer lifetime value (CLV)

### Phase 2: Visual Enhancements
- [ ] Interactive charts with Chart.js or D3
- [ ] Drill-down capabilities
- [ ] Comparison modes (YoY, MoM)
- [ ] Sparklines for quick insights
- [ ] Heatmaps for product performance

### Phase 3: Predictive Analytics
- [ ] Sales forecasting
- [ ] Inventory predictions
- [ ] Churn prediction
- [ ] Recommendation engine metrics
- [ ] A/B testing results

---

## Related Documentation

- [Remote Functions Documentation](https://svelte.dev/docs/kit/remote-functions)
- [Component Architecture](./COMPONENTS_STRUCTURE.md)
- [Database Schema](../src/lib/server/db/schema.ts)
- [Authentication System](./AUTHENTICATION.md)
- [MVP Features Checklist](./MVP_FEATURES.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
