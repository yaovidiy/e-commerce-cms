<script lang="ts">
	import AssetImage from '$lib/components/common/data-display/asset-image.svelte';
	import * as Card from '$lib/components/ui/card';
	import { goto } from '$app/navigation';

	let {
		image,
		category,
		title,
		description,
		url
	}: {
		image?: {
			id: string;
		};
		category?: string;
		title?: string;
		description?: string;
		url?: string;
	} = $props();
</script>

<Card.Root
	onclick={() => {
		if (url) {
			goto(url);
		}
	}}
	role="button"
	tabindex={0}
	class="w-full max-w-[350px] shrink-0 border-none p-0"
>
	<Card.Content>
		<AssetImage assetId={image?.id ?? ''} className="w-full h-[250px] mb-5" />
		<span class="mb-4 text-xs font-semibold text-gray-500">{category}</span>
		<h3 class="mb-4 text-2xl font-bold">{title}</h3>
		<p class="text-body mb-4 text-gray-600">{description}</p>
	</Card.Content>
</Card.Root>
