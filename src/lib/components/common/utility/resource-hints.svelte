<script lang="ts">
	/**
	 * Resource Hints Component
	 * 
	 * Adds preconnect, dns-prefetch, and preload hints
	 * to improve performance for external resources
	 */
	
	import { onMount } from 'svelte';
	
	let {
		// External origins to preconnect
		preconnect = [] as string[],
		// DNS to prefetch
		dnsPrefetch = [] as string[],
		// Resources to preload
		preload = [] as Array<{ href: string; as: string; type?: string }>
	} = $props();
	
	onMount(() => {
		const head = document.head;
		
		// Add preconnect hints
		preconnect.forEach(origin => {
			// Preconnect (establishes connection)
			const linkPreconnect = document.createElement('link');
			linkPreconnect.rel = 'preconnect';
			linkPreconnect.href = origin;
			linkPreconnect.crossOrigin = 'anonymous';
			head.appendChild(linkPreconnect);
			
			// DNS prefetch (fallback for older browsers)
			const linkDns = document.createElement('link');
			linkDns.rel = 'dns-prefetch';
			linkDns.href = origin;
			head.appendChild(linkDns);
		});
		
		// Add DNS prefetch hints
		dnsPrefetch.forEach(origin => {
			const link = document.createElement('link');
			link.rel = 'dns-prefetch';
			link.href = origin;
			head.appendChild(link);
		});
		
		// Add preload hints
		preload.forEach(resource => {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.href = resource.href;
			link.as = resource.as;
			if (resource.type) {
				link.type = resource.type;
			}
			head.appendChild(link);
		});
	});
</script>

<!-- No visible output - this component only modifies document head -->
