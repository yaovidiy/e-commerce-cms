<script lang="ts">
	import { getAllReceipts, getCurrentShift, openShift, closeShift } from '$lib/remotes/checkbox.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Receipt, ChevronLeft, ChevronRight, Power, PowerOff, ExternalLink } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let searchQuery = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	const pageSize = 20;

	// Format date helper
	function formatDate(date: Date | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Format price helper (cents to UAH)
	function formatPrice(cents: number): string {
		return `${(cents / 100).toFixed(2)} UAH`;
	}

	// Status badge colors
	function getStatusColor(status: string) {
		switch (status) {
			case 'created':
				return 'default';
			case 'sent':
				return 'success';
			case 'error':
				return 'destructive';
			case 'cancelled':
				return 'secondary';
			default:
				return 'default';
		}
	}

	// Shift management
	async function handleOpenShift() {
		try {
			await openShift({});
			getCurrentShift().refresh();
		} catch (err) {
			alert('Failed to open shift: ' + (err instanceof Error ? err.message : 'Unknown error'));
		}
	}

	async function handleCloseShift() {
		if (!confirm('Are you sure you want to close the current shift?')) return;
		
		try {
			await closeShift({});
			getCurrentShift().refresh();
		} catch (err) {
			alert('Failed to close shift: ' + (err instanceof Error ? err.message : 'Unknown error'));
		}
	}

	function nextPage() {
		currentPage++;
	}

	function previousPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}
</script>

<div class="container mx-auto py-6">
	<!-- Header -->
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-3xl font-bold">Checkbox РРО</h1>
			<p class="text-muted-foreground">Fiscal Receipt Management</p>
		</div>
	</div>

	<!-- Current Shift Status -->
	{#await getCurrentShift()}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>Current Shift</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground">Loading shift information...</p>
			</Card.Content>
		</Card.Root>
	{:then shiftData}
		<Card.Root class="mb-6">
			<Card.Header>
				<div class="flex justify-between items-center">
					<Card.Title>Current Shift</Card.Title>
					{#if shiftData?.shift}
						<Badge variant="success">Shift Open</Badge>
					{:else}
						<Badge variant="secondary">No Active Shift</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if shiftData?.shift}
					<div class="grid md:grid-cols-3 gap-4 mb-4">
						<div>
							<p class="text-sm text-muted-foreground">Shift ID</p>
							<p class="font-mono">{shiftData.shift.id}</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Opened At</p>
							<p>{formatDate(new Date(shiftData.shift.opened_at))}</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Cash Register</p>
							<p class="font-mono text-sm">{shiftData.shift.cash_register_id}</p>
						</div>
					</div>
					<Button onclick={handleCloseShift} variant="destructive">
						<PowerOff class="h-4 w-4 mr-2" />
						Close Shift
					</Button>
				{:else}
					<p class="text-muted-foreground mb-4">
						No active shift. You must open a shift before creating receipts.
					</p>
					<Button onclick={handleOpenShift}>
						<Power class="h-4 w-4 mr-2" />
						Open Shift
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	{:catch error}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>Current Shift</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-destructive">Error: {error.message}</p>
			</Card.Content>
		</Card.Root>
	{/await}

	<!-- Filters -->
	<Card.Root class="mb-6">
		<Card.Content class="pt-6">
			<div class="flex gap-4">
				<div class="flex-1">
					<Input
						type="text"
						placeholder="Search by order number..."
						bind:value={searchQuery}
					/>
				</div>
				<select
					bind:value={statusFilter}
					class="px-4 py-2 border rounded-md bg-white"
				>
					<option value="all">All Statuses</option>
					<option value="created">Created</option>
					<option value="sent">Sent</option>
					<option value="error">Error</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Receipts Table -->
	{#await getAllReceipts({ orderNumber: searchQuery, status: statusFilter, page: currentPage, pageSize })}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-center py-12">
					<p class="text-muted-foreground">Loading receipts...</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:then data}
		<Card.Root>
			<Card.Header>
				<Card.Title>Fiscal Receipts ({data.total})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.receipts.length === 0}
					<div class="text-center py-12">
						<Receipt class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p class="text-muted-foreground">No receipts found</p>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Order</Table.Head>
								<Table.Head>Fiscal Code</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head>Amount</Table.Head>
								<Table.Head>Created</Table.Head>
								<Table.Head>Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.receipts as receipt}
								<Table.Row>
									<Table.Cell>
										{#if receipt.order}
											<div>
												<p class="font-mono text-sm">{receipt.order.orderNumber}</p>
												<p class="text-xs text-muted-foreground">{receipt.order.customerEmail}</p>
											</div>
										{:else}
											<span class="text-muted-foreground">N/A</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if receipt.fiscalCode}
											<span class="font-mono text-sm">{receipt.fiscalCode}</span>
										{:else}
											<span class="text-muted-foreground">Pending</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<Badge variant={getStatusColor(receipt.status)}>
											{receipt.status}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										{#if receipt.order}
											{formatPrice(receipt.order.total)}
										{:else}
											<span class="text-muted-foreground">N/A</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<span class="text-sm">{formatDate(receipt.createdAt)}</span>
									</Table.Cell>
									<Table.Cell>
										<div class="flex gap-2">
											{#if receipt.receiptUrl}
												<Button
													size="sm"
													variant="outline"
													onclick={() => receipt.receiptUrl && window.open(receipt.receiptUrl, '_blank')}
												>
													<ExternalLink class="h-4 w-4" />
												</Button>
											{/if}
											{#if receipt.status === 'error'}
												<Button
													size="sm"
													variant="outline"
													onclick={() => alert(receipt.errorMessage || 'Unknown error')}
												>
													View Error
												</Button>
											{/if}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>

					<!-- Pagination -->
					<div class="flex justify-between items-center mt-4">
						<p class="text-sm text-muted-foreground">
							Page {data.page} of {data.totalPages} ({data.total} total)
						</p>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={previousPage}
								disabled={currentPage === 1}
							>
								<ChevronLeft class="h-4 w-4" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={nextPage}
								disabled={currentPage >= data.totalPages}
							>
								Next
								<ChevronRight class="h-4 w-4" />
							</Button>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:catch error}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-center py-12">
					<p class="text-destructive">Error loading receipts: {error.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/await}
</div>
