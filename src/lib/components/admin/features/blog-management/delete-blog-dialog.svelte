<script lang="ts">
	import { deleteBlog, getAllBlogs } from '$lib/remotes/blog.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';

	let { blog, open = $bindable(false) } = $props<{
		blog: {
			id: string;
			title: string;
		} | null;
		open?: boolean;
	}>();

	// Watch for successful deletion
	$effect(() => {
		if (deleteBlog.result) {
			// Close dialog on success
			open = false;
			// Refresh blog list
			getAllBlogs().refresh();
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m.blog_delete_blog()}</Dialog.Title>
			<Dialog.Description>{m.blog_delete_blog_description()}</Dialog.Description>
		</Dialog.Header>
		<form {...deleteBlog} class="space-y-4">
			<input type="hidden" name="id" value={blog?.id} />

			<p class="text-sm">
				{m.blog_delete_confirmation({ title: blog?.title || '' })}
			</p>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" variant="destructive" disabled={!!deleteBlog.pending}>
					{deleteBlog.pending ? m.common_deleting() : m.common_delete()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
