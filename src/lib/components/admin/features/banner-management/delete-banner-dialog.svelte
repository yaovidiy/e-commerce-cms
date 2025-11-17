<script lang="ts">
	import { deleteBanner, getAllBanners } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';
	import { AlertTriangle } from '@lucide/svelte';

	type Banner = {
		id: string;
		title: string;
	};

	let { banner, open = $bindable(false) }: { banner: Banner | null; open?: boolean } = $props();

	$effect(() => {
		if (deleteBanner.result) {
			open = false;
			getAllBanners({
				title: '',
				position: 'all',
				isActive: 'all',
				page: 1,
				pageSize: 10,
				sortField: 'displayOrder',
				sortDirection: 'asc'
			}).refresh();
		}
	});
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="text-destructive h-5 w-5" />
				<AlertDialog.Title>{m.banner_delete_banner()}</AlertDialog.Title>
			</div>
			<AlertDialog.Description>
				{m.banner_delete_banner_description()}
				<br /><br />
				<strong>{m.banner_delete_confirmation({ title: banner?.title || '' })}</strong>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form {...deleteBanner}>
				<input {...deleteBanner.fields.id.as('hidden', banner?.id || '')} />
				<div class="flex gap-2">
					<AlertDialog.Cancel>
						<Button type="button" variant="outline">{m.common_cancel()}</Button>
					</AlertDialog.Cancel>
					<Button type="submit" variant="destructive" disabled={!!deleteBanner.pending}>
						{deleteBanner.pending ? m.common_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
