<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();
</script>

<section class="container py-8">
	<figure class="max-w-4xl mx-auto">
		{#if data.imageUrl}
			<img
				src={data.imageUrl}
				alt={data.altText || ''}
				class="w-full h-auto rounded-lg shadow-lg"
			/>
		{/if}

		{#if data.caption}
			<figcaption class="mt-4 text-center text-muted-foreground">
				{data.caption}
			</figcaption>
		{/if}
	</figure>
</section>
