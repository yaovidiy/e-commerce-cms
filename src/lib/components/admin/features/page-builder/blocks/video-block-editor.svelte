<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as m from '$lib/paraglide/messages';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	// Initialize data with defaults
	$effect(() => {
		if (!data.videoUrl) data.videoUrl = '';
		if (!data.caption) data.caption = '';
	});

	function getEmbedUrl(url: string): string | null {
		if (!url) return null;

		// YouTube
		const youtubeMatch = url.match(
			/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
		);
		if (youtubeMatch) {
			return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
		}

		// Vimeo
		const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
		if (vimeoMatch) {
			return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
		}

		return url;
	}

	$effect(() => {
		if (data.videoUrl) {
			data.embedUrl = getEmbedUrl(data.videoUrl);
		}
	});
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="videoUrl">Video URL</Label>
		<Input
			id="videoUrl"
			type="url"
			bind:value={data.videoUrl}
			placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
		/>
		<p class="text-muted-foreground text-xs">
			Supports YouTube and Vimeo links. Paste the video URL here.
		</p>
	</div>

	<div class="space-y-2">
		<Label for="caption">Caption (Optional)</Label>
		<Input id="caption" type="text" bind:value={data.caption} placeholder="Video caption" />
	</div>

	{#if data.embedUrl}
		<div class="space-y-2">
			<Label>Preview</Label>
			<div class="aspect-video w-full overflow-hidden rounded-md">
				<iframe
					src={data.embedUrl}
					title="Video preview"
					class="h-full w-full"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		</div>
	{/if}
</div>
