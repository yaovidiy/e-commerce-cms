<script lang="ts">
	import { createPage, getAllPages } from '$lib/remotes/page.remote';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as m from '$lib/paraglide/messages';
	import ContentBlockEditor from '../page-builder/content-block-editor.svelte';

	let { open = $bindable() } = $props();

	let contentBlocks = $state<any[]>([]);

	// Auto-refresh query and close dialog after successful submission
	$effect(() => {
		if (createPage.result) {
			open = false;
			getAllPages({ page: 1, pageSize: 10 }).refresh();
			createPage.fields.set({
				title: '',
				slug: '',
				template: 'default',
				status: 'draft',
				seoTitle: '',
				seoDescription: ''
			});
			contentBlocks = [];
		}
	});

	// Auto-generate slug from title
	let titleValue = $state('');

	$effect(() => {
		const slug = titleValue
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '');
		createPage.fields.slug.set(slug);
	});

	function handleTitleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		titleValue = target.value;
		createPage.fields.title.set(target.value);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.page_create_page()}</Dialog.Title>
			<Dialog.Description>{m.page_create_page_description()}</Dialog.Description>
		</Dialog.Header>

		<form {...createPage} class="space-y-6">
			<!-- Basic Information -->
			<div class="space-y-4">
				<h3 class="font-medium">{m.page_basic_information()}</h3>

				<div class="space-y-2">
					<Label for="title">{m.page_title()}</Label>
					<Input
						{...createPage.fields.title.as('text')}
						placeholder={m.page_title_placeholder()}
						oninput={handleTitleInput}
					/>
					{#each createPage.fields.title.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label for="slug">{m.page_slug()}</Label>
					<Input
						{...createPage.fields.slug.as('text')}
						placeholder={m.page_slug_placeholder()}
						readonly
					/>
					<p class="text-muted-foreground text-xs">{m.page_slug_help()}</p>
					{#each createPage.fields.slug.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="template">{m.page_template()}</Label>
						<Select.Root
							type="single"
							value="default"
							onValueChange={(value) => {
								if (value) {
									createPage.fields.template.set(value);
								}
							}}
						>
							<Select.Trigger>
								{m.page_template_default()}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="default">{m.page_template_default()}</Select.Item>
								<Select.Item value="landing">{m.page_template_landing()}</Select.Item>
								<Select.Item value="about">{m.page_template_about()}</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="template" value={createPage.fields.template.value()} />
						<p class="text-muted-foreground text-xs">{m.page_template_help()}</p>
					</div>

					<div class="space-y-2">
						<Label for="status">{m.page_status()}</Label>
						<Select.Root
							type="single"
							value="draft"
							onValueChange={(value) => {
								if (value && (value === 'draft' || value === 'published')) {
									createPage.fields.status.set(value);
								}
							}}
						>
							<Select.Trigger>
								{m.page_status_draft()}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="draft">{m.page_status_draft()}</Select.Item>
								<Select.Item value="published">{m.page_status_published()}</Select.Item>
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="status" value={createPage.fields.status.value()} />
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
						{...createPage.fields.seoTitle.as('text')}
						placeholder={m.page_title_placeholder()}
					/>
					<p class="text-muted-foreground text-xs">{m.page_seo_title_help()}</p>
					{#each createPage.fields.seoTitle.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>

				<div class="space-y-2">
					<Label for="seoDescription">{m.page_seo_description()}</Label>
					<Textarea
						{...createPage.fields.seoDescription.as('text')}
						placeholder={m.page_seo_description_help()}
						rows={3}
					/>
					<p class="text-muted-foreground text-xs">{m.page_seo_description_help()}</p>
					{#each createPage.fields.seoDescription.issues() as issue}
						<p class="text-destructive text-sm">{issue.message}</p>
					{/each}
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={!!createPage.pending}>
					{createPage.pending ? m.common_creating() : m.common_create()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
