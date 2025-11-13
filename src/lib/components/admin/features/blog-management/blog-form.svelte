<script lang="ts">
	import { createBlog, updateBlog } from '$lib/remotes/blog.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RichTextEditor } from '$lib/components/common/forms';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	type Blog = {
		id: string;
		title: string;
		slug: string;
		content: string;
	};

	let { blog, onSuccess } = $props<{
		blog?: Blog | null;
		onSuccess?: () => void;
	}>();

	const isEditMode = $derived(!!blog);
	const formHandler = $derived(isEditMode ? updateBlog : createBlog);

	// Auto-generate slug from title
	function generateSlug(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	let titleValue = $state(blog?.title || '');
	let slugValue = $state(blog?.slug || '');
	let contentValue = $state(blog?.content || '');
	let manualSlugEdit = $state(false);

	// Pre-populate form in edit mode
	$effect(() => {
		if (blog) {
			titleValue = blog.title;
			slugValue = blog.slug;
			contentValue = blog.content;
			manualSlugEdit = true; // Don't auto-generate slug when editing
		}
	});

	function handleTitleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		titleValue = target.value;
		formHandler.fields.title.set(titleValue);

		// Auto-generate slug only if user hasn't manually edited it and not in edit mode
		if (!manualSlugEdit && !isEditMode) {
			slugValue = generateSlug(titleValue);
			formHandler.fields.slug.set(slugValue);
		}
	}

	function handleSlugChange(e: Event) {
		const target = e.target as HTMLInputElement;
		slugValue = target.value;
		formHandler.fields.slug.set(slugValue);
		manualSlugEdit = true;
	}

	// Watch for content changes from RichTextEditor
	$effect(() => {
		formHandler.fields.content.set(contentValue);
	});

</script>

<form
	{...formHandler.enhance(async ({ form, submit }) => {
		await submit();

		form.reset();

		onSuccess?.();
		goto('/admin/blogs');
	})}
	class="space-y-6"
>
	{#if isEditMode}
		<input type="hidden" name="id" value={blog?.id} />
	{/if}

	<div class="space-y-2">
		<Label>{m.blog_title()}</Label>
		<Input
			{...formHandler.fields.title.as('text')}
			value={titleValue}
			oninput={handleTitleChange}
			placeholder={m.blog_title_placeholder()}
		/>
		{#each formHandler.fields.title.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<div class="space-y-2">
		<Label>{m.blog_slug()}</Label>
		<Input
			{...formHandler.fields.slug.as('text')}
			value={slugValue}
			oninput={handleSlugChange}
			placeholder={m.blog_slug_placeholder()}
			class="font-mono"
		/>
		{#each formHandler.fields.slug.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
		<p class="text-muted-foreground text-xs">
			URL-friendly version of the title. Auto-generated but can be edited.
		</p>
	</div>

	<div class="space-y-2">
		<Label>{m.blog_content()}</Label>
		<input type="hidden" name="content" value={contentValue} />
		<RichTextEditor bind:value={contentValue} placeholder={m.blog_content_placeholder()} />
		{#each formHandler.fields.content.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<div class="flex gap-2">
		<Button type="submit" disabled={!!formHandler.pending}>
			{#if isEditMode}
				{formHandler.pending ? m.common_saving() : m.common_save()}
			{:else}
				{formHandler.pending ? m.common_creating() : m.common_create()}
			{/if}
		</Button>
		<Button type="button" variant="outline" onclick={() => (window.location.href = '/admin/blogs')}>
			{m.common_cancel()}
		</Button>
	</div>
</form>
