<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import {
		LayoutTemplate,
		Type,
		Image,
		Images,
		Package,
		FolderTree,
		Video,
		Code,
		Mail,
		MessageSquare
	} from '@lucide/svelte/icons';
	import * as m from '$lib/paraglide/messages';

	let { onSelect, onCancel } = $props<{
		onSelect: (blockType: string) => void;
		onCancel: () => void;
	}>();

	const blockTypes = [
		{
			type: 'hero',
			icon: LayoutTemplate,
			label: () => m.page_block_hero(),
			description: 'Full-width hero banner with title, subtitle, image, and CTA'
		},
		{
			type: 'text',
			icon: Type,
			label: () => m.page_block_text(),
			description: 'Rich text content with formatting'
		},
		{
			type: 'image',
			icon: Image,
			label: () => m.page_block_image(),
			description: 'Single image with optional caption'
		},
		{
			type: 'gallery',
			icon: Images,
			label: () => m.page_block_gallery(),
			description: 'Grid of multiple images'
		},
		{
			type: 'products',
			icon: Package,
			label: () => m.page_block_products(),
			description: 'Showcase selected products'
		},
		{
			type: 'categories',
			icon: FolderTree,
			label: () => m.page_block_categories(),
			description: 'Display product categories'
		},
		{
			type: 'video',
			icon: Video,
			label: () => m.page_block_video(),
			description: 'Embed video from URL'
		},
		{
			type: 'html',
			icon: Code,
			label: () => m.page_block_html(),
			description: 'Custom HTML code'
		}
	];
</script>

<Dialog.Root open={true} onOpenChange={(open) => !open && onCancel()}>
	<Dialog.Content class="max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>{m.page_add_block()}</Dialog.Title>
			<Dialog.Description>
				Choose a content block type to add to your page
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
			{#each blockTypes as blockType}
				<button
					class="hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors"
					onclick={() => onSelect(blockType.type)}
				>
					<div class="bg-primary/10 text-primary rounded-md p-2">
						<blockType.icon class="h-5 w-5" />
					</div>
					<div>
						<h4 class="font-medium">{blockType.label()}</h4>
						<p class="text-muted-foreground text-xs">{blockType.description}</p>
					</div>
				</button>
			{/each}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel}>
				{m.common_cancel()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
