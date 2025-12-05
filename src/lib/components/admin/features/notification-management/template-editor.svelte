<!--
  Notification Template Editor Component
  Edit and create notification templates with dynamic variable support
-->
<script lang="ts">
	import {
		getNotificationTemplate,
		createNotificationTemplate,
		updateNotificationTemplate,
		getAvailableVariables,
		getOrderItemTemplate,
		createOrderItemTemplate,
		updateOrderItemTemplate,
		deleteOrderItemTemplate
	} from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { X, Copy, Eye, Trash2 } from '@lucide/svelte';
	import { watch } from 'runed';
	import * as m from '$lib/paraglide/messages';
	import type { NotificationTemplate } from '$lib/server/db/schema';
	import { toast } from 'svelte-sonner';

	interface Props {
		templateId?: string;
		onSave: (template: any) => void;
		onCancel: () => void;
	}

	let { templateId, onSave, onCancel } = $props();

	let showPreview = $state(false);
	let selectedCategory = $state('all');
	let showItemTemplateEditor = $state(false);

	// Form state
	let form = createNotificationTemplate;
	let formData = $state({
		code: '',
		channel: 'email' as 'email' | 'sms',
		eventType: 'order_created' as any,
		name: '',
		subject: '',
		content: '',
		description: '',
		isActive: true,
		variables: '[]',
		language: 'en'
	});

	// Order item template state
	let itemTemplateData = $state({
		id: '',
		itemTemplate: '{{quantity}}x {{productName}} - {{price}} грн.',
		itemSeparator: '\n',
		wrapperTemplate: '',
		useHtmlFormatting: false
	});

	let selectedVariables = $state<string[]>([]);

	// Load template if editing
	watch(
		() => templateId,
		(id) => {
			if (id) {
				getNotificationTemplate({ id }).then((template) => {
					if (template) {
						formData = {
							code: template.code,
							channel: template.channel,
							eventType: template.eventType,
							name: template.name,
							subject: template.subject || '',
							content: template.content,
							description: template.description || '',
							isActive: template.isActive,
							variables: JSON.stringify(template.variables || []),
							language: template.language
						};
						selectedVariables = template.variables || [];

						// Load order item template if exists
						getOrderItemTemplate({ notificationTemplateId: id }).then((itemTemplate) => {
							if (itemTemplate) {
								itemTemplateData = {
									id: itemTemplate.id,
									itemTemplate: itemTemplate.itemTemplate,
									itemSeparator: itemTemplate.itemSeparator || '\n',
									wrapperTemplate: itemTemplate.wrapperTemplate || '',
									useHtmlFormatting: itemTemplate.useHtmlFormatting
								};
							}
						});
					}
				});
			}
		}
	);

	function insertVariable(variableKey: string) {
		const textarea = document.querySelector('textarea[data-content]') as HTMLTextAreaElement;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const before = formData.content.substring(0, start);
			const after = formData.content.substring(end);
			formData.content = `${before}{{${variableKey}}}${after}`;

			// Move cursor after inserted variable
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + variableKey.length + 4, start + variableKey.length + 4);
			}, 0);
		}
	}

	function insertItemVariable(variableKey: string) {
		const textarea = document.querySelector('textarea[data-item-template]') as HTMLTextAreaElement;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const before = itemTemplateData.itemTemplate.substring(0, start);
			const after = itemTemplateData.itemTemplate.substring(end);
			itemTemplateData.itemTemplate = `${before}{{${variableKey}}}${after}`;

			// Move cursor after inserted variable
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + variableKey.length + 4, start + variableKey.length + 4);
			}, 0);
		}
	}

	function addVariableToList(variableKey: string) {
		if (!selectedVariables.includes(variableKey)) {
			selectedVariables = [...selectedVariables, variableKey];
			formData.variables = JSON.stringify(selectedVariables);
		}
	}

	function removeVariable(variableKey: string) {
		selectedVariables = selectedVariables.filter((v) => v !== variableKey);
		formData.variables = JSON.stringify(selectedVariables);
	}

	async function handleSaveItemTemplate() {
		try {
			if (!templateId) {
				toast.error('Please save the notification template first');
				return;
			}

			let result;
			if (itemTemplateData.id) {
				result = await updateOrderItemTemplate({
					id: itemTemplateData.id,
					itemTemplate: itemTemplateData.itemTemplate,
					itemSeparator: itemTemplateData.itemSeparator,
					wrapperTemplate: itemTemplateData.wrapperTemplate || undefined,
					useHtmlFormatting: itemTemplateData.useHtmlFormatting
				});
			} else {
				result = await createOrderItemTemplate({
					notificationTemplateId: templateId,
					itemTemplate: itemTemplateData.itemTemplate,
					itemSeparator: itemTemplateData.itemSeparator,
					wrapperTemplate: itemTemplateData.wrapperTemplate || undefined,
					useHtmlFormatting: itemTemplateData.useHtmlFormatting
				});
			}

			if (result.success) {
				itemTemplateData.id = result.itemTemplate.id;
				toast.success('Order item template saved successfully');
				showItemTemplateEditor = false;
			} else {
				toast.error(result.error || 'Failed to save item template');
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	async function handleDeleteItemTemplate() {
		if (!itemTemplateData.id) return;

		try {
			const result = await deleteOrderItemTemplate({ id: itemTemplateData.id });
			if (result.success) {
				itemTemplateData = {
					id: '',
					itemTemplate: '{{quantity}}x {{productName}} - {{price}} грн.',
					itemSeparator: '\n',
					wrapperTemplate: '',
					useHtmlFormatting: false
				};
				toast.success('Order item template deleted successfully');
			} else {
				toast.error(result.error || 'Failed to delete item template');
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	function renderPreview(content: string): string {
		// Simple preview: replace variables with placeholder text
		return content.replace(/\{\{([a-z_]+)\}\}/gi, '<span class="bg-yellow-200">[$1]</span>');
	}
</script>

<div class="space-y-6">
	{#await getAvailableVariables()}
		<div>{m.common_loading()}</div>
	{:then variablesData}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Main Editor -->
			<div class="space-y-4 md:col-span-2">
				<!-- Basic Info -->
				<div class="space-y-4 rounded-lg border p-4">
					<h3 class="font-semibold">{m.notification_template_information()}</h3>
					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<Label for="code">{m.notification_template_code()}</Label>
							<Input
								id="code"
								bind:value={formData.code}
								placeholder={m.notification_template_code_placeholder()}
								readonly={!!templateId}
								class={templateId ? 'bg-gray-100' : ''}
							/>
						</div>

						<div>
							<Label for="name">{m.notification_template_name()}</Label>
							<Input
								id="name"
								bind:value={formData.name}
								placeholder={m.notification_template_name_placeholder()}
							/>
						</div>
					</div>

					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<Label for="channel">{m.notification_template_channel()}</Label>
							<select id="channel" bind:value={formData.channel} class="w-full rounded border p-2">
								<option value="email">{m.notification_channel_email()}</option>
								<option value="sms">{m.notification_channel_sms()}</option>
							</select>
						</div>

						<div>
							<Label for="eventType">{m.notification_template_event_type()}</Label>
							<select
								id="eventType"
								bind:value={formData.eventType}
								class="w-full rounded border p-2"
							>
								<option value="order_created">{m.notification_event_order_created()}</option>
								<option value="order_confirmed">{m.notification_event_order_confirmed()}</option>
								<option value="payment_pending_reminder"
									>{m.notification_event_payment_pending()}</option
								>
								<option value="order_shipped">{m.notification_event_order_shipped()}</option>
								<option value="order_delivered">{m.notification_event_order_delivered()}</option>
								<option value="post_delivery_review">{m.notification_event_post_delivery()}</option>
							</select>
						</div>
					</div>

					<div>
						<Label for="description">{m.notification_template_description()}</Label>
						<Input
							id="description"
							bind:value={formData.description}
							placeholder={m.common_description()}
						/>
					</div>

					<div class="flex items-center gap-2">
						<input id="isActive" type="checkbox" bind:checked={formData.isActive} />
						<Label for="isActive" class="cursor-pointer"
							>{m.notification_template_is_active()}</Label
						>
					</div>
				</div>

				<!-- Email Subject (conditionally shown) -->
				{#if formData.channel === 'email'}
					<div class="space-y-2 rounded-lg border p-4">
						<Label for="subject">{m.notification_template_subject()}</Label>
						<Input
							id="subject"
							bind:value={formData.subject}
							placeholder={m.notification_template_subject_placeholder({
								'{order_number': '{order_number'
							})}
						/>
						<p class="text-xs text-gray-600">
							{m.notification_template_content_placeholder({ '{variable_name': '{order_number' })}
						</p>
					</div>
				{/if}

				<!-- Template Content -->
				<div class="space-y-2 rounded-lg border p-4">
					<div class="flex items-center justify-between">
						<Label for="content">{m.notification_template_content_label()}</Label>
						<Button
							size="sm"
							variant="outline"
							onclick={() => (showPreview = !showPreview)}
							class="gap-2"
						>
							<Eye size={14} />
							{showPreview ? m.notification_hide_preview() : m.notification_show_preview()}
						</Button>
					</div>

					<textarea
						id="content"
						data-content
						bind:value={formData.content}
						class="min-h-64 w-full rounded border p-3 font-mono text-sm"
						placeholder={m.notification_template_content_placeholder({
							'{variable_name': '{variable_name'
						})}
					></textarea>

					{#if showPreview}
						<div class="mt-4 rounded-lg bg-gray-100 p-4">
							<p class="mb-2 text-xs font-semibold text-gray-600">{m.notification_preview()}</p>
							<div class="prose max-w-none rounded bg-white p-4 text-sm">
								{@html renderPreview(formData.content)}
							</div>
						</div>
					{/if}
				</div>

				<!-- Order Items Template (email only) -->
				{#if formData.channel === 'email' && templateId}
					<div class="space-y-2 rounded-lg border p-4">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-semibold">{m.notification_template_order_items_header()}</h4>
							<Button
								size="sm"
								variant="outline"
								onclick={() => (showItemTemplateEditor = !showItemTemplateEditor)}
							>
								{showItemTemplateEditor ? m.common_close() : m.common_edit()}
								{m.notification_template_order_items_label()}
							</Button>
						</div>
						{#if itemTemplateData.id}
							<p class="text-xs text-gray-500">
								{m.notification_template_configured()} • {m.notification_template_format_label()}: {itemTemplateData.itemTemplate.substring(
									0,
									50
								)}...
							</p>
						{:else}
							<p class="text-xs text-gray-500">{m.notification_template_no_custom()}</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Variables Panel -->
			<div class="space-y-4 rounded-lg border p-4">
				<h3 class="font-semibold">{m.notification_dynamic_variables()}</h3>

				<!-- Category Filter -->
				<div>
					<select bind:value={selectedCategory} class="w-full rounded border p-2 text-sm">
						<option value="all">{m.common_all()}</option>
						{#each Object.keys(variablesData) as category}
							<option value={category}>{category.replace(/_/g, ' ').toUpperCase()}</option>
						{/each}
					</select>
				</div>

				<!-- Variables List -->
				<div class="max-h-96 space-y-2 overflow-y-auto">
					{#each Object.entries(variablesData) as [category, vars]}
						{#if selectedCategory === 'all' || selectedCategory === category}
							<div class="space-y-2">
								{#if selectedCategory === 'all'}
									<p class="text-xs font-semibold text-gray-600 uppercase">{category}</p>
								{/if}
								{#each vars as variable}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="cursor-pointer rounded border p-2 text-xs hover:bg-blue-50"
										ondblclick={() => insertVariable(variable.key)}
										title={m.notification_double_click_insert()}
									>
										<div class="mb-1 flex items-start gap-2">
											<code class="flex-1 rounded bg-gray-100 px-1 font-mono">{variable.key}</code>
											<Button
												size="sm"
												variant="ghost"
												class="h-5 w-5 p-0"
												onclick={() => insertVariable(variable.key)}
												title={m.notification_click_to_insert()}
											>
												<Copy size={12} />
											</Button>
										</div>
										<p class="text-gray-600">{variable.label}</p>
										{#if variable.exampleValue}
											<p class="mt-1 text-gray-500">
												{m.notification_example()}
												{variable.exampleValue}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>

				<!-- Selected Variables -->
				{#if selectedVariables.length > 0}
					<div class="space-y-2 border-t pt-4">
						<p class="text-xs font-semibold text-gray-600">{m.notification_used_variables()}</p>
						<div class="flex flex-wrap gap-2">
							{#each selectedVariables as variable}
								<Badge class="flex items-center gap-1 bg-blue-100 text-blue-800">
									{variable}
									<button
										class="ml-1 text-blue-600 hover:text-blue-800"
										onclick={() => removeVariable(variable)}
									>
										<X size={12} />
									</button>
								</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="sticky -bottom-5 flex gap-3 border-t bg-white py-4 pt-4">
			<Button onclick={onCancel} variant="outline">{m.common_cancel()}</Button>
			<Button onclick={() => onSave(formData)} class="flex-1">
				{templateId ? m.notification_update_template() : m.notification_create_template()}
			</Button>
		</div>

		<!-- Order Items Template Editor Dialog -->
		{#if showItemTemplateEditor && formData.channel === 'email' && templateId}
			<Dialog.Root
				open={showItemTemplateEditor}
				onOpenChange={(open) => {
					if (!open) showItemTemplateEditor = false;
				}}
			>
				<Dialog.Content class="max-h-screen max-w-2xl overflow-y-auto">
					<Dialog.Header>
						<Dialog.Title>{m.notification_template_order_items_title()}</Dialog.Title>
					</Dialog.Header>
					<div class="space-y-4">
						<!-- Item Template -->
						<div class="space-y-2">
							<Label for="item-template">{m.notification_template_item_format_label()}</Label>
							<p class="text-xs text-gray-500">{m.notification_template_item_format_help({
								'quantity': '{quantity}',
								'productName': '{productName}',
								'productImage': '{productImage}',
								'price': '{price}',
								'subtotal': '{subtotal}'
							})}</p>
							<textarea
								id="item-template"
								data-item-template
								bind:value={itemTemplateData.itemTemplate}
								class="min-h-24 w-full rounded border p-3 font-mono text-sm"
								placeholder="1x Example Product - 100.00 грн."
							></textarea>
							<div class="flex flex-wrap gap-2">
								<Button size="sm" variant="outline" onclick={() => insertItemVariable('quantity')}
									>+ {'{quantity}'}</Button
								>
								<Button
									size="sm"
									variant="outline"
									onclick={() => insertItemVariable('productImage')}>+ {'{productImage}'}</Button
								>
								<Button
									size="sm"
									variant="outline"
									onclick={() => insertItemVariable('productName')}>+ {'{productName}'}</Button
								>
								<Button size="sm" variant="outline" onclick={() => insertItemVariable('price')}
									>+ {'{price}'}</Button
								>
								<Button size="sm" variant="outline" onclick={() => insertItemVariable('subtotal')}
									>+ {'{subtotal}'}</Button
								>
							</div>
						</div>

						<!-- Item Separator -->
						<div class="space-y-2">
							<Label for="item-separator">{m.notification_template_item_separator_label()}</Label>
							<p class="text-xs text-gray-500">{m.notification_template_item_separator_help()}</p>
							<select
								id="item-separator"
								bind:value={itemTemplateData.itemSeparator}
								class="w-full rounded border p-2"
							>
								<option value="\n">{m.notification_separator_newline()}</option>
								<option value="<br/>">{m.notification_separator_html_break()}</option>
								<option value=" | ">{m.notification_separator_pipe()}</option>
								<option value=", ">{m.notification_separator_comma()}</option>
								<option value="\n---\n">{m.notification_separator_dashed()}</option>
							</select>
						</div>

						<!-- Wrapper Template -->
						<div class="space-y-2">
							<Label for="wrapper-template">{m.notification_template_wrapper_label()}</Label>
							<p class="text-xs text-gray-500">
								{m.notification_template_wrapper_help({ items: '{items}' })}
							</p>
							<textarea
								id="wrapper-template"
								bind:value={itemTemplateData.wrapperTemplate}
								class="min-h-20 w-full rounded border p-3 font-mono text-sm"
								placeholder={'<ul>{{items}}</ul>'}
							></textarea>
						</div>

						<!-- HTML Formatting -->
						<div class="flex items-center gap-2">
							<input
								id="use-html"
								type="checkbox"
								bind:checked={itemTemplateData.useHtmlFormatting}
							/>
							<Label for="use-html" class="cursor-pointer"
								>{m.notification_template_use_html()}</Label
							>
						</div>

						<!-- Preview -->
						<div class="space-y-2 rounded-lg bg-gray-50 p-4">
							<p class="text-xs font-semibold text-gray-600">{m.notification_preview()}:</p>
							<div class="space-y-1 rounded bg-white p-3 font-mono text-sm text-gray-700">
								{#if itemTemplateData.itemTemplate}
									{@html (() => {
										const sampleItems = [
											{ quantity: 3, productName: 'Cinnamon', productImage: 'https://example.com/cinnamon.jpg', productSlug: 'cinnamon', price: '50.00', subtotal: '150.00' },
											{ quantity: 2, productName: 'Cardamom', productImage: 'https://example.com/cardamom.jpg', productSlug: 'cardamom', price: '100.00', subtotal: '200.00' },
											{ quantity: 1, productName: 'Saffron', productImage: 'https://example.com/saffron.jpg', productSlug: 'saffron', price: '500.00', subtotal: '500.00' }
										];
										
										const rendered = sampleItems.map(item => {
											let template = itemTemplateData.itemTemplate;
											const placeholderRegex = /\{\{([a-z_]+)\}\}/gi;
											template = template.replace(placeholderRegex, (match, variableName) => {
												return (item as Record<string, any>)[variableName] || match;
											});
											return template;
										});
										
										let preview = rendered.join(itemTemplateData.itemSeparator === '\n' ? '<br/>' : itemTemplateData.itemSeparator);
										
										if (itemTemplateData.wrapperTemplate) {
											preview = itemTemplateData.wrapperTemplate.replace('{{items}}', preview);
										}
										
										return preview;
									})()}
								{:else}
									<div>3x Cinnamon - 150.00 грн.</div>
									<div>2x Cardamom - 200.00 грн.</div>
									<div>1x Saffron - 500.00 грн.</div>
								{/if}
							</div>
						</div>
					</div>

					<Dialog.Footer>
						<Button variant="outline" onclick={() => (showItemTemplateEditor = false)}>
							{m.common_cancel()}
						</Button>
						{#if itemTemplateData.id}
							<Button variant="destructive" onclick={handleDeleteItemTemplate} class="gap-2">
								<Trash2 size={16} />
								{m.notification_delete_template()}
							</Button>
						{/if}
						<Button onclick={handleSaveItemTemplate}>
							{m.common_save()}
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	{:catch error}
		<div class="text-red-600">{m.common_error()}: {error.message}</div>
	{/await}
</div>

<style>
	:global(.prose) {
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
