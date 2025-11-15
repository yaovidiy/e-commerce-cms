<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { deleteCategory } from '$lib/remotes/category.remote';
	import * as m from '$lib/paraglide/messages';
	import type { Category } from '$lib/server/db/schema';

	let {
		category = $bindable(),
		open = $bindable()
	}: { category: Category | null; open: boolean } = $props();

	// Watch for successful deletion
	$effect(() => {
		if (deleteCategory.result) {
			open = false;
		}
	});

	// Pre-populate form when dialog opens
	$effect(() => {
		if (open && category) {
			deleteCategory.fields.set({
				id: category.id
			});
		}
	});
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.category_delete_category()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.category_delete_category_description()}
			</AlertDialog.Description>
		</AlertDialog.Header>

		{#if category}
			<div class="my-4">
				<p class="text-sm text-muted-foreground">
					{m.category_delete_confirmation({ name: category.name })}
				</p>
			</div>
		{/if}

		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.common_cancel()}</AlertDialog.Cancel>

			<form {...deleteCategory}>
				<input type="hidden" name="id" value={category?.id || ''} />

				<Button type="submit" variant="destructive" disabled={!!deleteCategory.pending}>
					{deleteCategory.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
