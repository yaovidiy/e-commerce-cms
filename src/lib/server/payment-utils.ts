/**
 * Payment Utilities
 * Server-side utilities for payment processing
 */

import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import type { Order } from '$lib/server/db/schema';
import { getLiqPayClient } from '$lib/server/liqpay-client';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

/**
 * Handle webhook from payment provider
 * Used by API routes to process payment status updates
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

	// Send order confirmation email for successful payment
	if (paymentStatus === 'completed') {
		try {
			const { sendOrderConfirmationEmail } = await import('$lib/server/email-client');
			
			// Parse order items for email
			const orderItems = JSON.parse(order.items) as Array<{
				productId: string;
				name: string;
				price: number;
				quantity: number;
			}>;
			
			await sendOrderConfirmationEmail({
				order: {
					...order,
					items: orderItems.map(item => ({
						productName: item.name,
						quantity: item.quantity,
						price: item.price
					}))
				} as Order & { items: Array<{ productName: string; quantity: number; price: number; }> }
			});
		} catch (emailError) {
			// Log but don't fail the webhook
			console.error('[Payment Webhook] Failed to send order confirmation email:', emailError);
		}
	}

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
