# Data Table Implementation Guide

This guide explains how to use the new `DataTableWrapper` component for all table instances in the admin panel.

## Overview

The `DataTableWrapper` component provides a unified, reusable interface for displaying data tables using TanStack Table (formerly React Table) with Svelte support. This replaces all custom table implementations across the application.

## Installation

The component is already installed and available at:
- **Component**: `src/lib/components/common/data-display/DataTableWrapper`
- **UI Base**: `src/lib/components/ui/data-table` (shadcn-svelte)

## Basic Usage

### 1. Import the Component

```svelte
<script lang="ts">
	import { DataTableWrapper } from '$lib/components/common/data-display';
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

### 4. Fetch Your Data

```typescript
let users: User[] = $state([]);
let isLoading = $state(false);

$effect(async () => {
	isLoading = true;
	try {
		const result = await getAllUsers({ username: searchQuery });
		users = result;
	} finally {
		isLoading = false;
	}
});
```

### 5. Render the Table

```svelte
<DataTableWrapper
	data={users}
	{columns}
	pageSize={10}
	{isLoading}
	emptyMessage={m.user_no_users()}
/>
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
	let users: User[] = $state([]);
	let isLoading = $state(false);

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

	$effect(async () => {
		isLoading = true;
		try {
			const result = await getAllUsers({ username: searchQuery });
			users = result;
		} finally {
			isLoading = false;
		}
	});
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

	<DataTableWrapper
		data={users}
		{columns}
		pageSize={10}
		{isLoading}
		emptyMessage={m.user_no_users()}
	/>
</div>
```

## Props

### DataTableWrapper

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | `[]` | Array of data rows to display |
| `columns` | `ColumnDef<TData>[]` | `[]` | Column definitions (required) |
| `pageSize` | `number` | `10` | Rows per page |
| `isLoading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `'No data'` | Message when no rows |

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

## Features

### ✅ Automatic Pagination
- Built-in pagination controls
- Shows page number and total
- Previous/Next buttons with disabled states

### ✅ Loading State
- Loading indicator with centered message
- Prevents interaction during load

### ✅ Empty State
- Customizable empty message
- Centered full-width display

### ✅ Sorting
- Ready for implementation
- Just add `enableSorting: true` to columns

### ✅ Responsive Design
- Tailwind CSS styled
- Border and hover effects
- Proper spacing and alignment

### ✅ Internationalization
- All labels use translation keys
- Common keys provided
- Easy to add new languages

## Action Columns with renderComponent

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

When migrating existing tables to use `DataTableWrapper`:

- [ ] Import `DataTableWrapper` and `ColumnDef`
- [ ] Define data type interface
- [ ] Create column definitions with proper headers and cells
- [ ] Setup data fetching with `$effect`
- [ ] Setup loading state tracking
- [ ] Replace old table markup with `<DataTableWrapper />`
- [ ] Test pagination works
- [ ] Test search/filter reactivity
- [ ] Test empty state
- [ ] Test loading state
- [ ] Test action columns (if applicable)
- [ ] Verify all i18n keys are used
- [ ] Update component imports in index.ts if needed

### Action Cells Migration Checklist

When adding action cells to existing tables:

- [ ] Create new action cell component file
- [ ] Define Props interface
- [ ] Use `$props()` to destructure
- [ ] Import `renderComponent` from data-table
- [ ] Add action handlers in parent component
- [ ] Update column definition to use `renderComponent`
- [ ] Set `enableSorting: false` on action column
- [ ] Set `enableHiding: false` on action column
- [ ] Export action cell component in index.ts
- [ ] Test all action handlers work correctly

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

## Benefits

✨ **Consistency** - All tables use the same component and styling
✨ **Maintainability** - Single source of truth for table logic
✨ **Performance** - TanStack Table is highly optimized
✨ **Extensibility** - Easy to add sorting, filtering, etc.
✨ **i18n Ready** - Built-in internationalization support
✨ **Accessible** - Proper semantic HTML and ARIA attributes
