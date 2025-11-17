<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();

	const images = data.images || [];
</script>

<section class="container py-8">
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		{#each images as image}
			<figure class="group">
				<img
					src={image.url}
					alt={image.altText || ''}
					class="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
				/>
				{#if image.altText}
					<figcaption class="mt-2 text-sm text-muted-foreground">
						{image.altText}
					</figcaption>
				{/if}
			</figure>
		{/each}
	</div>
</section>
