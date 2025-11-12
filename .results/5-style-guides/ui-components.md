# UI Components Style Guide

## Overview
UI components follow the shadcn-svelte pattern with Svelte 5 runes, tailwind-variants for styling, and TypeScript for type safety.

## Component Architecture

The project uses a **4-tier component architecture**:

1. **`/ui`** - shadcn-svelte base primitives (buttons, inputs, dialogs)
2. **`/admin`** - Admin panel specific components (dashboard, product management)
3. **`/client`** - Customer-facing components (catalog, cart, checkout)
4. **`/common`** - Shared components across admin/client (data tables, forms)

📖 **See full architecture guide**: `docs/COMPONENTS_STRUCTURE.md`

## File Structure
Each component gets its own directory with two files:

```
src/lib/components/ui/{component-name}/
├── {component-name}.svelte    # Component implementation
└── index.ts                    # Barrel exports
```

Example: Button component
```
src/lib/components/ui/button/
├── button.svelte
└── index.ts
```

## Component Template

### Module Script Section
Always start with a module-level script block for types and variants:

```svelte
<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	// Define component variants
	export const componentVariants = tv({
		base: "base-classes-here",
		variants: {
			variant: {
				default: "variant-classes",
				// ...
			},
			size: {
				default: "size-classes",
				// ...
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	});

	// Export variant types
	export type ComponentVariant = VariantProps<typeof componentVariants>["variant"];
	export type ComponentSize = VariantProps<typeof componentVariants>["size"];

	// Define props type
	export type ComponentProps = WithElementRef<HTMLButtonAttributes> & {
		variant?: ComponentVariant;
		size?: ComponentSize;
	};
</script>

<script lang="ts">
	// Destructure props
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		children,
		...restProps
	}: ComponentProps = $props();
</script>

<!-- Template -->
<element
	bind:this={ref}
	data-slot="component-name"
	class={cn(componentVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</element>
```

## Key Conventions

### 1. Module Script Imports
```svelte
<script lang="ts" module>
  // Always import utilities
  import { cn, type WithElementRef } from "$lib/utils.js";
  
  // Import element types from svelte/elements
  import type { HTMLButtonAttributes } from "svelte/elements";
  
  // Import variant system
  import { type VariantProps, tv } from "tailwind-variants";
</script>
```

### 2. Variant Definition
Use `tv()` from tailwind-variants:

```typescript
export const buttonVariants = tv({
  // Base classes always applied
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium",
  
  // Variant options
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border bg-background hover:bg-accent",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3",
      lg: "h-10 px-6",
      icon: "size-9",
    }
  },
  
  // Defaults when not specified
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
```

### 3. Type Exports
Always export variant types and props:

```typescript
export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export type ButtonProps = WithElementRef<HTMLButtonAttributes> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};
```

### 4. Props Destructuring
Use Svelte 5's `$props()` rune:

```typescript
let {
  // Rename class to className (class is reserved)
  class: className,
  
  // Variant props with defaults
  variant = "default",
  size = "default",
  
  // Ref support with $bindable
  ref = $bindable(null),
  
  // Children render block
  children,
  
  // Spread remaining props
  ...restProps
}: ButtonProps = $props();
```

### 5. Class Name Application
Always use `cn()` utility for class merging:

```svelte
<button
  class={cn(buttonVariants({ variant, size }), className)}
>
```

**Never:**
```svelte
<button class="{buttonVariants({ variant, size })} {className}">
```

### 6. Children Rendering
Use `{@render children?.()}` syntax:

```svelte
<button>
  {@render children?.()}
</button>
```

**Never use `<slot>`** in Svelte 5 components.

### 7. Ref Binding
```svelte
<button bind:this={ref}>
```

### 8. RestProps Spreading
```svelte
<button {...restProps}>
```

This maintains support for all HTML attributes.

### 9. Data Attributes
Add `data-slot` for component identification:

```svelte
<button data-slot="button">
```

## Barrel Export Pattern (index.ts)

```typescript
import Root, {
	type ButtonProps,
	type ButtonVariant,
	type ButtonSize,
	buttonVariants,
} from "./button.svelte";

export {
	// Component root
	Root,
	
	// Convenient alias
	Root as Button,
	
	// Variant function
	buttonVariants,
	
	// Types
	type ButtonProps,
	type ButtonVariant,
	type ButtonSize,
};
```

## Common Tailwind Patterns

### Focus States
```
focus-visible:ring-ring/50 
focus-visible:ring-[3px] 
focus-visible:border-ring 
outline-none
```

### Disabled States
```
disabled:pointer-events-none 
disabled:opacity-50
aria-disabled:pointer-events-none 
aria-disabled:opacity-50
```

### Dark Mode
```
dark:bg-input/30 
dark:hover:bg-accent/50 
dark:border-input
```

### Invalid States
```
aria-invalid:ring-destructive/20 
aria-invalid:border-destructive
dark:aria-invalid:ring-destructive/40
```

### Icon Sizing
```
[&_svg]:size-4 
[&_svg]:shrink-0 
[&_svg]:pointer-events-none
```

### Transitions
```
transition-all 
transition-colors
```

### Shadows
```
shadow-xs  // Extra small elevation
```

## Polymorphic Components

For components that can render as different elements:

```svelte
{#if href}
  <a
    bind:this={ref}
    {href}
    class={cn(buttonVariants({ variant, size }), className)}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : undefined}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
```

## Usage Example

### Import
```svelte
<script>
  import { Button } from '$lib/components/ui/button';
</script>
```

### Basic Usage
```svelte
<Button>Click me</Button>
```

### With Variants
```svelte
<Button variant="destructive" size="sm">Delete</Button>
```

### With Custom Class
```svelte
<Button class="mt-4">Submit</Button>
```

### As Link
```svelte
<Button href="/dashboard">Go to Dashboard</Button>
```

### With Ref
```svelte
<script>
  let buttonRef = $state(null);
</script>

<Button ref={buttonRef}>
  Button
</Button>
```

### With Icon
```svelte
<script>
  import { Trash } from '@lucide/svelte';
</script>

<Button variant="destructive" size="icon">
  <Trash />
</Button>
```

## Naming Conventions

- Component file: lowercase with hyphens (`button.svelte`, `dropdown-menu.svelte`)
- Component folder: same as file name (`button/`, `dropdown-menu/`)
- Variant function: `{component}Variants` (`buttonVariants`)
- Type names: PascalCase (`ButtonProps`, `ButtonVariant`)
- Props parameter: lowercase (`variant`, `size`)

## Testing Considerations

- Add `data-testid` via restProps
- Support keyboard navigation
- Proper ARIA attributes
- Focus management
- Disabled state handling

## Dependencies

Required for all UI components:
- `tailwind-variants`
- `clsx`
- `tailwind-merge`
- `@lucide/svelte` (for icons)
