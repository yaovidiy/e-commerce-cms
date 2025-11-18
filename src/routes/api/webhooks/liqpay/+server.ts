/**
 * LiqPay Webhook Endpoint
 * Receives payment status updates from LiqPay
 */

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { handlePaymentWebhook } from '$lib/server/payment-utils';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const data = formData.get('data') as string;
		const signature = formData.get('signature') as string;

		if (!data || !signature) {
			return json({ error: 'Missing data or signature' }, { status: 400 });
		}

		// Process webhook
		const result = await handlePaymentWebhook(data, signature);

		return json({ success: true, result });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Webhook processing failed' },
			{ status: 500 }
		);
	}
};
