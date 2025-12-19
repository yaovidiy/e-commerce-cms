<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Minus, Plus } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let {
		title,
		subItems,
		onSubItemClick
	}: {
		title: string;
		subItems: any[];
		onSubItemClick?: (item: any) => void;
	} = $props();

	let open = $state(false);
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger class="w-full">
		{#snippet child({ props })}
			<button {...props} class="flex w-full items-center justify-between px-2 text-sm">
				{title}
				{#if open}
					<Minus size={24} />
				{:else}
					<Plus size={24} />
				{/if}
			</button>
		{/snippet}
	</Collapsible.Trigger>
	<Collapsible.Content>
		<div transition:slide class="ml-3 flex flex-col gap-4 border-l border-gray-200 pt-4 pl-4">
			{#each subItems as subItem}
				<button
					onclick={() => onSubItemClick?.(subItem)}
					class="flex w-full items-center justify-between px-2 text-sm"
					>{subItem.attributes.title}</button
				>
			{/each}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
