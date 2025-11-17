<script lang="ts">
	import { getActiveBannersByPosition } from '$lib/remotes/banner.remote';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';

	let currentIndex = $state(0);
	let autoRotateInterval: ReturnType<typeof setInterval> | null = null;

	// Auto-rotate banners every 5 seconds
	function startAutoRotate(totalBanners: number) {
		if (totalBanners <= 1) return;

		stopAutoRotate();
		autoRotateInterval = setInterval(() => {
			currentIndex = (currentIndex + 1) % totalBanners;
		}, 5000);
	}

	function stopAutoRotate() {
		if (autoRotateInterval) {
			clearInterval(autoRotateInterval);
			autoRotateInterval = null;
		}
	}

	function goToSlide(index: number, totalBanners: number) {
		currentIndex = index;
		startAutoRotate(totalBanners);
	}

	function nextSlide(totalBanners: number) {
		currentIndex = (currentIndex + 1) % totalBanners;
		startAutoRotate(totalBanners);
	}

	function prevSlide(totalBanners: number) {
		currentIndex = (currentIndex - 1 + totalBanners) % totalBanners;
		startAutoRotate(totalBanners);
	}
</script>

<div class="relative w-full">
	{#await getActiveBannersByPosition({ position: 'home_hero' })}
		<!-- Loading skeleton -->
		<div class="h-[400px] md:h-[500px] lg:h-[600px] bg-muted animate-pulse"></div>
	{:then banners}
		{#if banners.length > 0}
			{@const _ = startAutoRotate(banners.length)}
			<div class="relative overflow-hidden rounded-lg">
				<!-- Banner slides -->
				<div
					class="flex transition-transform duration-500 ease-in-out"
					style="transform: translateX(-{currentIndex * 100}%)"
				>
					{#each banners as banner}
						<div class="min-w-full relative">
							<!-- Banner image -->
							<div class="relative h-[400px] md:h-[500px] lg:h-[600px]">
								<img
									src={banner.imageUrl}
									alt={banner.title}
									class="w-full h-full object-cover"
									loading="lazy"
								/>

								<!-- Overlay gradient -->
								<div
									class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"
								></div>

								<!-- Content overlay -->
								<div
									class="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8"
								>
									<h2
										class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
									>
										{banner.title}
									</h2>

									{#if banner.link && banner.linkText}
										<a href={banner.link}>
											<Button size="lg" class="shadow-lg">
												{banner.linkText}
											</Button>
										</a>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Navigation arrows (only show if multiple banners) -->
				{#if banners.length > 1}
					<button
						onclick={() => prevSlide(banners.length)}
						class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
						aria-label={m.common_previous()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m15 18-6-6 6-6" />
						</svg>
					</button>

					<button
						onclick={() => nextSlide(banners.length)}
						class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
						aria-label={m.common_next()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</button>

					<!-- Pagination dots -->
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
						{#each banners as _, index}
							<button
								onclick={() => goToSlide(index, banners.length)}
								class="w-2 h-2 rounded-full transition-all {currentIndex === index
									? 'bg-white w-6'
									: 'bg-white/50 hover:bg-white/75'}"
								aria-label="{m.common_go_to()} {index + 1}"
							></button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{:catch error}
		<!-- Error state - silently fail for better UX -->
		<div class="hidden"></div>
	{/await}
</div>
