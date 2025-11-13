<script lang="ts">
	import { getAllUsers, me, toggleAdminStatus } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EditUserDialog from './edit-user-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import { MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff, Search } from '@lucide/svelte';

	let currentUser = $derived(await me());
	let searchQuery = $state('');
	let users = $derived(await getAllUsers({ username: searchQuery }));
	
	// Filter out current user from the list
	let filteredUsers = $derived(
		users.filter((user) => user.id !== currentUser?.id)
	);

	// Track which user is being edited/deleted
	let editingUser = $state<typeof filteredUsers[0] | null>(null);
	let deletingUser = $state<typeof filteredUsers[0] | null>(null);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	function openEditDialog(user: typeof filteredUsers[0]) {
		editingUser = user;
		editDialogOpen = true;
	}

	function openDeleteDialog(user: typeof filteredUsers[0]) {
		deletingUser = user;
		deleteDialogOpen = true;
	}

	async function handleToggleAdmin(user: typeof filteredUsers[0]) {
		await toggleAdminStatus({
			id: user.id,
			isAdmin: !user.isAdmin
		});
	}
</script>

<div class="flex flex-col gap-4">
	<div class="relative max-w-sm">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="text"
			placeholder={m.user_search_placeholder()}
			bind:value={searchQuery}
			class="pl-9"
		/>
	</div>

	<div class="rounded-md border">
	<div class="w-full">
		<div class="border-b bg-muted/50 px-4 py-3">
			<div class="grid grid-cols-6 gap-4 font-medium">
				<div>{m.user_username()}</div>
				<div>{m.user_email()}</div>
				<div>{m.user_role()}</div>
				<div>{m.user_admin_status()}</div>
				<div>{m.user_created_at()}</div>
				<div class="text-right">{m.common_actions()}</div>
			</div>
		</div>
		<div>
			{#if filteredUsers.length === 0}
				<div class="px-4 py-8 text-center text-sm text-muted-foreground">
					{m.user_no_users()}
				</div>
			{:else}
				{#each filteredUsers as user}
					<div class="border-b px-4 py-3 last:border-0 hover:bg-muted/50">
						<div class="grid grid-cols-6 gap-4 items-center">
							<div class="font-medium">{user.username}</div>
							<div class="text-muted-foreground">{user.email || '-'}</div>
							<div>
								<span
									class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset {user.role ===
									'admin'
										? 'bg-blue-50 text-blue-700 ring-blue-700/10'
										: 'bg-gray-50 text-gray-700 ring-gray-700/10'}"
								>
									{user.role}
								</span>
							</div>
							<div>
								{#if user.isAdmin}
									<span class="text-sm text-green-600">{m.user_yes()}</span>
								{:else}
									<span class="text-sm text-muted-foreground">{m.user_no()}</span>
								{/if}
							</div>
							<div class="text-sm text-muted-foreground">
								{user.createdAt
									? new Date(user.createdAt).toLocaleDateString()
									: '-'}
							</div>
							<div class="flex items-center justify-end gap-2">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="ghost" size="icon">
											<MoreHorizontal class="h-4 w-4" />
											<span class="sr-only">{m.common_actions()}</span>
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => openEditDialog(user)}>
											<Pencil class="mr-2 h-4 w-4" />
											{m.user_edit_user()}
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => handleToggleAdmin(user)}>
											{#if user.isAdmin}
												<ShieldOff class="mr-2 h-4 w-4" />
												{m.user_remove_admin()}
											{:else}
												<ShieldCheck class="mr-2 h-4 w-4" />
												{m.user_make_admin()}
											{/if}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openDeleteDialog(user)} class="text-destructive">
											<Trash2 class="mr-2 h-4 w-4" />
											{m.user_delete_user()}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
</div>

{#if editingUser}
	<EditUserDialog user={editingUser} bind:open={editDialogOpen} />
{/if}

{#if deletingUser}
	<DeleteUserDialog user={deletingUser} bind:open={deleteDialogOpen} />
{/if}
