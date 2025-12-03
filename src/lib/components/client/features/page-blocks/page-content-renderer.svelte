<script lang="ts">
	import HeroBlock from './hero-block.svelte';
	import ImageBlock from './image-block.svelte';
	import TextBlock from './text-block.svelte';
	import VideoBlock from './video-block.svelte';
	import GalleryBlock from './gallery-block.svelte';
	import HtmlBlock from './html-block.svelte';
	import SliderBlock from './slider-block.svelte';
	import BenefitsBlock from './benefits-block.svelte';
	import InstagramBlock from './instagram-block.svelte';
	import BlogBlock from './blog-block.svelte';
	import ProductCardBlock from './product-card-block.svelte';

	let { blocks = [] } = $props<{ blocks: Array<Record<string, any>> }>();

	function renderBlock(block: Record<string, any>) {
		if (!block.type) return null;

		switch (block.type) {
			case 'hero':
				return HeroBlock;
			case 'image':
				return ImageBlock;
			case 'text':
				return TextBlock;
			case 'video':
				return VideoBlock;
			case 'gallery':
				return GalleryBlock;
			case 'html':
				return HtmlBlock;
			case 'slider':
				return SliderBlock;
			case 'benefits':
				return BenefitsBlock;
			case 'instagram':
				return InstagramBlock;
			case 'blog':
				return BlogBlock;
			case 'productCards':
				return ProductCardBlock;
			default:
				return null;
		}
	}
</script>

{#each blocks as block (block.id || `block-${blocks.indexOf(block)}`)}
	{@const Component = renderBlock(block)}
	{#if Component}
		<Component data={block.data || block} />
	{/if}
{/each}
