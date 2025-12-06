<script lang="ts">
	import { getAllReceipts, getCurrentShift, openShift, closeShift, createTestReceipt } from '$lib/remotes/checkbox.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Receipt, ChevronLeft, ChevronRight, Power, PowerOff, ExternalLink } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';

	let searchQuery = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	let closeShiftDialogOpen = $state(false);
	let isClosingShift = $state(false);
	let errorDialogOpen = $state(false);
	let errorMessage = $state('');
	let receiptErrorMessage = $state('');
	let receiptErrorDialogOpen = $state(false);
	let testReceiptSuccessOpen = $state(false);
	let testReceiptData = $state<any>(null);
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

	<!-- Test Receipt Creation -->
	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>{m.receipts_test_receipt_title()}</Card.Title>
			<p class="text-sm text-muted-foreground mt-2">{m.receipts_test_receipt_description()}</p>
		</Card.Header>
		<Card.Content>
			<form
				{...createTestReceipt.enhance(async ({ submit }) => {
					try {
						await submit();
						if (createTestReceipt.result?.success) {
							testReceiptData = createTestReceipt.result;
							testReceiptSuccessOpen = true;
							// Refresh receipts list
							getAllReceipts({ orderNumber: '', status: 'all', page: 1, pageSize }).refresh();
							getCurrentShift().refresh();
							// Reset form
							createTestReceipt.fields.set({
								productName: '',
								productPrice: 0,
								quantity: 1,
								customerEmail: '',
								customerPhone: ''
							});
							toast.success(m.receipts_test_success());
						}
					} catch (err) {
						const errorMsg = err instanceof Error ? err.message : 'Unknown error';
						toast.error(m.receipts_test_failed(), { description: errorMsg });
					}
				})}
				class="space-y-6"
			>
				<div class="grid md:grid-cols-2 gap-4">
					<div>
						<Label for="productName">{m.receipts_test_product_name()}</Label>
						<Input
							{...createTestReceipt.fields.productName.as('text')}
							placeholder={m.receipts_test_product_name_placeholder()}
						/>
						{#each createTestReceipt.fields.productName.issues() as issue}
							<p class="text-destructive text-sm mt-1">{issue.message}</p>
						{/each}
					</div>
					<div>
						<Label for="productPrice">{m.receipts_test_product_price()}</Label>
						<Input
							{...createTestReceipt.fields.productPrice.as('number')}
							step="0.01"
						/>
						<p class="text-xs text-muted-foreground mt-1">{m.receipts_test_product_price_help()}</p>
						{#each createTestReceipt.fields.productPrice.issues() as issue}
							<p class="text-destructive text-sm mt-1">{issue.message}</p>
						{/each}
					</div>
					<div>
						<Label for="quantity">{m.receipts_test_quantity()}</Label>
						<Input
							{...createTestReceipt.fields.quantity.as('number')}
							min="1"
							max="1000"
						/>
						{#each createTestReceipt.fields.quantity.issues() as issue}
							<p class="text-destructive text-sm mt-1">{issue.message}</p>
						{/each}
					</div>
					<div>
						<Label for="customerEmail">{m.receipts_test_customer_email()}</Label>
						<Input
							{...createTestReceipt.fields.customerEmail.as('email')}
							placeholder="test@example.com"
						/>
						{#each createTestReceipt.fields.customerEmail.issues() as issue}
							<p class="text-destructive text-sm mt-1">{issue.message}</p>
						{/each}
					</div>
					<div>
						<Label for="customerPhone">{m.receipts_test_customer_phone()}</Label>
						<Input
							{...createTestReceipt.fields.customerPhone.as('text')}
							placeholder="+380501234567"
						/>
						{#each createTestReceipt.fields.customerPhone.issues() as issue}
							<p class="text-destructive text-sm mt-1">{issue.message}</p>
						{/each}
					</div>
				</div>

				<Button type="submit" disabled={!!createTestReceipt.pending}>
					{createTestReceipt.pending ? m.receipts_test_creating() : m.receipts_test_create_button()}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

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

	<!-- Test Receipt Success Dialog -->
	<Dialog.Root bind:open={testReceiptSuccessOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.receipts_test_success()}</Dialog.Title>
			</Dialog.Header>
			{#if testReceiptData}
				<div class="space-y-4">
					<div class="bg-green-50 border border-green-200 rounded-md p-4">
						<p class="text-sm font-mono">{m.receipts_test_success_message({ receiptId: testReceiptData.receiptId })}</p>
						<p class="text-xs text-muted-foreground mt-2">
							Фіскальний код: <span class="font-mono">{testReceiptData.fiscalCode}</span>
						</p>
						<p class="text-xs text-muted-foreground">
							Сума: <span class="font-mono">{testReceiptData.totalAmount}</span> грн
						</p>
					</div>
				</div>
			{/if}
			<Dialog.Footer>
				{#if testReceiptData?.receiptUrl}
					<Button
						type="button"
						variant="outline"
						onclick={() => testReceiptData?.receiptUrl && window.open(testReceiptData.receiptUrl, '_blank')}
					>
						<ExternalLink class="h-4 w-4 mr-2" />
						{m.receipts_test_receipt_url()}
					</Button>
				{/if}
				<Button type="button" onclick={() => (testReceiptSuccessOpen = false)}>
					{m.common_ok()}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
