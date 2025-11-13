<script lang="ts">
	import { getAllBlogs, deleteBlog } from '$lib/remotes/blog.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import DeleteBlogDialog from './delete-blog-dialog.svelte';
	import * as m from '$lib/paraglide/messages';
	import { MoreHorizontal, Pencil, Trash2, Search, Eye } from '@lucide/svelte';

	let searchQuery = $state('');

	type Blog = {
		id: string;
		title: string;
		content: string;
		slug: string;
		authorId: string;
		createdAt: Date | null;
	};

	let deletingBlog = $state<null | Blog>(null);
	let deleteDialogOpen = $state(false);

	function openDeleteDialog(blog: Blog) {
		if (!blog) return;
		deletingBlog = blog;
		deleteDialogOpen = true;
	}

	// Filter blogs based on search query
	function filterBlogs(blogs: Blog[]) {
		if (!searchQuery) return blogs;
		return blogs.filter((blog) =>
			blog.title.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}
</script>

<div class="flex flex-col gap-4">
	<div class="relative max-w-sm">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input
			type="text"
			placeholder={m.blog_search_placeholder()}
			bind:value={searchQuery}
			class="pl-9"
		/>
	</div>

	<div class="rounded-md border">
		<div class="w-full">
			<div class="bg-muted/50 border-b px-4 py-3">
				<div class="grid grid-cols-5 gap-4 font-medium">
					<div class="col-span-2">{m.blog_title()}</div>
					<div>{m.blog_slug()}</div>
					<div>{m.blog_created_at()}</div>
					<div class="text-right">{m.common_actions()}</div>
				</div>
			</div>
			<div>
				{#await getAllBlogs()}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">Loading...</div>
				{:then blogs}
					{@const filteredBlogs = filterBlogs(blogs)}
					{#each filteredBlogs as blog (blog.id)}
						<div class="hover:bg-muted/50 border-b px-4 py-3 last:border-0">
							<div class="grid grid-cols-5 items-center gap-4">
								<div class="col-span-2 font-medium">{blog.title}</div>
								<div class="text-muted-foreground text-sm font-mono">{blog.slug}</div>
								<div class="text-muted-foreground text-sm">
									{#if blog.createdAt && blog.createdAt instanceof Date}
										{blog.createdAt.toLocaleDateString()}
									{:else if blog.createdAt}
										{new Date(blog.createdAt as string | number).toLocaleDateString()}
									{:else}
										-
									{/if}
								</div>
								<div class="flex items-center justify-end gap-2">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Button variant="ghost" size="icon">
												<MoreHorizontal class="h-4 w-4" />
												<span class="sr-only">{m.common_actions()}</span>
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => window.location.href = `/blog/${blog.slug}`}>
												<Eye class="mr-2 h-4 w-4" />
												{m.blog_view()}
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => window.location.href = `/admin/blogs/edit/${blog.id}`}>
												<Pencil class="mr-2 h-4 w-4" />
												{m.blog_edit_blog()}
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												onclick={() => openDeleteDialog(blog as Blog)}
												class="text-destructive"
											>
												<Trash2 class="mr-2 h-4 w-4" />
												{m.blog_delete_blog()}
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</div>
						</div>
					{:else}
						<div class="px-4 py-8 text-center text-sm text-muted-foreground">
							{m.blog_no_blogs()}
						</div>
					{/each}
				{:catch error}
					<div class="px-4 py-8 text-center text-sm text-destructive">
						Error loading blogs: {error.message}
					</div>
				{/await}
			</div>
		</div>
	</div>
</div>

<DeleteBlogDialog blog={deletingBlog} bind:open={deleteDialogOpen} />
