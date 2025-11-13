<script lang="ts">
	import { page } from '$app/stores';
	import { getBlogById } from '$lib/remotes/blog.remote';
	import { BlogForm } from '$lib/components/admin/features/blog-management';
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	// Get blog ID from route parameter
	const blogId = $derived($page.params.id || '');
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" onclick={() => goto('/admin/blogs')}>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.blog_edit_blog()}</h2>
			<p class="text-muted-foreground">{m.blog_edit_blog_description()}</p>
		</div>
	</div>

	<div class="rounded-lg border bg-card p-6">
		{#if blogId}
			{#await getBlogById(blogId)}
				<div class="flex items-center justify-center py-8">
					<p class="text-muted-foreground">Loading blog...</p>
				</div>
			{:then blog}
				{#if blog}
					<BlogForm {blog} />
				{:else}
					<div class="text-center py-8">
						<p class="text-muted-foreground">Blog not found</p>
						<Button onclick={() => goto('/admin/blogs')} class="mt-4">
							{m.common_cancel()}
						</Button>
					</div>
				{/if}
			{:catch error}
				<div class="text-center py-8">
					<p class="text-destructive">Error loading blog: {error.message}</p>
					<Button onclick={() => goto('/admin/blogs')} class="mt-4">
						{m.common_cancel()}
					</Button>
				</div>
			{/await}
		{/if}
	</div>
</div>
