<script lang="ts">
	import { uploadAsset } from '$lib/remotes/asset.remote';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Upload, X, Image as ImageIcon } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';

	let {
		onUploadComplete,
		class: className = '',
		disabled = false,
		accept = 'image/*'
	} = $props<{
		onUploadComplete?: (asset: { id: string; url: string; filename: string }) => void;
		class?: string;
		disabled?: boolean;
		accept?: string;
	}>();

	let fileInput = $state<HTMLInputElement>();
	let preview = $state<string | null>(null);
	let selectedFileName = $state<string | null>(null);
	let selectedFileSize = $state<number>(0);
	let isDragging = $state(false);
	let error = $state<string | null>(null);

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			processFile(file);
		}
	}

	function processFile(file: File) {
		error = null;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file';
			return;
		}

		// Validate file size (10MB)
		if (file.size > 10 * 1024 * 1024) {
			error = 'File size must be less than 10MB';
			return;
		}

		selectedFileName = file.name;
		selectedFileSize = file.size;

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			preview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled) {
			isDragging = true;
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (disabled) return;

		const file = e.dataTransfer?.files[0];
		if (file && fileInput) {
			// Create a new FileList with the dropped file
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			fileInput.files = dataTransfer.files;

			processFile(file);
		}
	}

	function clearSelection() {
		selectedFileName = null;
		selectedFileSize = 0;
		preview = null;
		error = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<form
	{...uploadAsset.enhance(async ({ submit, form }) => {
		await submit();

		if (uploadAsset.result && onUploadComplete) {
			onUploadComplete(uploadAsset.result);
			form.reset();
			clearSelection();
		}
	})}
	enctype="multipart/form-data"
	class={cn('space-y-4', className)}
>
	<!-- Hidden file input (always in form) -->
	<input
		bind:this={fileInput}
		{...uploadAsset.fields.file.as('file')}
		{accept}
		{disabled}
		class="hidden"
		onchange={handleFileSelect}
	/>

	<!-- Upload Area (shown when no preview) -->
	{#if !preview}
		<div
			role="button"
			tabindex={disabled ? -1 : 0}
			class={cn(
				'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
				isDragging && !disabled
					? 'border-primary bg-primary/5'
					: 'border-muted-foreground/25 hover:border-primary/50',
				disabled && 'cursor-not-allowed opacity-50'
			)}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={() => !disabled && fileInput?.click()}
			onkeydown={(e) => {
				if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
					e.preventDefault();
					fileInput?.click();
				}
			}}
		>
			<div class="flex flex-col items-center gap-2">
				<div
					class={cn(
						'rounded-full p-3 transition-colors',
						isDragging && !disabled ? 'bg-primary text-primary-foreground' : 'bg-muted'
					)}
				>
					<Upload class="h-6 w-6" />
				</div>

				<div class="space-y-1">
					<p class="text-sm font-medium">{m.asset_drag_drop()}</p>
					<p class="text-muted-foreground text-xs">{m.asset_allowed_types()}</p>
					<p class="text-muted-foreground text-xs">{m.asset_max_size()}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Preview Area (shown when file selected) -->
	{#if preview && selectedFileName}
		<div class="space-y-4">
			<div class="bg-muted relative overflow-hidden rounded-lg border">
				<img src={preview} alt="Preview" class="h-auto max-h-96 w-full object-contain" />

				<Button
					type="button"
					variant="destructive"
					size="icon"
					class="absolute top-2 right-2"
					onclick={clearSelection}
					disabled={!!uploadAsset.pending}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="text-muted-foreground flex items-center gap-2 text-sm">
				<ImageIcon class="h-4 w-4" />
				<span class="truncate">{selectedFileName}</span>
				<span>({(selectedFileSize / 1024).toFixed(1)} KB)</span>
			</div>

			<!-- Display validation errors -->
			{#each uploadAsset.fields.file.issues() as issue}
				<div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
					{issue.message}
				</div>
			{/each}

			<Button type="submit" disabled={!!uploadAsset.pending} class="w-full">
				{uploadAsset.pending ? m.asset_uploading() : m.asset_upload()}
			</Button>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
	{/if}
</form>
