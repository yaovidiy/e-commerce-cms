<script lang="ts">
	import { deleteAsset } from '$lib/remotes/asset.remote';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let { asset, open = $bindable(false) } = $props<{
		asset: Asset | null;
		open?: boolean;
	}>();

	// Close dialog after successful deletion
	$effect(() => {
		if (deleteAsset.result) {
			open = false;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.asset_delete()}</Dialog.Title>
			<Dialog.Description>{m.asset_delete_description()}</Dialog.Description>
		</Dialog.Header>

		{#if asset}
			<div class="py-4">
				<p class="text-sm">
					{m.asset_delete_confirmation({ filename: asset.originalFilename })}
				</p>

				<!-- Preview -->
				<div class="mt-4 rounded-lg border bg-muted overflow-hidden">
					<img
						src={asset.thumbnailUrl || asset.url}
						alt={asset.originalFilename}
						class="w-full h-auto max-h-48 object-contain"
					/>
				</div>
			</div>

			<form {...deleteAsset}>
				<input type="hidden" name="id" value={asset.id} />

				<div class="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => (open = false)}
						disabled={!!deleteAsset.pending}
					>
						{m.common_cancel()}
					</Button>

					<Button type="submit" variant="destructive" disabled={!!deleteAsset.pending}>
						{deleteAsset.pending ? m.common_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
