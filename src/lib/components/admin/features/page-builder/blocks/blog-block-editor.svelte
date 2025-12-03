<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import AssetBrowser from '$lib/components/common/forms/asset-browser.svelte';
	import { X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Asset } from '$lib/server/db/schema';

	let { data = $bindable({}) } = $props<{ data: Record<string, any> }>();

	let showAssetBrowser = $state(false);
	let assetBrowserFor = $state<number | null>(null);

	// Initialize data with defaults
	$effect(() => {
		if (!data.blogs) data.blogs = [];
	});

	function handleAssetSelect(asset: Asset) {
		if (assetBrowserFor !== null) {
			if (data.blogs[assetBrowserFor]) {
				data.blogs[assetBrowserFor].image = {
					id: asset.id
				};
			}
			data.blogs = [...data.blogs];
		}
		showAssetBrowser = false;
		assetBrowserFor = null;
	}

	function addBlog() {
		data.blogs = [
			...(data.blogs || []),
			{
				id: crypto.randomUUID(),
				image: { id: '' },
				category: '',
				title: '',
				description: '',
				url: ''
			}
		];
	}

	function removeBlog(index: number) {
		data.blogs = data.blogs.filter((_: any, i: number) => i !== index);
	}

	function updateBlogField(index: number, field: string, value: string) {
		if (data.blogs[index]) {
			data.blogs[index][field] = value;
			data.blogs = [...data.blogs];
		}
	}

	function selectBlogImage(index: number) {
		assetBrowserFor = index;
		showAssetBrowser = true;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label>Blog Cards</Label>
		<p class="text-muted-foreground text-sm">Add blog post cards with images, category, and content</p>
	</div>

	{#if data.blogs && data.blogs.length > 0}
		<div class="grid gap-4">
			{#each data.blogs as blog, index}
				<div class="space-y-3 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Blog {index + 1}</span>
						<Button
							size="icon-sm"
							variant="destructive"
							onclick={() => removeBlog(index)}
						>
							<X class="h-3 w-3" />
						</Button>
					</div>

					<div class="space-y-2">
						<Label class="text-sm">Image</Label>
						{#if blog.image?.id}
							<div class="space-y-2">
								<div class="bg-muted flex h-32 w-full items-center justify-center rounded-md">
									<span class="text-muted-foreground text-xs">Asset {blog.image.id}</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onclick={() => selectBlogImage(index)}
								>
									Change Image
								</Button>
							</div>
						{:else}
							<Button
								size="sm"
								variant="outline"
								onclick={() => selectBlogImage(index)}
							>
								Select Image
							</Button>
						{/if}
					</div>

					<div class="grid gap-2 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for={`blog-category-${index}`} class="text-sm">Category</Label>
							<Input
								id={`blog-category-${index}`}
								type="text"
								value={blog.category || ''}
								oninput={(e) => updateBlogField(index, 'category', e.currentTarget.value)}
								placeholder="Category"
								class="text-sm"
							/>
						</div>

						<div class="space-y-2">
							<Label for={`blog-url-${index}`} class="text-sm">URL</Label>
							<Input
								id={`blog-url-${index}`}
								type="text"
								value={blog.url || ''}
								oninput={(e) => updateBlogField(index, 'url', e.currentTarget.value)}
								placeholder="/blog/post"
								class="text-sm"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for={`blog-title-${index}`} class="text-sm">Title</Label>
						<Input
							id={`blog-title-${index}`}
							type="text"
							value={blog.title || ''}
							oninput={(e) => updateBlogField(index, 'title', e.currentTarget.value)}
							placeholder="Enter title"
							class="text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for={`blog-description-${index}`} class="text-sm">Description</Label>
						<Textarea
							id={`blog-description-${index}`}
							value={blog.description || ''}
							oninput={(e) => updateBlogField(index, 'description', e.currentTarget.value)}
							placeholder="Enter description"
							rows={2}
							class="text-sm"
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button size="sm" variant="outline" onclick={addBlog}>
		Add Blog Card
	</Button>

	<AssetBrowser bind:open={showAssetBrowser} onSelect={handleAssetSelect} />
</div>
