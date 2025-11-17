<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus, MoveUp, MoveDown, Pencil, Trash2 } from '@lucide/svelte/icons';
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import BlockTypeSelector from './block-type-selector.svelte';
	import HeroBlockEditor from './blocks/hero-block-editor.svelte';
	import TextBlockEditor from './blocks/text-block-editor.svelte';
	import ImageBlockEditor from './blocks/image-block-editor.svelte';
	import GalleryBlockEditor from './blocks/gallery-block-editor.svelte';
	import VideoBlockEditor from './blocks/video-block-editor.svelte';
	import HtmlBlockEditor from './blocks/html-block-editor.svelte';

	type ContentBlock = {
		id: string;
		type: string;
		data: Record<string, any>;
	};

	let { blocks = $bindable([]) } = $props<{ blocks: ContentBlock[] }>();

	let showBlockSelector = $state(false);
	let editingBlockIndex = $state<number | null>(null);
	let editingBlock = $state<ContentBlock | null>(null);

	function addBlock(blockType: string) {
		const newBlock: ContentBlock = {
			id: crypto.randomUUID(),
			type: blockType,
			data: {}
		};
		blocks = [...blocks, newBlock];
		showBlockSelector = false;
		editBlock(blocks.length - 1);
	}

	function editBlock(index: number) {
		editingBlockIndex = index;
		editingBlock = { ...blocks[index] };
	}

	function saveBlock() {
		if (editingBlockIndex !== null && editingBlock) {
			blocks[editingBlockIndex] = { ...editingBlock };
			blocks = [...blocks];
			cancelEdit();
		}
	}

	function cancelEdit() {
		editingBlockIndex = null;
		editingBlock = null;
	}

	function deleteBlock(index: number) {
		blocks = blocks.filter((_: any, i: number) => i !== index);
	}

	function moveBlockUp(index: number) {
		if (index > 0) {
			[blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
			blocks = [...blocks];
		}
	}

	function moveBlockDown(index: number) {
		if (index < blocks.length - 1) {
			[blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
			blocks = [...blocks];
		}
	}

	function getBlockTypeLabel(type: string): string {
		switch (type) {
			case 'hero':
				return m.page_block_hero();
			case 'text':
				return m.page_block_text();
			case 'image':
				return m.page_block_image();
			case 'gallery':
				return m.page_block_gallery();
			case 'products':
				return m.page_block_products();
			case 'categories':
				return m.page_block_categories();
			case 'video':
				return m.page_block_video();
			case 'html':
				return m.page_block_html();
			default:
				return type;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="font-medium">{m.page_content_editor()}</h3>
		<Button size="sm" onclick={() => (showBlockSelector = true)}>
			<Plus class="mr-2 h-4 w-4" />
			{m.page_add_block()}
		</Button>
	</div>

	{#if blocks.length === 0}
		<div class="border-dashed rounded-lg border-2 p-12 text-center">
			<p class="text-muted-foreground">{m.page_content_help()}</p>
			<Button class="mt-4" onclick={() => (showBlockSelector = true)}>
				<Plus class="mr-2 h-4 w-4" />
				{m.page_add_block()}
			</Button>
		</div>
	{:else}
		<div class="space-y-3">
			{#each blocks as block, index}
				<Card.Root>
					<Card.Header class="pb-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground text-sm">#{index + 1}</span>
								<span class="font-medium">{getBlockTypeLabel(block.type)}</span>
							</div>
							<div class="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => moveBlockUp(index)}
									disabled={index === 0}
								>
									<MoveUp class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => moveBlockDown(index)}
									disabled={index === blocks.length - 1}
								>
									<MoveDown class="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon-sm" onclick={() => editBlock(index)}>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => deleteBlock(index)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</Card.Header>
					{#if editingBlockIndex === index && editingBlock}
						<Card.Content>
							{#if editingBlock.type === 'hero'}
								<HeroBlockEditor bind:data={editingBlock.data} />
							{:else if editingBlock.type === 'text'}
								<TextBlockEditor bind:data={editingBlock.data} />
							{:else if editingBlock.type === 'image'}
								<ImageBlockEditor bind:data={editingBlock.data} />
							{:else if editingBlock.type === 'gallery'}
								<GalleryBlockEditor bind:data={editingBlock.data} />
							{:else if editingBlock.type === 'video'}
								<VideoBlockEditor bind:data={editingBlock.data} />
							{:else if editingBlock.type === 'html'}
								<HtmlBlockEditor bind:data={editingBlock.data} />
							{:else}
								<p class="text-muted-foreground text-sm">
									Block type "{editingBlock.type}" editor not implemented yet.
								</p>
							{/if}
							<div class="mt-4 flex gap-2">
								<Button size="sm" onclick={saveBlock}>{m.common_save()}</Button>
								<Button size="sm" variant="outline" onclick={cancelEdit}>
									{m.common_cancel()}
								</Button>
							</div>
						</Card.Content>
					{/if}
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

{#if showBlockSelector}
	<BlockTypeSelector
		onSelect={addBlock}
		onCancel={() => (showBlockSelector = false)}
	/>
{/if}
