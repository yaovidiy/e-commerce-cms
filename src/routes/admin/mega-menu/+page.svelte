<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { MegaMenuListTable } from '$lib/components/admin/features/mega-menu-management';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.mega_menu()}</h2>
			<p class="text-muted-foreground">{m.mega_menu_description()}</p>
		</div>
	</div>

	<MegaMenuListTable />
</div>
