<script lang="ts">
	import { updatePage, getAllPages, togglePageStatus } from '$lib/remotes/page.remote';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Power } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Page } from '$lib/server/db/schema';
	import ContentBlockEditor from '../page-builder/content-block-editor.svelte';

	let { page = null, open = $bindable() } = $props<{ page: Page | null; open: boolean }>();

	let contentBlocks = $state<any[]>([]);

	// Auto-refresh query and close dialog after successful submission
	$effect(() => {
		if (updatePage.result) {
			open = false;
			getAllPages({ page: 1, pageSize: 10 }).refresh();
		}
	});

	// Pre-populate form when dialog opens
	$effect(() => {
		if (open && page) {
			updatePage.fields.set({
				id: page.id,
				title: page.title,
				slug: page.slug,
				template: page.template,
				status: page.status,
				seoTitle: page.seoTitle || '',
				seoDescription: page.seoDescription || ''
			});

			// Parse content blocks
			try {
				contentBlocks = page.content ? JSON.parse(page.content) : [];
			} catch (e) {
				contentBlocks = [];
			}
		}
	});

	// Serialize content blocks before submission
	$effect(() => {
		if (contentBlocks.length > 0 || page?.content) {
			const contentJson = JSON.stringify(contentBlocks);
			updatePage.fields.content?.set(contentJson);
		}
	});

	async function handleToggleStatus() {
		if (!page) return;

		await togglePageStatus({
			id: page.id,
			publish: page.status === 'draft'
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.page_edit_page()}</Dialog.Title>
			<Dialog.Description>{m.page_edit_page_description()}</Dialog.Description>
		</Dialog.Header>

		<form {...updatePage} class="space-y-6">
			<!-- Basic Information -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="font-medium">{m.page_basic_information()}</h3>
					{#if page}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={handleToggleStatus}
						>
							<Power class="mr-2 h-4 w-4" />
							{page.status === 'published' ? m.page_unpublish_page() : m.page_publish_page()}
						</Button>
					{/if}
				</div>

				<input type="hidden" name="id" value={page?.id} />

				<div class="space-y-2">
					<Label for="title">{m.page_title()}</Label>
					<Input
						{...updatePage.fields.title.as('text')}
						placeholder={m.page_title_placeholder()}
					/>
					{#each updatePage.fields.title.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label for="slug">{m.page_slug()}</Label>
					<Input
						{...updatePage.fields.slug.as('text')}
						placeholder={m.page_slug_placeholder()}
					/>
					<p class="text-muted-foreground text-xs">{m.page_slug_help()}</p>
					{#each updatePage.fields.slug.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="template">{m.page_template()}</Label>
						<Select.Root
							type="single"
							value={page?.template || 'default'}
							onValueChange={(value) => {
								if (value) {
									updatePage.fields.template.set(value);
								}
							}}
						>
							<Select.Trigger>
								{page?.template === 'landing'
									? m.page_template_landing()
									: page?.template === 'about'
										? m.page_template_about()
										: m.page_template_default()}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="default">{m.page_template_default()}</Select.Item>
								<Select.Item value="landing">{m.page_template_landing()}</Select.Item>
								<Select.Item value="about">{m.page_template_about()}</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="template" value={updatePage.fields.template.value()} />
					</div>

					<div class="space-y-2">
						<Label for="status">{m.page_status()}</Label>
						<Select.Root
							type="single"
							value={page?.status || 'draft'}
							onValueChange={(value) => {
								if (value && (value === 'draft' || value === 'published')) {
									updatePage.fields.status.set(value);
								}
							}}
						>
							<Select.Trigger>
								{page?.status === 'published' ? m.page_status_published() : m.page_status_draft()}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="draft">{m.page_status_draft()}</Select.Item>
								<Select.Item value="published">{m.page_status_published()}</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="status" value={updatePage.fields.status.value()} />
					</div>
				</div>
			</div>

			<!-- Content Editor -->
			<ContentBlockEditor bind:blocks={contentBlocks} />
			<input type="hidden" name="content" value={JSON.stringify(contentBlocks)} />

			<!-- SEO Settings -->
			<div class="space-y-4">
				<h3 class="font-medium">{m.page_seo_settings()}</h3>

				<div class="space-y-2">
					<Label for="seoTitle">{m.page_seo_title()}</Label>
					<Input
						{...updatePage.fields.seoTitle.as('text')}
						placeholder={m.page_title_placeholder()}
					/>
					<p class="text-muted-foreground text-xs">{m.page_seo_title_help()}</p>
					{#each updatePage.fields.seoTitle.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label for="seoDescription">{m.page_seo_description()}</Label>
					<Textarea
						{...updatePage.fields.seoDescription.as('text')}
						placeholder={m.page_seo_description_help()}
						rows={3}
					/>
					<p class="text-muted-foreground text-xs">{m.page_seo_description_help()}</p>
					{#each updatePage.fields.seoDescription.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!updatePage.pending}>
					{updatePage.pending ? m.common_saving() : m.common_save()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
