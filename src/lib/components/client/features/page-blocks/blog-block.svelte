<script lang="ts">
	import BlogCard from '$lib/components/client/features/blog/blog-card.svelte';
	import * as Carousel from '$lib/components/ui/carousel';

	let {
		data
	}: {
		data: {
			blogs?: Array<{
				id: string;
				image?: {
					id: string;
				};
				category?: string;
				title?: string;
				description?: string;
				url?: string;
			}>;
		};
	} = $props();
</script>

<div class="container py-12">
	<Carousel.Root>
		<Carousel.Content>
			{#each data.blogs || [] as blog (blog.id)}
				<Carousel.Item class="md:basis-1/2 lg:basis-1/3">
					<BlogCard
						image={blog.image}
						category={blog.category}
						title={blog.title}
						description={blog.description}
						url={blog.url}
					/>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
