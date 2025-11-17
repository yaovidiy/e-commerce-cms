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
 * Handle webhook from payment provider (internal use - not exposed as remote function)
 */
export async function handlePaymentWebhook(data: string, signature: string) {
	const liqpay = getLiqPayClient();

	// Parse and verify webhook
	const webhookData = liqpay.parseWebhook(data, signature);

	if (!webhookData) {
		error(400, 'Invalid webhook signature');
	}

	// Find order by order number
	const [order] = await db
		.select()
		.from(tables.order)
		.where(eq(tables.order.orderNumber, webhookData.order_id));

	if (!order) {
		error(404, 'Order not found');
	}

	// Find payment
	const [payment] = await db
		.select()
		.from(tables.payment)
		.where(eq(tables.payment.orderId, order.id));

	if (!payment) {
		error(404, 'Payment not found');
	}

	// Update payment status
	const paymentStatus =
		webhookData.status === 'success'
			? 'completed'
			: webhookData.status === 'failure' || webhookData.status === 'error'
				? 'failed'
				: webhookData.status === 'reversed'
					? 'refunded'
					: 'pending';

	await db
		.update(tables.payment)
		.set({
			status: paymentStatus,
			transactionId: webhookData.payment_id?.toString(),
			metadata: JSON.stringify(webhookData),
			updatedAt: new Date()
		})
		.where(eq(tables.payment.id, payment.id));

	// Update order status
	const orderStatus =
		paymentStatus === 'completed'
			? 'processing'
			: paymentStatus === 'refunded'
				? 'refunded'
				: order.status;

	await db
		.update(tables.order)
		.set({
			paymentStatus,
			status: orderStatus,
			updatedAt: new Date()
		})
		.where(eq(tables.order.id, order.id));

	// Auto-generate Checkbox receipt for successful LiqPay payment
	if (paymentStatus === 'completed' && payment.provider === 'liqpay') {
		try {
			const { getCheckboxClient } = await import('$lib/server/checkbox-client');
			
			const checkbox = getCheckboxClient();

			// Parse order items
			const orderItems = JSON.parse(order.items) as Array<{
				productId: string;
				name: string;
				price: number;
				quantity: number;
			}>;

			// Prepare receipt items
			const goods = orderItems.map((item) => ({
				code: item.productId,
				name: item.name,
				price: item.price, // Already in kopiykas (cents)
				quantity: item.quantity,
				cost: item.price * item.quantity,
				tax: [20] // 20% VAT
			}));

			// Create receipt
			const receiptData = await checkbox.createSaleReceipt({
				goods,
				payments: [
					{
						type: 'CASHLESS',
						value: order.total
					}
				],
				delivery: {
					email: order.customerEmail,
					phone: order.customerPhone || undefined
				},
				order_id: order.orderNumber
			});

			// Get current shift
			const shift = await checkbox.getCurrentShift();

			// Save receipt to database
			await db
				.insert(tables.checkboxReceipt)
				.values({
					id: crypto.randomUUID(),
					orderId: order.id,
					paymentId: payment.id,
					receiptId: receiptData.id,
					fiscalCode: receiptData.fiscal_code,
					receiptUrl: receiptData.receipt_url || null,
					status: order.customerEmail || order.customerPhone ? 'sent' : 'created',
					checkboxData: JSON.stringify(receiptData),
					shiftId: shift?.id || null,
					cashRegisterId: shift?.cash_register_id || null,
					createdAt: new Date(),
					updatedAt: new Date()
				});
		} catch (checkboxError) {
			// Log error but don't fail the webhook
			console.error('Failed to create Checkbox receipt:', checkboxError);
			
			// Save error receipt for later retry
			await db
				.insert(tables.checkboxReceipt)
				.values({
					id: crypto.randomUUID(),
					orderId: order.id,
					paymentId: payment.id,
					status: 'error',
					errorMessage: checkboxError instanceof Error ? checkboxError.message : 'Unknown error',
					createdAt: new Date(),
					updatedAt: new Date()
				});
		}
	}

	return {
		success: true,
		paymentStatus,
		orderStatus
	};
}

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
