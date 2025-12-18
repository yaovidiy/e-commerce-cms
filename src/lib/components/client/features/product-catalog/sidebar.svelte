<script lang="ts">
	import CollapsibleSubMenuItem from './collapsibleSubMenuItem.svelte';
	import MenuItem from './MenuItem.svelte';
	import ApiRequest from '$lib/utils/api';
	import { Skeleton } from '$lib/components/ui/skeleton';

	const megaMenu = ApiRequest.Category.megaMenu.query();

	let {
		onCategoryChange
	}: {
		onCategoryChange?: (category: string) => void;
	} = $props();
</script>

<aside class="flex top-24 h-fit w-full flex-col gap-6 md:sticky md:max-w-[25%]">
	{#if $megaMenu.isSuccess}
		{#each $megaMenu.data as category}
			{#if category.attributes?.product_categories?.data.length > 0}
				<CollapsibleSubMenuItem
					onSubItemClick={(category) => onCategoryChange?.(category.id.toString())}
					title={category.attributes.category_title}
					subItems={category.attributes.product_categories.data}
				/>
			{:else}
				<MenuItem
					onClick={() =>
						onCategoryChange?.(category.attributes.product_category.data?.id.toString() ?? '')}
					title={category.attributes?.product_category?.data?.attributes?.title ?? ''}
				/>
			{/if}
		{/each}
	{:else}
		{#each Array.from({ length: 5 }) as _, index}
			<Skeleton class="h-8 w-full" />
		{/each}
	{/if}
</aside>