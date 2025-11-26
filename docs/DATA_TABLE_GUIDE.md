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

## Action Columns

For action columns (Edit, Delete, etc.), use custom cell renderers:

```typescript
{
	id: 'actions',
	header: () => m.common_actions(),
	cell: (info) => {
		const row = info.row.original;
		return {
			component: ActionCellComponent,
			props: { row, onEdit, onDelete }
		};
	}
}
```

Create a separate component for complex actions:

```svelte
<!-- actions-cell.svelte -->
<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let { row, onEdit, onDelete } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" size="icon" builders={[builder]}>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => onEdit(row)}>
			<Pencil class="mr-2 h-4 w-4" />
			{m.common_edit()}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => onDelete(row)}>
			<Trash2 class="mr-2 h-4 w-4" />
			{m.common_delete()}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

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
