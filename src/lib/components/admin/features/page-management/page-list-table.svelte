<script lang="ts">
	import { getAllPages } from '$lib/remotes/page.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { Eye, Pencil, Trash2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import CreatePageDialog from './create-page-dialog.svelte';
	import EditPageDialog from './edit-page-dialog.svelte';
	import DeletePageDialog from './delete-page-dialog.svelte';
	import type { Page } from '$lib/server/db/schema';

	// Search and filter state
	let searchQuery = $state('');
	let selectedStatus = $state<'all' | 'draft' | 'published'>('all');
	let currentPage = $state(1);
	let pageSize = $state(10);

	// Dialog state
	let createDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let editingPage = $state<Page | null>(null);
	let deletingPage = $state<Page | null>(null);

	function openEditDialog(pageItem: Page) {
		editingPage = pageItem;
		editDialogOpen = true;
	}

	function openDeleteDialog(pageItem: Page) {
		deletingPage = pageItem;
		deleteDialogOpen = true;
	}

	function getStatusVariant(status: string): 'default' | 'secondary' {
		return status === 'published' ? 'default' : 'secondary';
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{m.page_pages()}</h1>
			<p class="text-muted-foreground">{m.page_create_page_description()}</p>
		</div>
		<Button onclick={() => (createDialogOpen = true)}>{m.page_create_page()}</Button>
	</div>

	<!-- Filters -->
	<div class="flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<Input
				type="text"
				placeholder={m.page_search_placeholder()}
				bind:value={searchQuery}
				oninput={() => (currentPage = 1)}
			/>
		</div>

		<Select.Root
			type="single"
			value={selectedStatus}
			onValueChange={(value) => {
				if (value) {
					selectedStatus = value as typeof selectedStatus;
					currentPage = 1;
				}
			}}
		>
			<Select.Trigger class="w-full sm:w-[200px]">
				{selectedStatus === 'all'
					? m.page_status_all()
					: selectedStatus === 'draft'
						? m.page_status_draft()
						: m.page_status_published()}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">{m.page_status_all()}</Select.Item>
				<Select.Item value="draft">{m.page_status_draft()}</Select.Item>
				<Select.Item value="published">{m.page_status_published()}</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Table -->
	{#await getAllPages({ 
		title: searchQuery, 
		status: selectedStatus === 'all' ? undefined : selectedStatus, 
		page: currentPage, 
		pageSize 
	})}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">{m.common_loading()}</div>
		</div>
	{:then result}
		{#if result.pages.length === 0}
			<div class="flex flex-col items-center justify-center py-12">
				<p class="text-muted-foreground">{m.page_no_pages()}</p>
			</div>
		{:else}
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m.page_title()}</Table.Head>
							<Table.Head>{m.page_slug()}</Table.Head>
							<Table.Head>{m.page_template()}</Table.Head>
							<Table.Head>{m.page_status()}</Table.Head>
							<Table.Head>{m.page_updated_at()}</Table.Head>
							<Table.Head class="text-right">{m.common_actions()}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each result.pages as pageItem}
							<Table.Row>
								<Table.Cell class="font-medium">{pageItem.title}</Table.Cell>
								<Table.Cell>
									<code class="text-muted-foreground text-sm">/{pageItem.slug}</code>
								</Table.Cell>
								<Table.Cell class="capitalize">{pageItem.template}</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(pageItem.status)}>
										{pageItem.status === 'published' ? m.page_status_published() : m.page_status_draft()}
									</Badge>
								</Table.Cell>
								<Table.Cell>{formatDate(pageItem.updatedAt)}</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex items-center justify-end gap-2">
										{#if pageItem.status === 'published'}
											<Button
												variant="ghost"
												size="icon"
												href="/pages/{pageItem.slug}"
												target="_blank"
											>
												<Eye class="h-4 w-4" />
											</Button>
										{/if}
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openEditDialog(pageItem)}
										>
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openDeleteDialog(pageItem)}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Pagination -->
			{#if result.pagination.totalPages > 1}
				<div class="flex items-center justify-between">
					<p class="text-muted-foreground text-sm">
						Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, result.pagination.totalCount)} of {result.pagination.totalCount} pages
					</p>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
						>
							{m.common_previous()}
						</Button>
						<span class="text-sm">
							{m.common_page()} {currentPage} {m.common_of()} {result.pagination.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onclick={() => (currentPage = Math.min(result.pagination.totalPages, currentPage + 1))}
							disabled={currentPage === result.pagination.totalPages}
						>
							{m.common_next()}
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	{:catch error}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="text-destructive">{error.message}</p>
		</div>
	{/await}
</div>

<!-- Dialogs -->
<CreatePageDialog bind:open={createDialogOpen} />
<EditPageDialog page={editingPage} bind:open={editDialogOpen} />
<DeletePageDialog page={deletingPage} bind:open={deleteDialogOpen} />