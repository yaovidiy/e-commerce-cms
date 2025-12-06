<script lang="ts">
	import { getAllReceipts, getCurrentShift, openShift, closeShift } from '$lib/remotes/checkbox.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Receipt, ChevronLeft, ChevronRight, Power, PowerOff, ExternalLink } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let searchQuery = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	let closeShiftDialogOpen = $state(false);
	let isClosingShift = $state(false);
	let errorDialogOpen = $state(false);
	let errorMessage = $state('');
	let receiptErrorMessage = $state('');
	let receiptErrorDialogOpen = $state(false);
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
			errorMessage = m.receipts_failed_open_shift() + (err instanceof Error ? err.message : 'Unknown error');
			errorDialogOpen = true;
		}
	}

	async function handleCloseShiftConfirm() {
		isClosingShift = true;
		try {
			await closeShift({});
			getCurrentShift().refresh();
			closeShiftDialogOpen = false;
		} catch (err) {
			errorMessage = m.receipts_failed_close_shift() + (err instanceof Error ? err.message : 'Unknown error');
			errorDialogOpen = true;
		} finally {
			isClosingShift = false;
		}
	}

	function openCloseShiftDialog() {
		closeShiftDialogOpen = true;
	}

	function showReceiptError(message: string) {
		receiptErrorMessage = message || 'Unknown error';
		receiptErrorDialogOpen = true;
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
			<h1 class="text-3xl font-bold">{m.receipts_title()}</h1>
			<p class="text-muted-foreground">{m.receipts_subtitle()}</p>
		</div>
	</div>

	<!-- Current Shift Status -->
	{#await getCurrentShift()}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>{m.receipts_shift_title()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground">{m.receipts_loading()}</p>
			</Card.Content>
		</Card.Root>
	{:then shiftData}
		<Card.Root class="mb-6">
			<Card.Header>
				<div class="flex justify-between items-center">
					<Card.Title>{m.receipts_shift_title()}</Card.Title>
					{#if shiftData?.shift}
						<Badge variant="success">{m.receipts_shift_open()}</Badge>
					{:else}
						<Badge variant="secondary">{m.receipts_shift_closed()}</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				{#if shiftData?.shift}
					<div class="grid md:grid-cols-3 gap-4 mb-4">
						<div>
							<p class="text-sm text-muted-foreground">{m.receipts_shift_id()}</p>
							<p class="font-mono">{shiftData.shift.id}</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">{m.receipts_shift_opened_at()}</p>
							<p>{formatDate(new Date(shiftData.shift.opened_at))}</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">{m.receipts_cash_register()}</p>
							<p class="font-mono text-sm">{shiftData.shift.cash_register.id}</p>
						</div>
					</div>
					<Button onclick={openCloseShiftDialog} variant="destructive">
						<PowerOff class="h-4 w-4 mr-2" />
						{m.receipts_close_shift()}
					</Button>
				{:else}
					<p class="text-muted-foreground mb-4">
						{m.receipts_no_shift_message()}
					</p>
					<Button onclick={handleOpenShift}>
						<Power class="h-4 w-4 mr-2" />
						{m.receipts_open_shift()}
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	{:catch error}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title>{m.receipts_shift_title()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-destructive">{m.receipts_error_loading()}{error.message}</p>
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
						placeholder={m.receipts_search_placeholder()}
						bind:value={searchQuery}
					/>
				</div>
				<select
					bind:value={statusFilter}
					class="px-4 py-2 border rounded-md bg-white"
				>
					<option value="all">{m.receipts_filter_all()}</option>
					<option value="created">{m.receipts_filter_created()}</option>
					<option value="sent">{m.receipts_filter_sent()}</option>
					<option value="error">{m.receipts_filter_error()}</option>
					<option value="cancelled">{m.receipts_filter_cancelled()}</option>
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Receipts Table -->
	{#await getAllReceipts({ orderNumber: searchQuery, status: statusFilter, page: currentPage, pageSize })}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-center py-12">
					<p class="text-muted-foreground">{m.receipts_loading()}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:then data}
		<Card.Root>
			<Card.Header>
				<Card.Title>{m.receipts_table_title()} ({data.total})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if data.receipts.length === 0}
					<div class="text-center py-12">
						<Receipt class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p class="text-muted-foreground">{m.receipts_no_receipts()}</p>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{m.receipts_table_order()}</Table.Head>
								<Table.Head>{m.receipts_table_fiscal_code()}</Table.Head>
								<Table.Head>{m.receipts_table_status()}</Table.Head>
								<Table.Head>{m.receipts_table_amount()}</Table.Head>
								<Table.Head>{m.receipts_table_created()}</Table.Head>
								<Table.Head>{m.receipts_table_actions()}</Table.Head>
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
											<span class="text-muted-foreground">{m.receipts_not_available()}</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if receipt.fiscalCode}
											<span class="font-mono text-sm">{receipt.fiscalCode}</span>
										{:else}
											<span class="text-muted-foreground">{m.receipts_fiscal_code_pending()}</span>
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
											<span class="text-muted-foreground">{m.receipts_not_available()}</span>
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
													onclick={() => showReceiptError(receipt.errorMessage || 'Unknown error')}
												>
													{m.receipts_view_error()}
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
							{m.receipts_pagination_page()} {data.page} {m.receipts_pagination_of()} {data.totalPages} ({data.total} {m.receipts_pagination_total()})
						</p>
						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={previousPage}
								disabled={currentPage === 1}
							>
								<ChevronLeft class="h-4 w-4" />
								{m.receipts_pagination_previous()}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={nextPage}
								disabled={currentPage >= data.totalPages}
							>
								{m.receipts_pagination_next()}
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
					<p class="text-destructive">{m.receipts_error_loading()}{error.message}</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/await}

	<!-- Close Shift Confirmation Dialog -->
	<AlertDialog.Root bind:open={closeShiftDialogOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{m.receipts_close_shift()}</AlertDialog.Title>
				<AlertDialog.Description>
					{m.receipts_close_shift_confirm()}
				</AlertDialog.Description>
			</AlertDialog.Header>

			<AlertDialog.Footer>
				<Button type="button" variant="outline" onclick={() => (closeShiftDialogOpen = false)}>
					{m.common_cancel()}
				</Button>
				<Button type="button" variant="destructive" disabled={isClosingShift} onclick={handleCloseShiftConfirm}>
					{isClosingShift ? m.common_loading() : m.receipts_close_shift()}
				</Button>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<!-- Shift Operation Error Dialog -->
	<Dialog.Root bind:open={errorDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.common_error()}</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<p class="text-destructive text-sm">{errorMessage}</p>
			</div>
			<Dialog.Footer>
				<Button type="button" onclick={() => (errorDialogOpen = false)}>
					{m.common_ok()}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Receipt Error Details Dialog -->
	<Dialog.Root bind:open={receiptErrorDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.receipts_view_error()}</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<p class="text-destructive text-sm font-mono break-all">{receiptErrorMessage}</p>
			</div>
			<Dialog.Footer>
				<Button type="button" onclick={() => (receiptErrorDialogOpen = false)}>
					{m.common_ok()}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
