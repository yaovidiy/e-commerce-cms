<script lang="ts">
	import CollapsibleSubMenuItem from './collapsible-sub-menu-item.svelte';
	import MenuItem from './menu-item.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getAllMegaMenus } from '$lib/remotes/mega-menu.remote'; 

	let {
		onCategoryChange
	}: {
		onCategoryChange?: (category: string) => void;
	} = $props();
</script>

<aside class="flex top-24 h-fit w-full flex-col gap-6 md:sticky md:max-w-[25%]">
	{#await getAllMegaMenus({ search: '', page: 1, pageSize: 100 })}
		{#each Array.from({ length: 5 }) as _, index}
			<Skeleton class="h-8 w-full" />
		{/each}
	{:then response}
		{#each response.items as category}
			{#if category.categories?.length > 0}
				<CollapsibleSubMenuItem
					onSubItemClick={(categoryId) => onCategoryChange?.(categoryId)}
					title={category.title}
					subItems={category.categories}
				/>
			{:else}
				<MenuItem
					onClick={() => onCategoryChange?.(category.id)}
					title={category.title}
				/>
			{/if}
		{/each}
	{:catch error}
		<p class="text-sm text-destructive">Failed to load categories</p>
	{/await}
</aside>