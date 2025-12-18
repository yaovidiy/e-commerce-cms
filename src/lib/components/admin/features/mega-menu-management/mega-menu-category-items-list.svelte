<script lang="ts">
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Badge } from '$lib/components/ui/badge/';

	let { categoryIds = [] } = $props<{
		categoryIds: string[];
	}>();
</script>

{#await getAllCategories({ search: '', page: 1, pageSize: 100 })}
	<div class="flex flex-wrap gap-2">
		{#each categoryIds as categoryId (categoryId)}
			<div class="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
		{/each}
	</div>
{:then result}
	<div class="flex flex-wrap gap-2">
		{#each categoryIds as categoryId}
			{@const category = result.data.find((cat) => cat.id === categoryId)}
			{#if category}
				<Badge variant="secondary">{category.name}</Badge>
			{:else}
				<Badge variant="outline">{categoryId}</Badge>
			{/if}
		{/each}
	</div>
{:catch error}
	<div class="text-destructive text-sm">Error loading categories: {error}</div>
{/await}
