# User Management Domain

## Overview
Complete CRUD system for managing users in the admin panel with role-based access control.

## Architecture

### Components Structure
```
src/lib/components/admin/features/user-management/
├── user-list-table.svelte       # Main list view with filtering
├── create-user-dialog.svelte    # Create user modal form
├── edit-user-dialog.svelte      # Edit user modal form
├── delete-user-dialog.svelte    # Delete confirmation modal
└── index.ts                     # Barrel exports
```

### Remote Functions
Located in `src/lib/remotes/user.remote.ts`:

- **`getAllUsers()`** - query() - Fetches all users with basic info
- **`createUser()`** - form() - Creates new user with validation
- **`updateUser()`** - form() - Updates existing user (optional password)
- **`deleteUser()`** - form() - Deletes user with admin protection
- **`toggleAdminStatus()`** - command() - Quick admin status toggle

### Database Schema
```typescript
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  role: text('role').notNull().default('user'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

### Validation Schemas
Located in `src/lib/server/schemas/index.ts`:

- **CreateUserSchema** - username, password, role, isAdmin
- **UpdateUserSchema** - username, password (optional), role, isAdmin
- **DeleteUserSchema** - id with admin user protection
- **ToggleAdminStatusSchema** - id, isAdmin

## Implementation Patterns

### 1. List with Filtering
```svelte
<script lang="ts">
  import { getAllUsers, me } from '$lib/remotes/user.remote';
  
  let users = $derived(await getAllUsers());
  let currentUser = $derived(await me());
  
  // Filter out current user from list
  let filteredUsers = $derived(
    users.filter((user) => user.id !== currentUser?.id)
  );
</script>
```

**Key Pattern**: Derived state filtering current user to prevent self-deletion.

### 2. Modal Forms with Auto-Refresh
```svelte
<script lang="ts">
  import { createUser, getAllUsers } from '$lib/remotes/user.remote';
  
  let open = $state(false);
  
  // Auto-close and refresh on success
  $effect(() => {
    if (createUser.result) {
      open = false;
      getAllUsers().refresh();
    }
  });
</script>

<Dialog.Root bind:open>
  <form {...createUser}>
    <!-- form fields -->
  </form>
</Dialog.Root>
```

**Key Pattern**: $effect() detects `result` and triggers modal close + query refresh.

### 3. Command Pattern for Quick Actions
```typescript
export const toggleAdminStatus = command(
  v.object({ id: v.string(), isAdmin: v.boolean() }),
  async (data) => {
    requireAdminUser();
    await db.update(tables.user)
      .set({ isAdmin: data.isAdmin ? 1 : 0 })
      .where(eq(tables.user.id, data.id));
    return { success: true };
  }
);
```

**Key Pattern**: Use `command()` for simple programmatic actions without form submission.

### 4. Action Dropdown Menu
```svelte
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} variant="ghost" size="icon">
      <MoreHorizontal class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onclick={() => openEdit(user)}>
      <Pencil class="mr-2 h-4 w-4" />
      {m.common_edit()}
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={async () => {
      await toggleAdminStatus({ id: user.id, isAdmin: !user.isAdmin })
        .updates(getAllUsers());
    }}>
      {#if user.isAdmin}
        <ShieldOff class="mr-2 h-4 w-4" />
        {m.user_remove_admin()}
      {:else}
        <ShieldCheck class="mr-2 h-4 w-4" />
        {m.user_make_admin()}
      {/if}
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="text-destructive" onclick={() => openDelete(user)}>
      <Trash2 class="mr-2 h-4 w-4" />
      {m.common_delete()}
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

**Key Pattern**: DropdownMenu consolidates multiple actions, uses `.updates()` for query refresh.

### 5. Edit Form Pre-population
```svelte
<script lang="ts">
  import { updateUser } from '$lib/remotes/user.remote';
  
  let { user } = $props<{ user: User }>();
  
  // Pre-populate form when dialog opens
  $effect(() => {
    if (open) {
      updateUser.fields.set({
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        password: '' // Optional field - leave blank to keep existing
      });
    }
  });
</script>
```

**Key Pattern**: Use `fields.set()` to pre-populate form with existing data.

### 6. Optional Password Update
```svelte
<form {...updateUser}>
  <Label for={updateUser.fields.password.name}>
    {m.user_password()}
  </Label>
  <Input {...updateUser.fields.password.as('password')} />
  <p class="text-sm text-muted-foreground">
    {m.user_password_leave_blank()}
  </p>
</form>
```

**Schema**:
```typescript
export const UpdateUserSchema = v.object({
  id: v.string(),
  username: v.pipe(v.string(), v.minLength(3), v.maxLength(31)),
  password: v.optional(v.string()),
  role: v.picklist(['admin', 'user']),
  isAdmin: v.boolean()
});
```

**Server-side handling**:
```typescript
export const updateUser = form(UpdateUserSchema, async (data) => {
  const user = requireAdminUser();
  
  const updateData: any = {
    username: data.username,
    role: data.role,
    isAdmin: data.isAdmin ? 1 : 0
  };
  
  // Only hash and update password if provided
  if (data.password && data.password.length > 0) {
    updateData.hashedPassword = await hash(data.password, argon2Params);
  }
  
  await db.update(tables.user)
    .set(updateData)
    .where(eq(tables.user.id, data.id));
});
```

**Key Pattern**: Optional password update - hash and update only if value provided.

## UI Components Used

### shadcn-svelte Components
- **Dialog** - Modal container for all forms
- **Select** - Role selection dropdown
- **Switch** - Toggle for admin privileges
- **DropdownMenu** - Actions menu trigger
- **Button** - All form submissions and actions
- **Input** - Username and password fields
- **Label** - Form field labels

### Installation Commands
```bash
pnpm dlx shadcn-svelte@latest add dialog
pnpm dlx shadcn-svelte@latest add select
pnpm dlx shadcn-svelte@latest add switch
pnpm dlx shadcn-svelte@latest add dropdown-menu
```

## Internationalization

### Translation Keys
Located in `messages/en.json` and `messages/uk.json`:

```json
{
  "user_create_user": "Create User",
  "user_edit_user": "Edit User",
  "user_delete_user": "Delete User",
  "user_delete_confirmation": "Are you sure you want to delete user {username}?",
  "user_username": "Username",
  "user_password": "Password",
  "user_password_leave_blank": "Leave blank to keep current password",
  "user_role": "Role",
  "user_is_admin": "Admin Privileges",
  "user_make_admin": "Make Admin",
  "user_remove_admin": "Remove Admin",
  "common_actions": "Actions",
  "common_edit": "Edit",
  "common_delete": "Delete",
  "common_save": "Save",
  "common_cancel": "Cancel"
}
```

**Key Pattern**: All user-facing text uses translation keys via `m.keyName()`.

## Security Considerations

### 1. Admin-Only Operations
All user management functions require admin privileges:
```typescript
export const createUser = form(CreateUserSchema, async (data) => {
  requireAdminUser(); // Throws 401 if not admin
  // ... creation logic
});
```

### 2. Self-Deletion Prevention
Users cannot delete themselves:
```typescript
export const deleteUser = form(DeleteUserSchema, async (data) => {
  const user = requireAdminUser();
  if (data.id === user.id) {
    error(400, 'Cannot delete your own account');
  }
  // ... deletion logic
});
```

### 3. Password Hashing
All passwords hashed with Argon2:
```typescript
import { hash } from '@node-rs/argon2';

const argon2Params = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
};

const hashedPassword = await hash(data.password, argon2Params);
```

### 4. First User Setup
First user automatically becomes admin:
```typescript
const userCount = await db.select({ count: count() }).from(tables.user);
const isFirstUser = userCount[0].count === 0;

await db.insert(tables.user).values({
  // ... other fields
  role: isFirstUser ? 'admin' : 'user',
  isAdmin: isFirstUser
});
```

## Route Structure
```
src/routes/admin/users/+page.svelte
```

**Layout**: Uses `src/routes/admin/+layout.svelte` with AdminSidebar navigation.

**Protection**: Admin-only route enforced via `requireAdminUser()` in remote functions.

## Decision Patterns

### form() vs command()
- **Use form()** when:
  - Operation involves form submission
  - Need progressive enhancement (works without JS)
  - Creating/updating/deleting resources
  - Need validation error display

- **Use command()** when:
  - Simple programmatic toggle/update
  - No form UI needed
  - Quick state changes (e.g., toggle admin status)
  - Always requires JavaScript

### Modal Auto-Close Pattern
```svelte
let open = $state(false);

$effect(() => {
  if (formFunction.result) {
    open = false;
    queryFunction().refresh();
  }
});
```

**Why**: Detects successful submission via `result` property, closes modal, refreshes list.

### Query Refresh Methods
1. **Server-side** - Inside remote function:
   ```typescript
   await getAllUsers().refresh();
   ```

2. **Client-side** - Using `.updates()`:
   ```typescript
   await command(data).updates(getAllUsers());
   ```

3. **With optimistic update**:
   ```typescript
   await command(data).updates(
     getAllUsers().withOverride((users) => 
       users.map(u => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u)
     )
   );
   ```

## Best Practices

1. **Always filter current user** - Prevent self-actions
2. **Use $effect() for auto-refresh** - Clean side effect handling
3. **Pre-populate edit forms** - Better UX with existing data
4. **Optional password updates** - Don't force password changes
5. **Consolidate actions in DropdownMenu** - Cleaner UI
6. **Use command() for quick toggles** - Simpler than form submission
7. **Add confirmation for destructive actions** - Prevent accidents
8. **Include icons in action items** - Visual clarity
9. **Use destructive variant for delete** - Clear visual danger
10. **Always use translation keys** - Proper i18n support

## Testing Considerations

### E2E Test Coverage
Should cover:
- List display filtering current user
- Create user with validation
- Edit user with password update
- Edit user without password change
- Toggle admin status
- Delete user with confirmation
- Prevent self-deletion
- Admin-only access enforcement

### Example Test Structure
```typescript
test('user management flow', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page);
  
  // Navigate to users page
  await page.goto('/admin/users');
  
  // Create user
  await page.getByRole('button', { name: 'Create User' }).click();
  await page.getByLabel('Username').fill('testuser');
  // ... fill form and submit
  
  // Verify user appears in list
  await expect(page.getByText('testuser')).toBeVisible();
  
  // Edit user
  // Toggle admin
  // Delete user
});
```

## Extension Points

### Future Enhancements
1. **Pagination** - For large user lists
2. **Search/Filter** - By username, role, admin status
3. **Bulk Actions** - Select multiple users for batch operations
4. **User Profiles** - Extended user information
5. **Activity Logs** - Track user actions
6. **Email Verification** - Require email confirmation
7. **Password Reset** - Self-service password recovery
8. **2FA** - Two-factor authentication
9. **Role Permissions** - Granular permission system
10. **User Import/Export** - CSV/JSON data management

## Related Documentation
- [Authentication](./auth.md) - Session management and login flow
- [Component Architecture](./component-architecture.md) - 4-tier component structure
- [Validation](./validation.md) - Valibot schema patterns
- [UI Components](./ui.md) - shadcn-svelte patterns
