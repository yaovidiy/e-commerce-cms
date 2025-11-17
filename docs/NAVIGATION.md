# Navigation Domain

## Overview

The navigation domain provides a mobile-first sidebar navigation system for the SvelteKit E-commerce CMS. It leverages shadcn-svelte's `Sidebar` component to create a responsive, collapsible navigation experience that adapts to both desktop and mobile viewports.

## Architecture

### Components

#### App Sidebar (`src/lib/components/common/layout/app-sidebar.svelte`)

The main navigation component that displays:
- **Application links**: Home, Dashboard, Products, Blog
- **Account links** (authenticated users only): Profile, Settings
- **Admin button** (admin users only): Quick access to admin panel
- **User info footer**: Shows username and email, or login button for guests

**Key Features:**
- Mobile-first design using shadcn-svelte Sidebar primitives
- Conditional rendering based on authentication state
- Active route highlighting
- Icon-based navigation with @lucide/svelte
- Internationalized labels via Paraglide
- Keyboard shortcuts (`cmd+b` / `ctrl+b` to toggle)

### Layout Integration

The sidebar is integrated at the root layout level (`src/routes/+layout.svelte`):

```svelte
<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header>
      <Sidebar.Trigger />
    </header>
    <main>
      {children}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
```

**Structure:**
- `Sidebar.Provider`: Context provider for sidebar state
- `AppSidebar`: Custom sidebar component
- `Sidebar.Inset`: Main content area with proper spacing
- `Sidebar.Trigger`: Toggle button in header

## User Access Patterns

### Guest Users (Not Authenticated)
- Can view: Home, Dashboard, Products, Blog
- Cannot view: Account links, Admin button
- Footer shows: Login button

### Authenticated Users
- Can view: All main navigation + Profile, Settings
- Cannot view: Admin button (if not admin)
- Footer shows: Username and email

### Admin Users
- Can view: All navigation items
- Additional access: "Go to Admin" button
- Footer shows: Username and email

## Implementation Details

### Authentication Check

The sidebar checks user authentication state from `$page.data.user` (populated by `hooks.server.ts`):

```typescript
let user = $derived($page.data?.user ?? null);
```

This provides reactive access to:
- `user.username` - Display name
- `user.email` - User email (optional)
- `user.isAdmin` - Admin flag for conditional rendering

### Active Route Detection

```typescript
function isActive(url: string): boolean {
  if (url === '/') {
    return $page.url.pathname === '/';
  }
  return $page.url.pathname.startsWith(url);
}
```

Routes are marked active using `Sidebar.MenuButton isActive={...}` prop.

### Responsive Behavior

The sidebar automatically adapts:
- **Desktop (>= 768px)**: Collapsible sidebar (icon or expanded state)
- **Mobile (< 768px)**: Off-canvas drawer (slides in from left)

Controlled by shadcn-svelte's `useSidebar()` hook and `isMobile` media query.

## Navigation Items

### Main Navigation
```typescript
const mainNavItems = [
  { title: m.nav_home, url: '/', icon: Home },
  { title: m.nav_dashboard, url: '/dashboard', icon: LayoutDashboard },
  { title: m.nav_products, url: '/products', icon: Package },
  { title: m.nav_blog, url: '/blog', icon: BookOpen }
];
```

### Account Navigation (Authenticated Only)
```typescript
const accountNavItems = [
  { title: m.nav_profile, url: '/profile', icon: User },
  { title: m.nav_settings, url: '/settings', icon: Settings }
];
```

### Admin Access (Admin Only)
```svelte
{#if user?.isAdmin}
  <Sidebar.MenuItem>
    <a href="/admin">
      <ShieldCheck />
      <span>{m.nav_admin()}</span>
    </a>
  </Sidebar.MenuItem>
{/if}
```

## Internationalization

All navigation labels are internationalized using Paraglide:

**English (`messages/en.json`):**
```json
{
  "nav_home": "Home",
  "nav_dashboard": "Dashboard",
  "nav_products": "Products",
  "nav_blog": "Blog",
  "nav_admin": "Go to Admin",
  "nav_application": "Application",
  "nav_account": "Account",
  "nav_profile": "Profile",
  "nav_settings": "Settings"
}
```

**Ukrainian (`messages/uk.json`):**
```json
{
  "nav_home": "Головна",
  "nav_dashboard": "Панель",
  "nav_products": "Продукти",
  "nav_blog": "Блог",
  "nav_admin": "Адмін панель",
  "nav_application": "Додаток",
  "nav_account": "Обліковий запис",
  "nav_profile": "Профіль",
  "nav_settings": "Налаштування"
}
```

## Styling

### Theming

The sidebar uses CSS variables for theming (defined in `src/app.css`):

```css
@theme {
  --color-sidebar: oklch(0.985 0.001 106.423);
  --color-sidebar-foreground: oklch(0.147 0.004 49.25);
  --color-sidebar-primary: oklch(0.216 0.006 56.043);
  --color-sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --color-sidebar-accent: oklch(0.97 0.001 106.424);
  --color-sidebar-accent-foreground: oklch(0.216 0.006 56.043);
  --color-sidebar-border: oklch(0.923 0.003 48.717);
  --color-sidebar-ring: oklch(0.709 0.01 56.259);
}
```

Dark mode automatically applies alternate color scheme.

### Width Configuration

Default widths (in `src/lib/components/ui/sidebar/constants.ts`):
```typescript
export const SIDEBAR_WIDTH = "16rem"; // 256px
export const SIDEBAR_WIDTH_MOBILE = "18rem"; // 288px
```

## Keyboard Shortcuts

- **Toggle Sidebar**: `cmd+b` (Mac) / `ctrl+b` (Windows/Linux)

Configured via `SIDEBAR_KEYBOARD_SHORTCUT` constant.

## Component Hierarchy

```
Sidebar.Provider
└── AppSidebar
    ├── Sidebar.Root
    │   ├── Sidebar.Header
    │   │   └── Sidebar.Menu (Logo/Brand)
    │   ├── Sidebar.Content
    │   │   ├── Sidebar.Group (Application)
    │   │   │   ├── Sidebar.GroupLabel
    │   │   │   └── Sidebar.GroupContent
    │   │   │       └── Sidebar.Menu (Main Nav Items)
    │   │   ├── Sidebar.Separator
    │   │   ├── Sidebar.Group (Account - if authenticated)
    │   │   │   ├── Sidebar.GroupLabel
    │   │   │   └── Sidebar.GroupContent
    │   │   │       └── Sidebar.Menu (Account Items)
    │   │   ├── Sidebar.Separator
    │   │   └── Sidebar.Group (Admin - if isAdmin)
    │   │       └── Sidebar.Menu (Admin Button)
    │   ├── Sidebar.Footer
    │   │   └── Sidebar.Menu (User Info / Login Button)
    │   └── Sidebar.Rail
    └── Sidebar.Inset (Main Content Area)
        ├── Header (with Sidebar.Trigger)
        └── Main (Page Content)
```

## Adding New Navigation Items

### Main Navigation

Edit `app-sidebar.svelte`:

```typescript
const mainNavItems = [
  // ... existing items
  {
    title: m.nav_new_section,
    url: '/new-section',
    icon: NewIcon
  }
];
```

Add translations:

```json
// messages/en.json
"nav_new_section": "New Section"

// messages/uk.json
"nav_new_section": "Новий розділ"
```

### Conditional Navigation

For role-based or feature-specific items:

```svelte
{#if user?.hasFeature}
  <Sidebar.MenuItem>
    <Sidebar.MenuButton isActive={isActive('/feature')}>
      {#snippet child({ props })}
        <a href="/feature" {...props}>
          <FeatureIcon class="size-4" />
          <span>{m.nav_feature()}</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
{/if}
```

## Best Practices

1. **Always use internationalized labels** - Never hardcode navigation text
2. **Check authentication state** - Use `user?.isAdmin` for conditional rendering
3. **Use semantic icons** - Choose icons that clearly represent the destination
4. **Mark active routes** - Always use `isActive()` helper for route highlighting
5. **Group related items** - Use `Sidebar.Group` to organize navigation logically
6. **Test mobile behavior** - Ensure off-canvas drawer works smoothly on small screens
7. **Maintain separation** - Keep navigation logic in `app-sidebar.svelte`, not page components

## Troubleshooting

### Sidebar not showing user data
**Cause**: `hooks.server.ts` not populating `event.locals.user`
**Fix**: Ensure authentication hooks are properly setting user data

### Active route not highlighting
**Cause**: URL path doesn't match exactly
**Fix**: Check `isActive()` logic and ensure route paths are correct

### Sidebar not responsive
**Cause**: Missing `Sidebar.Provider` or incorrect component structure
**Fix**: Verify layout structure matches the documented hierarchy

### Icons not rendering
**Cause**: Missing @lucide/svelte icon imports
**Fix**: Import icons from `@lucide/svelte` and use as components

## Dependencies

- `@lucide/svelte` - Icon library
- `shadcn-svelte` - Sidebar components
- `@inlang/paraglide-sveltekit` - Internationalization
- `$app/stores` - Page context ($page)
- Custom hooks: `is-mobile` (auto-installed with sidebar)

## Future Enhancements

- [ ] Nested navigation (submenus)
- [ ] Search/command palette integration
- [ ] User avatar upload in footer
- [ ] Recently visited pages tracking
- [ ] Customizable sidebar width per user
- [ ] Drag-and-drop navigation reordering (admin)
- [ ] Navigation analytics tracking
- [ ] Breadcrumb integration with sidebar

---

**Last Updated**: November 2025
**Maintainer**: Development Team
