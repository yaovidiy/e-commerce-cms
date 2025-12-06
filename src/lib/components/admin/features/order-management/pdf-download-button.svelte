<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download, Loader2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		orderId: string;
		orderNumber: string;
	}

	const { orderId, orderNumber }: Props = $props();

	let isLoading = $state(false);

	async function downloadPDF() {
		if (isLoading) return;

		try {
			isLoading = true;

			// Use the API endpoint to download PDF
			const response = await fetch(`/api/orders/${orderId}/pdf`);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to generate PDF');
			}

			// Get the PDF blob
			const blob = await response.blob();

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `order-${orderNumber}.pdf`;
			document.body.appendChild(link);
			link.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(link);

			toast.success(m.order_pdf_downloaded?.() ?? 'PDF downloaded successfully');
		} catch (error) {
			console.error('PDF download error:', error);
			const message =
				error instanceof Error ? error.message : m.order_pdf_download_error?.() ?? 'Failed to download PDF';
			toast.error(message);
		} finally {
			isLoading = false;
		}
	}
</script>

<Button
	variant="outline"
	size="sm"
	onclick={downloadPDF}
	disabled={isLoading}
	title={m.order_download_pdf?.() ?? 'Download PDF'}
>
	{#if isLoading}
		<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		{m.common_loading?.() ?? 'Loading...'}
	{:else}
		<Download class="mr-2 h-4 w-4" />
		{m.order_download_pdf?.() ?? 'PDF'}
	{/if}
</Button>
