<script lang="ts">
	import { getAllBlogs } from '$lib/remotes/blog.remote';
	import { DataTableWrapper } from '$lib/components/common/data-display';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import { createRawSnippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import BlogActionsCell from './blog-actions-cell.svelte';
	import DeleteBlogDialog from './delete-blog-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import { Search } from '@lucide/svelte';

	type Blog = {
		id: string;
		title: string;
		content: string;
		slug: string;
		authorId: string;
		createdAt: Date | null;
	};

	let searchQuery = $state('');
	let currentPage = $state(1);
	const pageSize = 12;

	let deletingBlog = $state<null | Blog>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(blog: Blog) {
		if (!blog) return;
		deletingBlog = blog;
		deleteDialogOpen = true;
	}

	function handlePageChange(pageIndex: number) {
		currentPage = pageIndex + 1;
	}

	function handleSearchChange() {
		currentPage = 1;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="relative max-w-sm">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input
			type="text"
			placeholder={m.blog_search_placeholder()}
			bind:value={searchQuery}
			oninput={handleSearchChange}
			class="pl-9"
		/>
	</div>

	{#await getAllBlogs({ search: searchQuery, page: currentPage, pageSize })}
		<div class="text-muted-foreground px-4 py-8 text-center text-sm">
			{m.common_loading?.() || 'Loading...'}
		</div>
	{:then response}
		{console.log(response.data)}
		<DataTableWrapper
			data={response.data}
			columns={[
				{
					accessorKey: 'title',
					header: () => m.blog_title(),
					cell: (info: any) => {
						const value = info.getValue() as string;
						const snippet = createRawSnippet<[{ title: string }]>((getTitle) => {
							const { title } = getTitle();
							return {
								render: () => `<div class="font-medium">${title}</div>`
							};
						});
						return renderSnippet(snippet, { title: value });
					}
				},
				{
					accessorKey: 'slug',
					header: () => m.blog_slug(),
					cell: (info: any) => {
						const value = info.getValue() as string;
						const snippet = createRawSnippet<[{ slug: string }]>((getSlug) => {
							const { slug } = getSlug();
							return {
								render: () => `<div class="text-muted-foreground font-mono text-sm">${slug}</div>`
							};
						});
						return renderSnippet(snippet, { slug: value });
					}
				},
				{
					accessorKey: 'createdAt',
					header: () => m.blog_created_at(),
					cell: (info: any) => {
						const date = info.getValue() as Date | null;
						const snippet = createRawSnippet<[{ date: Date | null }]>((getDate) => {
							const { date: d } = getDate();
							let dateStr = '-';
							if (d instanceof Date) {
								dateStr = d.toLocaleDateString();
							} else if (d) {
								dateStr = new Date(d as string | number).toLocaleDateString();
							}
							return {
								render: () => `<div class="text-muted-foreground text-sm">${dateStr}</div>`
							};
						});
						return renderSnippet(snippet, { date });
					}
				},
				{
					id: 'actions',
					header: () => m.common_actions(),
					cell: ({ row }: any) =>
						renderComponent(BlogActionsCell, {
							blog: row.original,
							onDelete: openDeleteDialog
						}),
					enableSorting: false,
					enableHiding: false
				}
			]}
			totalPages={response.totalPages}
			page={currentPage}
			{pageSize}
			onPageChange={handlePageChange}
			emptyMessage={m.blog_no_blogs()}
		/>
	{:catch error}
		<div class="text-destructive px-4 py-8 text-center text-sm">
			{m.common_error?.() || 'Error'}: {error.message}
		</div>
	{/await}
</div>

<DeleteBlogDialog blog={deletingBlog} bind:open={deleteDialogOpen} />
