<script lang="ts">
	import { deleteMegaMenu } from '$lib/remotes/mega-menu.remote';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import type { MegaMenu } from '$lib/server/db/schema';
	import { watch } from 'runed';

	let { item, open = $bindable(false) } = $props<{
		item?: MegaMenu | null;
		open?: boolean;
	}>();

	const form = deleteMegaMenu;

	watch(
		() => [item, open],
		() => {
			if (item && open) {
				form.fields.id.set(item.id);
			}
		}
	);

	watch(
		() => form.result,
		() => {
			if (form.result) {
				open = false;
			}
		}
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.common_confirm_delete?.() ?? 'Confirm Delete'}</Dialog.Title>
		</Dialog.Header>

		<p class="text-muted-foreground">
			Are you sure you want to delete "<strong>{item?.title}</strong>"? This action cannot be
			undone.
		</p>

		<Dialog.Footer>
			<form {...form} class="contents">
				<input {...form.fields.id.as('hidden', item.id)} value={item?.id || ''} />
				<Button variant="outline" onclick={() => (open = false)}>
					{m.common_cancel?.() ?? 'Cancel'}
				</Button>
				<Button variant="destructive" type="submit" disabled={!!form.pending}>
					{form.pending
						? (m.common_deleting?.() ?? 'Deleting...')
						: (m.common_delete?.() ?? 'Delete')}
				</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
