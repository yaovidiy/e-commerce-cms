# Component Architecture Domain

## Overview
The component architecture is organized into **4 primary folders** following separation of concerns and usage patterns. This structure ensures clear boundaries, minimal duplication, and scalable organization.

## 4-Tier Structure

```
src/lib/components/
├── ui/              # shadcn-svelte base components
├── admin/           # Admin panel specific components
├── client/          # Customer-facing components
└── common/          # Shared components across admin/client
```

## 1. `/ui` - Base UI Components

**Purpose**: Low-level, design system components (shadcn-svelte)

**Characteristics**:
- Framework-agnostic UI primitives
- No business logic or API calls
- Highly reusable across entire application
- Follow shadcn-svelte conventions

**Example Components**:
- `button/` - Base button component with variants
- `input/` - Form input primitives
- `dialog/` - Modal dialogs
- `card/` - Content containers
- `table/` - Data table primitives

**Rules**:
- ✅ Always check https://www.shadcn-svelte.com/llms.txt before creating
- ✅ Use `tailwind-variants` for styling
- ✅ Export via barrel `index.ts`
- ❌ No business logic or feature-specific code

## 2. `/admin` - Admin Panel Components

**Purpose**: Components exclusively for admin dashboard/CMS

**Structure**:
```
admin/
├── layout/          # Sidebars, headers, navigation
├── features/        # Domain-grouped modules (product, blog, order)
└── widgets/         # Dashboard widgets, stats cards
```

**Example Components**:
- `admin/layout/admin-sidebar.svelte`
- `admin/features/product-management/product-form.svelte`
- `admin/widgets/quick-stats-card.svelte`

**Rules**:
- ✅ Use remote functions for data operations
- ✅ Check `event.locals.user` for authentication
- ✅ Group by feature domain
- ❌ No customer-facing UI code

## 3. `/client` - Customer-Facing Components

**Purpose**: Components for public e-commerce storefront

**Structure**:
```
client/
├── layout/          # Site headers, footers, navigation
├── features/        # Product catalog, cart, checkout, user account
└── widgets/         # Marketing widgets, promos, newsletters
```

**Example Components**:
- `client/layout/site-header.svelte`
- `client/features/product-catalog/product-card.svelte`
- `client/features/cart/cart-drawer.svelte`
- `client/widgets/newsletter-signup.svelte`

**Rules**:
- ✅ Optimize for SEO and performance
- ✅ Group by customer journey
- ✅ Use i18n for multi-language support
- ❌ No admin logic

## 4. `/common` - Shared Components

**Purpose**: Components used across both admin and client contexts

**Structure**:
```
common/
├── layout/          # Generic page layout components
├── data-display/    # Tables, pagination, empty states
├── forms/           # Rich text editors, image uploads, date pickers
├── feedback/        # Toasts, confirmations, loading spinners
├── navigation/      # Tabs, steppers, breadcrumbs
└── utility/         # Error boundaries, SEO, language switchers
```

**Example Components**:
- `common/data-display/data-table.svelte`
- `common/forms/rich-text-editor.svelte`
- `common/feedback/toast-notification.svelte`
- `common/utility/language-switcher.svelte`

**Rules**:
- ✅ Context-agnostic (works in admin and client)
- ✅ Reusable across multiple features
- ✅ Can compose `/ui` components
- ❌ No admin-only or client-only logic

## Decision Tree

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

## Import Patterns

```typescript
// UI Components (shadcn-svelte)
import { Button, Input } from '$lib/components/ui/button';

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

## Naming Conventions

**Files**: `kebab-case.svelte`
```
product-card.svelte
admin-sidebar.svelte
cart-drawer.svelte
```

**Exports**: `PascalCase`
```typescript
export { ProductCard, ProductGrid } from './features/product-catalog';
```

**Folders**: `kebab-case`
```
product-management/
user-account/
```

**Feature folders**: Always include `index.ts` for barrel exports

## Best Practices

### DO ✅
- Use shadcn-svelte for all base UI components
- Group admin features by domain (product, order, user)
- Group client features by customer journey (catalog, cart, checkout)
- Use barrel exports (`index.ts`) for feature folders
- Apply i18n to all user-facing text
- Use remote functions for data operations
- Keep components focused and single-purpose

### DON'T ❌
- Mix admin and client logic in same component
- Duplicate code between admin/client (extract to `/common`)
- Create custom UI components without checking shadcn-svelte first
- Hardcode text (always use i18n)
- Bypass remote functions for direct DB access
- Create deeply nested folder structures (max 3 levels)

## Integration Points

### With Remote Functions
All data operations use remote functions:
```svelte
<script lang="ts">
  import { getAllProducts } from '$lib/remotes/product.remote';
  
  let products = $state([]);
  
  async function loadProducts() {
    products = await getAllProducts();
  }
</script>
```

### With i18n
All user-facing text uses translation keys:
```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages';
</script>

<Button>{m.addToCart()}</Button>
```

### With UI Components
Higher-level components compose base UI:
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  
  // Feature-specific component logic
</script>

<Card>
  <Button>Action</Button>
</Card>
```

## Related Documentation

- **Full guide**: `docs/COMPONENTS_STRUCTURE.md`
- **UI component patterns**: `.results/5-style-guides/ui-components.md`
- **Remote functions**: `.results/5-style-guides/remote-functions.md`
- **i18n usage**: `.results/4-domains/i18n.md`

## Files

**UI Components**:
- `src/lib/components/ui/button/button.svelte`
- `src/lib/components/ui/button/index.ts`

**Admin Components**:
- `src/lib/components/admin/layout/`
- `src/lib/components/admin/features/`
- `src/lib/components/admin/widgets/`

**Client Components**:
- `src/lib/components/client/layout/`
- `src/lib/components/client/features/`
- `src/lib/components/client/widgets/`

**Common Components**:
- `src/lib/components/common/layout/`
- `src/lib/components/common/data-display/`
- `src/lib/components/common/forms/`
- `src/lib/components/common/feedback/`
- `src/lib/components/common/navigation/`
- `src/lib/components/common/utility/`
