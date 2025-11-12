# Components Folder Structure - Best Practices

## Overview
The components directory is organized into 4 primary folders following separation of concerns and usage patterns:

```
src/lib/components/
├── ui/              # shadcn-svelte base components
├── admin/           # Admin panel specific components
├── client/          # Customer-facing components
└── common/          # Shared components across admin/client
```

---

## 1. `/ui` - Base UI Components (shadcn-svelte)

**Purpose**: Low-level, design system components following shadcn-svelte patterns.

**Characteristics**:
- Framework-agnostic UI primitives
- No business logic
- Highly reusable across the entire application
- Follow shadcn-svelte conventions strictly

**Structure**:
```
ui/
├── button/
│   ├── button.svelte
│   └── index.ts
├── input/
│   ├── input.svelte
│   └── index.ts
├── card/
│   ├── card.svelte
│   ├── card-header.svelte
│   ├── card-content.svelte
│   ├── card-footer.svelte
│   └── index.ts
├── dialog/
│   ├── dialog.svelte
│   ├── dialog-content.svelte
│   ├── dialog-header.svelte
│   └── index.ts
├── table/
├── form/
├── select/
├── dropdown-menu/
├── badge/
├── avatar/
└── ...
```

**Rules**:
- ✅ Use `tailwind-variants` for variants
- ✅ Export via barrel `index.ts`
- ✅ Support `ref` with `$bindable()`
- ✅ Use `cn()` for className merging
- ✅ Component + types per folder
- ❌ No business logic or API calls
- ❌ No feature-specific code
- ❌ Always check https://www.shadcn-svelte.com/llms.txt before creating

**Example Import**:
```typescript
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
```

---

## 2. `/admin` - Admin Panel Components

**Purpose**: Components exclusively for the admin dashboard/CMS.

**Characteristics**:
- Business logic for content management
- Access to admin remote functions
- Authentication-aware (requires admin role)
- Complex data manipulation interfaces

**Structure**:
```
admin/
├── layout/
│   ├── admin-sidebar.svelte
│   ├── admin-header.svelte
│   ├── admin-nav.svelte
│   └── admin-breadcrumbs.svelte
├── features/
│   ├── product-management/
│   │   ├── product-list-table.svelte
│   │   ├── product-form.svelte
│   │   ├── product-quick-edit.svelte
│   │   ├── product-bulk-actions.svelte
│   │   └── index.ts
│   ├── blog-management/
│   │   ├── blog-editor.svelte
│   │   ├── blog-preview.svelte
│   │   ├── blog-publish-controls.svelte
│   │   └── index.ts
│   ├── order-management/
│   │   ├── order-list.svelte
│   │   ├── order-details-panel.svelte
│   │   ├── order-status-updater.svelte
│   │   └── index.ts
│   ├── user-management/
│   │   ├── user-list.svelte
│   │   ├── user-permissions.svelte
│   │   └── index.ts
│   └── analytics/
│       ├── dashboard-stats.svelte
│       ├── revenue-chart.svelte
│       └── index.ts
└── widgets/
    ├── quick-stats-card.svelte
    ├── recent-orders-widget.svelte
    └── low-stock-alert.svelte
```

**Subfolder Guidelines**:

### `/layout`
- Navigation, sidebars, headers
- Admin-specific layout components
- Breadcrumb navigation

### `/features`
- Domain-grouped feature modules (product, blog, order, etc.)
- Each feature has its own folder with related components
- Barrel export via `index.ts` per feature

### `/widgets`
- Dashboard widgets
- Admin-specific reusable blocks

**Rules**:
- ✅ Use remote functions for data fetching
- ✅ Check `event.locals.user` for auth
- ✅ Group by feature domain
- ✅ Use i18n (`import * as m from '$lib/paraglide/messages'`)
- ❌ No customer-facing UI code
- ❌ Don't duplicate common logic (use `/common`)

**Example Import**:
```typescript
import { ProductForm } from '$lib/components/admin/features/product-management';
import { AdminSidebar } from '$lib/components/admin/layout';
```

---

## 3. `/client` - Customer-Facing Components

**Purpose**: Components for the public e-commerce storefront.

**Characteristics**:
- Customer-oriented UI/UX
- Product browsing, cart, checkout flows
- Public-facing content display
- Marketing/promotional elements

**Structure**:
```
client/
├── layout/
│   ├── site-header.svelte
│   ├── site-footer.svelte
│   ├── main-nav.svelte
│   ├── mobile-menu.svelte
│   └── search-bar.svelte
├── features/
│   ├── product-catalog/
│   │   ├── product-card.svelte
│   │   ├── product-grid.svelte
│   │   ├── product-filters.svelte
│   │   ├── product-sort.svelte
│   │   └── index.ts
│   ├── product-detail/
│   │   ├── product-gallery.svelte
│   │   ├── product-info.svelte
│   │   ├── product-reviews.svelte
│   │   ├── add-to-cart-button.svelte
│   │   └── index.ts
│   ├── cart/
│   │   ├── cart-drawer.svelte
│   │   ├── cart-item.svelte
│   │   ├── cart-summary.svelte
│   │   └── index.ts
│   ├── checkout/
│   │   ├── checkout-form.svelte
│   │   ├── shipping-step.svelte
│   │   ├── payment-step.svelte
│   │   ├── order-review.svelte
│   │   └── index.ts
│   ├── user-account/
│   │   ├── order-history.svelte
│   │   ├── profile-form.svelte
│   │   ├── wishlist.svelte
│   │   └── index.ts
│   └── blog/
│       ├── blog-card.svelte
│       ├── blog-grid.svelte
│       ├── blog-sidebar.svelte
│       └── index.ts
└── widgets/
    ├── newsletter-signup.svelte
    ├── promo-banner.svelte
    ├── featured-products.svelte
    └── testimonials.svelte
```

**Subfolder Guidelines**:

### `/layout`
- Public site navigation
- Customer-facing headers/footers
- Search functionality

### `/features`
- E-commerce specific features (catalog, cart, checkout)
- User account management
- Blog/content display

### `/widgets`
- Marketing widgets
- Promotional components
- Newsletter forms

**Rules**:
- ✅ Use remote functions for data
- ✅ Optimize for SEO and performance
- ✅ Group by customer journey/feature
- ✅ Use i18n for multi-language support
- ❌ No admin logic
- ❌ Don't duplicate common patterns (use `/common`)

**Example Import**:
```typescript
import { ProductCard } from '$lib/components/client/features/product-catalog';
import { CartDrawer } from '$lib/components/client/features/cart';
```

---

## 4. `/common` - Shared Components

**Purpose**: Components used across both admin and client contexts.

**Characteristics**:
- Reusable business logic components
- Application-specific but context-agnostic
- Higher-level than `/ui`, more generic than `/admin` or `/client`

**Structure**:
```
common/
├── layout/
│   ├── page-header.svelte
│   ├── page-container.svelte
│   └── breadcrumbs.svelte
├── data-display/
│   ├── data-table.svelte
│   ├── empty-state.svelte
│   ├── loading-skeleton.svelte
│   ├── pagination.svelte
│   └── status-badge.svelte
├── forms/
│   ├── form-field.svelte
│   ├── form-error.svelte
│   ├── image-upload.svelte
│   ├── rich-text-editor.svelte
│   └── date-picker.svelte
├── feedback/
│   ├── toast-notification.svelte
│   ├── confirmation-dialog.svelte
│   └── loading-spinner.svelte
├── navigation/
│   ├── tabs.svelte
│   ├── stepper.svelte
│   └── breadcrumb-nav.svelte
└── utility/
    ├── error-boundary.svelte
    ├── seo-meta.svelte
    └── language-switcher.svelte
```

**Subfolder Guidelines**:

### `/layout`
- Generic page layout components
- Containers, wrappers

### `/data-display`
- Tables, lists, cards that work in any context
- Empty states, loading states
- Pagination

### `/forms`
- Complex form controls (image upload, WYSIWYG, date pickers)
- Form validation displays
- Reusable input patterns

### `/feedback`
- Toasts, notifications
- Confirmation dialogs
- Loading indicators

### `/navigation`
- Multi-step forms
- Tab interfaces
- Breadcrumb navigation

### `/utility`
- Error boundaries
- SEO components
- i18n switchers

**Rules**:
- ✅ Context-agnostic (works in admin and client)
- ✅ Contains application-specific logic beyond `/ui`
- ✅ Reusable across multiple features
- ✅ Can compose `/ui` components
- ❌ No admin-only or client-only logic
- ❌ If it's purely presentational with no logic, use `/ui` instead

**Example Import**:
```typescript
import { DataTable } from '$lib/components/common/data-display';
import { RichTextEditor } from '$lib/components/common/forms';
```

---

## Decision Tree: Where Does This Component Go?

```
Is it a base UI primitive (button, input, dialog)?
├─ YES → /ui
└─ NO ↓

Does it contain business logic or fetch data?
├─ NO → /ui (if purely presentational)
└─ YES ↓

Is it used ONLY in admin panel?
├─ YES → /admin
└─ NO ↓

Is it used ONLY on customer-facing site?
├─ YES → /client
└─ NO ↓

Is it shared between admin and client?
└─ YES → /common
```

---

## Component Naming Conventions

### File Naming
- **Svelte components**: `kebab-case.svelte`
  - `product-card.svelte`
  - `admin-sidebar.svelte`
  - `cart-drawer.svelte`

### Export Naming
- **Component exports**: `PascalCase`
  ```typescript
  export { ProductCard, ProductGrid } from './features/product-catalog';
  ```

### Folder Structure
- **Feature folders**: `kebab-case`
  - `product-management/`
  - `user-account/`
  
- **Always include**: `index.ts` for barrel exports in feature folders

---

## Import Path Examples

```typescript
// UI Components (shadcn-svelte)
import { Button, Input, Card } from '$lib/components/ui/button';

// Admin Components
import { ProductForm } from '$lib/components/admin/features/product-management';
import { AdminSidebar } from '$lib/components/admin/layout';

// Client Components
import { ProductCard } from '$lib/components/client/features/product-catalog';
import { CartDrawer } from '$lib/components/client/features/cart';

// Common Components
import { DataTable } from '$lib/components/common/data-display';
import { RichTextEditor } from '$lib/components/common/forms';
```

---

## Migration Checklist

When organizing existing components:

1. **Audit Current Components**
   - List all existing components
   - Identify their current location
   - Determine their purpose and usage

2. **Categorize**
   - Apply decision tree to each component
   - Group by appropriate folder

3. **Create Structure**
   - Create subfolders (`layout/`, `features/`, `widgets/`, etc.)
   - Move components to new locations

4. **Update Imports**
   - Search for old import paths
   - Replace with new structure
   - Use barrel exports (`index.ts`)

5. **Test**
   - Ensure all imports resolve
   - Run type checking: `pnpm check`
   - Run tests: `pnpm test:e2e`

---

## Best Practices Summary

### DO ✅
- Use shadcn-svelte for all base UI components
- Group admin features by domain (product, order, user, etc.)
- Group client features by customer journey (catalog, cart, checkout)
- Use barrel exports (`index.ts`) for feature folders
- Apply i18n to all user-facing text
- Use remote functions for data operations
- Keep components focused and single-purpose
- Compose smaller components into larger ones

### DON'T ❌
- Mix admin and client logic in the same component
- Duplicate code between admin/client (extract to `/common`)
- Create custom UI components without checking shadcn-svelte first
- Hardcode text (always use i18n)
- Bypass remote functions for direct DB access
- Create deeply nested folder structures (max 3 levels)
- Use generic names (`component.svelte`, `utils.svelte`)

---

## Examples

### Example 1: Product Card
**Location**: `/client/features/product-catalog/product-card.svelte`
**Why**: Customer-facing, specific to product browsing

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import * as m from '$lib/paraglide/messages';
  
  let { product } = $props();
</script>

<Card>
  <CardContent>
    <h3>{product.name}</h3>
    <p>${product.price}</p>
    <Button>{m.addToCart()}</Button>
  </CardContent>
</Card>
```

### Example 2: Data Table
**Location**: `/common/data-display/data-table.svelte`
**Why**: Used in both admin (product list) and client (order history)

```svelte
<script lang="ts">
  import { Table } from '$lib/components/ui/table';
  
  let { data, columns } = $props();
</script>

<Table>
  <!-- Generic table implementation -->
</Table>
```

### Example 3: Product Management Form
**Location**: `/admin/features/product-management/product-form.svelte`
**Why**: Admin-only, creates/edits products

```svelte
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { RichTextEditor } from '$lib/components/common/forms';
  import { createProduct } from '$lib/remotes/product.remote';
  
  // Admin product form logic
</script>
```

---

## Maintenance

- **Review quarterly**: Ensure components haven't drifted from guidelines
- **Update documentation**: When adding new patterns or conventions
- **Refactor duplicates**: Extract common patterns to `/common`
- **Monitor bundle size**: Keep feature folders focused to enable tree-shaking

---

This structure ensures:
- ✅ Clear separation of concerns
- ✅ Easy to find components
- ✅ Minimal code duplication
- ✅ Scalable architecture
- ✅ Follows SvelteKit and shadcn-svelte best practices
