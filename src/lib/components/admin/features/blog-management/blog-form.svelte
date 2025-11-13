<script lang="ts">
	import { createBlog } from '$lib/remotes/blog.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
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

	function handleContentChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		contentValue = target.value;
		createBlog.fields.content.set(contentValue);
	}
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
		<textarea
			{...createBlog.fields.content.as('text')}
			oninput={handleContentChange}
			placeholder={m.blog_content_placeholder()}
			rows="12"
			class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[200px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		></textarea>
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
