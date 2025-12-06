/**
 * Checkbox РРО Remote Functions
 * Handles fiscal receipt generation and shift management
 */

import { query, command, form } from '$app/server';
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
		const goods = orderItems.map((item) => {
			// Quantity in thousands (1 unit = 1000)
			const quantityInThousands = item.quantity * 1000;
			return {
				code: item.productId,
				good: {
					code: item.productId,
					name: item.name,
					price: item.price // Already in kopiykas (cents)
				},
				name: item.name,
				price: item.price, // Already in kopiykas (cents)
				quantity: quantityInThousands
				// tax and total_sum omitted to match organization settings
			};
		});

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
				cashRegisterId: shift?.cash_register?.id || null,
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

		console.log('Opened shift:', shiftData);

		// Save to database
		const [shift] = await db
			.insert(tables.checkboxShift)
			.values({
				id: crypto.randomUUID(),
				shiftId: shiftData.id,
				cashRegisterId: shiftData.cash_register.id,
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
		console.error(err);
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

/**
 * Get receipt HTML visualization
 */
export const getReceiptHtml = query(v.string(), async (receiptId) => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const html = await checkbox.getReceiptHtml(receiptId);
		return html;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to get receipt HTML: ${errorMessage}`);
	}
});

/**
 * Get receipt PNG visualization
 */
export const getReceiptPng = query(v.string(), async (receiptId) => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const png = await checkbox.getReceiptPng(receiptId);
		return png;
	} catch (err) {
		console.log(err);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to get receipt PNG: ${errorMessage}`);
	}
});

/**
 * Get receipt text visualization
 */
export const getReceiptText = query(v.string(), async (receiptId) => {
	auth.requireAdminUser();

	try {
		const checkbox = getCheckboxClient();
		const text = await checkbox.getReceiptText(receiptId);
		return text;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(500, `Failed to get receipt text: ${errorMessage}`);
	}
});

/**
 * Create a test receipt for testing Checkbox integration
 */
export const createTestReceipt = form(
	v.object({
		productName: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
		productPrice: v.pipe(v.number(), v.minValue(0)),
		quantity: v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
		customerEmail: v.optional(v.string(), ''),
		customerPhone: v.optional(v.string(), '')
	}),
	async (data) => {
		auth.requireAdminUser();

		try {
			const checkbox = getCheckboxClient();

			// Ensure shift is open
			let shift = await checkbox.getCurrentShift();
			if (!shift) {
				shift = await checkbox.openShift();
			}

			// Generate unique receipt ID
			const receiptId = crypto.randomUUID();

			// Calculate total (price is in kopiykas)
			// Quantity in thousands (1 unit = 1000)
			const quantityInThousands = data.quantity * 1000;
			const priceInKopiykas = Math.round(data.productPrice);
			const totalAmount = priceInKopiykas * data.quantity;

			// Sanitize phone number to match Checkbox API format: ^380\d{9}$
			let phoneNumber: string | undefined = undefined;
			if (data.customerPhone) {
				// Remove all non-digits
				const digits = data.customerPhone.replace(/\D/g, '');
				// Check if it's a valid Ukrainian number (380 + 9 digits)
				if (digits.match(/^380\d{9}$/)) {
					phoneNumber = digits;
				} else if (digits.match(/^0\d{9}$/)) {
					// Convert 0XXXXXXXXX to 380XXXXXXXXX
					phoneNumber = '380' + digits.substring(1);
				}
			}

			// Create test receipt with all required fields according to Checkbox API spec
			const receipt = await checkbox.createSaleReceipt({
				id: receiptId,
				goods: [
					{
						code: 'TEST_PRODUCT',
						good: {
							code: 'TEST_PRODUCT',
							name: data.productName,
							price: priceInKopiykas
						},
						name: data.productName,
						price: priceInKopiykas,
						quantity: quantityInThousands
					}
				],
				payments: [
					{
						type: 'CASHLESS',
						value: totalAmount
					}
				],
				delivery: {
					email: data.customerEmail || undefined,
					phone: phoneNumber
				}
			});

			// Get current shift reference for database storage
			const currentShift = await checkbox.getCurrentShift();

			// Save test receipt to database
			const [savedReceipt] = await db
				.insert(tables.checkboxReceipt)
				.values({
					id: crypto.randomUUID(),
					orderId: null, // Test receipt has no order
					paymentId: null, // Test receipt has no payment
					receiptId: receipt.id,
					fiscalCode: receipt.fiscal_code,
					receiptUrl: receipt.receipt_url || null,
					status: data.customerEmail || data.customerPhone ? 'sent' : 'created',
					checkboxData: JSON.stringify(receipt),
					shiftId: currentShift?.id || null,
					cashRegisterId: currentShift?.cash_register?.id || null,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Refresh the receipts list on the server
			await getAllReceipts({ orderNumber: '', status: 'all', page: 1, pageSize: 20 }).refresh();
			await getCurrentShift().refresh();

			return {
				success: true,
				receiptId: receipt.id,
				fiscalCode: receipt.fiscal_code,
				receiptUrl: receipt.receipt_url,
				totalAmount: (totalAmount / 100).toFixed(2)
			};
		} catch (err) {
			console.error('Error creating test receipt:', err);
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(500, `Failed to create test receipt: ${errorMessage}`);
		}
	}
);
