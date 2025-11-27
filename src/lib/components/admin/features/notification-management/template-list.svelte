<!--
  Notification Template List Component
  Displays list of email and SMS templates with filtering and pagination
-->
<script lang="ts">
	import { getAllNotificationTemplates } from '$lib/remotes/notification.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Edit2, Trash2, Plus } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
		onNew: () => void;
	}

	let { onEdit, onDelete, onNew } = $props();

	let searchQuery = $state('');
	let selectedChannel = $state<'all' | 'email' | 'sms'>('all');
	let selectedEventType = $state<string>('all');
	let selectedStatus = $state<'all' | 'true' | 'false'>('all');
	let selectedLanguage = $state<string>('uk');
	let currentPage = $state(1);
	let pageSize = $state(20);

	const eventTypes = [
		{ value: 'all', label: 'All Events' },
		{ value: 'order_created', label: 'Order Created' },
		{ value: 'order_confirmed', label: 'Order Confirmed' },
		{ value: 'payment_pending_reminder', label: 'Payment Reminder' },
		{ value: 'order_shipped', label: 'Order Shipped' },
		{ value: 'order_delivered', label: 'Order Delivered' },
		{ value: 'post_delivery_review', label: 'Post-Delivery Review' }
	];

	const getChannelBadgeColor = (channel: 'email' | 'sms') => {
		return channel === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
	};

	const getStatusBadgeColor = (isActive: boolean) => {
		return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
	};
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold">Notification Templates</h2>
		<Button onclick={onNew} class="gap-2">
			<Plus size={16} />
			New Template
		</Button>
	</div>

	<!-- Filters -->
	<div class="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
		<div>
			<label for="search" class="mb-1 block text-sm font-medium">Search</label>
			<Input
				id="search"
				type="text"
				placeholder="Search templates..."
				bind:value={searchQuery}
			/>
		</div>

		<div>
			<label for="channel" class="mb-1 block text-sm font-medium">Channel</label>
			<select
				id="channel"
				bind:value={selectedChannel}
				class="w-full rounded border p-2"
			>
				<option value="all">All Channels</option>
				<option value="email">Email</option>
				<option value="sms">SMS</option>
			</select>
		</div>

		<div>
			<label for="eventType" class="mb-1 block text-sm font-medium">Event Type</label>
			<select
				id="eventType"
				bind:value={selectedEventType}
				class="w-full rounded border p-2"
			>
				{#each eventTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="status" class="mb-1 block text-sm font-medium">Status</label>
			<select
				id="status"
				bind:value={selectedStatus}
				class="w-full rounded border p-2"
			>
				<option value="all">All</option>
				<option value="true">Active</option>
				<option value="false">Inactive</option>
			</select>
		</div>

		<div>
			<label for="language" class="mb-1 block text-sm font-medium">Language</label>
			<select
				id="language"
				bind:value={selectedLanguage}
				class="w-full rounded border p-2"
			>
				<option value="uk">Ukrainian (uk)</option>
				<option value="en">English (en)</option>
			</select>
		</div>
	</div>

	<!-- Templates Table -->
	{#await getAllNotificationTemplates({
		search: searchQuery,
		channel: selectedChannel,
		eventType: selectedEventType as any,
		isActive: selectedStatus,
		language: selectedLanguage,
		page: currentPage,
		pageSize: pageSize
	})}
		<div class="py-8 text-center">Loading templates...</div>
	{:then result}
		{#if result.data.length > 0}
			<div class="overflow-x-auto rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row class="bg-gray-50">
							<Table.Head class="w-24">Code</Table.Head>
							<Table.Head class="w-32">Channel</Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head class="w-32">Event Type</Table.Head>
							<Table.Head class="w-20">Status</Table.Head>
							<Table.Head class="w-32 text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each result.data as template (template.id)}
							<Table.Row class="hover:bg-gray-50">
								<Table.Cell class="font-mono text-sm font-semibold">{template.code}</Table.Cell>
								<Table.Cell>
									<Badge class={`${getChannelBadgeColor(template.channel)} text-xs font-medium`}>
										{template.channel.toUpperCase()}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="max-w-xs truncate">
										{template.name}
										{#if template.description}
											<div class="truncate text-xs text-gray-600">{template.description}</div>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="text-sm capitalize">
									{template.eventType.replace(/_/g, ' ')}
								</Table.Cell>
								<Table.Cell>
									<Badge class={`${getStatusBadgeColor(template.isActive)} text-xs font-medium`}>
										{template.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</Table.Cell>
								<Table.Cell class="flex justify-end gap-2">
									<Button
										size="sm"
										variant="ghost"
										onclick={() => onEdit(template.id)}
										title="Edit template"
									>
										<Edit2 size={16} />
									</Button>
									<Button
										size="sm"
										variant="ghost"
										class="text-red-600 hover:text-red-700"
										onclick={() => onDelete(template.id)}
										title="Delete template"
									>
										<Trash2 size={16} />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Pagination -->
			{#if result.totalPages > 1}
				<div class="flex items-center justify-between border-t p-4">
					<div class="text-sm text-gray-600">
						Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, result.totalCount)} of {result.totalCount}
					</div>
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === 1}
							onclick={() => currentPage--}
						>
							Previous
						</Button>
						<div class="flex items-center gap-2">
							<span class="text-sm">Page {currentPage} of {result.totalPages}</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage === result.totalPages}
							onclick={() => currentPage++}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		{:else}
			<div class="rounded-lg border border-dashed p-8 text-center">
				<p class="text-gray-600">No templates found</p>
				<Button onclick={onNew} variant="outline" class="mt-4 gap-2">
					<Plus size={16} />
					Create First Template
				</Button>
			</div>
		{/if}
	{:catch error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
			Error loading templates: {error.message}
		</div>
	{/await}
</div>
