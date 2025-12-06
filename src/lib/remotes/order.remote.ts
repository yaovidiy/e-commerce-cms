import { query, form, command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import {
	CheckoutSchema,
	UpdateOrderStatusSchema,
	FilterOrdersSchema,
	GetOrderByIdSchema,
	UpdateOrderNotesSchema,
	SendOrderEmailSchema
} from '$lib/server/schemas';
import { eq, like, and, desc, count } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { createPaginatedResponse, calculatePagination } from '$lib/server/pagination-utils';
// Notification imports
import { sendNotification, buildOrderNotificationContext } from '$lib/server/services/notification';
import { getTemplatesByEventType } from '$lib/remotes/notification.remote';
import { createNotification } from '$lib/server/services/notification-manager';

// Helper to generate order number
function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `ORD-${timestamp}-${random}`;
}

// Helper to send order notifications
async function sendOrderNotifications(
	order: typeof tables.order.$inferSelect,
	orderItems: Array<typeof tables.orderItem.$inferSelect>,
	eventType: 'order_confirmed' | 'payment_pending_reminder' | 'order_shipped' | 'order_delivered' | 'post_delivery_review',
	additionalVars?: Record<string, string | number | boolean>
) {
	try {
		// Try to send email
		const emailTemplates = await getTemplatesByEventType({
			eventType,
			channel: 'email',
			language: 'uk'
		});

		if (emailTemplates.length > 0) {
			// Fetch item template for this notification
			const [itemTemplate] = await db
				.select()
				.from(tables.orderItemTemplate)
				.where(eq(tables.orderItemTemplate.notificationTemplateId, emailTemplates[0].id));

			const context = buildOrderNotificationContext(
				order,
				orderItems,
				additionalVars,
				itemTemplate?.itemTemplate,
				itemTemplate?.itemSeparator,
				itemTemplate?.wrapperTemplate,
				itemTemplate?.useHtmlFormatting
			);
			await sendNotification(emailTemplates[0].id, context);
			console.log(`✅ [Order] ${eventType} email sent to ${order.customerEmail}`);
		}

		// Try to send SMS (if customer has phone)
		if (order.customerPhone) {
			const smsTemplates = await getTemplatesByEventType({
				eventType,
				channel: 'sms',
				language: 'uk'
			});

			if (smsTemplates.length > 0) {
				// Fetch item template for this notification
				const [itemTemplate] = await db
					.select()
					.from(tables.orderItemTemplate)
					.where(eq(tables.orderItemTemplate.notificationTemplateId, smsTemplates[0].id));

				const context = buildOrderNotificationContext(
					order,
					orderItems,
					additionalVars,
					itemTemplate?.itemTemplate,
					itemTemplate?.itemSeparator,
					itemTemplate?.wrapperTemplate,
					itemTemplate?.useHtmlFormatting
				);
				await sendNotification(smsTemplates[0].id, context);
				console.log(`✅ [Order] ${eventType} SMS sent to ${order.customerPhone}`);
			}
		}
	} catch (notificationError) {
		console.error(`[Order] Failed to send ${eventType} notifications:`, notificationError);
		// Don't fail order operations if notifications fail
	}
}

// Get all orders (admin only)
export const getAllOrders = query(FilterOrdersSchema, async (data) => {
	auth.requireAdminUser();

	let baseQuery = db.select().from(tables.order);

	const conditions = [];

	// Filter by status
	if (data.status && data.status !== 'all') {
		conditions.push(eq(tables.order.status, data.status));
	}

	// Filter by customer email
	if (data.customerEmail) {
		conditions.push(like(tables.order.customerEmail, `%${data.customerEmail}%`));
	}

	// Filter by order number
	if (data.orderNumber) {
		conditions.push(like(tables.order.orderNumber, `%${data.orderNumber}%`));
	}

	// Apply conditions
	if (conditions.length > 0) {
		baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
	}

	// Order by creation date (newest first)
	baseQuery = baseQuery.orderBy(desc(tables.order.createdAt)) as typeof baseQuery;

	// Create count query with same conditions
	let countQuery = db.select({ count: count() }).from(tables.order);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	// Execute count query
	const [countResult] = await countQuery;
	const totalCount = Number(countResult?.count) || 0;

	// Calculate pagination
	const { offset, limit } = calculatePagination(data.page, data.pageSize);

	// Execute data query with pagination
	const orders = await baseQuery.limit(limit).offset(offset);

	// Return using utility
	return createPaginatedResponse(orders, totalCount, {
		page: data.page,
		pageSize: data.pageSize
	});
});

// Get single order (admin or order owner)
export const getOrder = query(v.string(), async (id: string) => {
	const event = getRequestEvent();
	const user = event.locals.user;

	const [order] = await db.select()
		.from(tables.order)
		.where(eq(tables.order.id, id));

	if (!order) {
		throw new Error('Order not found');
	}

	// Check authorization
	if (!user?.isAdmin && order.userId !== user?.id) {
		throw new Error('Unauthorized');
	}

	return order;
});

// Get order by order number and email (public access for tracking)
export const getOrderByNumber = query(
	v.object({
		orderNumber: v.string(),
		email: v.pipe(v.string(), v.email())
	}),
	async (data) => {
		const [order] = await db.select()
			.from(tables.order)
			.where(
				and(
					eq(tables.order.orderNumber, data.orderNumber),
					eq(tables.order.customerEmail, data.email)
				)
			);

		if (!order) {
			throw new Error('Order not found');
		}

		return order;
	}
);

// Get order by order number only (for payment redirect)
export const getOrderByOrderNumber = query(v.string(), async (orderNumber: string) => {
	const [order] = await db.select()
		.from(tables.order)
		.where(eq(tables.order.orderNumber, orderNumber));

	if (!order) {
		throw new Error('Order not found');
	}

	return order;
});

// Get user's orders
export const getMyOrders = query(async () => {
	const user = auth.getUser();

	const orders = await db.select()
		.from(tables.order)
		.where(eq(tables.order.userId, user.id))
		.orderBy(desc(tables.order.createdAt));

	return orders;
});

// Create order (checkout)
export const checkout = form(CheckoutSchema, async (data) => {
	const event = getRequestEvent();
	const user = event.locals.user;

	// Get cart
	let cart;
	if (user) {
		[cart] = await db.select()
			.from(tables.cart)
			.where(eq(tables.cart.userId, user.id));
	} else {
		const sessionId = event.cookies.get('cart-session');
		if (!sessionId) {
			throw new Error('Cart not found');
		}

		[cart] = await db.select()
			.from(tables.cart)
			.where(eq(tables.cart.sessionId, sessionId));
	}

	if (!cart) {
		throw new Error('Cart not found');
	}

	const items = JSON.parse(cart.items);

	if (items.length === 0) {
		throw new Error('Cart is empty');
	}

	// Verify inventory for all items
	for (const item of items) {
		const [product] = await db.select()
			.from(tables.product)
			.where(eq(tables.product.id, item.productId));

		if (!product) {
			throw new Error(`Product ${item.productId} not found`);
		}

		if (product.trackInventory && product.quantity < item.quantity) {
			if (!product.allowBackorders) {
				throw new Error(`Insufficient stock for ${product.name}`);
			}
		}
	}

	// Prepare billing address
	const billingAddress = data.sameAsShipping 
		? data.shippingAddress 
		: (data.billingAddress || data.shippingAddress);

	// Create order
	const orderNumber = generateOrderNumber();
	const orderId = crypto.randomUUID();
	const now = new Date();

	const [order] = await db.insert(tables.order).values({
		id: orderId,
		orderNumber,
		userId: user?.id || null,
		status: 'pending',
		items: JSON.stringify(items),
		shippingAddress: JSON.stringify(data.shippingAddress),
		billingAddress: JSON.stringify(billingAddress),
		customerEmail: data.customerEmail,
		customerPhone: data.customerPhone || null,
		customerFirstName: data.customerFirstName,
		customerLastName: data.customerLastName,
		subtotal: cart.subtotal,
		shippingCost: 0, // TODO: Calculate shipping cost
		tax: 0, // TODO: Calculate tax
		discount: 0, // TODO: Apply discount codes
		total: cart.total,
		paymentMethod: data.paymentMethod || 'cod',
		paymentStatus: 'pending',
		shippingMethod: data.shippingMethod || null,
		notes: data.notes || null,
		createdAt: now,
		updatedAt: now
	}).returning();

	// Create in-app notification for authenticated users
	if (user && order) {
		await createNotification(user.id, {
			title: 'Order Placed Successfully',
			message: `Your order #${order.orderNumber} has been created. Total: ${(order.total / 100).toFixed(2)} ${order.currency || 'UAH'}`,
			type: 'success',
			actionUrl: `/customer/orders/${order.id}`,
			actionLabel: 'View Order',
			metadata: {
				orderId: order.id,
				orderNumber: order.orderNumber,
				amount: order.total,
				currency: order.currency || 'UAH',
				itemCount: items.length
			}
		});
	}

	// Create order_item records for analytics
	const orderItems = [];
	for (const item of items) {
		const itemResult = await db.insert(tables.orderItem).values({
			id: crypto.randomUUID(),
			orderId: orderId,
			productId: item.productId,
			productName: item.name,
			productSlug: item.slug,
			productImage: item.image || null,
			price: item.price,
			quantity: item.quantity,
			subtotal: item.price * item.quantity,
			createdAt: now
		}).returning();
		orderItems.push(...itemResult);
	}

	// Update inventory
	for (const item of items) {
		const [product] = await db.select()
			.from(tables.product)
			.where(eq(tables.product.id, item.productId));

		if (product && product.trackInventory) {
			await db.update(tables.product)
				.set({
					quantity: product.quantity - item.quantity,
					updatedAt: new Date()
				})
				.where(eq(tables.product.id, item.productId));
		}
	}

	// Clear cart
	await db.update(tables.cart)
		.set({
			items: JSON.stringify([]),
			subtotal: 0,
			total: 0,
			updatedAt: new Date()
		})
		.where(eq(tables.cart.id, cart.id));

	// Clear cart session cookie
	event.cookies.delete('cart-session', { path: '/' });

	// Send order confirmation notifications
	await sendOrderNotifications(order, orderItems, 'order_confirmed');

	// If paying by IBAN, also send payment instructions
	if (data.paymentMethod === 'iban') {
		const ibanTemplates = await getTemplatesByEventType({
			eventType: 'order_confirmed',
			channel: 'email',
			language: 'uk'
		});

		if (ibanTemplates.length > 0) {
			try {
				// Fetch item template for this notification
				const [itemTemplate] = await db
					.select()
					.from(tables.orderItemTemplate)
					.where(eq(tables.orderItemTemplate.notificationTemplateId, ibanTemplates[0].id));

				const context = buildOrderNotificationContext(
					order,
					orderItems,
					{
						iban: 'UA623052990000026004010405791', // TODO: Get from settings
						bank_details: 'PJSC "Raiffeisen Bank Aval", Kyiv' // TODO: Get from settings
					},
					itemTemplate?.itemTemplate,
					itemTemplate?.itemSeparator,
					itemTemplate?.wrapperTemplate,
					itemTemplate?.useHtmlFormatting
				);
				await sendNotification(ibanTemplates[0].id, context);
				console.log(`✅ [Order] IBAN payment instructions sent to ${order.customerEmail}`);
			} catch (error) {
				console.error('[Order] Failed to send IBAN instructions:', error);
			}
		}
	}

	// Create payment and handle redirect based on payment method
	if (data.paymentMethod === 'cod') {
		// Cash on delivery - go directly to confirmation
		redirect(303, `/order-confirmation/${order.id}`);
	} else {
		// Online payment (LiqPay) - redirect to payment page which will handle LiqPay checkout
		redirect(303, `/payment/${order.id}`);
	}
});

// Update order status (admin only)
export const updateOrderStatus = command(UpdateOrderStatusSchema, async (data) => {
	auth.requireAdminUser();

	const [order] = await db.update(tables.order)
		.set({
			status: data.status,
			updatedAt: new Date(),
			...(data.status === 'shipped' && { shippedAt: new Date() }),
			...(data.status === 'delivered' && { deliveredAt: new Date() })
		})
		.where(eq(tables.order.id, data.id))
		.returning();

	if (!order) {
		throw new Error('Order not found');
	}

	// Send status-specific notifications
	try {
		// Fetch full order item records from database
		const orderItems = await db.select()
			.from(tables.orderItem)
			.where(eq(tables.orderItem.orderId, order.id));

		// Determine event type based on status
		if (data.status === 'shipped') {
			await sendOrderNotifications(order, orderItems, 'order_shipped');
		} else if (data.status === 'delivered') {
			await sendOrderNotifications(order, orderItems, 'order_delivered');
		}
	} catch (notificationError) {
		// Log but don't fail the status update
		console.error('[Order] Failed to send status notification:', notificationError);
	}

	return order;
});

// Cancel order (customer or admin)
// Note: This updates the order status to 'cancelled' but does NOT delete the order or order_item records.
// This preserves order history for analytics and reporting. Analytics queries filter by status.
export const cancelOrder = form(v.object({ id: v.string() }), async (data) => {
	const event = getRequestEvent();
	const user = event.locals.user;

	const [existingOrder] = await db.select()
		.from(tables.order)
		.where(eq(tables.order.id, data.id));

	if (!existingOrder) {
		throw new Error('Order not found');
	}

	// Check authorization
	if (!user?.isAdmin && existingOrder.userId !== user?.id) {
		throw new Error('Unauthorized');
	}

	// Only allow cancellation for pending/processing orders
	if (!['pending', 'processing'].includes(existingOrder.status)) {
		throw new Error('Cannot cancel order in current status');
	}

	// Restore inventory
	const items = JSON.parse(existingOrder.items);
	for (const item of items) {
		const [product] = await db.select()
			.from(tables.product)
			.where(eq(tables.product.id, item.productId));

		if (product && product.trackInventory) {
			await db.update(tables.product)
				.set({
					quantity: product.quantity + item.quantity,
					updatedAt: new Date()
				})
				.where(eq(tables.product.id, item.productId));
		}
	}

	// Update order status
	const [order] = await db.update(tables.order)
		.set({
			status: 'cancelled',
			updatedAt: new Date()
		})
		.where(eq(tables.order.id, data.id))
		.returning();

	// Send cancellation notification (if event type is defined in notification system)
	// Note: order_cancelled is not part of the core notification system yet
	// Update needed: Add order_cancelled event type and templates to notification system if needed

	return order;
});

// Get order by ID (admin only)
export const getOrderById = query(GetOrderByIdSchema, async (data) => {
	auth.requireAdminUser();

	const [order] = await db.select()
		.from(tables.order)
		.where(eq(tables.order.id, data.id));

	if (!order) {
		throw new Error('Order not found');
	}

	// Get order items from the order_item table
	const orderItems = await db.select()
		.from(tables.orderItem)
		.where(eq(tables.orderItem.orderId, order.id));

	return {
		...order,
		orderItems
	};
});

// Update order notes (admin only)
export const updateOrderNotes = command(UpdateOrderNotesSchema, async (data) => {
	auth.requireAdminUser();

	const [order] = await db.update(tables.order)
		.set({
			notes: data.notes || null,
			updatedAt: new Date()
		})
		.where(eq(tables.order.id, data.id))
		.returning();

	if (!order) {
		throw new Error('Order not found');
	}

	// Refresh the order query
	await getOrderById({ id: data.id }).refresh();

	return order;
});

// Send custom email to customer (admin only)
export const sendOrderEmail = command(SendOrderEmailSchema, async (data) => {
	auth.requireAdminUser();

	// Get order details
	const [order] = await db.select()
		.from(tables.order)
		.where(eq(tables.order.id, data.orderId));

	if (!order) {
		throw new Error('Order not found');
	}

	try {
		const { sendCustomOrderEmail } = await import('$lib/server/email-client');
		const result = await sendCustomOrderEmail({
			toEmail: order.customerEmail,
			subject: data.subject,
			message: data.message,
			orderNumber: order.orderNumber,
			customerName: `${order.customerFirstName} ${order.customerLastName}`
		});

		if (result.success) {
			// Log successful send for audit trail
			console.log(`✅ [Order] Custom email sent to ${order.customerEmail}: "${data.subject}"`);

			return {
				success: true,
				message: `Email sent successfully to ${order.customerEmail}`
			};
		} else {
			return {
				success: false,
				message: result.error || result.message || 'Failed to send email'
			};
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
});
