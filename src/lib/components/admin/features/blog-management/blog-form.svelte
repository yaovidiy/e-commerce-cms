<script lang="ts">
	import { createBlog } from '$lib/remotes/blog.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RichTextEditor } from '$lib/components/common/forms';
	import * as m from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	let { onSuccess } = $props<{
		onSuccess?: () => void;
	}>();

	// Auto-generate slug from title
	function generateSlug(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	let titleValue = $state('');
	let slugValue = $state('');
	let contentValue = $state('');
	let manualSlugEdit = $state(false);

	function handleTitleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		titleValue = target.value;
		createBlog.fields.title.set(titleValue);

		// Auto-generate slug only if user hasn't manually edited it
		if (!manualSlugEdit) {
			slugValue = generateSlug(titleValue);
			createBlog.fields.slug.set(slugValue);
		}
	}

	function handleSlugChange(e: Event) {
		const target = e.target as HTMLInputElement;
		slugValue = target.value;
		createBlog.fields.slug.set(slugValue);
		manualSlugEdit = true;
	}

	// Watch for content changes from RichTextEditor
	$effect(() => {
		createBlog.fields.content.set(contentValue);
	});
</script>

<form
	{...createBlog.enhance(async ({ form, submit }) => {
		await submit();

		form.reset();

		onSuccess?.();
		goto('/admin/blogs');
	})}
	class="space-y-6"
>
	<div class="space-y-2">
		<Label>{m.blog_title()}</Label>
		<Input
			{...createBlog.fields.title.as('text')}
			oninput={handleTitleChange}
			placeholder={m.blog_title_placeholder()}
		/>
		{#each createBlog.fields.title.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<div class="space-y-2">
		<Label>{m.blog_slug()}</Label>
		<Input
			{...createBlog.fields.slug.as('text')}
			oninput={handleSlugChange}
			placeholder={m.blog_slug_placeholder()}
			class="font-mono"
		/>
		{#each createBlog.fields.slug.issues() as issue}
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
		{#each createBlog.fields.content.issues() as issue}
			<p class="text-destructive text-sm">{issue.message}</p>
		{/each}
	</div>

	<div class="flex gap-2">
		<Button type="submit" disabled={!!createBlog.pending}>
			{createBlog.pending ? m.common_creating() : m.common_create()}
		</Button>
		<Button type="button" variant="outline" onclick={() => (window.location.href = '/admin/blogs')}>
			{m.common_cancel()}
		</Button>
	</div>
</form>
