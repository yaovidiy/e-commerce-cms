<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { deleteProduct } from '$lib/remotes/product.remote';
	import * as m from '$lib/paraglide/messages';
	import type { Product } from '$lib/server/db/schema';

	let { product = $bindable(), open = $bindable() }: { product: Product | null; open: boolean } =
		$props();

	// Watch for successful deletion
	$effect(() => {
		if (deleteProduct.result) {
			open = false;
		}
	});

	// Pre-populate form when dialog opens
	$effect(() => {
		if (open && product) {
			deleteProduct.fields.set({
				id: product.id
			});
		}
	});
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.product_delete_product()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.product_delete_product_description()}
			</AlertDialog.Description>
		</AlertDialog.Header>

		{#if product}
			<div class="my-4">
				<p class="text-sm text-muted-foreground">
					{m.product_delete_confirmation({ name: product.name })}
				</p>
			</div>
		{/if}

		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.common_cancel()}</AlertDialog.Cancel>

			<form {...deleteProduct}>
				<input type="hidden" name="id" value={product?.id || ''} />

				<Button type="submit" variant="destructive" disabled={!!deleteProduct.pending}>
					{deleteProduct.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
