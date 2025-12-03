<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import {
		NovaPoshtaConnectionStatus,
		NovaPoshtaAddressTest
	} from '$lib/components/admin/features/novaposhta-management';
	import { Truck } from '@lucide/svelte/icons';
</script>

<svelte:head>
	<title>{m.novaposhta_admin_title?.() || 'Nova Poshta Integration'} | Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<div class="bg-primary/10 p-3 rounded-lg">
			<Truck class="h-6 w-6 text-primary" />
		</div>
		<div>
			<h1 class="text-2xl font-bold">{m.novaposhta_admin_title?.() || 'Nova Poshta Integration'}</h1>
			<p class="text-muted-foreground">
				{m.novaposhta_admin_description?.() || 'Test and manage Nova Poshta API integration for delivery services'}
			</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Connection Status -->
		<NovaPoshtaConnectionStatus />

		<!-- Address Test -->
		<NovaPoshtaAddressTest />
	</div>
</div>
