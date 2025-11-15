<script lang="ts">
	import { getAssetById } from '$lib/remotes/asset.remote';

	type Props = {
		/** Asset ID to fetch and display */
		assetId: string;
		/** Alt text for the image */
		alt: string;
		/** Whether to display thumbnail version (default: true) */
		thumbnail?: boolean;
		/** Additional CSS classes */
		class?: string;
	};

	let { assetId, alt, thumbnail = true, class: className = '' }: Props = $props();
</script>

{#await getAssetById(assetId)}
	<div class="bg-muted animate-pulse {className}"></div>
{:then asset}
	<img
		src={thumbnail ? asset.thumbnailUrl || asset.url : asset.url}
		alt={alt}
		class={className}
	/>
{:catch}
	<div class="bg-muted flex items-center justify-center {className}">
		<span class="text-muted-foreground text-xs">?</span>
	</div>
{/await}
