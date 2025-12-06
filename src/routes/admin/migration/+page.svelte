<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';
	import { AlertCircle, Upload } from '@lucide/svelte';

	let file: File | null = $state(null);
	let baseUrl: string = $state('https://crm.thespiceroom.com.ua');
	let isProcessing = $state(false);
	let progress = $state(0);
	let totalItems = $state(0);
	let processedItems = $state(0);
	let currentItem = $state('');
	let logs = $state<string[]>([]);
	let error = $state<string | null>(null);
	let success = $state(false);
	let eventSource: EventSource | null = null;
	let showAbortDialog = $state(false);
	let hasActiveMigration = $state(false);
	let activeMigrationStatus: any = $state(null);

	function addLog(message: string) {
		logs = [...logs, `${new Date().toLocaleTimeString()}: ${message}`];
	}

	// Check for active migration on mount
	$effect(() => {
		checkActiveMigration();
	});

	async function checkActiveMigration() {
		try {
			const response = await fetch('/api/admin/migration');
			const data = await response.json();

			if (data.status && data.status !== 'no-migration') {
				hasActiveMigration = true;
				activeMigrationStatus = data;
				addLog(`Found active migration: ${data.processedItems}/${data.totalItems} items processed`);
			}
		} catch (err) {
			console.error('Failed to check migration status:', err);
		}
	}

	async function resumeMigration() {
		if (!activeMigrationStatus) return;

		isProcessing = true;
		progress = (activeMigrationStatus.processedItems / activeMigrationStatus.totalItems) * 100;
		processedItems = activeMigrationStatus.processedItems;
		totalItems = activeMigrationStatus.totalItems;
		logs = [];
		error = null;
		success = false;
		hasActiveMigration = false;

		addLog('Resuming migration...');

		try {
			// Reconnect to the server migration stream
			// Note: This will start a fresh migration but skip already processed items
			const formData = new FormData();
			formData.append('baseUrl', baseUrl);

			const response = await fetch('/api/admin/migration', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				error = `Server error: ${response.status} ${response.statusText}`;
				isProcessing = false;
				addLog(`❌ Error: ${error}`);
				return;
			}

			if (!response.body) {
				error = 'No response body from server';
				isProcessing = false;
				addLog(`❌ Error: ${error}`);
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));

							if (data.type === 'progress') {
								processedItems = data.current;
								progress = (processedItems / totalItems) * 100;
								currentItem = data.item;
							} else if (data.type === 'complete') {
								processedItems = data.processed;
								progress = 100;
								success = true;
								addLog(`✅ Migration resumed and completed! Processed ${data.processed}/${data.total} items`);

								// Clear migration state
								await clearMigrationState();

								setTimeout(() => {
									isProcessing = false;
								}, 2000);
								return;
							} else if (data.type === 'error') {
								error = data.message;
								addLog(`❌ Error: ${data.message}`);
							}
						} catch (parseError) {
							console.error('Error parsing response:', parseError);
						}
					}
				}
			}

			isProcessing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to resume migration';
			addLog(`Fatal error: ${error}`);
			isProcessing = false;
		}
	}

	async function clearMigrationState() {
		try {
			await fetch('/api/admin/migration', { method: 'DELETE' });
		} catch (err) {
			console.error('Failed to clear migration state:', err);
		}
	}

	async function processMigration() {
		if (!file) return;

		isProcessing = true;
		progress = 0;
		processedItems = 0;
		logs = [];
		error = null;
		success = false;
		totalItems = 0;

		try {
			addLog('Starting migration via server...');

			// Create FormData with file and baseUrl
			const formData = new FormData();
			formData.append('file', file);
			formData.append('baseUrl', baseUrl);

			// POST request to initiate migration
			const response = await fetch('/api/admin/migration', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				error = `Server error: ${response.status} ${response.statusText}`;
				isProcessing = false;
				addLog(`❌ Error: ${error}`);
				return;
			}

			// Handle SSE response
			if (!response.body) {
				error = 'No response body from server';
				isProcessing = false;
				addLog(`❌ Error: ${error}`);
				return;
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const data = JSON.parse(line.slice(6));

							if (data.type === 'start') {
								totalItems = data.total;
								addLog(`Migration started. Total items to process: ${totalItems}`);
							} else if (data.type === 'progress') {
								processedItems = data.current;
								progress = (processedItems / totalItems) * 100;
								currentItem = data.item;
						} else if (data.type === 'complete') {
							processedItems = data.processed;
							progress = 100;
							success = true;
							addLog(`✅ Migration completed successfully! Processed ${data.processed}/${data.total} items`);

							// Clear migration state
							await clearMigrationState();

							// Close dialog after 2 seconds
							setTimeout(() => {
								isProcessing = false;
							}, 2000);
							return;
							} else if (data.type === 'error') {
								error = data.message;
								addLog(`❌ Error: ${data.message}`);
							}
						} catch (parseError) {
							console.error('Error parsing response:', parseError);
						}
					}
				}
			}

			isProcessing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start migration';
			addLog(`Fatal error: ${error}`);
			isProcessing = false;
		}
	}

	function stopMigration() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
		}

		isProcessing = false;
		addLog('Migration stopped by user');
		showAbortDialog = false;
	}

	function handleAbortClick() {
		showAbortDialog = true;
	}
</script>


<div class="container mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">{m.migration_title()}</h1>
		<p class="text-muted-foreground">{m.migration_description()}</p>
	</div>

	{#if hasActiveMigration && activeMigrationStatus}
		<Card class="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
			<CardHeader>
				<CardTitle class="text-blue-800 dark:text-blue-200">{m.migration_active_found()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<p class="text-blue-700 dark:text-blue-300">
						{m.migration_active_description()}
					</p>
					<div class="text-sm text-blue-600 dark:text-blue-400">
						<p>{m.migration_active_progress({ processed: activeMigrationStatus.processedItems, total: activeMigrationStatus.totalItems })}</p>
						<p>{m.migration_active_started({ date: new Date(activeMigrationStatus.startedAt).toLocaleString() })}</p>
					</div>
					<div class="flex gap-2">
						<Button onclick={resumeMigration} variant="default">
							{m.migration_resume()}
						</Button>
						<Button
							onclick={async () => {
								await clearMigrationState();
								hasActiveMigration = false;
								addLog(m.migration_state_cleared());
							}}
							variant="outline"
						>
							{m.migration_clear_state()}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if !isProcessing && !success && !hasActiveMigration}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>{m.migration_upload_file()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div>
						<Label for="base-url">{m.migration_base_url()}</Label>
						<Input
							id="base-url"
							type="text"
							bind:value={baseUrl}
							placeholder="https://crm.thespiceroom.com.ua"
							disabled={isProcessing}
						/>
						<p class="text-xs text-muted-foreground mt-1">{m.migration_base_url_help()}</p>
					</div>

					<input
						type="file"
						accept=".json"
						onchange={(e) => {
							const fileInput = e.target as HTMLInputElement;

							if (fileInput.files?.length) {
								file = fileInput.files[0];
							}
						}}
						disabled={isProcessing}
						class="block w-full text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:hover:file:bg-blue-50"
					/>

					<Button onclick={processMigration} disabled={!file || isProcessing}>
						<Upload class="mr-2 h-4 w-4" />
						{isProcessing ? m.migration_processing() : m.migration_start()}
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if isProcessing}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>{m.migration_progress()}</CardTitle>
			</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<Progress value={progress} class="w-full" />
				<div class="text-muted-foreground flex justify-between text-sm">
					<span>{m.migration_items_processed({ current: processedItems, total: totalItems })}</span>
					<span>{progress.toFixed(1)}%</span>
				</div>
				{#if currentItem}
					<p class="text-sm text-muted-foreground">{m.migration_current_item({ item: currentItem })}</p>
				{/if}

				<Button variant="destructive" size="sm" onclick={handleAbortClick}>
					{m.migration_abort()}
				</Button>
			</div>
		</CardContent>
		</Card>
	{/if}

	{#if success}
		<Card class="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20">
			<CardHeader>
				<CardTitle class="text-green-800 dark:text-green-200">{m.migration_success_title()}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-green-700 dark:text-green-300">
					{m.migration_success_message({ processed: processedItems })}
				</p>
			</CardContent>
		</Card>
	{/if}

	{#if error}
		<Card class="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-red-800 dark:text-red-200">
					<AlertCircle class="h-5 w-5" />
					{m.migration_error_title()}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-red-700 dark:text-red-300">{error}</p>
			</CardContent>
		</Card>
	{/if}

	{#if logs.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>{m.migration_logs()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="max-h-96 space-y-1 overflow-y-auto font-mono text-sm bg-muted p-3 rounded">
					{#each logs as log}
						<p class="text-muted-foreground">{log}</p>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}

	<AlertDialog.Root bind:open={showAbortDialog}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>{m.migration_confirm_abort_title()}</AlertDialog.Title>
				<AlertDialog.Description>
					{m.migration_confirm_abort_description()}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>{m.migration_confirm_abort_cancel()}</AlertDialog.Cancel>
				<AlertDialog.Action onclick={stopMigration} class="bg-destructive hover:bg-destructive/90">
					{m.migration_confirm_abort_confirm()}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
