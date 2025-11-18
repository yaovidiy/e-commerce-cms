<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { ChevronRight, Menu } from '@lucide/svelte/icons';
	import { slide } from 'svelte/transition';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { getAllCategories } from '$lib/remotes/category.remote';
	import type { Category } from '$lib/server/db/schema';
	import { goto } from '$app/navigation';

	let open = false;
	const categoriesPromise = getAllCategories();
</script>

<Popover.Root bind:open>
	<Popover.Trigger class="flex gap-3">
		<Menu />
		<span>Категорії</span>
	</Popover.Trigger>
	<Popover.Content class="w-screen p-0">
		<div
			transition:slide
			class="top-10 z-10 flex max-h-[84.25vh] w-[98.8vw] overflow-hidden bg-milky md:-left-8 md:px-8 lg:-left-10 lg:px-10 xl:-left-40 xl:px-40"
		>
			<ul class="mt-2 py-4">
				<li>
					<a
						href="/products"
						class="flex gap-1 bg-primary px-5 py-2 uppercase text-white cursor-pointer"
						onclick={(e) => { e.preventDefault(); open = false; goto('/products'); }}
						tabindex="0"
					>
						Усі товари
						<ChevronRight size={24} />
					</a>
				</li>
				<li>
					<a
						href="/products?isOnSale=true"
						class="px-5 py-2 font-semibold uppercase hover:text-primary cursor-pointer block"
						onclick={(e) => { e.preventDefault(); open = false; goto('/products?isOnSale=true'); }}
						tabindex="0"
					>
						Акції
					</a>
				</li>
				<li>
					<a
						href="/products?additional%5B0%5D=featured"
						class="px-5 py-2 font-semibold uppercase hover:text-primary cursor-pointer block"
						onclick={(e) => { e.preventDefault(); open = false; goto('/products?additional%5B0%5D=featured'); }}
						tabindex="0"
					>
						Новинки
					</a>
				</li>
				<li>
					<a
						href="/products?additional%5B0%5D=bestseller"
						class="px-5 py-2 font-semibold uppercase hover:text-primary cursor-pointer block"
						onclick={(e) => { e.preventDefault(); open = false; goto('/products?additional%5B0%5D=bestseller'); }}
						tabindex="0"
					>
						Бестселери
					</a>
				</li>
			</ul>
			<ul class="mt-2 flex flex-1 flex-col flex-wrap bg-milky">
				{#await categoriesPromise}
					{#each Array(20) as _}
						<Skeleton class="h-2 w-20" />
					{/each}
				{:then categoriesRaw}
					{#each (categoriesRaw as Category[]).filter(c => c.isVisible && !c.parentId) as category (category.id)}
						<li class="cat-item flex flex-col px-5 py-4 transition-all">
							<span class="block w-3/4 overflow-hidden text-ellipsis font-semibold uppercase text-primary transition-all hover:text-primary">
								<a
									onclick={() => { open = false; goto(`/products?category=${category.slug}`); }}
									href={`/products?category=${category.slug}`}
								>{category.name}</a>
							</span>
							{#if (categoriesRaw as Category[]).some(c => c.parentId === category.id)}
								<ul class="m-0 flex flex-col">
									{#each (categoriesRaw as Category[]).filter(c => c.parentId === category.id && c.isVisible) as subcategory (subcategory.id)}
										<li class="py-2 transition-all hover:text-primary">
											<a
												onclick={() => { open = false; goto(`/products?category=${subcategory.slug}`); }}
												href={`/products?category=${subcategory.slug}`}
											>{subcategory.name}</a>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				{:catch}
					{#each Array(20) as _}
						<Skeleton class="h-2 w-20" />
					{/each}
				{/await}
			</ul>
		</div>
	</Popover.Content>
</Popover.Root>