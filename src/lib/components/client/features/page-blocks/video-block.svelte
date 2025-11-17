<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();
</script>

<section class="container py-8">
	<div class="max-w-4xl mx-auto">
		{#if data.embedUrl}
			<div class="relative aspect-video rounded-lg overflow-hidden shadow-lg">
				<iframe
					src={data.embedUrl}
					title={data.caption || 'Video'}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					class="absolute inset-0 w-full h-full"
				></iframe>
			</div>
		{/if}

		{#if data.caption}
			<p class="mt-4 text-center text-muted-foreground">
				{data.caption}
			</p>
		{/if}
	</div>
</section>
