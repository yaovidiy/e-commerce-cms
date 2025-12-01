<!--
  Notification Template Editor Component
  Edit and create notification templates with dynamic variable support
-->
<script lang="ts">
	import { getNotificationTemplate, createNotificationTemplate, updateNotificationTemplate, getAvailableVariables } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { X, Copy, Eye } from '@lucide/svelte';
	import { watch } from 'runed';
	import * as m from '$lib/paraglide/messages';
	import type { NotificationTemplate } from '$lib/server/db/schema';

	interface Props {
		templateId?: string;
		onSave: (template: any) => void;
		onCancel: () => void;
	}

	let { templateId, onSave, onCancel } = $props();

	let showPreview = $state(false);
	let selectedCategory = $state('all');

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

	function addVariableToList(variableKey: string) {
		if (!selectedVariables.includes(variableKey)) {
			selectedVariables = [...selectedVariables, variableKey];
			formData.variables = JSON.stringify(selectedVariables);
		}
	}

	function removeVariable(variableKey: string) {
		selectedVariables = selectedVariables.filter(v => v !== variableKey);
		formData.variables = JSON.stringify(selectedVariables);
	}

	function renderPreview(content: string): string {
		// Simple preview: replace variables with placeholder text
		return content.replace(/\{\{([a-z_]+)\}\}/gi, '<span class="bg-yellow-200">[$1]</span>');
	}
</script>

<div class="space-y-6">
	{#await getAvailableVariables({})}
		<div>{m.common_loading()}</div>
	{:then variablesData}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Main Editor -->
			<div class="md:col-span-2 space-y-4">
			<!-- Basic Info -->
			<div class="space-y-4 rounded-lg border p-4">
				<h3 class="font-semibold">{m.notification_template_information()}</h3>					<div class="grid gap-3 md:grid-cols-2">
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
							<select
								id="channel"
								bind:value={formData.channel}
								class="w-full rounded border p-2"
							>
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
								<option value="payment_pending_reminder">{m.notification_event_payment_pending()}</option>
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
						<input
							id="isActive"
							type="checkbox"
							bind:checked={formData.isActive}
						/>
						<Label for="isActive" class="cursor-pointer">{m.notification_template_is_active()}</Label>
					</div>
				</div>

				<!-- Email Subject (conditionally shown) -->
				{#if formData.channel === 'email'}
					<div class="space-y-2 rounded-lg border p-4">
						<Label for="subject">{m.notification_template_subject()}</Label>
						<Input
							id="subject"
							bind:value={formData.subject}
							placeholder={m.notification_template_subject_placeholder({ "{order_number": "{order_number" })}
						/>
						<p class="text-xs text-gray-600">{m.notification_template_content_placeholder({ "{variable_name": "{order_number" })}</p>
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
						placeholder={m.notification_template_content_placeholder({ "{variable_name": "{variable_name" })}
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
			</div>

			<!-- Variables Panel -->
			<div class="space-y-4 rounded-lg border p-4">
				<h3 class="font-semibold">{m.notification_dynamic_variables()}</h3>

				<!-- Category Filter -->
				<div>
					<select
						bind:value={selectedCategory}
						class="w-full rounded border p-2 text-sm"
					>
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
									<p class="text-xs font-semibold uppercase text-gray-600">{category}</p>
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
										<p class="mt-1 text-gray-500">{m.notification_example()} {variable.exampleValue}</p>
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
		<div class="flex gap-3 border-t pt-4 sticky -bottom-5 bg-white py-4">
			<Button onclick={onCancel} variant="outline">{m.common_cancel()}</Button>
			<Button onclick={() => onSave(formData)} class="flex-1">
				{templateId ? m.notification_update_template() : m.notification_create_template()}
			</Button>
		</div>
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
