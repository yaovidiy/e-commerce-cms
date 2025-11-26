<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import SiteHead from '$lib/components/common/utility/site-head.svelte';
	import WebVitalsTracker from '$lib/components/common/utility/web-vitals-tracker.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';

	let { children } = $props();
</script>

<!-- Dynamic favicon, title, and SEO meta from store settings -->
<SiteHead />

<ParaglideJS {i18n}>
	{@render children()}

	<!-- Global toast notifications -->
	<Toaster />

	<!-- Web Vitals Tracker (shows in dev mode only) -->
	<WebVitalsTracker />
</ParaglideJS>
