# UI Domain Implementation

## Overview
The UI domain follows the shadcn-svelte component pattern with Tailwind CSS v4 for styling. Components are built using Svelte 5's new runes API and use tailwind-variants for creating flexible, type-safe variant systems.

## Component Structure Pattern

### File Organization
Each UI component lives in its own directory with two files:
```
src/lib/components/ui/{component-name}/
├── button.svelte          # Component implementation
└── index.ts              # Type exports and re-exports
```

### Module Script Pattern
Components use a module-level `<script>` block for type definitions and a regular `<script>` for props:

```svelte
<script lang="ts" module>
  import { type VariantProps, tv } from "tailwind-variants";
  import { cn, type WithElementRef } from "$lib/utils.js";
  
  // Define variants using tailwind-variants
  export const buttonVariants = tv({
    base: "inline-flex items-center justify-center...",
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-white",
        // ...
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        // ...
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });
  
  // Export variant types
  export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
  export type ButtonSize = VariantProps<typeof buttonVariants>["size"];
  
  // Define component props type
  export type ButtonProps = WithElementRef<HTMLButtonAttributes> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };
</script>

<script lang="ts">
  // Destructure props using $props rune
  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null), // For element references
    children,
    ...restProps
  }: ButtonProps = $props();
</script>
```

## Key Patterns

### 1. Tailwind Variants System
Use `tailwind-variants` tv() function for creating component APIs:

```typescript
export const buttonVariants = tv({
  base: "base-classes",  // Always applied
  variants: {
    variant: { /* variant options */ },
    size: { /* size options */ }
  },
  defaultVariants: { /* defaults */ }
});
```

### 2. Class Name Merging
Always use the `cn()` utility to merge Tailwind classes:

```svelte
<button class={cn(buttonVariants({ variant, size }), className)}>
```

This uses `clsx` + `tailwind-merge` to properly handle conditional classes and conflicts.

### 3. Svelte 5 Runes
- **$props()**: Destructure props with defaults
- **$bindable()**: For two-way binding (refs, values)
- **{@render children?.()}**: Render slot content

```svelte
let { 
  prop1 = "default",
  ref = $bindable(null),
  children 
}: Props = $props();

<!-- Render children -->
{@render children?.()}
```

### 4. Polymorphic Components
Components can render different elements based on props:

```svelte
{#if href}
  <a bind:this={ref} {href} {...restProps}>
    {@render children?.()}
  </a>
{:else}
  <button bind:this={ref} {type} {...restProps}>
    {@render children?.()}
  </button>
{/if}
```

### 5. Type Exports (index.ts)
Barrel file exports all types and the component:

```typescript
import Root, {
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  buttonVariants,
} from "./button.svelte";

export {
  Root,
  Root as Button,
  buttonVariants,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
};
```

## Styling Conventions

### Tailwind v4 Usage
- CSS defined in `src/app.css` with `@import 'tailwindcss'`
- Plugins loaded via `@plugin` directives
- Source files via `@source` directive
- No tailwind.config.ts file needed

### Utility Classes
Common patterns in the codebase:
- **Focus states**: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Dark mode**: `dark:bg-input/30 dark:hover:bg-accent/50`
- **Invalid states**: `aria-invalid:ring-destructive/20 aria-invalid:border-destructive`
- **Disabled states**: `disabled:pointer-events-none disabled:opacity-50`
- **Icon sizing**: `[&_svg]:size-4 [&_svg]:shrink-0`

### Shadow System
The project uses a custom shadow scale:
- `shadow-xs`: Extra small shadows for subtle elevation

## Component Props Pattern

### WithElementRef Helper
Utility type for ref support:

```typescript
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = 
  T & { ref?: U | null };
```

Usage:
```typescript
export type ButtonProps = 
  WithElementRef<HTMLButtonAttributes> & 
  WithElementRef<HTMLAnchorAttributes> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };
```

### RestProps Spreading
Always spread remaining props to the root element:

```svelte
<button {...restProps}>
```

This maintains HTML attribute support (aria-*, data-*, etc).

## File Location Rules

- **UI Components**: `src/lib/components/ui/{component-name}/`
- **Admin Components**: `src/lib/components/admin/`
- **Client Components**: `src/lib/components/client/`
- **Utilities**: `src/lib/utils.ts`

## Dependencies

Required packages for UI components:
- `tailwind-variants`: Variant system
- `clsx`: Conditional classes  
- `tailwind-merge`: Merge Tailwind classes
- `@lucide/svelte`: Icon library
- `tw-animate-css`: Animation utilities

## Example: Creating a New Component

1. Create directory: `src/lib/components/ui/card/`
2. Create `card.svelte` with module script for variants
3. Define variants using `tv()`
4. Use `$props()` for props with `$bindable()` for refs
5. Apply `cn()` for className merging
6. Render children with `{@render children?.()}`
7. Create `index.ts` for exports
8. Import utilities from `$lib/utils`

## Testing Considerations

- Components should accept `data-testid` via restProps
- Disabled states prevent interaction (pointer-events-none)
- aria-disabled for accessible disabled states
- Support both controlled and uncontrolled patterns via $bindable
