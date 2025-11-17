<script lang="ts">
	import {
		getAllZones,
		createZone,
		updateZone,
		deleteZone
	} from '$lib/remotes/shipping.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import type { ShippingZone } from '$lib/server/db/schema';

	// Type for zones returned from getAllZones (with parsed countries array)
	type ZoneWithCountries = Omit<ShippingZone, 'countries'> & { countries: string[] };

	// Common countries list
	const COUNTRIES = [
		{ code: 'UA', name: 'Ukraine' },
		{ code: 'US', name: 'United States' },
		{ code: 'GB', name: 'United Kingdom' },
		{ code: 'DE', name: 'Germany' },
		{ code: 'FR', name: 'France' },
		{ code: 'IT', name: 'Italy' },
		{ code: 'ES', name: 'Spain' },
		{ code: 'PL', name: 'Poland' },
		{ code: 'RO', name: 'Romania' },
		{ code: 'NL', name: 'Netherlands' },
		{ code: 'BE', name: 'Belgium' },
		{ code: 'CZ', name: 'Czech Republic' },
		{ code: 'GR', name: 'Greece' },
		{ code: 'PT', name: 'Portugal' },
		{ code: 'HU', name: 'Hungary' },
		{ code: 'AT', name: 'Austria' },
		{ code: 'BG', name: 'Bulgaria' },
		{ code: 'DK', name: 'Denmark' },
		{ code: 'FI', name: 'Finland' },
		{ code: 'SK', name: 'Slovakia' },
		{ code: 'IE', name: 'Ireland' },
		{ code: 'HR', name: 'Croatia' },
		{ code: 'LT', name: 'Lithuania' },
		{ code: 'SI', name: 'Slovenia' },
		{ code: 'LV', name: 'Latvia' },
		{ code: 'EE', name: 'Estonia' }
	];

	// Dialog states
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	// Selected zone for edit/delete (with parsed countries array)
	let selectedZone = $state<ZoneWithCountries | null>(null);

	// Selected countries for create/edit
	let selectedCountries = $state<string[]>([]);

	function openCreateDialog() {
		selectedCountries = [];
		createDialogOpen = true;
	}

	function openEditDialog(zone: ZoneWithCountries) {
		selectedZone = zone;
		selectedCountries = [...zone.countries];
		editDialogOpen = true;
	}

	function openDeleteDialog(zone: ZoneWithCountries) {
		selectedZone = zone;
		deleteDialogOpen = true;
	}	function toggleCountry(countryCode: string) {
		if (selectedCountries.includes(countryCode)) {
			selectedCountries = selectedCountries.filter((c) => c !== countryCode);
		} else {
			selectedCountries = [...selectedCountries, countryCode];
		}
	}

	// Auto-refresh and close dialogs on success
	$effect(() => {
		if (createZone.result) {
			createDialogOpen = false;
			getAllZones().refresh();
		}
	});

	$effect(() => {
		if (updateZone.result) {
			editDialogOpen = false;
			getAllZones().refresh();
		}
	});

	$effect(() => {
		if (deleteZone.result) {
			deleteDialogOpen = false;
			getAllZones().refresh();
		}
	});

	// Pre-populate form when edit dialog opens
	$effect(() => {
		if (editDialogOpen && selectedZone) {
			updateZone.fields.set({
				id: selectedZone.id,
				name: selectedZone.name,
				countries: selectedZone.countries
			});
		}
	});
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{m.shipping_zones()}</h1>
			<p class="text-muted-foreground">
				Manage shipping zones and their associated countries
			</p>
		</div>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 h-4 w-4" />
			{m.shipping_create_zone()}
		</Button>
	</div>

	{#await getAllZones()}
		<Card.Root>
			<Card.Content class="p-6">
				<div class="flex items-center justify-center py-8">
					<p class="text-muted-foreground">Loading zones...</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:then zones}
		{#if zones.length === 0}
			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<p class="text-muted-foreground">{m.shipping_no_zones()}</p>
						<Button class="mt-4" onclick={openCreateDialog}>
							<Plus class="mr-2 h-4 w-4" />
							{m.shipping_create_zone()}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Content class="p-6">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.shipping_zone_name()}</Table.Head>
								<Table.Head>{m.shipping_zone_countries()}</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each zones as zone}
								<Table.Row>
									<Table.Cell class="font-medium">{zone.name}</Table.Cell>
									<Table.Cell>
										<div class="flex flex-wrap gap-1">
											{#each zone.countries as countryCode}
												{@const country = COUNTRIES.find((c) => c.code === countryCode)}
												<span
													class="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs"
												>
													{country?.name || countryCode}
												</span>
											{/each}
										</div>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex justify-end gap-2">
											<Button size="sm" variant="outline" onclick={() => openEditDialog(zone)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => openDeleteDialog(zone)}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/if}
	{:catch error}
		<Card.Root>
			<Card.Content class="p-6">
				<div class="flex items-center justify-center py-8">
					<p class="text-destructive">Error: {error.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/await}
</div>

<!-- Create Zone Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.shipping_create_zone()}</Dialog.Title>
		</Dialog.Header>

		<form
			{...createZone}
			onsubmit={(e) => {
				e.preventDefault();
				createZone.fields.set({
					name: createZone.fields.name.value(),
					countries: selectedCountries
				});
				const form = e.target as HTMLFormElement;
				form.requestSubmit();
			}}
		>
			<div class="flex flex-col gap-4">
				<div>
					<Label>{m.shipping_zone_name()}</Label>
					<Input {...createZone.fields.name.as('text')} placeholder="Europe, North America, etc." />
					{#each createZone.fields.name.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div>
					<Label>{m.shipping_zone_countries()}</Label>
					<div class="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-64 overflow-y-auto">
						{#each COUNTRIES as country}
							<div class="flex items-center gap-2">
								<Checkbox
									checked={selectedCountries.includes(country.code)}
									onCheckedChange={() => toggleCountry(country.code)}
								/>
								<button
									type="button"
									class="text-sm text-left flex-1"
									onclick={() => toggleCountry(country.code)}
								>
									{country.name}
								</button>
							</div>
						{/each}
					</div>
					{#if selectedCountries.length === 0}
						<p class="text-destructive text-sm mt-1">Please select at least one country</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2 mt-4">
					<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!!createZone.pending || selectedCountries.length === 0}>
						{createZone.pending ? 'Creating...' : m.shipping_create_zone()}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Zone Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.shipping_edit_zone()}</Dialog.Title>
		</Dialog.Header>

		<form
			{...updateZone}
			onsubmit={(e) => {
				e.preventDefault();
				if (!selectedZone) return;
				
				updateZone.fields.set({
					id: selectedZone.id,
					name: updateZone.fields.name.value(),
					countries: selectedCountries
				});
				const form = e.target as HTMLFormElement;
				form.requestSubmit();
			}}
		>
			<div class="flex flex-col gap-4">
				<div>
					<Label>{m.shipping_zone_name()}</Label>
					<Input {...updateZone.fields.name.as('text')} />
					{#each updateZone.fields.name.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div>
					<Label>{m.shipping_zone_countries()}</Label>
					<div class="grid grid-cols-2 gap-2 rounded-md border p-4 max-h-64 overflow-y-auto">
						{#each COUNTRIES as country}
							<div class="flex items-center gap-2">
								<Checkbox
									checked={selectedCountries.includes(country.code)}
									onCheckedChange={() => toggleCountry(country.code)}
								/>
								<button
									type="button"
									class="text-sm text-left flex-1"
									onclick={() => toggleCountry(country.code)}
								>
									{country.name}
								</button>
							</div>
						{/each}
					</div>
					{#if selectedCountries.length === 0}
						<p class="text-destructive text-sm mt-1">Please select at least one country</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2 mt-4">
					<Button type="button" variant="outline" onclick={() => (editDialogOpen = false)}>
						Cancel
					</Button>
					<Button type="submit" disabled={!!updateZone.pending || selectedCountries.length === 0}>
						{updateZone.pending ? 'Saving...' : m.common_save()}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.shipping_delete_zone()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.shipping_delete_zone_confirm()}
				{#if selectedZone}
					<span class="font-semibold">{selectedZone.name}</span>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				{...deleteZone}
				onsubmit={(e) => {
					e.preventDefault();
					if (selectedZone) {
						deleteZone.fields.set({ id: selectedZone.id });
						const form = e.target as HTMLFormElement;
						form.requestSubmit();
					}
				}}
			>
				<AlertDialog.Action type="submit" disabled={!!deleteZone.pending}>
					{deleteZone.pending ? 'Deleting...' : 'Delete'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
