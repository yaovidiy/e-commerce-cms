<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { FileText, Users } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">{m.admin_panel()}</h2>
		<p class="text-muted-foreground">Welcome to the administration panel</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<a
			href="/admin/blogs"
			class="group flex flex-col gap-2 rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
		>
			<FileText class="size-8 text-muted-foreground group-hover:text-foreground" />
			<h3 class="text-xl font-semibold">{m.admin_blogs()}</h3>
			<p class="text-sm text-muted-foreground">Manage blog posts and content</p>
		</a>

		<a
			href="/admin/users"
			class="group flex flex-col gap-2 rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
		>
			<Users class="size-8 text-muted-foreground group-hover:text-foreground" />
			<h3 class="text-xl font-semibold">{m.admin_users()}</h3>
			<p class="text-sm text-muted-foreground">Manage users and permissions</p>
		</a>
	</div>
</div>
