<script lang="ts">
	import {
		getMyAddresses,
		createAddress,
		updateAddress,
		deleteAddress,
		setDefaultAddress
	} from '$lib/remotes/address.remote';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';
	import { MapPin, Plus, Pencil, Trash2, Star } from '@lucide/svelte/icons';
	import type { Address } from '$lib/server/db/schema';

	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let editingAddress = $state<Address | null>(null);
	let deletingAddress = $state<Address | null>(null);

	function openCreateDialog() {
		createDialogOpen = true;
	}

	function openEditDialog(address: Address) {
		editingAddress = address;
		editDialogOpen = true;
		// Pre-populate form
		updateAddress.fields.set({
			id: address.id,
			firstName: address.firstName,
			lastName: address.lastName,
			company: address.company || '',
			address1: address.address1,
			address2: address.address2 || '',
			city: address.city,
			state: address.state,
			postalCode: address.postalCode,
			country: address.country,
			phone: address.phone,
			isDefault: address.isDefault
		});
	}

	function openDeleteDialog(address: Address) {
		deletingAddress = address;
		deleteDialogOpen = true;
	}

	async function handleSetDefault(address: Address) {
		if (!address.isDefault) {
			await setDefaultAddress({ id: address.id });
		}
	}

	// Auto-refresh and close dialogs on success
	$effect(() => {
		if (createAddress.result) {
			createDialogOpen = false;
			getMyAddresses().refresh();
			createAddress.fields.set({
				firstName: '',
				lastName: '',
				company: '',
				address1: '',
				address2: '',
				city: '',
				state: '',
				postalCode: '',
				country: 'Ukraine',
				phone: '',
				isDefault: false
			});
		}
	});

	$effect(() => {
		if (updateAddress.result) {
			editDialogOpen = false;
			getMyAddresses().refresh();
		}
	});

	$effect(() => {
		if (deleteAddress.result) {
			deleteDialogOpen = false;
			getMyAddresses().refresh();
		}
	});
</script>

<div class="mx-auto max-w-6xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.address_title()}</h1>
			<p class="text-muted-foreground mt-1">{m.address_description()}</p>
		</div>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 size-4" />
			{m.address_add_new()}
		</Button>
	</div>

	{#await getMyAddresses()}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(3) as _}
				<Card>
					<CardContent class="py-8">
						<div class="flex items-center justify-center">
							<div class="text-muted-foreground">Loading...</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:then addresses}
		{#if addresses.length === 0}
			<Card>
				<CardContent class="py-12">
					<div class="flex flex-col items-center justify-center gap-4 text-center">
						<MapPin class="text-muted-foreground size-12" />
						<div>
							<h3 class="text-lg font-semibold">{m.address_no_addresses()}</h3>
							<p class="text-muted-foreground mt-1">Add your first address to get started</p>
						</div>
						<Button onclick={openCreateDialog}>
							<Plus class="mr-2 size-4" />
							{m.address_add_new()}
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each addresses as address}
					<Card class={address.isDefault ? 'border-primary' : ''}>
						<CardHeader>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<CardTitle class="text-base">
										{address.firstName}
										{address.lastName}
									</CardTitle>
									{#if address.company}
										<CardDescription>{address.company}</CardDescription>
									{/if}
								</div>
								{#if address.isDefault}
									<div class="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
										<Star class="size-3 fill-current" />
										{m.address_default()}
									</div>
								{/if}
							</div>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="text-muted-foreground text-sm">
								<div>{address.address1}</div>
								{#if address.address2}
									<div>{address.address2}</div>
								{/if}
								<div>
									{address.city}, {address.state} {address.postalCode}
								</div>
								<div>{address.country}</div>
								<div class="mt-2">{address.phone}</div>
							</div>

							<div class="flex flex-wrap gap-2 pt-2">
								{#if !address.isDefault}
									<Button
										variant="outline"
										size="sm"
										onclick={() => handleSetDefault(address)}
									>
										<Star class="mr-1 size-3" />
										{m.address_set_default()}
									</Button>
								{/if}
								<Button
									variant="outline"
									size="sm"
									onclick={() => openEditDialog(address)}
								>
									<Pencil class="mr-1 size-3" />
									{m.common_edit()}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => openDeleteDialog(address)}
								>
									<Trash2 class="mr-1 size-3" />
									{m.common_delete()}
								</Button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	{:catch error}
		<Card>
			<CardContent class="py-8">
				<div class="flex items-center justify-center">
					<div class="text-destructive">Error loading addresses: {error.message}</div>
				</div>
			</CardContent>
		</Card>
	{/await}
</div>

<!-- Create Address Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{m.address_add_new()}</Dialog.Title>
			<Dialog.Description>Add a new shipping address</Dialog.Description>
		</Dialog.Header>

		<form {...createAddress} class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_first_name()}
					</Label>
					<Input {...createAddress.fields.firstName.as('text')} />
					{#each createAddress.fields.firstName.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_last_name()}
					</Label>
					<Input {...createAddress.fields.lastName.as('text')} />
					{#each createAddress.fields.lastName.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_company()}
				</Label>
				<Input {...createAddress.fields.company.as('text')} />
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_address_line_1()}
				</Label>
				<Input {...createAddress.fields.address1.as('text')} />
				{#each createAddress.fields.address1.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_address_line_2()}
				</Label>
				<Input {...createAddress.fields.address2.as('text')} />
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_city()}
					</Label>
					<Input {...createAddress.fields.city.as('text')} />
					{#each createAddress.fields.city.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_state()}
					</Label>
					<Input {...createAddress.fields.state.as('text')} />
					{#each createAddress.fields.state.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_postal_code()}
					</Label>
					<Input {...createAddress.fields.postalCode.as('text')} />
					{#each createAddress.fields.postalCode.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_country()}
					</Label>
					<Input {...createAddress.fields.country.as('text')} value="Ukraine" />
					{#each createAddress.fields.country.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_phone()}
				</Label>
				<Input {...createAddress.fields.phone.as('text')} />
				{#each createAddress.fields.phone.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox
					checked={false}
					onCheckedChange={(checked) => {
						createAddress.fields.isDefault.set(checked as boolean);
					}}
				/>
				<Label class="cursor-pointer font-normal">
					{m.address_set_default()}
				</Label>
			</div>

			<div class="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!createAddress.pending}>
					{createAddress.pending ? 'Creating...' : m.common_create()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Address Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{m.address_edit()}</Dialog.Title>
			<Dialog.Description>Update address information</Dialog.Description>
		</Dialog.Header>

		<form {...updateAddress} class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_first_name()}
					</Label>
					<Input {...updateAddress.fields.firstName.as('text')} />
					{#each updateAddress.fields.firstName.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_last_name()}
					</Label>
					<Input {...updateAddress.fields.lastName.as('text')} />
					{#each updateAddress.fields.lastName.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_company()}
				</Label>
				<Input {...updateAddress.fields.company.as('text')} />
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_address_line_1()}
				</Label>
				<Input {...updateAddress.fields.address1.as('text')} />
				{#each updateAddress.fields.address1.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_address_line_2()}
				</Label>
				<Input {...updateAddress.fields.address2.as('text')} />
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_city()}
					</Label>
					<Input {...updateAddress.fields.city.as('text')} />
					{#each updateAddress.fields.city.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_state()}
					</Label>
					<Input {...updateAddress.fields.state.as('text')} />
					{#each updateAddress.fields.state.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label>
						{m.address_postal_code()}
					</Label>
					<Input {...updateAddress.fields.postalCode.as('text')} />
					{#each updateAddress.fields.postalCode.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label>
						{m.address_country()}
					</Label>
					<Input {...updateAddress.fields.country.as('text')} />
					{#each updateAddress.fields.country.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<Label>
					{m.address_phone()}
				</Label>
				<Input {...updateAddress.fields.phone.as('text')} />
				{#each updateAddress.fields.phone.issues() as issue}
					<p class="text-destructive text-sm">{issue.message}</p>
				{/each}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox
					checked={editingAddress?.isDefault || false}
					onCheckedChange={(checked) => {
						updateAddress.fields.isDefault.set(checked as boolean);
					}}
				/>
				<Label class="cursor-pointer font-normal">
					{m.address_set_default()}
				</Label>
			</div>

			<div class="flex justify-end gap-3 pt-4">
				<Button type="button" variant="outline" onclick={() => (editDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!updateAddress.pending}>
					{updateAddress.pending ? 'Saving...' : m.common_save()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Address Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.address_delete()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.address_delete_confirmation()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.common_cancel()}</AlertDialog.Cancel>
			<form {...deleteAddress}>
				<input type="hidden" name="id" value={deletingAddress?.id || ''} />
				<AlertDialog.Action type="submit" disabled={!!deleteAddress.pending}>
					{deleteAddress.pending ? 'Deleting...' : m.common_delete()}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
