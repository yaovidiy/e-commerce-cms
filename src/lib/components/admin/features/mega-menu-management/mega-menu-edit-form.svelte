<script lang="ts">
	import { updateMegaMenu, getAllMegaMenus } from '$lib/remotes/mega-menu.remote';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as m from '$lib/paraglide/messages';
	import type { MegaMenu } from '$lib/server/db/schema';
	import CategoryBrowser from '$lib/components/common/forms/category-browser.svelte';
	import { watch } from 'runed';

	let { item, onSave } = $props<{
		item: MegaMenu;
		onSave?: (savedItem: MegaMenu) => void;
	}>();

	let form = $derived(updateMegaMenu.for(item.id));
	let selectedCategoryIds = $state<string[]>(item?.categories || []);
	let showCategoryBrowser = $state(false);
	let selectedMainCategory = $state(item?.categoryId || '');
	let selectedMainCategoryName = $state('');

	// Initialize category name
	let initCategoryName = $state('');
	
	$effect(async () => {
		if (item?.categoryId) {
			const result = await getAllCategories({ search: '', page: 1, pageSize: 100 });
			const cat = result.data.find((c) => c.id === item.categoryId);
			selectedMainCategoryName = cat?.name || '';
			initCategoryName = cat?.name || '';
		}
	});

	function handleCategoriesSelect(categoryIds: string[]) {
		selectedCategoryIds = categoryIds;
		// Convert array to comma-separated string for form submission
		form.fields.categories.set(categoryIds.join(','));
	}

	// Pre-fill form on mount
	$effect(() => {
		form.fields.set({
			id: item.id,
			title: item.title,
			categoryId: item.categoryId || '',
			categories: item.categories ? item.categories.join(',') : '',
			isVisible: item.isVisible,
			displayOrder: item.displayOrder
		});
		selectedCategoryIds = item.categories || [];
		selectedMainCategory = item.categoryId || '';
	});

	// Auto-sync form fields with component state
	watch(
		() => selectedMainCategory,
		(newValue) => {
			form.fields.categoryId.set(newValue || '');
		}
	);

	watch(
		() => selectedCategoryIds,
		() => {
			// Convert array to comma-separated string for form submission
			form.fields.categories.set(selectedCategoryIds.join(','));
		}
	);

	// Handle form submission
	watch(
		() => form.result,
		() => {
			if (form.result) {
				// Form submission successful
				showCategoryBrowser = false;
				onSave?.(form.result as MegaMenu);
			}
		}
	);
</script>

<form
	{...form.enhance(async ({ submit, form: formEl }) => {
		await submit();

		formEl.reset();
	})}
	class="space-y-6"
>
	<!-- Title -->
	<div class="space-y-2">
		<Label>{m.common_title()}</Label>
		<Input {...form.fields.title.as('text')} placeholder={m.mega_menu_title_placeholder()} />
		{#each form.fields.title.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<!-- Hidden inputs for categoryId and categories - always in form -->
	<Input
		{...form.fields.categoryId.as('text')}
		placeholder={m.mega_menu_main_category()}
		type="hidden"
	/>
	<Input
		{...form.fields.categories.as('text')}
		placeholder={m.common_categories()}
		type="hidden"
	/>

	<!-- Main Category (Single select) -->
	<div class="space-y-2">
		<Label for="category">{m.mega_menu_main_category()}</Label>
		<p class="text-muted-foreground text-xs">{m.mega_menu_main_category_optional()}</p>
		{#await getAllCategories({ search: '', page: 1, pageSize: 100 })}
			<div class="text-muted-foreground text-sm">{m.category_loading()}</div>
		{:then result}
			<Select.Root
				type="single"
				value={selectedMainCategory}
				onValueChange={(value) => {
					selectedMainCategory = value;

					selectedMainCategoryName =
						result.data.find((category) => category.id === value)?.name || '';

					form.fields.categoryId.set(value);
				}}
			>
				<Select.Trigger>
					{selectedMainCategoryName ? selectedMainCategoryName : m.product_select_category()}
				</Select.Trigger>
				<Select.Content>
					{#each result.data as category (category.id)}
						<Select.Item value={category.id}>{category.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					selectedMainCategory = '';
					selectedMainCategoryName = '';
					form.fields.categoryId.set('');
				}}
			>
				{m.common_clear_selection()}
			</Button>
		{/await}
		{#each form.fields.categoryId.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<!-- Categories List (Multi-select) -->
	<div class="space-y-2">
		<Label>{m.common_categories()}</Label>
		<Button
			type="button"
			variant="outline"
			class="w-full"
			onclick={() => (showCategoryBrowser = true)}
		>
			{m.mega_menu_select_categories({ count: selectedCategoryIds.length })}
		</Button>
		{#if selectedCategoryIds.length > 0}
			<div class="rounded-lg border p-3">
				{#await getAllCategories({ search: '', page: 1, pageSize: 100 })}
					<p class="text-muted-foreground text-sm">{m.common_loading()}</p>
				{:then result}
					<div class="space-y-2">
						{#each selectedCategoryIds as categoryId}
							{@const category = result.data.find((c) => c.id === categoryId)}
							{#if category}
								<div class="bg-muted flex items-center justify-between rounded p-2">
									<span class="text-sm">{category.name}</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => {
											selectedCategoryIds = selectedCategoryIds.filter((id) => id !== categoryId);
											form.fields.categories.set(selectedCategoryIds);
										}}
									>
										{m.common_remove()}
									</Button>
								</div>
							{/if}
						{/each}
					</div>
				{/await}
			</div>
		{/if}
		{#each form.fields.categories.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<!-- Visibility -->
	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<Checkbox
				checked={form.fields.isVisible.value()}
				onCheckedChange={(checked) => form.fields.isVisible.set(checked)}
			/>
			<Label>{m.common_visible()}</Label>
		</div>
	</div>

	<!-- Display Order -->
	<div class="space-y-2">
		<Label>{m.common_order()}</Label>
		<Input {...form.fields.displayOrder.as('number')} placeholder="0" />
		{#each form.fields.displayOrder.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<!-- Submit Button -->
	<Button type="submit" disabled={!!form.pending} class="w-full">
		{form.pending ? m.common_saving() : m.common_update()}
	</Button>
</form>

<!-- Category Browser Modal -->
<CategoryBrowser
	bind:open={showCategoryBrowser}
	onSelect={handleCategoriesSelect}
	{selectedCategoryIds}
/>
