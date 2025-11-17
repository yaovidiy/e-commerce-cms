/**
 * Checkbox РРО Remote Functions
 * Handles fiscal receipt generation and shift management
 */

import { query, command } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { getCheckboxClient } from '$lib/server/checkbox-client';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

/**
 * Create fiscal receipt for an order
 * This should be called automatically when LiqPay payment succeeds
 */
export const createReceipt = command(v.string(), async (orderId) => {
	auth.requireAdminUser();

	// Get order
	const [order] = await db.select().from(tables.order).where(eq(tables.order.id, orderId));

	if (!order) {
		error(404, 'Order not found');
	}

	// Get payment
	const [payment] = await db
		.select()
		.from(tables.payment)
		.where(eq(tables.payment.orderId, orderId));

	if (!payment) {
		error(404, 'Payment not found');
	}

	// Only create receipts for completed LiqPay payments
	if (payment.provider !== 'liqpay' || payment.status !== 'completed') {
		error(400, 'Receipt can only be created for completed LiqPay payments');
	}

	// Check if receipt already exists
	const [existingReceipt] = await db
		.select()
		.from(tables.checkboxReceipt)
		.where(eq(tables.checkboxReceipt.orderId, orderId));

	if (existingReceipt) {
		return { receipt: existingReceipt, message: 'Receipt already exists' };
	}

	try {
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
			tax: [20] // 20% VAT - adjust as needed
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
		const [receipt] = await db
			.insert(tables.checkboxReceipt)
			.values({
				id: crypto.randomUUID(),
				orderId: order.id,
				paymentId: payment.id,
				receiptId: receiptData.id,
				fiscalCode: receiptData.fiscal_code,
				receiptUrl: receiptData.receipt_url || null,
				status: 'created',
				checkboxData: JSON.stringify(receiptData),
				shiftId: shift?.id || null,
				cashRegisterId: shift?.cash_register_id || null,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Update status to sent if delivery info was provided
		if (order.customerEmail || order.customerPhone) {
			await db
				.update(tables.checkboxReceipt)
				.set({
					status: 'sent',
					updatedAt: new Date()
				})
				.where(eq(tables.checkboxReceipt.id, receipt.id));
		}

		return {
			receipt,
			receiptData,
			message: 'Fiscal receipt created successfully'
		};
	} catch (err) {
		// Save error receipt
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';

		await db
			.insert(tables.checkboxReceipt)
			.values({
				id: crypto.randomUUID(),
				orderId: order.id,
				paymentId: payment.id,
				status: 'error',
				errorMessage,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		error(500, `Failed to create receipt: ${errorMessage}`);
	}
});

/**
 * Get all receipts (admin only)
 */
export const getAllReceipts = query(
	v.object({
		orderNumber: v.optional(v.string(), ''),
		status: v.optional(v.string(), 'all'),
		page: v.optional(v.number(), 1),
		pageSize: v.optional(v.number(), 20)
	}),
	async (data) => {
		auth.requireAdminUser();

		const offset = (data.page - 1) * data.pageSize;

		// Build query with optional status filter
		const receipts = await db
			.select({
				receipt: tables.checkboxReceipt,
				order: tables.order
			})
			.from(tables.checkboxReceipt)
			.leftJoin(tables.order, eq(tables.checkboxReceipt.orderId, tables.order.id))
			.where(
				data.status && data.status !== 'all'
					? eq(tables.checkboxReceipt.status, data.status as 'created' | 'sent' | 'error' | 'cancelled')
					: undefined
			)
			.orderBy(desc(tables.checkboxReceipt.createdAt))
			.limit(data.pageSize)
			.offset(offset);

		// Get total count
		const totalResult = await db
			.select({ count: tables.checkboxReceipt.id })
			.from(tables.checkboxReceipt);

		return {
			receipts: receipts.map((r) => ({
				...r.receipt,
				order: r.order
			})),
			total: totalResult.length,
			page: data.page,
			pageSize: data.pageSize,
			totalPages: Math.ceil(totalResult.length / data.pageSize)
		};
	}
);

/**
 * Get receipt by order ID
 */
export const getReceiptByOrderId = query(v.string(), async (orderId) => {
	const [receipt] = await db
		.select()
		.from(tables.checkboxReceipt)
		.where(eq(tables.checkboxReceipt.orderId, orderId));

	if (!receipt) {
		error(404, 'Receipt not found');
	}

	return receipt;
});

/**
 * Open new shift
 */
export const openShift = command(v.object({}), async () => {
	auth.requireAdminUser();
	const user = auth.getUser();

	try {
		const checkbox = getCheckboxClient();

		// Check if shift already open
		const currentShift = await checkbox.getCurrentShift();

		if (currentShift) {
			error(400, 'Shift already open');
		}

		// Open new shift
		const shiftData = await checkbox.openShift();

		// Save to database
		const [shift] = await db
			.insert(tables.checkboxShift)
			.values({
				id: crypto.randomUUID(),
				shiftId: shiftData.id,
				cashRegisterId: shiftData.cash_register_id,
				status: 'opened',
				openedBy: user.id,
				openedAt: new Date()
			})
			.returning();

		return {
			shift,
			shiftData,
			message: 'Shift opened successfully'
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to open shift: ${errorMessage}`);
	}
});

/**
 * Close current shift
 */
export const closeShift = command(v.object({}), async () => {
	auth.requireAdminUser();
	const user = auth.getUser();

	try {
		const checkbox = getCheckboxClient();

		// Get current shift from Checkbox
		const currentShift = await checkbox.getCurrentShift();

		if (!currentShift) {
			error(400, 'No open shift found');
		}

		// Close shift
		const shiftData = await checkbox.closeShift();

		// Update database
		await db
			.update(tables.checkboxShift)
			.set({
				status: 'closed',
				closedBy: user.id,
				closedAt: new Date(),
				balance: shiftData.balance ? JSON.stringify(shiftData.balance) : null
			})
			.where(eq(tables.checkboxShift.shiftId, currentShift.id));

		return {
			shiftData,
			message: 'Shift closed successfully'
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to close shift: ${errorMessage}`);
	}
});

/**
 * Get current shift
 */
export const getCurrentShift = query(async () => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const shift = await checkbox.getCurrentShift();

		if (!shift) {
			return null;
		}

		// Get from database
		const [dbShift] = await db
			.select()
			.from(tables.checkboxShift)
			.where(eq(tables.checkboxShift.shiftId, shift.id));

		return {
			shift,
			dbShift: dbShift || null
		};
	} catch {
		return null;
	}
});

/**
 * Get all shifts
 */
export const getAllShifts = query(
	v.object({
		page: v.optional(v.number(), 1),
		pageSize: v.optional(v.number(), 20)
	}),
	async (data) => {
		auth.requireAdminUser();

		const offset = (data.page - 1) * data.pageSize;

		const shifts = await db
			.select({
				shift: tables.checkboxShift,
				openedBy: {
					id: tables.user.id,
					username: tables.user.username
				}
			})
			.from(tables.checkboxShift)
			.leftJoin(tables.user, eq(tables.checkboxShift.openedBy, tables.user.id))
			.orderBy(desc(tables.checkboxShift.openedAt))
			.limit(data.pageSize)
			.offset(offset);

		// Get total count
		const totalResult = await db.select({ count: tables.checkboxShift.id }).from(tables.checkboxShift);

		return {
			shifts: shifts.map((s) => ({
				...s.shift,
				openedByUser: s.openedBy
			})),
			total: totalResult.length,
			page: data.page,
			pageSize: data.pageSize,
			totalPages: Math.ceil(totalResult.length / data.pageSize)
		};
	}
);

/**
 * Get Checkbox cashier info
 */
export const getCashierInfo = query(async () => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const cashier = await checkbox.getCashierInfo();
		return cashier;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to get cashier info: ${errorMessage}`);
	}
});

/**
 * Get cash registers
 */
export const getCashRegisters = query(async () => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const registers = await checkbox.getCashRegisters();
		return registers;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to get cash registers: ${errorMessage}`);
	}
});
