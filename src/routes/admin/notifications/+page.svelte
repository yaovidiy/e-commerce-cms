<!--
  Admin Notification Templates Page
  Main page for managing email and SMS notification templates
-->
<script lang="ts">
	import { TemplateList, TemplateEditor } from '$lib/components/admin/features/notification-management';
	import { deleteNotificationTemplate, initializeDefaultVariables, createNotificationTemplate, updateNotificationTemplate, seedDefaultTemplates } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { AlertCircle, Check, Zap } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';

	let editingTemplateId: string | undefined = $state();
	let showEditor = $state(false);
	let showDeleteDialog = $state(false);
	let deleteTemplateId: string | undefined = $state();

	async function handleSaveTemplate(formData: any) {
		try {
			if (editingTemplateId) {
				// Update
				const result = await updateNotificationTemplate({
					...formData,
					id: editingTemplateId
				});
				if (result.success) {
					toast.success(`Template "${result?.template?.name}" updated successfully`);
					handleCloseEditor();
				} else {
					toast.error(result.error || 'Failed to update template');
				}
			} else {
				// Create
				const result = await createNotificationTemplate(formData);
				if (result.success) {
					toast.success(`Template "${result?.template?.name}" created successfully`);
					handleCloseEditor();
				} else {
					toast.error(result.error || 'Failed to create template');
				}
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	function handleShowDeleteDialog(id: string) {
		deleteTemplateId = id;
		showDeleteDialog = true;
	}

	async function handleDeleteTemplate() {
		if (!deleteTemplateId) return;

		try {
			const result = await deleteNotificationTemplate({ id: deleteTemplateId });
			if (result.success) {
				toast.success(result?.message ?? 'Notification template deleted successfully');
			} else {
				toast.error(result.error || 'Failed to delete template');
			}
			showDeleteDialog = false;
			deleteTemplateId = undefined;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	function handleEditTemplate(id: string) {
		editingTemplateId = id;
		showEditor = true;
	}

	function handleNewTemplate() {
		editingTemplateId = undefined;
		showEditor = true;
	}

	function handleCloseEditor() {
		showEditor = false;
		editingTemplateId = undefined;
	}

	async function handleInitializeVariables() {
		try {
			const result = await initializeDefaultVariables({});
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.info(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	async function handleSeedTemplates() {
		try {
			const result = await seedDefaultTemplates({});
			if (result.success) {
				toast.success(result.message);
			} else {
				toast.info(result.message);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'An error occurred');
		}
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold">{m.notification_templates()}</h1>
		<p class="mt-2 text-gray-600">
			{m.notification_manage_templates()}
		</p>
	</div>

	<!-- Info Box -->
	<div class="flex gap-3 rounded-lg bg-blue-50 p-4 text-blue-800">
		<AlertCircle class="mt-0.5 shrink-0" size={20} />
		<div class="space-y-1">
			<p class="font-semibold">{m.notification_how_it_works()}</p>
			<ul class="list-inside space-y-1 text-sm">
				<li>• {m.notification_how_it_works_1({ "{variable_name": "{variable_name" })}</li>
				<li>• {m.notification_how_it_works_2()}</li>
				<li>• {m.notification_how_it_works_3()}</li>
				<li>• {m.notification_how_it_works_4()}</li>
			</ul>
		</div>
	</div>

	<!-- Template Editor Dialog -->
	{#if showEditor}
		<Dialog.Root open={showEditor} onOpenChange={(open) => {
			if (!open) handleCloseEditor();
		}}>
			<Dialog.Content class="max-h-screen max-w-[90vw]! w-full overflow-y-auto">
				<Dialog.Header>
					<Dialog.Title>
						{editingTemplateId ? m.notification_edit_template() : m.notification_create_template()}
					</Dialog.Title>
				</Dialog.Header>
				<TemplateEditor
					templateId={editingTemplateId}
					onSave={handleSaveTemplate}
					onCancel={handleCloseEditor}
				/>
			</Dialog.Content>
		</Dialog.Root>
	{/if}

	<!-- Delete Confirmation Dialog -->
	<Dialog.Root open={showDeleteDialog} onOpenChange={(open) => {
		if (!open) {
			showDeleteDialog = false;
			deleteTemplateId = undefined;
		}
	}}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.notification_delete_template()}</Dialog.Title>
			</Dialog.Header>
			<p class="text-gray-600">
				{m.common_delete_confirmation_message()}
			</p>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						showDeleteDialog = false;
						deleteTemplateId = undefined;
					}}
				>
					{m.common_cancel()}
				</Button>
				<Button
					variant="destructive"
					onclick={handleDeleteTemplate}
				>
					{m.notification_delete_template()}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Template List -->
	<TemplateList
		onEdit={handleEditTemplate}
		onDelete={(id: string) => handleShowDeleteDialog(id)}
		onNew={handleNewTemplate}
	/>

	<!-- Initialize/Seed Section -->
	<div class="space-y-4 rounded-lg border bg-gray-50 p-4">
		<div>
			<h3 class="font-semibold text-gray-900">🌿 Setup Notification Templates</h3>
			<p class="mt-1 text-sm text-gray-600">
				Initialize default email and SMS templates for The Spice Room order communication flow
			</p>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row">
			<Button onclick={handleSeedTemplates} variant="default" class="gap-2">
				<Zap size={16} />
				Seed Default Templates
			</Button>
			<Button onclick={handleInitializeVariables} variant="outline" class="gap-2">
				<Check size={16} />
				Initialize Variables
			</Button>
		</div>

		<p class="text-xs text-gray-500">
			This will create 8 default templates (E1, E1a, E1b, S1, E2, S2, E3, S3, E4, S4) based on the order communication workflow.
		</p>
	</div>
</div>
