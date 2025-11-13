<script lang="ts">
	import { BlogForm } from '$lib/components/admin/features/blog-management';
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from '@lucide/svelte';
	import { goto } from '$app/navigation';
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center gap-4">
		<Button
			variant="ghost"
			size="icon"
			onclick={() => goto('/admin/blogs')}
		>
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{m.blog_create_new_blog()}</h2>
			<p class="text-muted-foreground">{m.blog_create_blog_description()}</p>
		</div>
	</div>

	<div class="rounded-lg border bg-card p-6">
		<BlogForm />
	</div>
</div>
