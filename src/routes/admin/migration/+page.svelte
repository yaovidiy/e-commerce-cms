<script lang="ts">
	import {
		createCategoryIfNotExists,
		uploadFileFromUrl,
		createProduct,
		createBlogCommand
	} from '$lib/remotes/migration.remote';
	import { me } from '$lib/remotes/user.remote';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages';
	import { sleep } from '$lib/utils';

	let file: File | null = $state(null);
	let isProcessing = $state(false);
	let progress = $state(0);
	let totalItems = $state(0);
	let processedItems = $state(0);
	let currentItem = $state('');
	let logs = $state<string[]>([]);
	let timings = $state<{ item: string; time: number }[]>([]);

	function addLog(message: string) {
		logs.push(`${new Date().toLocaleTimeString()}: ${message}`);
	}

	async function processMigration() {
		if (!file) return;

		isProcessing = true;
		progress = 0;
		processedItems = 0;
		logs = [];
		timings = [];

		try {
			const text = await file.text();
			const data = JSON.parse(text)?.data;

			console.log('Imported data:', data);

			// Extract data
			const categories = Object.values(data['api::category.category'] || {});
			const files = Object.values(data['plugin::upload.file'] || {});
			const products = Object.values(data['api::product.product'] || {});
			const blogs = Object.values(data['api::blog.blog'] || {});

			addLog(
				`Starting migration of ${categories.length} categories, ${files.length} files, ${products.length} products, and ${blogs.length} blogs.`
			);

			totalItems = categories.length + files.length + products.length + blogs.length;

			// Maps for IDs
			const categoryIdMap = new Map<string, string>();
			const fileIdMap = new Map<string, string>();

			addLog(`Processing categories... ${categories.length} to process.`);

			// Process categories
			for (const category of categories as any[]) {
				const start = Date.now();
				currentItem = `Processing category: ${category.title}`;

				try {
					const result = await createCategoryIfNotExists({ name: category.title });
					categoryIdMap.set(category.id, result.id);
					addLog(`Category "${category.title}": ${result.created ? 'created' : 'already exists'}`);
				} catch (error) {
					addLog(`Error processing category "${category.title}": ${error}`);
				}

				const time = Date.now() - start;
				timings.push({ item: `Category: ${category.title}`, time });
				processedItems++;
				progress = (processedItems / totalItems) * 100;
			}

			// Process files
			for (const fileData of files as any[]) {
				const start = Date.now();
				currentItem = `Processing file: ${fileData.name}`;

				await sleep(100); // Add a small delay to avoid overwhelming the server

				try {
					const result = await uploadFileFromUrl({
						url: fileData.url,
						filename: fileData.name
					});
					fileIdMap.set(fileData.id, result.id);
					addLog(`File "${fileData.name}": uploaded`);
				} catch (error) {
					addLog(`Error processing file "${fileData.name}": ${error}`);
				}

				const time = Date.now() - start;
				timings.push({ item: `File: ${fileData.name}`, time });
				processedItems++;
				progress = (processedItems / totalItems) * 100;
			}

			// Process products
			for (const product of products as any[]) {
				console.log('Processing product:', product);
				const start = Date.now();
				currentItem = `Processing product: ${product.title}`;

				await sleep(500); // Add a small delay to avoid overwhelming the server

				try {
					// Map category ID
					const categoryId = product.category ? categoryIdMap.get(product.category) : undefined;

					// Map image IDs
					const images = product.images
						? product.images.map((imgId: string) => fileIdMap.get(imgId)).filter(Boolean)
						: [];

					const result = await createProduct({
						name: product.title,
						description: product.description || '',
						slug: product.slug,
						price: product.price || 0,
						categoryId,
						images,
						status: 'draft'
					});

					addLog(`Product "${result.name}": created`);
				} catch (error) {
					addLog(`Error processing product "${product.title}": ${error}`);
				}

				const time = Date.now() - start;
				timings.push({ item: `Product: ${product.name}`, time });
				processedItems++;
				progress = (processedItems / totalItems) * 100;
			}

			// Process blogs
			for (const blog of blogs as any[]) {
				const start = Date.now();
				currentItem = `Processing blog: ${blog.title}`;

				try {
					const user = await me();
					if (!user) throw new Error('No admin user found');

					const result = await createBlogCommand({
						title: blog.title,
						content: blog.content,
						slug: blog.slug,
						authorId: user.id
					});

					addLog(`Blog "${blog.title}": created`);
				} catch (error) {
					addLog(`Error processing blog "${blog.title}": ${error}`);
				}

				const time = Date.now() - start;
				timings.push({ item: `Blog: ${blog.title}`, time });
				processedItems++;
				progress = (processedItems / totalItems) * 100;
			}

			addLog('Migration completed successfully!');
		} catch (error) {
			addLog(`Migration failed: ${error}`);
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="container mx-auto py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">{m.migration()}</h1>
		<p class="text-muted-foreground">Import data from JSON export file</p>
	</div>

	<Card class="mb-6">
		<CardHeader>
			<CardTitle>Upload JSON File</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
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
					class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
				/>

				<Button onclick={processMigration} disabled={!file || isProcessing}>
					{isProcessing ? 'Processing...' : 'Start Migration'}
				</Button>
			</div>
		</CardContent>
	</Card>

	{#if isProcessing || progress > 0}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>Progress</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<Progress value={progress} class="w-full" />
					<div class="text-muted-foreground flex justify-between text-sm">
						<span>{processedItems} / {totalItems} items processed</span>
						<span>{progress.toFixed(1)}%</span>
					</div>
					{#if currentItem}
						<p class="text-sm">Current: {currentItem}</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if timings.length > 0}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>Processing Times</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="max-h-60 space-y-2 overflow-y-auto">
					{#each timings as timing}
						<div class="flex justify-between text-sm">
							<span class="mr-4 truncate">{timing.item}</span>
							<span>{timing.time}ms</span>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}

	{#if logs.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Logs</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="max-h-96 space-y-1 overflow-y-auto font-mono text-sm">
					{#each logs as log}
						<p>{log}</p>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
