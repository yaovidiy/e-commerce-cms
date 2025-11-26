<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Category } from '$lib/server/db/schema';

	interface Props {
		category: Category;
		onEdit: (category: Category) => void;
		onDelete: (category: Category) => void;
	}

	let { category, onEdit, onDelete }: Props = $props();
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
			<DropdownMenu.Item onclick={() => onEdit(category)}>
				<Pencil class="mr-2 h-4 w-4" />
				{m.common_edit()}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => onDelete(category)} class="text-destructive">
				<Trash2 class="mr-2 h-4 w-4" />
				{m.common_delete()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
