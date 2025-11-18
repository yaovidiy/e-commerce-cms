<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';
</script>

<!-- Hero Banner -->
<section class="-mx-8 mb-10 lg:mb-32">
	<div class="relative h-[150px] w-full overflow-hidden bg-linear-to-r from-primary/20 to-primary/10 md:h-[450px] lg:h-[650px]">
		<div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
			<h1 class="text-4xl font-bold tracking-tight text-dark-green md:text-6xl lg:text-7xl mb-4">
				Welcome to SpiceRoom
			</h1>
			<p class="text-lg text-muted-foreground max-w-2xl mb-6 md:text-xl">
				{m.footer_description()}
			</p>
			<Button href="/products" size="lg" class="hidden md:inline-flex">
				{m.nav_products()}
			</Button>
		</div>
	</div>
</section>

<!-- Featured Categories Grid -->
<section class="mx-auto mb-10 max-w-7xl lg:mb-32">
	<div class="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4 lg:gap-10">
		<!-- Category 1 -->
		<a href="/products?category=spices" class="group relative overflow-hidden rounded-lg bg-milky h-[250px] transition-transform hover:scale-[1.02]">
			<div class="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/50 to-transparent">
				<h3 class="text-2xl font-bold text-white">Spices</h3>
			</div>
		</a>

		<!-- Category 2 (Tall) -->
		<a href="/products?category=herbs" class="group relative overflow-hidden rounded-lg bg-milky h-80 md:row-span-2 md:h-[250px] transition-transform hover:scale-[1.02]">
			<div class="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/50 to-transparent">
				<h3 class="text-2xl font-bold text-white">Herbs & Seasonings</h3>
			</div>
		</a>

		<!-- Category 3 -->
		<a href="/products?category=blends" class="group relative overflow-hidden rounded-lg bg-milky h-[250px] transition-transform hover:scale-[1.02]">
			<div class="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/50 to-transparent">
				<h3 class="text-2xl font-bold text-white">Spice Blends</h3>
			</div>
		</a>
	</div>
</section>

<!-- New Arrivals -->
<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight md:text-3xl">New Arrivals</h2>
	</div>
	<div class="relative overflow-hidden">
		<div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
			{#each Array(6) as _, i}
				<a href="/products/{i+1}" class="group relative min-w-[230px] overflow-hidden rounded-lg bg-milky transition-transform hover:scale-[1.02]">
					<div class="aspect-square bg-linear-to-br from-primary/20 to-primary/5"></div>
					<div class="p-4">
						<h4 class="font-semibold text-sm mb-1 line-clamp-2">Product Name {i + 1}</h4>
						<p class="text-muted-foreground text-xs mb-2">100g</p>
						<p class="font-bold text-lg">$12.99</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Best Sellers -->
<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight md:text-3xl">Best Sellers</h2>
	</div>
	<div class="relative overflow-hidden">
		<div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
			{#each Array(6) as _, i}
				<a href="/products/{i+7}" class="group relative min-w-[230px] overflow-hidden rounded-lg bg-milky transition-transform hover:scale-[1.02]">
					<div class="aspect-square bg-linear-to-br from-primary/20 to-primary/5"></div>
					<div class="p-4">
						<h4 class="font-semibold text-sm mb-1 line-clamp-2">Popular Product {i + 1}</h4>
						<p class="text-muted-foreground text-xs mb-2">100g</p>
						<p class="font-bold text-lg">$9.99</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Special Offers -->
<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight md:text-3xl">Special Offers</h2>
	</div>
	<div class="relative overflow-hidden">
		<div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
			{#each Array(6) as _, i}
				<a href="/products/{i+13}" class="group relative min-w-[230px] overflow-hidden rounded-lg bg-milky transition-transform hover:scale-[1.02]">
					<div class="aspect-square bg-linear-to-br from-destructive/20 to-destructive/5 relative">
						<span class="absolute top-2 right-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">-20%</span>
					</div>
					<div class="p-4">
						<h4 class="font-semibold text-sm mb-1 line-clamp-2">Sale Item {i + 1}</h4>
						<p class="text-muted-foreground text-xs mb-2">100g</p>
						<div class="flex items-center gap-2">
							<p class="font-bold text-lg">$7.99</p>
							<p class="text-muted-foreground text-sm line-through">$9.99</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Promotional Banner 1 -->
<section class="-mx-8 mb-10 lg:mb-32">
	<div class="relative h-[150px] w-full overflow-hidden bg-linear-to-r from-dark-green/90 to-dark-green/70 md:h-[450px] lg:h-[650px]">
		<div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
			<h2 class="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl mb-4">
				Organic & Natural
			</h2>
			<p class="text-lg text-white/90 max-w-2xl mb-6">
				Premium quality spices sourced from the finest farms
			</p>
			<Button href="/products" size="lg" variant="outline" class="hidden md:inline-flex bg-white text-dark-green hover:bg-white/90">
				Shop Now
			</Button>
		</div>
	</div>
</section>

<!-- Promotional Banner 2 -->
<section class="-mx-8 mb-10 lg:mb-32">
	<div class="relative h-[150px] w-full overflow-hidden bg-linear-to-r from-primary/90 to-primary/70 md:h-[450px] lg:h-[650px]">
		<div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
			<h2 class="text-3xl font-bold tracking-tight text-dark-green md:text-5xl lg:text-6xl mb-4">
				Authentic Flavors
			</h2>
			<p class="text-lg text-dark-green/90 max-w-2xl mb-6">
				Traditional recipes meet modern quality standards
			</p>
			<Button href="/pages/about-us" size="lg" class="hidden md:inline-flex">
				Learn More
			</Button>
		</div>
	</div>
</section>

<!-- Categories Section -->
<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight md:text-3xl">Shop by Category</h2>
	</div>
	<div class="relative overflow-hidden">
		<div class="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
			{#each ['Spices', 'Herbs', 'Blends', 'Seeds', 'Salts', 'Peppers'] as category}
				<a href="/products?category={category.toLowerCase()}" class="group relative min-w-[230px] overflow-hidden rounded-lg transition-transform hover:scale-[1.02]">
					<div class="aspect-square bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center">
						<h4 class="font-bold text-lg text-dark-green">{category}</h4>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Blog/Recipes Section -->
<section class="mx-auto mb-10 w-full max-w-7xl lg:mb-32">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight md:text-3xl">Latest from Blog</h2>
	</div>
	<div class="relative overflow-hidden">
		<div class="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
			{#each Array(6) as _, i}
				<a href="/blog/{i+1}" class="group relative min-w-[230px] overflow-hidden rounded-lg bg-milky transition-transform hover:scale-[1.02]">
					<div class="aspect-square bg-linear-to-br from-primary/20 to-primary/5"></div>
					<div class="p-4">
						<h4 class="font-semibold text-sm mb-2 line-clamp-2">Blog Post Title {i + 1}</h4>
						<p class="text-muted-foreground text-xs">Read more →</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
