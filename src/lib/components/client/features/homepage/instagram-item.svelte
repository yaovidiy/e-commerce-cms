<script lang="ts">
	import AssetImage from '$lib/components/common/data-display/asset-image.svelte';
	import { Instagram } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	let {
		item
	}: {
		item: {
			id: string;
			image?: {
				assetId?: string;
			};
			url?: string;
		};
	} = $props();

	let itemHovered = $state(false);
</script>

<button
	onmouseenter={() => {
		itemHovered = true;
	}}
	onmouseleave={() => {
		itemHovered = false;
	}}
	onclick={() => {
		if (item?.url) {
			window.open(item?.url, '_blank');
		}
	}}
	class="relative h-[300px] w-[300px] shrink-0 overflow-hidden"
>
	<AssetImage
		assetId={item.image?.assetId ?? ''}
		thumbnail={false}
		class="h-full w-full object-cover"
	/>
	{#if itemHovered}
		<div
			transition:slide
			class="absolute top-0 left-1/2 flex h-full w-full -translate-x-1/2 items-center justify-center bg-black/40 text-white"
		>
			<Instagram size={65} />
		</div>
	{/if}
</button>
