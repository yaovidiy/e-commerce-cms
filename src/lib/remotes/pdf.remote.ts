/**
 * PDF Generation Remote Functions
 * Provides endpoints for generating and downloading order PDFs
 */

import { command } from '$app/server';
import * as v from 'valibot';
import * as auth from '$lib/server/auth';
import { generateOrderPDF } from '$lib/server/services/pdf-generator';
import { error } from '@sveltejs/kit';

/**
 * Generate and download order PDF
 * Returns the PDF data as a buffer
 */
export const downloadOrderPDF = command(v.string(), async (orderId) => {
	// Require admin user
	const user = auth.requireAdminUser();

	if (!user) {
		error(401, 'Unauthorized');
	}

	try {
		const pdfBuffer = await generateOrderPDF(orderId);

		return {
			success: true,
			pdfBuffer: pdfBuffer.toString('base64'),
			orderId: orderId
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
		console.error('PDF generation error:', err);
		error(500, errorMessage);
	}
});
