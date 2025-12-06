/**
 * Order PDF Download API Endpoint
 * Generates and streams PDF for download
 */

import type { RequestHandler } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { generateOrderPDF } from '$lib/server/services/pdf-generator';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		// Check admin authentication
		const user = auth.getUser();
		if (!user || !user.isAdmin) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const orderId = params.orderId;

		// Verify order exists
		const [order] = await db.select().from(tables.order).where(eq(tables.order.id, orderId));

		if (!order) {
			return new Response(JSON.stringify({ error: 'Order not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Generate PDF
		const pdfBuffer = await generateOrderPDF(orderId);

		// Return PDF file
		return new Response(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="order-${order.orderNumber}.pdf"`,
				'Content-Length': pdfBuffer.length.toString()
			}
		});
	} catch (error) {
		console.error('PDF download error:', error);

		const message = error instanceof Error ? error.message : 'Internal server error';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
