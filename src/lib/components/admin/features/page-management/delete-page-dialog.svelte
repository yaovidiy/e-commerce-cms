<script lang="ts">
	import { deletePage, getAllPages } from '$lib/remotes/page.remote';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import type { Page } from '$lib/server/db/schema';

	let { page = null, open = $bindable() } = $props<{ page: Page | null; open: boolean }>();

	// Auto-refresh query and close dialog after successful deletion
	$effect(() => {
		if (deletePage.result) {
			open = false;
			getAllPages({ page: 1, pageSize: 10 }).refresh();
		}
	});

	// Pre-populate form when dialog opens
	$effect(() => {
		if (open && page) {
			deletePage.fields.set({ id: page.id });
		}
	});
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.page_delete_page()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.page_delete_confirmation({ title: page?.title || '' })}
				<br />
				<strong>{m.page_delete_warning()}</strong>
			</AlertDialog.Description>
		</AlertDialog.Header>

		<form {...deletePage}>
			<input type="hidden" name="id" value={page?.id} />

			<AlertDialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" variant="destructive" disabled={!!deletePage.pending}>
					{deletePage.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</AlertDialog.Footer>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
