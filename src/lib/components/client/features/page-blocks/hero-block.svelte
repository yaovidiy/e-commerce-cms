<script lang="ts">
	let { data } = $props<{ data: Record<string, any> }>();
</script>

<section class="relative min-h-[400px] flex items-center justify-center bg-muted">
	{#if data.imageUrl}
		<div class="absolute inset-0">
			<img
				src={data.imageUrl}
				alt={data.heading || ''}
				class="w-full h-full object-cover"
			/>
			<div class="absolute inset-0 bg-black/40"></div>
		</div>
	{/if}

	<div class="container relative z-10 text-center text-white py-20">
		{#if data.heading}
			<h1 class="text-4xl md:text-6xl font-bold mb-4">
				{data.heading}
			</h1>
		{/if}

		{#if data.subheading}
			<p class="text-xl md:text-2xl mb-8 text-white/90">
				{data.subheading}
			</p>
		{/if}

		{#if data.ctaText && data.ctaLink}
			<a
				href={data.ctaLink}
				class="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
			>
				{data.ctaText}
			</a>
		{/if}
	</div>
</section>
