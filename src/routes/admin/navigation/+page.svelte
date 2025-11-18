<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Plus, Pencil, Trash2, Phone, Menu as MenuIcon } from '@lucide/svelte/icons';
	import {
		getAllNavigationMenus,
		getNavigationMenuItems,
		createNavigationMenu,
		updateNavigationMenu,
		deleteNavigationMenu,
		createNavigationMenuItem,
		updateNavigationMenuItem,
		deleteNavigationMenuItem,
		getAllContactPhonesAdmin,
		createContactPhone,
		updateContactPhone,
		deleteContactPhone
	} from '$lib/remotes/navigation.remote';
	import type { NavigationMenu, NavigationMenuItem, ContactPhone } from '$lib/server/db/schema';
	import * as m from '$lib/paraglide/messages';

	// State
	let selectedMenu = $state<NavigationMenu | null>(null);
	let menuDialogOpen = $state(false);
	let menuItemDialogOpen = $state(false);
	let phoneDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let deleteItemDialogOpen = $state(false);
	let deletePhoneDialogOpen = $state(false);

	let editingMenu = $state<NavigationMenu | null>(null);
	let editingMenuItem = $state<NavigationMenuItem | null>(null);
	let editingPhone = $state<ContactPhone | null>(null);
	let deletingMenu = $state<NavigationMenu | null>(null);
	let deletingMenuItem = $state<NavigationMenuItem | null>(null);
	let deletingPhone = $state<ContactPhone | null>(null);

	// Functions
	function openMenuDialog(menu?: NavigationMenu) {
		editingMenu = menu || null;
		if (menu) {
			createNavigationMenu.fields.set({
				name: menu.name,
				location: menu.location,
				isActive: menu.isActive
			});
		} else {
			createNavigationMenu.fields.set({
				name: '',
				location: 'header',
				isActive: true
			});
		}
		menuDialogOpen = true;
	}

	function openMenuItemDialog(item?: NavigationMenuItem) {
		editingMenuItem = item || null;
		if (item) {
			createNavigationMenuItem.fields.set({
				menuId: item.menuId,
				label: item.label,
				url: item.url,
				displayOrder: item.displayOrder,
				openInNewTab: item.openInNewTab,
				isVisible: item.isVisible,
				icon: item.icon || '',
				parentId: item.parentId || ''
			});
		} else {
			createNavigationMenuItem.fields.set({
				menuId: selectedMenu?.id || '',
				label: '',
				url: '',
				displayOrder: 0,
				openInNewTab: false,
				isVisible: true,
				icon: '',
				parentId: ''
			});
		}
		menuItemDialogOpen = true;
	}

	function openPhoneDialog(phone?: ContactPhone) {
		editingPhone = phone || null;
		if (phone) {
			createContactPhone.fields.set({
				phoneNumber: phone.phoneNumber,
				label: phone.label || '',
				displayOrder: phone.displayOrder,
				isActive: phone.isActive
			});
		} else {
			createContactPhone.fields.set({
				phoneNumber: '',
				label: '',
				displayOrder: 0,
				isActive: true
			});
		}
		phoneDialogOpen = true;
	}

	// Refresh handlers
	$effect(() => {
		if (createNavigationMenu.result) {
			menuDialogOpen = false;
			getAllNavigationMenus().refresh();
		}
	});

	$effect(() => {
		if (updateNavigationMenu.result) {
			menuDialogOpen = false;
			getAllNavigationMenus().refresh();
		}
	});

	$effect(() => {
		if (createNavigationMenuItem.result && selectedMenu) {
			menuItemDialogOpen = false;
			getNavigationMenuItems(selectedMenu.id).refresh();
		}
	});

	$effect(() => {
		if (updateNavigationMenuItem.result && selectedMenu) {
			menuItemDialogOpen = false;
			getNavigationMenuItems(selectedMenu.id).refresh();
		}
	});

	$effect(() => {
		if (createContactPhone.result) {
			phoneDialogOpen = false;
			getAllContactPhonesAdmin().refresh();
		}
	});

	$effect(() => {
		if (updateContactPhone.result) {
			phoneDialogOpen = false;
			getAllContactPhonesAdmin().refresh();
		}
	});

	$effect(() => {
		if (deleteNavigationMenu.result) {
			deleteDialogOpen = false;
			selectedMenu = null;
			getAllNavigationMenus().refresh();
		}
	});

	$effect(() => {
		if (deleteNavigationMenuItem.result && selectedMenu) {
			deleteItemDialogOpen = false;
			getNavigationMenuItems(selectedMenu.id).refresh();
		}
	});

	// Initialize forms with default values
	$effect(() => {
		// Initialize create forms with default values
		createNavigationMenu.fields.set({
			name: '',
			location: 'header',
			isActive: true
		});

		createNavigationMenuItem.fields.set({
			menuId: '',
			label: '',
			url: '',
			displayOrder: 0,
			openInNewTab: false,
			isVisible: true,
			icon: '',
			parentId: ''
		});

		createContactPhone.fields.set({
			phoneNumber: '',
			label: '',
			displayOrder: 0,
			isActive: true
		});
	});
</script>

<div class="flex flex-col gap-8 p-8">
	<div>
		<h1 class="text-3xl font-bold">{m.nav_navigation_contact_settings()}</h1>
		<p class="text-muted-foreground mt-2">
			{m.nav_manage_navigation_menus()}
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-2">
		<!-- Navigation Menus -->
		<Card.Root>
			<Card.Header class="flex items-center justify-between">
				<div>
					<Card.Title>{m.nav_navigation_menus()}</Card.Title>
					<Card.Description>{m.nav_manage_site_navigation()}</Card.Description>
				</div>
				<Button size="sm" onclick={() => openMenuDialog()}>
					<Plus class="mr-2 h-4 w-4" />
					Add Menu
				</Button>
			</Card.Header>
			<Card.Content>
				{#await getAllNavigationMenus()}
					<p class="text-muted-foreground">{m.nav_loading_menus()}</p>
				{:then menus}
					{#if menus && menus.length > 0}
						<div class="space-y-4">
							{#each menus as menu}
								<div class="rounded-lg border p-4">
									<div class="mb-2 flex items-center justify-between">
										<div class="flex items-center gap-2">
											<MenuIcon class="text-muted-foreground h-5 w-5" />
											<h3 class="font-semibold">{menu.name}</h3>
											<span class="bg-secondary rounded-full px-2 py-1 text-xs">
												{menu.location}
											</span>
											{#if !menu.isActive}
												<span
													class="bg-destructive/10 text-destructive rounded-full px-2 py-1 text-xs"
												>
													Inactive
												</span>
											{/if}
										</div>
										<div class="flex gap-2">
											<Button variant="ghost" size="icon" onclick={() => openMenuDialog(menu)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onclick={() => {
													deletingMenu = menu;
													deleteDialogOpen = true;
												}}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											selectedMenu = menu;
										}}
									>
										{selectedMenu?.id === menu.id ? m.nav_hide_items() : m.nav_manage_items()}
									</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-muted-foreground">{m.nav_no_menus_found()}</p>
					{/if}
				{/await}
			</Card.Content>
		</Card.Root>

		<!-- Contact Phones -->
		<Card.Root>
			<Card.Header class="flex items-center justify-between">
				<div>
					<Card.Title>{m.nav_contact_phones()}</Card.Title>
					<Card.Description>{m.nav_manage_contact_phones()}</Card.Description>
				</div>
				<Button size="sm" onclick={() => openPhoneDialog()}>
					<Plus class="mr-2 h-4 w-4" />
					Add Phone
				</Button>
			</Card.Header>
			<Card.Content>
				{#await getAllContactPhonesAdmin()}
					<p class="text-muted-foreground">{m.nav_loading_phones()}</p>
				{:then phones}
					{#if phones && phones.length > 0}
						<div class="space-y-2">
							{#each phones as phone}
								<div class="flex items-center justify-between rounded-lg border p-3">
									<div class="flex items-center gap-3">
										<Phone class="text-muted-foreground h-4 w-4" />
										<div>
											{#if phone.label}
												<p class="text-sm font-medium">{phone.label}</p>
											{/if}
											<p class="text-sm {phone.label ? 'text-muted-foreground' : ''}">
												{phone.phoneNumber}
											</p>
										</div>
										{#if !phone.isActive}
											<span
												class="bg-destructive/10 text-destructive rounded-full px-2 py-1 text-xs"
											>
												{m.nav_inactive()}
											</span>
										{/if}
									</div>
									<div class="flex gap-2">
										<Button variant="ghost" size="icon" onclick={() => openPhoneDialog(phone)}>
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => {
												deletingPhone = phone;
												deletePhoneDialogOpen = true;
											}}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-muted-foreground">{m.nav_no_phone_numbers_found()}</p>
					{/if}
				{/await}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Menu Items Section -->
	{#if selectedMenu}
		<Card.Root>
			<Card.Header class="flex items-center justify-between">
				<div>
					<Card.Title>{m.nav_menu_items({ name: selectedMenu.name })}</Card.Title>
					<Card.Description>{m.nav_manage_items_in_menu()}</Card.Description>
				</div>
				<Button size="sm" onclick={() => openMenuItemDialog()}>
					<Plus class="mr-2 h-4 w-4" />
					Add Item
				</Button>
			</Card.Header>
			<Card.Content>
				{#await getNavigationMenuItems(selectedMenu.id)}
					<p class="text-muted-foreground">{m.nav_loading_items()}</p>
				{:then items}
					{#if items && items.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>{m.nav_order()}</Table.Head>
									<Table.Head>{m.nav_label()}</Table.Head>
									<Table.Head>{m.nav_url()}</Table.Head>
									<Table.Head>{m.nav_visible()}</Table.Head>
									<Table.Head class="text-right">{m.nav_actions()}</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each items as item}
									<Table.Row>
										<Table.Cell>{item.displayOrder}</Table.Cell>
										<Table.Cell class="font-medium">{item.label}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{item.url}</Table.Cell>
										<Table.Cell>
											{#if item.isVisible}
												<span class="text-green-600">✓</span>
											{:else}
												<span class="text-red-600">✗</span>
											{/if}
										</Table.Cell>
										<Table.Cell class="text-right">
											<div class="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onclick={() => openMenuItemDialog(item)}
												>
													<Pencil class="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onclick={() => {
														deletingMenuItem = item;
														deleteItemDialogOpen = true;
													}}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</div>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<p class="text-muted-foreground">{m.nav_no_items_in_menu()}</p>
					{/if}
				{/await}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- Menu Dialog -->
<Dialog.Root bind:open={menuDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{editingMenu ? m.nav_edit_menu() : m.nav_create_menu()}</Dialog.Title>
		</Dialog.Header>
		<form
			{...editingMenu
				? updateNavigationMenu.enhance(async ({ submit, form }) => {
						try {
							await submit();
							form.reset();
							menuDialogOpen = false;
							console.log('Menu updated successfully');
							getAllNavigationMenus().refresh();
						} catch (error) {
							console.error('Failed to update menu:', error);
						}
					})
				: createNavigationMenu.enhance(async ({ submit, form, data }) => {
						try {
							await submit();
							form.reset();
							menuDialogOpen = false;
							console.log('Menu created successfully with data ', data);
							getAllNavigationMenus().refresh();
						} catch (error) {
							console.error('Failed to create menu:', error);
						}
					})}
		>
			{#if editingMenu}
				<input
					{...updateNavigationMenu.fields.id.as('text')}
					value={editingMenu.id}
					class="hidden"
				/>
			{/if}

			<div class="space-y-4">
				<div>
					<Label>{m.nav_menu_name()}</Label>
					<Input
						{...(editingMenu ? updateNavigationMenu : createNavigationMenu).fields.name.as('text')}
					/>
				</div>

				<div>
					<Label>{m.nav_location()}</Label>
					<Select.Root
						type="single"
						value={(editingMenu
							? updateNavigationMenu
							: createNavigationMenu
						).fields.location.value()}
						onValueChange={(value) => {
							(editingMenu ? updateNavigationMenu : createNavigationMenu).fields.location.set(
								value as 'header' | 'footer' | 'mobile'
							);
						}}
					>
						<Select.Trigger>
							{(editingMenu
								? updateNavigationMenu
								: createNavigationMenu
							).fields.location.value() ?? m.nav_select_location()}
						</Select.Trigger>
						<Select.Content class="bg-white">
							<Select.Item value="header">{m.nav_location_header()}</Select.Item>
							<Select.Item value="footer">{m.nav_location_footer()}</Select.Item>
							<Select.Item value="mobile">{m.nav_location_mobile()}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox
						{...(editingMenu ? updateNavigationMenu : createNavigationMenu).fields.isActive.as(
							'checkbox'
						)}
					/>
					<Label>{m.nav_active()}</Label>
				</div>

				<Button
					type="submit"
					disabled={!!(editingMenu ? updateNavigationMenu : createNavigationMenu).pending}
				>
					{(editingMenu ? updateNavigationMenu : createNavigationMenu).pending
						? m.nav_saving()
						: m.nav_save_menu()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Menu Item Dialog -->
<Dialog.Root bind:open={menuItemDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title
				>{editingMenuItem ? m.nav_edit_menu_item() : m.nav_create_menu_item()}</Dialog.Title
			>
		</Dialog.Header>
		<form
			{...(editingMenuItem ? updateNavigationMenuItem : createNavigationMenuItem).enhance(
				async ({ submit, form, data }) => {
					try {
						await submit();
						form.reset();
						menuItemDialogOpen = false;
						console.log('Menu item saved successfully with data ', data);
						if (selectedMenu) {
							getNavigationMenuItems(selectedMenu.id).refresh();
						}
					} catch (error) {
						console.error('Failed to save menu item:', error);
					}
				}
			)}
		>
			{#if editingMenuItem}
				<input {...updateNavigationMenuItem.fields.id.as('text')} value={editingMenuItem.id} />
			{/if}

			<div class="space-y-4">
				<div>
					<Label>{m.nav_label()}</Label>
					<Input
						{...(editingMenuItem
							? updateNavigationMenuItem
							: createNavigationMenuItem
						).fields.label.as('text')}
					/>
				</div>

				<div>
					<Label>{m.nav_url()}</Label>
					<Input
						{...(editingMenuItem
							? updateNavigationMenuItem
							: createNavigationMenuItem
						).fields.url.as('text')}
						placeholder={m.nav_url_placeholder()}
					/>
				</div>

				<div>
					<Label>{m.nav_display_order()}</Label>
					<Input
						{...(editingMenuItem
							? updateNavigationMenuItem
							: createNavigationMenuItem
						).fields.displayOrder.as('number')}
					/>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox
						{...(editingMenuItem
							? updateNavigationMenuItem
							: createNavigationMenuItem
						).fields.isVisible.as('checkbox')}
					/>
					<Label>{m.nav_visible()}</Label>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox
						{...(editingMenuItem
							? updateNavigationMenuItem
							: createNavigationMenuItem
						).fields.openInNewTab.as('checkbox')}
					/>
					<Label>{m.nav_open_in_new_tab()}</Label>
				</div>

				<Button
					type="submit"
					disabled={!!(editingMenuItem ? updateNavigationMenuItem : createNavigationMenuItem)
						.pending}
				>
					{(editingMenuItem ? updateNavigationMenuItem : createNavigationMenuItem).pending
						? m.nav_saving()
						: m.nav_save_item()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Phone Dialog -->
<Dialog.Root bind:open={phoneDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title
				>{editingPhone ? m.nav_edit_phone_number() : m.nav_add_phone_number()}</Dialog.Title
			>
		</Dialog.Header>
		<form
			{...(editingPhone ? updateContactPhone : createContactPhone).enhance(
				async ({ submit, form, data }) => {
					try {
						await submit();
						form.reset();
						phoneDialogOpen = false;
						console.log('Phone number saved successfully with data ', data);
						getAllContactPhonesAdmin().refresh();
					} catch (error) {
						console.error('Failed to save phone number:', error);
					}
				}
			)}
		>
			{#if editingPhone}
				<input
					{...updateContactPhone.fields.id.as('text')}
					value={editingPhone.id}
					class="hidden"
				/>
			{/if}

			<div class="space-y-4">
				<div>
					<Label>{m.nav_phone_number()}</Label>
					<Input
						{...(editingPhone ? updateContactPhone : createContactPhone).fields.phoneNumber.as(
							'text'
						)}
						value={editingPhone ? editingPhone.phoneNumber : ''}
						placeholder={m.nav_phone_number_placeholder()}
					/>
				</div>

				<div>
					<Label>{m.nav_label_optional()}</Label>
					<Input
						{...(editingPhone ? updateContactPhone : createContactPhone).fields.label.as('text')}
						placeholder={m.nav_label_placeholder()}
						value={editingPhone ? editingPhone.label : ''}
					/>
				</div>

				<div>
					<Label>{m.nav_display_order()}</Label>
					<Input
						{...(editingPhone ? updateContactPhone : createContactPhone).fields.displayOrder.as(
							'number'
						)}
						value={editingPhone ? editingPhone.displayOrder : ''}
					/>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox
						{...(editingPhone ? updateContactPhone : createContactPhone).fields.isActive.as(
							'checkbox'
						)}
						checked={editingPhone ? editingPhone.isActive : true}
					/>
					<Label>{m.nav_active()}</Label>
				</div>

				<Button
					type="submit"
					disabled={!!(editingPhone ? updateContactPhone : createContactPhone).pending}
				>
					{(editingPhone ? updateContactPhone : createContactPhone).pending
						? m.nav_saving()
						: m.nav_save_phone()}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Menu Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.nav_delete_menu()}</Dialog.Title>
			<Dialog.Description>
				{m.nav_delete_menu_confirm()}
			</Dialog.Description>
		</Dialog.Header>
		{#if deletingMenu}
			<form {...deleteNavigationMenu}>
				<input
					{...deleteNavigationMenu.fields.id.as('text')}
					type="hidden"
					value={deletingMenu.id}
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit" variant="destructive" disabled={!!deleteNavigationMenu.pending}>
						{deleteNavigationMenu.pending ? m.nav_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Menu Item Dialog -->
<Dialog.Root bind:open={deleteItemDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.nav_delete_menu_item()}</Dialog.Title>
			<Dialog.Description>
				{m.nav_delete_menu_item_confirm()}
			</Dialog.Description>
		</Dialog.Header>
		{#if deletingMenuItem}
			<form {...deleteNavigationMenuItem}>
				<input
					{...deleteNavigationMenuItem.fields.id.as('text')}
					value={deletingMenuItem.id}
					type="hidden"
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (deleteItemDialogOpen = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit" variant="destructive" disabled={!!deleteNavigationMenuItem.pending}>
						{deleteNavigationMenuItem.pending ? m.nav_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Phone Dialog -->
<Dialog.Root bind:open={deletePhoneDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{m.nav_delete_phone_number()}</Dialog.Title>
			<Dialog.Description>
				{m.nav_delete_phone_number_confirm()}
			</Dialog.Description>
		</Dialog.Header>
		{#if deletingPhone}
			<form {...deleteContactPhone}>
				<input
					{...deleteContactPhone.fields.id.as('text')}
					value={deletingPhone.id}
					type="hidden"
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (deletePhoneDialogOpen = false)}>
						{m.common_cancel()}
					</Button>
					<Button type="submit" variant="destructive" disabled={!!deleteContactPhone.pending}>
						{deleteContactPhone.pending ? m.nav_deleting() : m.common_delete()}
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
