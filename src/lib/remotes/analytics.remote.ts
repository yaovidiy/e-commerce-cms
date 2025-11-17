import { query } from '$app/server';
import { db, rawDb } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { requireAdminUser } from '$lib/server/auth';
import { eq, sql, and } from 'drizzle-orm';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface DashboardStats {
	revenue: { value: number; change: number; trend: 'up' | 'down' };
	orders: { value: number; change: number; trend: 'up' | 'down' };
	products: { value: number };
	customers: { value: number };
}

let dashboardStatsCache: {
	data: DashboardStats;
	timestamp: number;
} | null = null;

// Get dashboard overview statistics
export const getDashboardStats = query(async () => {
	requireAdminUser();

	// Check cache
	const cacheTime = Date.now();
	if (dashboardStatsCache && cacheTime - dashboardStatsCache.timestamp < CACHE_TTL) {
		return dashboardStatsCache.data;
	}

	const now = Date.now();
	const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000;
	const sixtyDaysAgoMs = now - 60 * 24 * 60 * 60 * 1000;

	// Total revenue (last 30 days)
	const revenueResult = await db
		.select({
			total: sql<number>`COALESCE(SUM(${tables.order.total}), 0)`
		})
		.from(tables.order)
		.where(
			and(
				sql`${tables.order.createdAt} >= ${thirtyDaysAgoMs}`,
				sql`${tables.order.status} NOT IN ('cancelled', 'refunded')`
			)
		);

	// Previous period revenue (30-60 days ago)
	const prevRevenueResult = await db
		.select({
			total: sql<number>`COALESCE(SUM(${tables.order.total}), 0)`
		})
		.from(tables.order)
		.where(
			and(
				sql`${tables.order.createdAt} >= ${sixtyDaysAgoMs}`,
				sql`${tables.order.createdAt} < ${thirtyDaysAgoMs}`,
				sql`${tables.order.status} NOT IN ('cancelled', 'refunded')`
			)
		);

	// Total orders (last 30 days)
	const ordersResult = await db
		.select({
			count: sql<number>`COUNT(*)`
		})
		.from(tables.order)
		.where(sql`${tables.order.createdAt} >= ${thirtyDaysAgoMs}`);

	// Previous period orders
	const prevOrdersResult = await db
		.select({
			count: sql<number>`COUNT(*)`
		})
		.from(tables.order)
		.where(
			and(
				sql`${tables.order.createdAt} >= ${sixtyDaysAgoMs}`,
				sql`${tables.order.createdAt} < ${thirtyDaysAgoMs}`
			)
		);

	// Total products
	const productsResult = await db
		.select({
			count: sql<number>`COUNT(*)`
		})
		.from(tables.product)
		.where(eq(tables.product.status, 'active'));

	// Total customers (users who have placed orders)
	const customersResult = await db
		.select({
			count: sql<number>`COUNT(DISTINCT ${tables.order.customerEmail})`
		})
		.from(tables.order);

	const currentRevenue = revenueResult[0]?.total || 0;
	const previousRevenue = prevRevenueResult[0]?.total || 0;
	const revenueChange =
		previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

	const currentOrders = ordersResult[0]?.count || 0;
	const previousOrders = prevOrdersResult[0]?.count || 0;
	const ordersChange =
		previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

	const result: DashboardStats = {
		revenue: {
			value: currentRevenue,
			change: revenueChange,
			trend: revenueChange >= 0 ? 'up' : 'down'
		},
		orders: {
			value: currentOrders,
			change: ordersChange,
			trend: ordersChange >= 0 ? 'up' : 'down'
		},
		products: {
			value: productsResult[0]?.count || 0
		},
		customers: {
			value: customersResult[0]?.count || 0
		}
	};

	// Update cache
	dashboardStatsCache = {
		data: result,
		timestamp: Date.now()
	};

	return result;
});

// Get revenue chart data
export const getRevenueChart = query(async () => {
	requireAdminUser();

	const days = 30;
	const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

	// Use raw SQL for date grouping
	const results = rawDb
		.prepare(
			`
		SELECT 
			DATE(created_at / 1000, 'unixepoch') as date,
			SUM(total) as revenue,
			COUNT(*) as orders
		FROM "order"
		WHERE created_at >= ?
			AND status NOT IN ('cancelled', 'refunded')
		GROUP BY DATE(created_at / 1000, 'unixepoch')
		ORDER BY date ASC
	`
		)
		.all(daysAgo.getTime()) as { date: string; revenue: number; orders: number }[];

	return results;
});

// Get top selling products
export const getTopProducts = query(async ({ limit = 5 }: { limit?: number } = {}) => {
	requireAdminUser();

	const results = rawDb
		.prepare(
			`
		SELECT 
			p.id,
			p.name,
			p.slug,
			p.price,
			p.images,
			SUM(oi.quantity) as total_sold,
			SUM(oi.subtotal) as total_revenue
		FROM order_item oi
		JOIN product p ON oi.product_id = p.id
		JOIN "order" o ON oi.order_id = o.id
		WHERE o.status NOT IN ('cancelled', 'refunded')
		GROUP BY p.id, p.name, p.slug, p.price, p.images
		ORDER BY total_sold DESC
		LIMIT ?
	`
		)
		.all(limit);

	return results;
});

// Get top categories
export const getTopCategories = query(async ({ limit = 5 }: { limit?: number } = {}) => {
	requireAdminUser();

	const results = rawDb
		.prepare(
			`
		SELECT 
			c.id,
			c.name,
			c.slug,
			COUNT(DISTINCT p.id) as product_count,
			COALESCE(SUM(oi.quantity), 0) as total_sold,
			COALESCE(SUM(oi.subtotal), 0) as total_revenue
		FROM category c
		JOIN product p ON p.category_id = c.id
		LEFT JOIN order_item oi ON oi.product_id = p.id
		LEFT JOIN "order" o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'refunded')
		WHERE c.is_visible = 1
		GROUP BY c.id, c.name, c.slug
		ORDER BY total_sold DESC
		LIMIT ?
	`
		)
		.all(limit);

	return results;
});

// Get recent orders
export const getRecentOrders = query(async ({ limit = 10 }: { limit?: number } = {}) => {
	requireAdminUser();

	const orders = await db
		.select({
			id: tables.order.id,
			orderNumber: tables.order.orderNumber,
			total: tables.order.total,
			status: tables.order.status,
			customerName: sql<string>`${tables.order.customerFirstName} || ' ' || ${tables.order.customerLastName}`,
			email: tables.order.customerEmail,
			createdAt: tables.order.createdAt
		})
		.from(tables.order)
		.orderBy(sql`${tables.order.createdAt} DESC`)
		.limit(limit);

	return orders;
});

// Get order status distribution
export const getOrderStatusDistribution = query(async () => {
	requireAdminUser();

	const results = await db
		.select({
			status: tables.order.status,
			count: sql<number>`COUNT(*)`
		})
		.from(tables.order)
		.groupBy(tables.order.status);

	return results;
});
