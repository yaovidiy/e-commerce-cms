<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Trash2 } from '@lucide/svelte/icons';
	import type { Product } from '$lib/server/db/schema';

	interface Props {
		product: Product;
		onEdit: (product: Product) => void;
		onDelete: (product: Product) => void;
	}

	let { product, onEdit, onDelete }: Props = $props();
</script>

<div class="flex justify-end gap-2">
	<Button variant="ghost" size="sm" onclick={() => onEdit(product)}>
		<Pencil class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="text-destructive"
		onclick={() => onDelete(product)}
	>
		<Trash2 class="size-4" />
	</Button>
</div>
