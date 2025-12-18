<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		item: any;
		onEdit: (item: any) => void;
		onDelete: (item: any) => void;
	}

	let { item, onEdit, onDelete }: Props = $props();
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
			<DropdownMenu.Item onclick={() => onEdit(item)}>
				<Pencil class="mr-2 h-4 w-4" />
				{m.common_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => onDelete(item)} class="text-destructive">
				<Trash2 class="mr-2 h-4 w-4" />
				{m.common_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
