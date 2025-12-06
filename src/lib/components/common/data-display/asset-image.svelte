<script lang="ts">
	import { getAssetById } from '$lib/remotes/asset.remote';
	import { OptimizedImage } from '$lib/components/common/utility';
	import type { ComponentProps } from 'svelte';

	type OptimizedImageProps = Omit<ComponentProps<typeof OptimizedImage>, 'src'>;

	type Props = OptimizedImageProps & {
		/** Asset ID to fetch and display */
		assetId: string;
		/** Whether to display thumbnail version (default: true) */
		thumbnail?: boolean;
	};

	let {
		assetId,
		alt,
		thumbnail = true,
		class: className = '',
		width = 'auto',
		height = 'auto',
		loading = 'lazy',
		sizes,
		srcset,
		priority = false,
		placeholder = '',
		onError,
		...restProps
	}: Props = $props();
</script>

{#if assetId}
	{#await getAssetById(assetId)}
		<div class="bg-muted animate-pulse {className}" style:width="{width}px" style:height="{height}px"></div>
	{:then asset}
		{#if asset?.url}
			<OptimizedImage
				src={thumbnail ? asset.thumbnailUrl || asset.url : asset.url}
				{alt}
				{width}
				{height}
				{loading}
				{sizes}
				{srcset}
				class={className}
				{priority}
				{placeholder}
				{onError}
				{...restProps}
			/>
		{:else}
			<div class="bg-muted flex items-center justify-center {className}" style:width="{width}px" style:height="{height}px">
				<span class="text-muted-foreground text-xs">?</span>
			</div>
		{/if}
	{:catch}
		<div class="bg-muted flex items-center justify-center {className}" style:width="{width}px" style:height="{height}px">
			<span class="text-muted-foreground text-xs">?</span>
		</div>
	{/await}
{:else}
	<div class="bg-muted flex items-center justify-center {className}" style:width="{width}px" style:height="{height}px">
		<span class="text-muted-foreground text-xs">?</span>
	</div>
{/if}
