import { query, command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import * as v from 'valibot';
import {
	AddToCartSchema,
	UpdateCartItemSchema,
	RemoveFromCartSchema
} from '$lib/server/schemas';
import { eq } from 'drizzle-orm';

// Cart item type
interface CartItem {
	productId: string;
	variantId: string | null;
	quantity: number;
	price: number;
	name: string;
	image: string | null;
}

// Helper to get or create cart (for commands that can set cookies)
async function getOrCreateCart() {
	const event = getRequestEvent();
	const user = event.locals.user;
	
	let cart;
	
	if (user) {
		// Logged-in user - find by userId
		[cart] = await db.select()
			.from(tables.cart)
			.where(eq(tables.cart.userId, user.id));
	} else {
		// Guest user - use session ID from cookie or create new one
		let sessionId = event.cookies.get('cart-session');
		
		if (!sessionId) {
			sessionId = crypto.randomUUID();
			event.cookies.set('cart-session', sessionId, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		}
		
		[cart] = await db.select()
			.from(tables.cart)
			.where(eq(tables.cart.sessionId, sessionId));
	}
	
	// Create new cart if doesn't exist
	if (!cart) {
		const newCart = await db.insert(tables.cart).values({
			id: crypto.randomUUID(),
			sessionId: user ? null : event.cookies.get('cart-session'),
			userId: user?.id || null,
			items: JSON.stringify([]),
			subtotal: 0,
			total: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		}).returning();
		
		cart = newCart[0];
	}
	
	return cart;
}

// Helper to get existing cart only (for queries - doesn't set cookies)
async function getExistingCart() {
	const event = getRequestEvent();
	const user = event.locals.user;
	
	let cart;
	
	if (user) {
		// Logged-in user - find by userId
		[cart] = await db.select()
			.from(tables.cart)
			.where(eq(tables.cart.userId, user.id));
	} else {
		// Guest user - use existing session ID from cookie (don't create new one)
		const sessionId = event.cookies.get('cart-session');
		
		if (sessionId) {
			[cart] = await db.select()
				.from(tables.cart)
				.where(eq(tables.cart.sessionId, sessionId));
		}
	}
	
	return cart;
}

// Helper to calculate cart totals
function calculateCartTotals(items: CartItem[]) {
	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	const total = subtotal; // Add shipping, tax, discount later
	
	return { subtotal, total };
}

// Get current cart
export const getCart = query(async () => {
	const cart = await getExistingCart();
	
	// Return empty cart if no cart exists yet
	if (!cart) {
		return {
			id: null,
			items: [],
			subtotal: 0,
			total: 0
		};
	}
	
	const items = JSON.parse(cart.items);
	
	// Fetch product details for each item
	const itemsWithDetails = await Promise.all(
		items.map(async (item: CartItem) => {
			const [product] = await db.select()
				.from(tables.product)
				.where(eq(tables.product.id, item.productId));
			
			return {
				...item,
				product
			};
		})
	);
	
	return {
		...cart,
		items: itemsWithDetails
	};
});

// Add item to cart
export const addToCart = command(AddToCartSchema, async (data) => {
	const cart = await getOrCreateCart();
	const items = JSON.parse(cart.items);
	
	// Get product details
	const [product] = await db.select()
		.from(tables.product)
		.where(eq(tables.product.id, data.productId));
	
	if (!product) {
		throw new Error('Product not found');
	}
	
	// Check if product is active
	if (product.status !== 'active') {
		throw new Error('Product is not available');
	}
	
	// Check inventory
	if (product.trackInventory && product.quantity < data.quantity) {
		if (!product.allowBackorders) {
			throw new Error('Insufficient stock');
		}
	}
	
	// Check if item already in cart
	const existingItemIndex = items.findIndex((item: CartItem) => 
		item.productId === data.productId && item.variantId === data.variantId
	);
	
	if (existingItemIndex >= 0) {
		// Update quantity
		items[existingItemIndex].quantity += data.quantity;
	} else {
		// Add new item
		items.push({
			productId: data.productId,
			variantId: data.variantId || null,
			quantity: data.quantity,
			price: product.price,
			name: product.name,
			image: product.images ? JSON.parse(product.images)[0] : null
		});
	}
	
	// Recalculate totals
	const { subtotal, total } = calculateCartTotals(items);
	
	// Update cart
	await db.update(tables.cart)
		.set({
			items: JSON.stringify(items),
			subtotal,
			total,
			updatedAt: new Date()
		})
		.where(eq(tables.cart.id, cart.id));
	
	// Refresh cart query
	await getCart().refresh();
	
	return { success: true };
});

// Update cart item quantity
export const updateCartItem = command(UpdateCartItemSchema, async (data) => {
	const cart = await getOrCreateCart();
	let items = JSON.parse(cart.items);
	
	if (data.quantity === 0) {
		// Remove item
		items = items.filter((item: CartItem) => 
			!(item.productId === data.productId && item.variantId === data.variantId)
		);
	} else {
		// Update quantity
		const itemIndex = items.findIndex((item: CartItem) => 
			item.productId === data.productId && item.variantId === data.variantId
		);
		
		if (itemIndex >= 0) {
			// Get product to check inventory
			const [product] = await db.select()
				.from(tables.product)
				.where(eq(tables.product.id, data.productId));
			
			if (product && product.trackInventory && product.quantity < data.quantity) {
				if (!product.allowBackorders) {
					throw new Error('Insufficient stock');
				}
			}
			
			items[itemIndex].quantity = data.quantity;
		}
	}
	
	// Recalculate totals
	const { subtotal, total } = calculateCartTotals(items);
	
	// Update cart
	await db.update(tables.cart)
		.set({
			items: JSON.stringify(items),
			subtotal,
			total,
			updatedAt: new Date()
		})
		.where(eq(tables.cart.id, cart.id));
	
	// Refresh cart query
	await getCart().refresh();
	
	return { success: true };
});

// Remove item from cart
export const removeFromCart = command(RemoveFromCartSchema, async (data) => {
	const cart = await getOrCreateCart();
	let items = JSON.parse(cart.items);
	
	// Remove item
	items = items.filter((item: CartItem) => 
		!(item.productId === data.productId && item.variantId === data.variantId)
	);
	
	// Recalculate totals
	const { subtotal, total } = calculateCartTotals(items);
	
	// Update cart
	await db.update(tables.cart)
		.set({
			items: JSON.stringify(items),
			subtotal,
			total,
			updatedAt: new Date()
		})
		.where(eq(tables.cart.id, cart.id));
	
	// Refresh cart query
	await getCart().refresh();
	
	return { success: true };
});

// Clear entire cart
export const clearCart = command(v.object({}), async () => {
	const cart = await getOrCreateCart();
	
	await db.update(tables.cart)
		.set({
			items: JSON.stringify([]),
			subtotal: 0,
			total: 0,
			updatedAt: new Date()
		})
		.where(eq(tables.cart.id, cart.id));
	
	// Refresh cart query
	await getCart().refresh();
	
	return { success: true };
});

// Get cart item count
export const getCartItemCount = query(async () => {
	const cart = await getExistingCart();
	
	// Return 0 if no cart exists yet
	if (!cart) {
		return 0;
	}
	
	const items = JSON.parse(cart.items);
	
	const count = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
	
	return count;
});
