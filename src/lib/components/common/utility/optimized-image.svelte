<script lang="ts">
	/**
	 * Optimized Image Component
	 * 
	 * Features:
	 * - Native lazy loading
	 * - Responsive images with srcset
	 * - Automatic width/height (prevents layout shift)
	 * - Error handling with fallback
	 * - Optional blur placeholder
	 */
	
	import { onMount } from 'svelte';
	
	let {
		src,
		alt,
		width,
		height,
		loading = 'lazy' as 'lazy' | 'eager',
		sizes,
		srcset,
		class: className = '',
		priority = false,
		placeholder = '',
		onError,
		...props
	} = $props();
	
	let imgElement = $state<HTMLImageElement | null>(null);
	let loaded = $state(false);
	let error = $state(false);
	let imageLoading = $state(loading);
	
	// If priority is set, use eager loading
	$effect(() => {
		if (priority) {
			imageLoading = 'eager';
		}
	});
	
	onMount(() => {
		// Preload high-priority images
		if (priority && src) {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = src;
			if (srcset) link.setAttribute('imagesrcset', srcset);
			if (sizes) link.setAttribute('imagesizes', sizes);
			document.head.appendChild(link);
		}
	});
	
	function handleLoad() {
		loaded = true;
	}
	
	function handleError(e: Event) {
		error = true;
		if (onError) {
			onError(e);
		}
	}
</script>

<div class="relative inline-block {className}">
	{#if placeholder && !loaded && !error}
		<div
			class="absolute inset-0 bg-gray-200 animate-pulse"
			style="width: {width}px; height: {height}px;"
		></div>
	{/if}
	
	{#if !error}
		<img
			bind:this={imgElement}
			{src}
			{alt}
			{width}
			{height}
			loading={imageLoading}
			{srcset}
			{sizes}
			class:opacity-0={!loaded && placeholder}
			class:opacity-100={loaded}
			class="transition-opacity duration-300"
			onload={handleLoad}
			onerror={handleError}
			{...props}
		/>
	{:else}
		<!-- Fallback for broken images -->
		<div
			class="flex items-center justify-center bg-gray-100 text-gray-400"
			style="width: {width}px; height: {height}px;"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
				<circle cx="9" cy="9" r="2"></circle>
				<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
			</svg>
		</div>
	{/if}
</div>
