import { query, command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { AddToWishlistSchema, RemoveFromWishlistSchema, MoveToCartSchema } from '$lib/server/schemas';
import { eq, inArray } from 'drizzle-orm';
import * as auth from '$lib/server/auth';

// Helper function to get or create wishlist for a user
async function getOrCreateWishlist(userId: string) {
	const [wishlist] = await db
		.select()
		.from(tables.wishlist)
		.where(eq(tables.wishlist.userId, userId));

	if (wishlist) {
		return wishlist;
	}

	// Create new wishlist
	const [newWishlist] = await db
		.insert(tables.wishlist)
		.values({
			id: crypto.randomUUID(),
			userId,
			items: '[]',
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	return newWishlist;
}

// Query: Get user's wishlist with full product details
export const getWishlist = query(async () => {
	const user = auth.getUser();

	const wishlist = await getOrCreateWishlist(user.id);

	// Parse items array
	const productIds = JSON.parse(wishlist.items) as string[];

	if (productIds.length === 0) {
		return {
			id: wishlist.id,
			items: [],
			count: 0
		};
	}

	// Fetch full product details
	const products = await db
		.select({
			id: tables.product.id,
			name: tables.product.name,
			slug: tables.product.slug,
			price: tables.product.price,
			compareAtPrice: tables.product.compareAtPrice,
			images: tables.product.images,
			quantity: tables.product.quantity,
			status: tables.product.status
		})
		.from(tables.product)
		.where(inArray(tables.product.id, productIds));

	// Create a map for quick lookup
	const productMap = new Map(products.map((p) => [p.id, p]));

	// Build items array with product details in the order they were added
	const items = productIds
		.map((productId) => productMap.get(productId))
		.filter((product) => product !== undefined);

	return {
		id: wishlist.id,
		items,
		count: items.length
	};
});

// Query: Get wishlist count only (for header badge)
export const getWishlistCount = query(async () => {
	const event = getRequestEvent();

	if (!event?.locals?.user) {
		return 0;
	}

	const [wishlist] = await db
		.select()
		.from(tables.wishlist)
		.where(eq(tables.wishlist.userId, event.locals.user.id));

	if (!wishlist) {
		return 0;
	}

	const items = JSON.parse(wishlist.items) as string[];
	return items.length;
});

// Command: Add product to wishlist
export const addToWishlist = command(AddToWishlistSchema, async (data) => {
	const user = auth.getUser();

	const wishlist = await getOrCreateWishlist(user.id);

	// Parse existing items
	const items = JSON.parse(wishlist.items) as string[];

	// Check if product already in wishlist
	if (items.includes(data.productId)) {
		return {
			success: false,
			message: 'Product already in wishlist'
		};
	}

	// Add product to beginning of array (most recent first)
	const updatedItems = [data.productId, ...items];

	// Update wishlist
	await db
		.update(tables.wishlist)
		.set({
			items: JSON.stringify(updatedItems),
			updatedAt: new Date()
		})
		.where(eq(tables.wishlist.id, wishlist.id));

	// Refresh wishlist queries
	await getWishlist().refresh();
	await getWishlistCount().refresh();

	return {
		success: true,
		message: 'Product added to wishlist',
		count: updatedItems.length
	};
});

// Command: Remove product from wishlist
export const removeFromWishlist = command(RemoveFromWishlistSchema, async (data) => {
	const user = auth.getUser();

	const [wishlist] = await db
		.select()
		.from(tables.wishlist)
		.where(eq(tables.wishlist.userId, user.id));

	if (!wishlist) {
		return {
			success: false,
			message: 'Wishlist not found'
		};
	}

	// Parse existing items
	const items = JSON.parse(wishlist.items) as string[];

	// Remove product
	const updatedItems = items.filter((id) => id !== data.productId);

	// Update wishlist
	await db
		.update(tables.wishlist)
		.set({
			items: JSON.stringify(updatedItems),
			updatedAt: new Date()
		})
		.where(eq(tables.wishlist.id, wishlist.id));

	// Refresh wishlist queries
	await getWishlist().refresh();
	await getWishlistCount().refresh();

	return {
		success: true,
		message: 'Product removed from wishlist',
		count: updatedItems.length
	};
});

// Command: Clear entire wishlist
export const clearWishlist = command(async () => {
	const user = auth.getUser();

	const [wishlist] = await db
		.select()
		.from(tables.wishlist)
		.where(eq(tables.wishlist.userId, user.id));

	if (!wishlist) {
		return {
			success: false,
			message: 'Wishlist not found'
		};
	}

	// Clear items
	await db
		.update(tables.wishlist)
		.set({
			items: '[]',
			updatedAt: new Date()
		})
		.where(eq(tables.wishlist.id, wishlist.id));

	// Refresh wishlist queries
	await getWishlist().refresh();
	await getWishlistCount().refresh();

	return {
		success: true,
		message: 'Wishlist cleared'
	};
});

// Command: Move product from wishlist to cart
export const moveToCart = command(MoveToCartSchema, async (data) => {
	const user = auth.getUser();

	// Get wishlist
	const [wishlist] = await db
		.select()
		.from(tables.wishlist)
		.where(eq(tables.wishlist.userId, user.id));

	if (!wishlist) {
		return {
			success: false,
			message: 'Wishlist not found'
		};
	}

	// Get product details
	const [product] = await db
		.select()
		.from(tables.product)
		.where(eq(tables.product.id, data.productId));

	if (!product) {
		return {
			success: false,
			message: 'Product not found'
		};
	}

	// Check if product is available
	if (product.status !== 'active') {
		return {
			success: false,
			message: 'Product is not available'
		};
	}

	// Check stock
	if (product.quantity < data.quantity) {
		return {
			success: false,
			message: 'Not enough stock available'
		};
	}

	// Get or create cart
	const [cart] = await db
		.select()
		.from(tables.cart)
		.where(eq(tables.cart.userId, user.id));

	let cartId: string;

	if (!cart) {
		// Create new cart
		const [newCart] = await db
			.insert(tables.cart)
			.values({
				id: crypto.randomUUID(),
				userId: user.id,
				sessionId: null,
				items: JSON.stringify([
					{
						productId: product.id,
						quantity: data.quantity,
						price: product.price
					}
				]),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
		cartId = newCart.id;
	} else {
		// Add to existing cart
		const cartItems = JSON.parse(cart.items) as Array<{
			productId: string;
			quantity: number;
			price: number;
		}>;

		// Check if product already in cart
		const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id);

		if (existingItemIndex >= 0) {
			// Update quantity
			cartItems[existingItemIndex].quantity += data.quantity;
		} else {
			// Add new item
			cartItems.push({
				productId: product.id,
				quantity: data.quantity,
				price: product.price
			});
		}

		// Update cart
		await db
			.update(tables.cart)
			.set({
				items: JSON.stringify(cartItems),
				updatedAt: new Date()
			})
			.where(eq(tables.cart.id, cart.id));

		cartId = cart.id;
	}

	// Remove product from wishlist
	const wishlistItems = JSON.parse(wishlist.items) as string[];
	const updatedWishlistItems = wishlistItems.filter((id) => id !== data.productId);

	await db
		.update(tables.wishlist)
		.set({
			items: JSON.stringify(updatedWishlistItems),
			updatedAt: new Date()
		})
		.where(eq(tables.wishlist.id, wishlist.id));

	// Refresh queries
	await getWishlist().refresh();
	await getWishlistCount().refresh();

	return {
		success: true,
		message: 'Product moved to cart',
		cartId
	};
});
