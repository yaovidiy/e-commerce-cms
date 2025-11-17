import { query, form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import * as v from 'valibot';
import {
	CheckoutSchema,
	UpdateOrderStatusSchema,
	FilterOrdersSchema
} from '$lib/server/schemas';
import { eq, like, and, desc, count } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

// Helper to generate order number
function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `ORD-${timestamp}-${random}`;
}

// Get all orders (admin only)
export const getAllOrders = query(FilterOrdersSchema, async (data) => {
	auth.requireAdminUser();

	let query = db.select().from(tables.order);

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

	if (conditions.length > 0) {
		query = query.where(and(...conditions)) as typeof query;
	}

	// Order by creation date (newest first)
	query = query.orderBy(desc(tables.order.createdAt)) as typeof query;

	// Pagination
	const offset = (data.page - 1) * data.pageSize;
	query = query.limit(data.pageSize).offset(offset) as typeof query;

	const orders = await query;

	// Get total count for pagination
	let countQuery = db.select({ count: count() }).from(tables.order);

	if (conditions.length > 0) {
		countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
	}

	const [{ count: totalCount }] = await countQuery;

	return {
		orders,
		pagination: {
			page: data.page,
			pageSize: data.pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / data.pageSize)
		}
	};
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

	const [order] = await db.insert(tables.order).values({
		id: crypto.randomUUID(),
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
		createdAt: new Date(),
		updatedAt: new Date()
	}).returning();

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

	// Redirect to order confirmation
	redirect(303, `/order-confirmation/${order.id}`);
});

// Update order status (admin only)
export const updateOrderStatus = form(UpdateOrderStatusSchema, async (data) => {
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

	// Refresh orders query
	await getAllOrders({
		status: 'all',
		customerEmail: '',
		orderNumber: '',
		page: 1,
		pageSize: 20
	}).refresh();

	return order;
});

// Cancel order (customer or admin)
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

	return order;
});
