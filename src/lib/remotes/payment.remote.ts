/**
 * Payment Remote Functions
 * Handles payment creation, status checking, and webhook processing
 */

import { query, command } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { getLiqPayClient } from '$lib/server/liqpay-client';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { LIQPAY_PUBLIC_KEY, LIQPAY_PRIVATE_KEY, LIQPAY_SANDBOX } from '$env/static/private';

/**
 * Create a payment for an order
 */
export const createPayment = command(
	v.object({
		orderId: v.string(),
		paymentMethod: v.picklist(['liqpay', 'cod'])
	}),
	async (data) => {
		// Get order
		const [order] = await db
			.select()
			.from(tables.order)
			.where(eq(tables.order.id, data.orderId));

		if (!order) {
			error(404, 'Order not found');
		}

		// Check if payment already exists
		const [existingPayment] = await db
			.select()
			.from(tables.payment)
			.where(eq(tables.payment.orderId, data.orderId));

		if (existingPayment) {
			return { payment: existingPayment };
		}

		// Create payment record
		const paymentId = crypto.randomUUID();

		if (data.paymentMethod === 'cod') {
			// Cash on delivery - no external payment
			const [payment] = await db
				.insert(tables.payment)
				.values({
					id: paymentId,
					orderId: data.orderId,
					provider: 'cod',
					amount: order.total,
					currency: 'UAH',
					status: 'pending',
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return { payment };
		}

		// LiqPay payment
		const liqpay = getLiqPayClient();

		// Create LiqPay payment
		const liqpayResponse = liqpay.createPayment({
			orderId: order.orderNumber,
			amount: order.total / 100, // Convert cents to UAH
			description: `Order ${order.orderNumber}`,
			email: order.customerEmail,
			phone: order.customerPhone || undefined,
			resultUrl: `${process.env.ORIGIN || 'http://localhost:5173'}/payment/result`,
			serverUrl: `${process.env.ORIGIN || 'http://localhost:5173'}/api/webhooks/liqpay`
		});

		const checkoutUrl = liqpay.getCheckoutUrl(liqpayResponse);

		// Store payment record
		const [payment] = await db
			.insert(tables.payment)
			.values({
				id: paymentId,
				orderId: data.orderId,
				provider: 'liqpay',
				amount: order.total,
				currency: 'UAH',
				status: 'pending',
				liqpayData: JSON.stringify({
					data: liqpayResponse.data,
					signature: liqpayResponse.signature,
					checkoutUrl
				}),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		return { payment, checkoutUrl };
	}
);

/**
 * Get payment by order ID
 */
export const getPaymentByOrderId = query(v.string(), async (orderId) => {
	const [payment] = await db
		.select()
		.from(tables.payment)
		.where(eq(tables.payment.orderId, orderId));

	if (!payment) {
		error(404, 'Payment not found');
	}

	return payment;
});

/**
 * Check payment status with provider
 */
export const checkPaymentStatus = command(v.string(), async (orderId) => {
	const [order] = await db
		.select()
		.from(tables.order)
		.where(eq(tables.order.id, orderId));

	if (!order) {
		error(404, 'Order not found');
	}

	const [payment] = await db
		.select()
		.from(tables.payment)
		.where(eq(tables.payment.orderId, orderId));

	if (!payment) {
		error(404, 'Payment not found');
	}

	if (payment.provider === 'cod') {
		return {
			status: payment.status,
			message: 'Cash on delivery - payment collected on delivery'
		};
	}

	// Check with LiqPay
	const liqpay = getLiqPayClient();
	const status = await liqpay.checkPaymentStatus(order.orderNumber);

	// Update payment status
	const paymentStatus =
		status.status === 'success'
			? 'completed'
			: status.status === 'failure' || status.status === 'error'
				? 'failed'
				: status.status === 'reversed'
					? 'refunded'
					: 'pending';

	await db
		.update(tables.payment)
		.set({
			status: paymentStatus,
			transactionId: status.payment_id?.toString(),
			metadata: JSON.stringify(status),
			updatedAt: new Date()
		})
		.where(eq(tables.payment.id, payment.id));

	// Update order payment status
	await db
		.update(tables.order)
		.set({
			paymentStatus,
			status: paymentStatus === 'completed' ? 'processing' : order.status,
			updatedAt: new Date()
		})
		.where(eq(tables.order.id, orderId));

	return {
		status: paymentStatus,
		details: status
	};
});

/**
 * Create refund for payment
 */
export const createRefund = command(v.string(), async (orderId) => {
	// Auth check would go here (admin only)

	const [order] = await db
		.select()
		.from(tables.order)
		.where(eq(tables.order.id, orderId));

	if (!order) {
		error(404, 'Order not found');
	}

	const [payment] = await db
		.select()
		.from(tables.payment)
		.where(
			and(eq(tables.payment.orderId, orderId), eq(tables.payment.status, 'completed'))
		);

	if (!payment) {
		error(404, 'Completed payment not found for this order');
	}

	if (payment.provider === 'cod') {
		// Manual refund for COD
		await db
			.update(tables.payment)
			.set({
				status: 'refunded',
				updatedAt: new Date()
			})
			.where(eq(tables.payment.id, payment.id));

		await db
			.update(tables.order)
			.set({
				status: 'refunded',
				paymentStatus: 'refunded',
				updatedAt: new Date()
			})
			.where(eq(tables.order.id, orderId));

		return { success: true, message: 'Manual refund recorded' };
	}

	// Process LiqPay refund
	const liqpay = getLiqPayClient();
	const refundResult = await liqpay.createRefund(order.orderNumber, order.total / 100);

	if (refundResult.status === 'reversed' || refundResult.status === 'success') {
		await db
			.update(tables.payment)
			.set({
				status: 'refunded',
				metadata: JSON.stringify(refundResult),
				updatedAt: new Date()
			})
			.where(eq(tables.payment.id, payment.id));

		await db
			.update(tables.order)
			.set({
				status: 'refunded',
				paymentStatus: 'refunded',
				updatedAt: new Date()
			})
			.where(eq(tables.order.id, orderId));

		return { success: true, message: 'Refund processed successfully' };
	}

	error(400, refundResult.err_description || 'Failed to process refund');
});

/**
 * Check LiqPay integration status and test API connection
 */
export const testLiqPayIntegration = query(async () => {
	try {
		const liqpay = getLiqPayClient();
		
		// Check if credentials are configured
		const publicKeyConfigured = !!LIQPAY_PUBLIC_KEY;
		const privateKeyConfigured = !!LIQPAY_PRIVATE_KEY;
		const isSandbox = LIQPAY_SANDBOX === 'true';

		// Try a test status check with a dummy order
		let testConnectionSuccess = false;
		let testConnectionError: string | null = null;

		if (publicKeyConfigured && privateKeyConfigured) {
			try {
				// Try to check status of a test order (will fail but tests connectivity)
				const statusResponse = await liqpay.checkPaymentStatus('test-order-' + Date.now());
				testConnectionSuccess = true;
			} catch (err) {
				// Connection test - we expect some error, but not a connection error
				const errorMsg = err instanceof Error ? err.message : String(err);
				if (errorMsg.includes('fetch') || errorMsg.includes('ECONNREFUSED')) {
					testConnectionError = 'Failed to connect to LiqPay API: ' + errorMsg;
				} else {
					// Other errors indicate the API is reachable
					testConnectionSuccess = true;
				}
			}
		}

		return {
			configured: publicKeyConfigured && privateKeyConfigured,
			sandbox: isSandbox,
			publicKeyConfigured,
			privateKeyConfigured,
			testConnectionSuccess,
			testConnectionError
		};
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : 'Unknown error';
		return {
			configured: false,
			sandbox: false,
			publicKeyConfigured: false,
			privateKeyConfigured: false,
			testConnectionSuccess: false,
			testConnectionError: errorMsg
		};
	}
});
