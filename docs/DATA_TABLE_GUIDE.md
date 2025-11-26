# Data Table Implementation Guide

This guide explains how to use the new `DataTableWrapper` component for all table instances in the admin panel.

## Overview

The `DataTableWrapper` component provides a unified, reusable interface for displaying data tables using TanStack Table (formerly React Table) with Svelte support. This replaces all custom table implementations across the application.

## Installation

The component is already installed and available at:
- **Component**: `src/lib/components/common/data-display/DataTableWrapper`
- **UI Base**: `src/lib/components/ui/data-table` (shadcn-svelte)

## Basic Usage

### 1. Import the Component and Utilities

```svelte
<script lang="ts">
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { getAll } from '$lib/remotes/your-domain.remote';
	import type { ColumnDef } from '@tanstack/table-core';
</script>
```

### 2. Define Your Data Type

```typescript
type User = {
	id: string;
	username: string;
	email: string | null;
	role: string;
	isAdmin: boolean;
	createdAt: Date | null;
};
```

### 3. Define Columns

```typescript
const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'username',
		header: () => m.user_username()
	},
	{
		accessorKey: 'email',
		header: () => m.user_email(),
		cell: (info) => info.getValue() || '-'
	},
	{
		accessorKey: 'role',
		header: () => m.user_role(),
		cell: (info) => {
			const role = info.getValue() as string;
			return role === 'admin' ? 'Admin' : 'User';
		}
	},
	{
		accessorKey: 'isAdmin',
		header: () => m.user_admin_status(),
		cell: (info) => (info.getValue() ? m.user_yes() : m.user_no())
	},
	{
		accessorKey: 'createdAt',
		header: () => m.user_created_at(),
		cell: (info) => {
			const date = info.getValue() as Date | null;
			if (date instanceof Date) {
				return date.toLocaleDateString();
			} else if (date) {
				return new Date(date as string | number).toLocaleDateString();
			}
			return '-';
		}
	}
];
```

### 4. Setup State and Pagination

```typescript
let searchQuery = $state('');
let currentPage = $state(1);
const pageSize = 20;

function handlePageChange(pageIndex: number) {
	// Convert 0-based index from DataTableWrapper to 1-based for API
	currentPage = pageIndex + 1;
}
```

### 5. Render the Table with Pagination

```svelte
{#await getAll({ 
	username: searchQuery, 
	page: currentPage, 
	pageSize 
}) then response}
	<DataTableWrapper
		data={response.data}
		columns={columns}
		totalPages={response.totalPages}
		page={currentPage}
		pageSize={pageSize}
		onPageChange={handlePageChange}
		emptyMessage={m.user_no_users()}
	/>
{/await}
```

## Complete Example

```svelte
<script lang="ts">
	import { getAllUsers } from '$lib/remotes/user.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { Input } from '$lib/components/ui/input';
	import * as m from '$lib/paraglide/messages';
	import { Search } from '@lucide/svelte';
	import type { ColumnDef } from '@tanstack/table-core';

	type User = {
		id: string;
		username: string;
		email: string | null;
		role: string;
		isAdmin: boolean;
		createdAt: Date | null;
	};

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 20;

	function handlePageChange(pageIndex: number) {
		// DataTableWrapper sends 0-based index, convert to 1-based for API
		currentPage = pageIndex + 1;
	}

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'username',
			header: () => m.user_username()
		},
		{
			accessorKey: 'email',
			header: () => m.user_email(),
			cell: (info) => info.getValue() || '-'
		},
		{
			accessorKey: 'createdAt',
			header: () => m.user_created_at(),
			cell: (info) => {
				const date = info.getValue() as Date | null;
				return date ? new Date(date).toLocaleDateString() : '-';
			}
		}
	];
</script>

<div class="flex flex-col gap-4">
	<div class="relative max-w-sm">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input
			type="text"
			placeholder={m.user_search_placeholder()}
			bind:value={searchQuery}
			class="pl-9"
		/>
	</div>

	{#await getAllUsers({ 
		username: searchQuery, 
		page: currentPage, 
		pageSize 
	}) then response}
		<DataTableWrapper
			data={response.data}
			columns={columns}
			totalPages={response.totalPages}
			page={currentPage}
			pageSize={pageSize}
			onPageChange={handlePageChange}
			emptyMessage={m.user_no_users()}
		/>
	{/await}
</div>
```

## Props

### DataTableWrapper

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | `[]` | Array of data rows for current page (from `response.data`) |
| `columns` | `ColumnDef<TData>[]` | `[]` | Column definitions (required) |
| `totalPages` | `number` | `1` | Total pages available (from `response.totalPages`) |
| `page` | `number` | `1` | Current page (1-based, bindable) |
| `pageSize` | `number` | `20` | Rows per page |
| `onPageChange` | `(pageIndex: number) => void` | - | Callback when user changes page (receives 0-based index) |
| `emptyMessage` | `string` | `'No data'` | Message when no rows available |

### Using PaginatedResponse

The remote function returns a `PaginatedResponse<T>` with:

```typescript
{
  data: T[];              // Items for current page only
  totalPages: number;     // Total pages available
  hasNextPage: boolean;   // Is there a next page?
  hasPreviousPage: boolean; // Is there a previous page?
  currentPage: number;    // Current page (1-based)
  pageSize: number;       // Items per page
  totalCount: number;     // Total items matching filters
}
```

## Column Definition

Each column is defined using `ColumnDef<TData>`:

```typescript
{
	// Accessor for the data key
	accessorKey: 'fieldName',
	
	// Header (function for i18n support)
	header: () => m.translation_key(),
	
	// Cell renderer (optional)
	cell: (info) => {
		const value = info.getValue();
		// Return formatted value or string
		return formattedValue;
	}
}
```

## Pagination Setup

### Remote Function Schema

Your remote function should include pagination fields:

```typescript
const FilterSchema = v.object({
	// Your filters
	search: v.optional(v.string(), ''),
	status: v.optional(v.string(), 'all'),
	
	// Pagination fields
	page: v.optional(v.pipe(
		v.number(),
		v.minValue(1)
	), 1),
	pageSize: v.optional(v.pipe(
		v.number(),
		v.minValue(1),
		v.maxValue(100)
	), 20)
});
```

### Remote Function Implementation

Use the pagination utility to return consistent responses:

```typescript
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';

export const getAll = query(FilterSchema, async (data) => {
	let baseQuery = db.select().from(tables.item);
	const conditions = [];
	
	// Build conditions
	if (data.search) {
		conditions.push(like(tables.item.name, `%${data.search}%`));
	}
	
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}
	
	// Add ordering
	baseQuery = baseQuery.orderBy(desc(tables.item.createdAt)) as typeof baseQuery;
	
	// Get count
	let countQuery = db.select({ count: count() }).from(tables.item);
	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}
	
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;
	
	// Paginate
	const { offset, limit } = calculatePagination(data.page, data.pageSize);
	const items = await baseQuery.limit(limit).offset(offset);
	
	return createPaginatedResponse(items, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});
```

### Component State Setup

```typescript
let searchQuery = $state('');
let currentPage = $state(1);
const pageSize = 20;

function handlePageChange(pageIndex: number) {
	// DataTableWrapper sends 0-based index, convert to 1-based for API
	currentPage = pageIndex + 1;
}
```

### Component Usage with Await

```svelte
{#await getAll({ 
	search: searchQuery, 
	page: currentPage, 
	pageSize 
}) then response}
	<DataTableWrapper
		data={response.data}
		columns={columns}
		totalPages={response.totalPages}
		page={currentPage}
		pageSize={pageSize}
		onPageChange={handlePageChange}
		emptyMessage={m.no_items()}
	/>
{/await}
```

## Features

### ✅ Server-Side Pagination
- Data fetched from server with current page only
- Total page count calculated from filtered results
- Responsive to filter/search changes
- Handles large datasets efficiently

### ✅ Automatic Pagination Controls
- Built-in pagination UI with TanStack Table
- Shows "Page X of Y" format
- Previous/Next buttons with proper disabled states
- Jump to specific page support

### ✅ Filter Integration
- Query parameters include page and pageSize
- Filters reset to page 1 when changed
- Reactive parameter updates trigger new queries

### ✅ Empty State
- Customizable empty message
- Centered full-width display
- Shown when no results match filters

### ✅ Sorting
- Ready for implementation
- Just add `enableSorting: true` to columns
- Combined with existing filters and pagination

### ✅ Responsive Design
- Tailwind CSS styled
- Border and hover effects
- Proper spacing and alignment
- Mobile-friendly controls

### ✅ Internationalization
- All labels use translation keys
- Headers support i18n functions
- Empty messages are translatable
- Easy to add new languages

### ✅ Type Safety
- Full TypeScript support
- Generic column definitions
- Type-safe cell renderers
- Response types fully typed

## HTML in Table Cells (renderSnippet Pattern)

For cells that need to render HTML content (like badges, colored status indicators), use the `createRawSnippet` and `renderSnippet` pattern from `@tanstack/table-core`:

```typescript
import { createRawSnippet, renderSnippet } from 'svelte';

const columns: ColumnDef<Product>[] = [
	// ... other columns ...
	{
		accessorKey: 'quantity',
		header: () => m.product_quantity(),
		cell: (info) => {
			const quantity = info.getValue() as number;
			
			// Create a snippet that renders HTML
			const snippet = createRawSnippet<[number]>((getQuantity) => {
				const qty = getQuantity();
				const color = qty > 10 ? 'text-green-600' : qty > 0 ? 'text-yellow-600' : 'text-red-600';
				
				return {
					render: () => `<div class="${color} font-semibold">${qty}</div>`,
					setup() {}
				};
			});
			
			// Render the snippet
			return renderSnippet(snippet, quantity);
		}
	},
	{
		accessorKey: 'status',
		header: () => m.product_status(),
		cell: (info) => {
			const status = info.getValue() as 'draft' | 'active' | 'archived';
			
			const snippet = createRawSnippet<[string]>((getStatus) => {
				const s = getStatus();
				const styles = {
					draft: 'bg-gray-100 text-gray-800',
					active: 'bg-green-100 text-green-800',
					archived: 'bg-red-100 text-red-800'
				};
				
				return {
					render: () => `<span class="px-2 py-1 rounded text-sm ${styles[s as keyof typeof styles]}">${s}</span>`,
					setup() {}
				};
			});
			
			return renderSnippet(snippet, status);
		}
	}
];
```

**Key Points:**
- Use `createRawSnippet` to create a snippet factory
- Return an object with `render()` and `setup()` methods
- `render()` returns the HTML string
- `renderSnippet` executes the snippet and returns the result
- Arguments passed to the snippet are accessible via the getter function

**Use Cases:**
- Colored status badges
- Number formatting with colors
- Icon + text combinations
- Custom HTML layouts
- Conditional styling

For action columns (Edit, Delete, etc.), use the `renderComponent` function from shadcn-svelte's data-table to render Svelte components directly in table cells. This is perfect for action columns with dropdowns, buttons, or other interactive elements.

### Key Concept

Instead of returning a string or simple value, the cell renderer uses `renderComponent` to instantiate a component:

```typescript
import { renderComponent } from '$lib/components/ui/data-table';
import MyActionCell from './my-action-cell.svelte';

cell: ({ row }) =>
  renderComponent(MyActionCell, {
    user: row.original,
    onEdit: handleEdit,
    onDelete: handleDelete
  })
```

### Step-by-Step Implementation

#### 1. Create an Action Cell Component

Create a new `.svelte` file for your action cell (e.g., `user-actions-cell.svelte`):

```svelte
<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		user: {
			id: string;
			username: string;
			email: string | null;
			// ... other fields
		};
		onEdit: (user: any) => void;
		onDelete: (user: any) => void;
	}

	let { user, onEdit, onDelete }: Props = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="ghost" size="icon" builders={[builder]}>
				<MoreHorizontal class="h-4 w-4" />
				<span class="sr-only">{m.common_actions()}</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => onEdit(user)}>
				<Pencil class="mr-2 h-4 w-4" />
				{m.common_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => onDelete(user)} class="text-destructive">
				<Trash2 class="mr-2 h-4 w-4" />
				{m.common_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
```

#### 2. Import renderComponent in Your Table Component

```typescript
import { renderComponent } from '$lib/components/ui/data-table';
import MyActionCell from './my-actions-cell.svelte';
```

#### 3. Define Handler Functions

```typescript
function handleEdit(item: T) {
	// Handle edit action
	editingItem = item;
	editDialogOpen = true;
}

function handleDelete(item: T) {
	// Handle delete action
	deletingItem = item;
	deleteDialogOpen = true;
}
```

#### 4. Add Action Column Definition

```typescript
const columns: ColumnDef<T>[] = [
	// ... other columns ...
	{
		id: 'actions',
		header: () => m.common_actions(),
		cell: ({ row }) =>
			renderComponent(MyActionCell, {
				item: row.original,
				onEdit: handleEdit,
				onDelete: handleDelete
			}),
		enableSorting: false,
		enableHiding: false
	}
];
```

### User Management Example

Here's the complete implementation from the user management table:

**user-list-table.svelte:**
```typescript
const columns: ColumnDef<User>[] = [
	// ... other columns ...
	{
		id: 'actions',
		header: () => m.common_actions(),
		cell: ({ row }) =>
			renderComponent(UserActionsCell, {
				user: row.original,
				onEdit: openEditDialog,
				onDelete: openDeleteDialog,
				onToggleAdmin: handleToggleAdmin
			}),
		enableSorting: false,
		enableHiding: false
	}
];

function openEditDialog(user: User) {
	if (!user) return;
	editingUser = user;
	editDialogOpen = true;
}

function openDeleteDialog(user: User) {
	if (!user) return;
	deletingUser = user;
	deleteDialogOpen = true;
}

async function handleToggleAdmin(user: Record<string, any> | null) {
	if (!user) return;
	await toggleAdminStatus({
		id: user?.id ?? '',
		isAdmin: !user?.isAdmin
	});
}
```

**user-actions-cell.svelte:**
```svelte
<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		user: any;
		onEdit: (user: any) => void;
		onDelete: (user: any) => void;
		onToggleAdmin: (user: any) => void;
	}

	let { user, onEdit, onDelete, onToggleAdmin }: Props = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="ghost" size="icon" builders={[builder]}>
				<MoreHorizontal class="h-4 w-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => onEdit(user)}>
				<Pencil class="mr-2 h-4 w-4" />
				{m.user_edit_user()}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => onToggleAdmin(user)}>
				{#if user.isAdmin}
					<ShieldOff class="mr-2 h-4 w-4" />
					{m.user_remove_admin()}
				{:else}
					<ShieldCheck class="mr-2 h-4 w-4" />
					{m.user_make_admin()}
				{/if}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => onDelete(user)} class="text-destructive">
				<Trash2 class="mr-2 h-4 w-4" />
				{m.user_delete_user()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
```

### Props Pattern

Always destructure props at the top of your action component:

```typescript
interface Props {
	row: MyDataType;
	onEdit: (row: MyDataType) => void;
	onDelete: (row: MyDataType) => void;
}

let { row, onEdit, onDelete }: Props = $props();
```

### Common Action Patterns

#### Simple Edit/Delete
```typescript
cell: ({ row }) =>
	renderComponent(SimpleActions, {
		item: row.original,
		onEdit: handleEdit,
		onDelete: handleDelete
	})
```

#### Multiple Actions with Conditional Rendering
```typescript
cell: ({ row }) =>
	renderComponent(AdminActions, {
		user: row.original,
		onEdit: handleEdit,
		onDelete: handleDelete,
		onToggleStatus: handleToggleStatus,
		onViewDetails: handleViewDetails
	})
```

#### Action with Custom Styling
```typescript
cell: ({ row }) =>
	renderComponent(StatusActions, {
		item: row.original,
		status: row.original.status,
		onApprove: handleApprove,
		onReject: handleReject
	})
```

### Best Practices for Action Cells

✅ **Do:**
- Use `renderComponent` for complex interactive cells
- Pass row data as a prop to the component
- Use callback props for event handling
- Keep action components focused and reusable
- Use descriptive prop names (e.g., `onEdit`, `onDelete`)
- Disable sorting and hiding on action columns

❌ **Don't:**
- Return component instances directly (must use `renderComponent`)
- Perform async operations inside cell render
- Mix logic in the table and action cell

### Troubleshooting Action Cells

**Issue:** Component not rendering
- Ensure `renderComponent` is imported from `$lib/components/ui/data-table`
- Check that all required props are passed

**Issue:** Props not updating
- Use `$props()` in Svelte 5 syntax
- Ensure props are passed in the correct order

**Issue:** Events not firing
- Verify callback functions are defined in parent component
- Check that `onclick` handlers are properly bound

## Migration Checklist

When migrating existing tables to use `DataTableWrapper` with pagination:

### Remote Function Setup
- [ ] Add `page` and `pageSize` to validation schema
- [ ] Import pagination utilities: `createPaginatedResponse`, `calculatePagination`
- [ ] Build conditions as separate array instead of chaining `.where()`
- [ ] Create count query with same conditions as data query
- [ ] Execute count query to get total count
- [ ] Use `calculatePagination()` to get offset and limit
- [ ] Execute data query with limit/offset
- [ ] Return using `createPaginatedResponse()`

### Component Setup
- [ ] Import remote function and DataTableWrapper
- [ ] Define data type interface
- [ ] Create column definitions with proper headers and cells
- [ ] Setup state: `currentPage`, `searchQuery`, `pageSize`
- [ ] Create `handlePageChange()` function (convert 0-based to 1-based)
- [ ] Use `{#await}` to call remote function with pagination params

### DataTableWrapper Integration
- [ ] Replace old table markup with `<DataTableWrapper />`
- [ ] Pass `data={response.data}` (not all items)
- [ ] Pass `totalPages={response.totalPages}`
- [ ] Pass `page={currentPage}` (1-based)
- [ ] Pass `pageSize={pageSize}`
- [ ] Pass `onPageChange={handlePageChange}`
- [ ] Pass `emptyMessage` for custom empty state

### Testing
- [ ] Test page 1 loads with correct data
- [ ] Test pagination controls appear
- [ ] Test "next" button navigates to page 2
- [ ] Test "previous" button works
- [ ] Test search/filter resets to page 1
- [ ] Test empty state when no results
- [ ] Test last page shows fewer items if needed
- [ ] Test i18n keys are used correctly
- [ ] Test all action buttons work (if applicable)
- [ ] Test on mobile and desktop

### Action Cells Migration Checklist (if applicable)
- [ ] Create new action cell component file
- [ ] Define Props interface with item and callback props
- [ ] Use `$props()` to destructure
- [ ] Import `renderComponent` from data-table
- [ ] Add action handlers in parent component
- [ ] Update column definition to use `renderComponent`
- [ ] Set `enableSorting: false` on action column
- [ ] Set `enableHiding: false` on action column
- [ ] Test all action handlers work correctly

### HTML Cell Rendering (if applicable)
- [ ] Import `createRawSnippet` and `renderSnippet`
- [ ] Create snippet with `createRawSnippet`
- [ ] Return `render()` and `setup()` methods
- [ ] Use `renderSnippet()` in cell renderer
- [ ] Test HTML renders correctly
- [ ] Verify styling is applied
- [ ] Test responsive behavior

## Common Translation Keys

All pagination and UI text uses these keys:

- `common_loading` - "Loading..."
- `common_page` - "Page"
- `common_of` - "of"
- `common_previous` - "Previous"
- `common_next` - "Next"
- `common_no_data` - "No data"
- `common_actions` - "Actions"

These are automatically added to both `en.json` and `uk.json`.

## Common Translation Keys

All pagination and UI text uses these keys:

- `common_loading` - "Loading..."
- `common_page` - "Page"
- `common_of` - "of"
- `common_previous` - "Previous"
- `common_next` - "Next"
- `common_no_data` - "No data"
- `common_actions` - "Actions"

These are automatically added to both `en.json` and `uk.json`.

## Best Practices

### ✅ Pagination Pattern

1. **Always use the pagination utility in remote functions**
   - Ensures consistent response structure across all pages
   - Reduces code duplication
   - Makes refactoring easier

2. **Build conditions as a separate array**
   ```typescript
   const conditions = [];
   if (filter1) conditions.push(...);
   if (filter2) conditions.push(...);
   // Apply once to both queries
   ```

3. **Apply conditions to both count and data queries**
   - Count must match filtered results
   - Otherwise pagination will be incorrect

4. **Add deterministic ordering**
   ```typescript
   baseQuery = baseQuery.orderBy(desc(tables.item.createdAt));
   ```

5. **Reset page to 1 when filters change**
   - Component handles this automatically with reactive parameters
   - Users expect to start at page 1 after filtering

### ✅ Component Patterns

1. **Use `await` pattern for remote function calls**
   ```svelte
   {#await getAll({ page: currentPage, pageSize }) then response}
     <DataTableWrapper {...response} />
   {/await}
   ```

2. **Convert 0-based to 1-based in page change handler**
   ```typescript
   function handlePageChange(pageIndex: number) {
     currentPage = pageIndex;
   }
   ```

3. **Bind searchQuery to input for reactive filtering**
   ```svelte
   <Input bind:value={searchQuery} />
   <!-- This automatically triggers remote function re-call -->
   ```

### ✅ Column Definitions

1. **Always use i18n functions for headers**
   ```typescript
   header: () => m.user_email()  // ✓ Good
   header: 'Email'               // ✗ Bad
   ```

2. **Format cell values for display**
   ```typescript
   cell: (info) => {
     const date = info.getValue() as Date;
     return date.toLocaleDateString();  // ✓ Formatted
   }
   ```

3. **Use `renderSnippet` for HTML content**
   ```typescript
   cell: (info) => renderSnippet(snippet, value)  // ✓ HTML rendering
   ```

4. **Use `renderComponent` for interactive cells**
   ```typescript
   cell: ({ row }) => renderComponent(ActionsCell, { item: row.original })
   ```

### ✅ Action Cells

1. **Keep action components focused**
   - Single responsibility
   - Receive data via props
   - Call parent callbacks

2. **Use dropdown menus for multiple actions**
   - Better UX than button rows
   - Takes less space
   - Professional appearance

3. **Disable dangerous actions appropriately**
   ```typescript
   <DropdownMenu.Item 
     onclick={() => onDelete(user)}
     class="text-destructive"
   >
     {m.delete()}
   </DropdownMenu.Item>
   ```

### ✅ Remote Function Schema

1. **Always include pagination fields with defaults**
   ```typescript
   page: v.optional(v.pipe(
     v.number(),
     v.minValue(1)
   ), 1),
   pageSize: v.optional(v.pipe(
     v.number(),
     v.minValue(1),
     v.maxValue(100)
   ), 20)
   ```

2. **Validate pageSize to prevent abuse**
   - Min: 1 item per page
   - Max: 100 items per page (adjustable)

3. **Use optional filters with sensible defaults**
   ```typescript
   search: v.optional(v.string(), ''),
   status: v.optional(v.string(), 'all')
   ```

### ❌ Common Mistakes to Avoid

1. **Don't store query results in component state**
   ```typescript
   // ✗ Wrong
   let items = $state([]);
   $effect(async () => {
     items = await getAll();
   });
   
   // ✓ Correct
   {#await getAll() then response}
     {response.data}
   {/await}
   ```

2. **Don't forget conditions in count query**
   ```typescript
   // ✗ Wrong - Count doesn't match filtered results
   let countQuery = db.select({ count: count() }).from(table);
   
   // ✓ Correct - Same conditions as data query
   if (conditions.length > 0) {
     countQuery = countQuery.where(and(...conditions));
   }
   ```

3. **Don't use manual offset calculation**
   ```typescript
   // ✗ Error-prone
   const offset = (page - 1) * pageSize;
   
   // ✓ Use utility
   const { offset, limit } = calculatePagination(page, pageSize);
   ```

4. **Don't forget to convert page index in callback**
   ```typescript
   // ✗ Wrong - breaks pagination
   function handlePageChange(pageIndex: number) {
     currentPage = pageIndex;  // pageIndex is 0-based!
   }
   
   // ✓ Correct
   function handlePageChange(pageIndex: number) {
     currentPage = pageIndex + 1;
   }
   ```

5. **Don't hardcode page size in component**
   ```typescript
   // ✗ No control over amount of data
   <DataTableWrapper pageSize={10} />
   
   // ✓ Make it configurable
   const pageSize = 20;
   <DataTableWrapper pageSize={pageSize} />
   ```

### ✅ Performance Tips

1. **Use database indexes on filtered columns**
   ```sql
   CREATE INDEX idx_table_search_column ON table(search_column);
   CREATE INDEX idx_table_order_column ON table(order_column DESC);
   ```

2. **Limit page size (recommend max 100)**
   - Prevents large queries
   - Faster pagination
   - Better UX

3. **Consider caching count results**
   - Cache for stable filter combinations
   - TTL: 5-15 minutes
   - Invalidate on mutations

4. **Execute count and data queries in parallel**
   ```typescript
   const [items, countResult] = await Promise.all([
     baseQuery.limit(limit).offset(offset),
     countQuery
   ]);
   ```

## Benefits

✨ **Consistency** - All tables use the same component and pagination pattern
✨ **Maintainability** - Single source of truth for table logic and pagination
✨ **Performance** - Server-side pagination handles large datasets efficiently
✨ **Extensibility** - Easy to add sorting, filters, column visibility
✨ **i18n Ready** - Built-in internationalization support
✨ **Accessible** - Proper semantic HTML and ARIA attributes
✨ **Type Safe** - Full TypeScript support throughout
