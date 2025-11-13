<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { UserListTable, CreateUserDialog } from '$lib/components/admin/features/user-management';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.admin_users()}</h2>
			<p class="text-muted-foreground">{m.user_manage_description()}</p>
		</div>
		<CreateUserDialog />
	</div>

	<UserListTable />
</div>
