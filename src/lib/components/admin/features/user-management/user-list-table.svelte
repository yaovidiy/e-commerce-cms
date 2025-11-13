<script lang="ts">
	import { getAllUsers, me, toggleAdminStatus } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import EditUserDialog from './edit-user-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import { MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff, Search } from '@lucide/svelte';

	let searchQuery = $state('');

	type User = {
		id: string;
		username: string;
		email: string | null;
		role: string;
		isAdmin: boolean;
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
		await toggleAdminStatus({
			id: user?.id ?? '',
			isAdmin: !user?.isAdmin
		});
	}
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

	<div class="rounded-md border">
		<div class="w-full">
			<div class="bg-muted/50 border-b px-4 py-3">
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
				{#await getAllUsers({ username: searchQuery })}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">Loading ...</div>
				{:then users}
					{#each users as user}
						<div class="hover:bg-muted/50 border-b px-4 py-3 last:border-0">
							<div class="grid grid-cols-6 items-center gap-4">
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
										<span class="text-muted-foreground text-sm">{m.user_no()}</span>
									{/if}
								</div>
								<div class="text-muted-foreground text-sm">
									{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
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
											<DropdownMenu.Item
												onclick={() => openDeleteDialog(user)}
												class="text-destructive"
											>
												<Trash2 class="mr-2 h-4 w-4" />
												{m.user_delete_user()}
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</div>
						</div>
					{:else}
						<div class="px-4 py-8 text-center text-sm text-muted-foreground">
							{m.user_no_users()}
						</div>
					{/each}
				{/await}
			</div>
		</div>
	</div>
</div>

<EditUserDialog user={editingUser} bind:open={editDialogOpen} />

<DeleteUserDialog user={deletingUser} bind:open={deleteDialogOpen} />
