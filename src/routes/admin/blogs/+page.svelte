<script lang="ts">
	import { goto } from '$app/navigation';
	import { BlogListTable } from '$lib/components/admin/features/blog-management';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { Plus } from '@lucide/svelte';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.admin_blogs()}</h2>
			<p class="text-muted-foreground">{m.blog_manage_description()}</p>
		</div>
		<Button onclick={() => goto('/admin/blogs/create')}>
			<Plus class="mr-2 h-4 w-4" />
			{m.blog_create_blog()}
		</Button>
	</div>

	<BlogListTable />
</div>
