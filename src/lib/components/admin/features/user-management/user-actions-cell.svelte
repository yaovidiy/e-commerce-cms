<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		user: {
			id: string;
			username: string;
			email: string | null;
			role: string;
			isAdmin: boolean;
			createdAt: Date | null;
		};
		onEdit: (user: any) => void;
		onDelete: (user: any) => void;
		onToggleAdmin: (user: any) => void;
	}

	let { user, onEdit, onDelete, onToggleAdmin }: Props = $props();
</script>

<div class="flex items-center justify-end gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="ghost" size="icon">
				<MoreHorizontal class="h-4 w-4" />
				<span class="sr-only">{m.common_actions()}</span>
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
