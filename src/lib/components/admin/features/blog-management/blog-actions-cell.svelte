<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { MoreHorizontal, Pencil, Trash2, Eye } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	interface Blog {
		id: string;
		title: string;
		content: string;
		slug: string;
		authorId: string;
		createdAt: Date | null;
	}

	interface Props {
		blog: Blog;
		onDelete?: (blog: Blog) => void;
	}

	let { blog, onDelete }: Props = $props();

</script>

<div class="flex items-center justify-end gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="ghost" size="icon">
				<MoreHorizontal class="h-4 w-4" />
				<span class="sr-only">{m.common_actions()}</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => goto(`/blog/${blog.slug}`)}>
				<Eye class="mr-2 h-4 w-4" />
				{m.blog_view()}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => goto(`/admin/blogs/edit/${blog.id}`)}>
				<Pencil class="mr-2 h-4 w-4" />
				{m.blog_edit_blog()}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => onDelete?.(blog)}
				class="text-destructive"
			>
				<Trash2 class="mr-2 h-4 w-4" />
				{m.blog_delete_blog()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
