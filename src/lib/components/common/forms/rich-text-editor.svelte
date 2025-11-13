<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import Youtube from '@tiptap/extension-youtube';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import {
		Bold,
		Italic,
		Strikethrough,
		Code,
		Heading1,
		Heading2,
		Heading3,
		List,
		ListOrdered,
		Quote,
		Undo,
		Redo,
		Link as LinkIcon,
		ImageIcon,
		Youtube as YoutubeIcon,
		RemoveFormatting
	} from '@lucide/svelte';

	let {
		value = $bindable(''),
		placeholder = 'Write something...',
		class: className = '',
		disabled = false
	} = $props<{
		value?: string;
		placeholder?: string;
		class?: string;
		disabled?: boolean;
	}>();

	let element: HTMLDivElement;
	let editor = $state<Editor | null>(null);

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-primary underline'
					}
				}),
				Image.configure({
					HTMLAttributes: {
						class: 'max-w-full h-auto rounded-lg'
					}
				}),
				Youtube.configure({
					width: 640,
					height: 360,
					HTMLAttributes: {
						class: 'rounded-lg'
					}
				})
			],
			content: value,
			editable: !disabled,
			onTransaction: () => {
				// Force re-render
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				value = editor.getHTML();
			},
			editorProps: {
				attributes: {
					class:
						'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 [&_ol]:list-decimal [&_ul]:list-disc'
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Watch for external value changes
	$effect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	});

	// Watch for disabled state changes
	$effect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	});

	function addLink() {
		const url = window.prompt('Enter URL:');
		if (url && editor) {
			editor.chain().focus().setLink({ href: url }).run();
		}
	}

	function addImage() {
		const url = window.prompt('Enter image URL:');
		if (url && editor) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}

	function addYoutubeVideo() {
		const url = window.prompt('Enter YouTube URL:');
		if (url && editor) {
			editor.chain().focus().setYoutubeVideo({ src: url }).run();
		}
	}

	function clearFormatting() {
		if (editor) {
			editor.chain().focus().clearNodes().unsetAllMarks().run();
		}
	}
</script>

<div class={cn('rounded-md border bg-background', className)}>
	{#if editor}
		<div class="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
			<!-- Text Formatting -->
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				class={editor.isActive('bold') ? 'bg-muted' : ''}
			>
				<Bold class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				class={editor.isActive('italic') ? 'bg-muted' : ''}
			>
				<Italic class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				class={editor.isActive('strike') ? 'bg-muted' : ''}
			>
				<Strikethrough class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleCode().run()}
				disabled={!editor.can().chain().focus().toggleCode().run()}
				class={editor.isActive('code') ? 'bg-muted' : ''}
			>
				<Code class="h-4 w-4" />
			</Button>

			<div class="w-px h-8 bg-border mx-1"></div>

			<!-- Headings -->
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
				class={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
			>
				<Heading1 class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
				class={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
			>
				<Heading2 class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
				class={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
			>
				<Heading3 class="h-4 w-4" />
			</Button>

			<div class="w-px h-8 bg-border mx-1"></div>

			<!-- Lists -->
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
				class={editor.isActive('bulletList') ? 'bg-muted' : ''}
			>
				<List class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
				class={editor.isActive('orderedList') ? 'bg-muted' : ''}
			>
				<ListOrdered class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().toggleBlockquote().run()}
				class={editor.isActive('blockquote') ? 'bg-muted' : ''}
			>
				<Quote class="h-4 w-4" />
			</Button>

			<div class="w-px h-8 bg-border mx-1"></div>

			<!-- Media -->
			<Button type="button" variant="ghost" size="sm" onclick={addLink}>
				<LinkIcon class="h-4 w-4" />
			</Button>

			<Button type="button" variant="ghost" size="sm" onclick={addImage}>
				<ImageIcon class="h-4 w-4" />
			</Button>

			<Button type="button" variant="ghost" size="sm" onclick={addYoutubeVideo}>
				<YoutubeIcon class="h-4 w-4" />
			</Button>

			<div class="w-px h-8 bg-border mx-1"></div>

			<!-- Undo/Redo -->
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}
			>
				<Undo class="h-4 w-4" />
			</Button>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onclick={() => editor?.chain().focus().redo().run()}
				disabled={!editor.can().chain().focus().redo().run()}
			>
				<Redo class="h-4 w-4" />
			</Button>

			<Button type="button" variant="ghost" size="sm" onclick={clearFormatting}>
				<RemoveFormatting class="h-4 w-4" />
			</Button>
		</div>
	{/if}

	<div bind:this={element} class="min-h-[200px]"></div>

	{#if !value || value === '<p></p>'}
		<div class="pointer-events-none absolute top-[60px] left-6 text-muted-foreground text-sm">
			{placeholder}
		</div>
	{/if}
</div>

<style>
	:global(.ProseMirror) {
		outline: none;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: #adb5bd;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.ProseMirror h1) {
		font-size: 2em;
		font-weight: bold;
		margin: 0.67em 0;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5em;
		font-weight: bold;
		margin: 0.75em 0;
	}

	:global(.ProseMirror h3) {
		font-size: 1.17em;
		font-weight: bold;
		margin: 0.83em 0;
	}

	:global(.ProseMirror ul) {
		list-style-type: disc;
		padding-left: 2rem;
	}

	:global(.ProseMirror ol) {
		list-style-type: decimal;
		padding-left: 2rem;
	}

	:global(.ProseMirror blockquote) {
		border-left: 3px solid #ccc;
		padding-left: 1rem;
		margin-left: 0;
		font-style: italic;
	}

	:global(.ProseMirror code) {
		background-color: rgba(97, 97, 97, 0.1);
		border-radius: 0.25rem;
		padding: 0.125rem 0.25rem;
		font-family: monospace;
		font-size: 0.875em;
	}

	:global(.ProseMirror pre) {
		background-color: rgba(97, 97, 97, 0.1);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-family: monospace;
		overflow-x: auto;
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 1rem 0;
	}

	:global(.ProseMirror iframe) {
		border: 0;
		margin: 1rem 0;
	}
</style>
