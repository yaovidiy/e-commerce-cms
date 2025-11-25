import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = url.origin;

	// Fetch all active products
	const products = await db
		.select({
			slug: tables.product.slug,
			updatedAt: tables.product.updatedAt
		})
		.from(tables.product)
		.where(eq(tables.product.status, 'active'));

	// Fetch all visible categories
	const categories = await db
		.select({
			slug: tables.category.slug,
			updatedAt: tables.category.updatedAt
		})
		.from(tables.category)
		.where(eq(tables.category.isVisible, true));

	// Fetch all visible brands
	const brands = await db
		.select({
			slug: tables.brand.slug,
			updatedAt: tables.brand.updatedAt
		})
		.from(tables.brand)
		.where(eq(tables.brand.isVisible, true));

	// Fetch all published pages
	const pages = await db
		.select({
			slug: tables.page.slug,
			updatedAt: tables.page.updatedAt
		})
		.from(tables.page)
		.where(eq(tables.page.status, 'published'));

	// Fetch all published blog posts
	const posts = await db
		.select({
			slug: tables.blog.slug,
			createdAt: tables.blog.createdAt
		})
		.from(tables.blog);

	// Static pages
	const staticPages = [
		{ url: '', priority: '1.0', changefreq: 'daily' },
		{ url: '/products', priority: '0.9', changefreq: 'daily' },
		{ url: '/auth/login', priority: '0.5', changefreq: 'monthly' },
		{ url: '/auth/signup', priority: '0.5', changefreq: 'monthly' },
		{ url: '/checkout', priority: '0.7', changefreq: 'weekly' }
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPages
	.map(
		(page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
${products
	.map(
		(product) => `  <url>
    <loc>${siteUrl}/products/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
${categories
	.map(
		(category) => `  <url>
    <loc>${siteUrl}/products?category=${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
${brands
	.map(
		(brand) => `  <url>
    <loc>${siteUrl}/products?brand=${brand.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${brand.updatedAt.toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
${pages
	.map(
		(page) => `  <url>
    <loc>${siteUrl}/pages/${page.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
${posts
	.map(
		(post) => `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <lastmod>${post.createdAt.toISOString()}</lastmod>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
};
