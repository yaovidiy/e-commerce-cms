<script lang="ts">
	import { getActiveBannersByPosition } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';

	type Position = 'home_secondary' | 'category_top' | 'product_sidebar' | 'footer';

	let { position }: { position: Position } = $props();
</script>

<div class="w-full">
	{#await getActiveBannersByPosition({ position })}
		<!-- Loading skeleton -->
		<div class="h-32 md:h-40 bg-muted animate-pulse rounded-lg"></div>
	{:then banners}
		{#if banners.length > 0}
			{@const banner = banners[0]}
			<div class="relative overflow-hidden rounded-lg group">
				<!-- Banner image -->
				<div class="relative h-32 md:h-40">
					<img
						src={banner.imageUrl}
						alt={banner.title}
						class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>

					<!-- Overlay -->
					<div class="absolute inset-0 bg-linear-to-r from-black/40 to-transparent"></div>

					<!-- Content overlay -->
					<div class="absolute inset-0 flex items-center px-4 md:px-6">
						<div class="max-w-lg">
							<h3 class="text-xl md:text-2xl font-semibold text-white mb-2 drop-shadow-md">
								{banner.title}
							</h3>

							{#if banner.link && banner.linkText}
								<a href={banner.link}>
									<Button size="sm" variant="secondary" class="shadow-md">
										{banner.linkText}
									</Button>
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{:catch error}
		<!-- Error state - silently fail -->
		<div class="hidden"></div>
	{/await}
</div>
