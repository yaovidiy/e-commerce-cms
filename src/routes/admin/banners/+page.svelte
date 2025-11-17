<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { BannerListTable, CreateBannerDialog } from '$lib/components/admin/features/banner-management';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.banner_banners()}</h2>
			<p class="text-muted-foreground">{m.banner_manage_description()}</p>
		</div>
		<CreateBannerDialog />
	</div>

	<BannerListTable />
</div>
