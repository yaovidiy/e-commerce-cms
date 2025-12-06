<script lang="ts">
	import { AssetListGrid, ClearBucketDialog } from '$lib/components/admin/features/asset-management';
	import { ImageUploader } from '$lib/components/common/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Upload, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let uploadDialogOpen = $state(false);
	let clearBucketDialogOpen = $state(false);

	function handleUploadComplete() {
		uploadDialogOpen = false;
	}
</script>

<div class="flex flex-col max-w-full gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.asset_media_library()}</h1>
			<p class="text-muted-foreground">{m.asset_manage_description()}</p>
		</div>

		<div class="flex gap-2">
			<Dialog.Root bind:open={uploadDialogOpen}>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
					<Upload class="mr-2 h-4 w-4" />
					{m.asset_upload_new()}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>{m.asset_upload_new()}</Dialog.Title>
						<Dialog.Description>{m.asset_upload_description()}</Dialog.Description>
					</Dialog.Header>

					<ImageUploader onUploadComplete={handleUploadComplete} />
				</Dialog.Content>
			</Dialog.Root>

			<Button variant="destructive" onclick={() => (clearBucketDialogOpen = true)}>
				<Trash2 class="mr-2 h-4 w-4" />
				{m.asset_clear_bucket()}
			</Button>
		</div>
	</div>

	<AssetListGrid />
</div>

<ClearBucketDialog bind:open={clearBucketDialogOpen} />
