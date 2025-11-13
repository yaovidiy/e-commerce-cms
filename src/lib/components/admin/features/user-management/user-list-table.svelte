<script lang="ts">
	import { getAllUsers, me } from '$lib/remotes/user.remote';
	import * as m from '$lib/paraglide/messages';

	let currentUser = $derived(await me());
	let users = $derived(await getAllUsers());
	
	// Filter out current user from the list
	let filteredUsers = $derived(
		users.filter((user) => user.id !== currentUser?.id)
	);
</script>

<div class="rounded-md border">
	<div class="w-full">
		<div class="border-b bg-muted/50 px-4 py-3">
			<div class="grid grid-cols-5 gap-4 font-medium">
				<div>{m.user_username()}</div>
				<div>{m.user_email()}</div>
				<div>{m.user_role()}</div>
				<div>{m.user_admin_status()}</div>
				<div>{m.user_created_at()}</div>
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
						<div class="grid grid-cols-5 gap-4 items-center">
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
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
