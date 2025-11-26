<script lang="ts">
	import { getAllUsers, toggleAdminStatus } from '$lib/remotes/user.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { Input } from '$lib/components/ui/input';
	import { renderComponent } from '$lib/components/ui/data-table';
	import EditUserDialog from './edit-user-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import UserActionsCell from './user-actions-cell.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Search } from '@lucide/svelte';
	import type { ColumnDef } from '@tanstack/table-core';

	let searchQuery = $state('');
	let isLoading = $state(false);

	type User = {
		id: string;
		username: string;
		email: string | null;
		role: string;
		isAdmin: boolean;
		createdAt: Date | null;
	};

	// Track which user is being edited/deleted
	let editingUser = $state<null | User>(null);
	let deletingUser = $state<null | User>(null);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

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

	// Define columns for the data table
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'username',
			header: () => m.user_username()
		},
		{
			accessorKey: 'email',
			header: () => m.user_email(),
			cell: (info: any) => info.getValue() || '-'
		},
		{
			accessorKey: 'role',
			header: () => m.user_role(),
			cell: (info: any) => {
				const role = info.getValue() as string;
				return role === 'admin' ? 'Admin' : 'User';
			}
		},
		{
			accessorKey: 'isAdmin',
			header: () => m.user_admin_status(),
			cell: (info: any) => (info.getValue() ? m.user_yes() : m.user_no())
		},
		{
			accessorKey: 'createdAt',
			header: () => m.user_created_at(),
			cell: (info: any) => {
				const date = info.getValue() as Date | null;
				if (date instanceof Date) {
					return date.toLocaleDateString();
				} else if (date) {
					return new Date(date as string | number).toLocaleDateString();
				}
				return '-';
			}
		},
		{
			id: 'actions',
			header: () => m.common_actions(),
			cell: ({ row }: any) =>
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

	{#await getAllUsers({ username: searchQuery })}
		<div class="flex items-center justify-center p-8">
			<p class="text-muted-foreground">{m.common_loading()}</p>
		</div>
	{:then users}
		<DataTableWrapper data={users.data} {columns} pageSize={10} {isLoading} />
	{:catch error}
		<div class="flex flex-col items-center justify-center gap-2 p-8">
			<p class="text-red-600">{error}</p>
		</div>
	{/await}
</div>

<EditUserDialog user={editingUser} bind:open={editDialogOpen} />
<DeleteUserDialog user={deletingUser} bind:open={deleteDialogOpen} />
