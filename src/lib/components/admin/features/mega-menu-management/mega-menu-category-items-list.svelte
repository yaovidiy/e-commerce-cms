<script lang="ts">
	import { getAllCategories } from '$lib/remotes/category.remote';
	import { Badge } from '$lib/components/ui/badge/';

	let { categoryIds = [] } = $props<{ categoryIds: string[] }>();
</script>

<div class="flex flex-wrap gap-2">
	{#each categoryIds as categoryId}
		{#await getAllCategories({ search: '', page: 1, pageSize: 1000 }) then result}
			{#if result}
				{#each result.data.filter((cat) => cat.id === categoryId) as category}
					<Badge variant="secondary">{category.name}</Badge>
				{/each}
			{/if}
		{/await}
	{/each}
</div>
