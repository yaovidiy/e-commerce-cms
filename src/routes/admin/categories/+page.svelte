<script lang="ts">
	import { getAllCategories, deleteCategory } from '$lib/remotes/category.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';
	import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from '@lucide/svelte/icons';
	import type { Category } from '$lib/server/db/schema';

	let searchQuery = $state('');

	// Expanded categories (for tree view)
	let expandedCategories = $state<Set<string>>(new Set());

	// Delete dialog state
	let deletingCategory = $state<Category | null>(null);
	let deleteDialogOpen = $state(false);

	function toggleExpand(categoryId: string) {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId);
		} else {
			newExpanded.add(categoryId);
		}
		expandedCategories = newExpanded;
	}

	function openDeleteDialog(category: Category) {
		deletingCategory = category;
		deleteDialogOpen = true;
	}

	// Auto-refresh list after successful deletion
	$effect(() => {
		if (deleteCategory.result) {
			getAllCategories().refresh();
		}
	});

	// Helper to format date
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}

	// Build tree structure
	function buildTree(categories: Category[]) {
		const map = new Map<string | null, Category[]>();
		
		// Group by parentId
		categories.forEach((cat) => {
			const parentId = cat.parentId;
			if (!map.has(parentId)) {
				map.set(parentId, []);
			}
			map.get(parentId)!.push(cat);
		});

		// Sort by displayOrder
		map.forEach((children) => {
			children.sort((a, b) => a.displayOrder - b.displayOrder);
		});

		return map;
	}

	// Render tree recursively
	function renderTree(
		categoryMap: Map<string | null, Category[]>,
		parentId: string | null,
		level: number
	): (Category & { level: number; hasChildren: boolean; isExpanded: boolean })[] {
		const children = categoryMap.get(parentId) || [];
		const result: (Category & { level: number; hasChildren: boolean; isExpanded: boolean })[] =
			[];

		children.forEach((category) => {
			const hasChildren = (categoryMap.get(category.id)?.length || 0) > 0;
			const isExpanded = expandedCategories.has(category.id);

			result.push({
				...category,
				level,
				hasChildren,
				isExpanded
			});

			// If expanded, add children
			if (isExpanded && hasChildren) {
				const childrenData = renderTree(categoryMap, category.id, level + 1);
				result.push(...childrenData);
			}
		});

		return result;
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.category_categories()}</h1>
			<p class="text-muted-foreground">{m.category_create_category_description()}</p>
		</div>
		<Button href="/admin/categories/create">
			<Plus class="mr-2 size-4" />
			{m.category_create_category()}
		</Button>
	</div>

	<!-- Search -->
	<div class="flex gap-4">
		<Input
			type="text"
			placeholder={m.common_search()}
			bind:value={searchQuery}
			class="max-w-sm"
		/>
	</div>

	<!-- Categories Tree Table -->
	<div class="border-border rounded-lg border">
		{#await getAllCategories()}
			<div class="flex items-center justify-center p-8">
				<p class="text-muted-foreground">{m.common_loading()}</p>
			</div>
		{:then categories}
			{#if categories.length === 0}
				<div class="flex flex-col items-center justify-center gap-2 p-8">
					<p class="text-muted-foreground">{m.category_no_categories()}</p>
					<Button href="/admin/categories/create" variant="outline" size="sm">
						<Plus class="mr-2 size-4" />
						{m.category_create_category()}
					</Button>
				</div>
			{:else}
				{@const categoryMap = buildTree(categories)}
				{@const treeData = renderTree(categoryMap, null, 0)}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m.category_name()}</Table.Head>
							<Table.Head>{m.category_slug()}</Table.Head>
							<Table.Head>{m.category_display_order()}</Table.Head>
							<Table.Head>{m.category_is_visible()}</Table.Head>
							<Table.Head>{m.category_created_at()}</Table.Head>
							<Table.Head class="text-right">{m.common_actions()}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each treeData as category}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2" style="padding-left: {category.level * 24}px">
										{#if category.hasChildren}
											<button
												onclick={() => toggleExpand(category.id)}
												class="hover:bg-muted rounded p-1"
											>
												{#if category.isExpanded}
													<ChevronDown class="size-4" />
												{:else}
													<ChevronRight class="size-4" />
												{/if}
											</button>
										{:else}
											<div class="size-6"></div>
										{/if}
										<span>{category.name}</span>
									</div>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">{category.slug}</Table.Cell>
								<Table.Cell>{category.displayOrder}</Table.Cell>
								<Table.Cell>
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
										class:bg-green-100={category.isVisible}
										class:text-green-800={category.isVisible}
										class:bg-gray-100={!category.isVisible}
										class:text-gray-800={!category.isVisible}
									>
										{category.isVisible ? m.common_yes() : m.common_no()}
									</span>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">
									{formatDate(category.createdAt)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<Button href="/admin/categories/{category.id}/edit" variant="ghost" size="sm">
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="text-destructive"
											onclick={() => openDeleteDialog(category)}
										>
											<Trash2 class="size-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		{:catch error}
			<div class="flex items-center justify-center p-8">
				<p class="text-destructive">{m.common_error()}: {error.message}</p>
			</div>
		{/await}
	</div>
</div>

<!-- Delete Category Dialog -->
{#if deletingCategory}
	{@const DeleteCategoryDialog = await import(
		'$lib/components/admin/features/category-management'
	).then((m) => m.DeleteCategoryDialog)}
	<DeleteCategoryDialog bind:category={deletingCategory} bind:open={deleteDialogOpen} />
{/if}
