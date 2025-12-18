<script lang="ts">
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Check } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MegaMenu } from '$lib/server/db/schema';
	import * as Pagination from '$lib/components/ui/pagination/';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { open = $bindable(false), onSelect, selectedCategoryIds = [] } = $props<{
		open?: boolean;
		onSelect: (categoryIds: string[]) => void;
		selectedCategoryIds?: string[];
	}>();

	let searchQuery = $state('');
	let selectedIds = $state<Set<string>>(new Set(selectedCategoryIds || []));
	let currentPage = $state(1);
	const pageSize = 20;

	$effect(() => {
		selectedIds = new Set(selectedCategoryIds || []);
	});

	function handleToggleCategory(categoryId: string) {
		const newSet = new Set(selectedIds);
		if (newSet.has(categoryId)) {
			newSet.delete(categoryId);
		} else {
			newSet.add(categoryId);
		}
		selectedIds = newSet;
	}

	function handleConfirm() {
		onSelect(Array.from(selectedIds));
		open = false;
	}

	function handleSearch() {
		currentPage = 1;
	}

	function handleReset() {
		selectedIds = new Set();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{m.category_browser_title()}</Dialog.Title>
			<Dialog.Description>{m.category_browser_description()}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Search -->
			<div class="flex gap-2">
				<Input
					type="text"
					placeholder={m.category_search_placeholder()}
					bind:value={searchQuery}
					class="flex-1"
				/>
				<Button size="sm" onclick={handleSearch}>{m.common_search()}</Button>
			</div>

			<!-- Categories List -->
			<div class="max-h-[50vh] overflow-y-auto rounded-lg border">
				{#await getAllCategories({ search: searchQuery, page: currentPage, pageSize })}
					<div class="flex items-center justify-center p-8">
						<p class="text-muted-foreground">{m.common_loading()}</p>
					</div>
				{:then result}
					{#if result.data && result.data.length > 0}
						<div class="divide-y">
							{#each result.data as category (category.id)}
								<button
									class="hover:bg-accent flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
									onclick={() => handleToggleCategory(category.id)}
								>
									<div class="flex flex-1 items-center gap-3">
										<Checkbox checked={selectedIds.has(category.id)} />
										<div>
											<p class="font-medium">{category.name}</p>
											{#if category.description}
												<p class="text-muted-foreground text-sm">{category.description}</p>
											{/if}
										</div>
									</div>
									{#if selectedIds.has(category.id)}
										<Check class="text-primary h-4 w-4" />
									{/if}
								</button>
							{/each}
						</div>
						<div class="mt-3">
							<Pagination.Root
								bind:page={currentPage}
								count={result.totalCount}
								perPage={result.pageSize}
							>
								{#snippet children({ pages, currentPage })}
									<Pagination.Content>
										<Pagination.Item>
											<Pagination.PrevButton />
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === 'ellipsis'}
												<Pagination.Item>
													<Pagination.Ellipsis />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link {page} isActive={currentPage === page.value}>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.NextButton />
										</Pagination.Item>
									</Pagination.Content>
								{/snippet}
							</Pagination.Root>
						</div>
					{:else}
						<div class="flex items-center justify-center p-8">
							<p class="text-muted-foreground">{m.category_no_categories()}</p>
						</div>
					{/if}
				{:catch error}
					<div class="flex items-center justify-center p-8">
						<p class="text-destructive">{m.error_loading_categories()}: {error.message}</p>
					</div>
				{/await}
			</div>

			<!-- Selected count -->
			<div class="text-sm text-muted-foreground">
				{m.category_browser_selected_count({ count: selectedIds.size })}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>
				{m.common_cancel()}
			</Button>
			<Button variant="outline" onclick={handleReset}>
				{m.common_reset()}
			</Button>
			<Button onclick={handleConfirm}>
				{m.common_confirm()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
