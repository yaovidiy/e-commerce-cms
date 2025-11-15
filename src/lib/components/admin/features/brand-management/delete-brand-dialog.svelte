<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { deleteBrand } from '$lib/remotes/brand.remote';
	import * as m from '$lib/paraglide/messages';
	import type { Brand } from '$lib/server/db/schema';

	let { brand = $bindable(), open = $bindable() }: { brand: Brand | null; open: boolean } =
		$props();

	// Watch for successful deletion
	$effect(() => {
		if (deleteBrand.result) {
			open = false;
		}
	});

	// Pre-populate form when dialog opens
	$effect(() => {
		if (open && brand) {
			deleteBrand.fields.set({
				id: brand.id
			});
		}
	});
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.brand_delete_brand()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.brand_delete_brand_description()}
			</AlertDialog.Description>
		</AlertDialog.Header>

		{#if brand}
			<div class="my-4">
				<p class="text-sm text-muted-foreground">
					{m.brand_delete_confirmation({ name: brand.name })}
				</p>
			</div>
		{/if}

		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.common_cancel()}</AlertDialog.Cancel>

			<form {...deleteBrand}>
				<input type="hidden" name="id" value={brand?.id || ''} />

				<Button type="submit" variant="destructive" disabled={!!deleteBrand.pending}>
					{deleteBrand.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
