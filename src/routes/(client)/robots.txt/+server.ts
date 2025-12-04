import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = url.origin;

	const robotsTxt = `# Robots.txt for E-commerce CMS
# Generated dynamically for SEO best practices

# Default rules for all bots
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /checkout
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /auth
Disallow: /auth/
Disallow: /auth/reset-password
Disallow: /_app
Disallow: /.well-known

# Explicit bot rules for Google
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /checkout
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /auth

# Explicit bot rules for Bing
User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api
Disallow: /checkout
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /auth

# Crawl-delay for polite bots (allow 1 second between requests)
Crawl-delay: 1
Request-rate: 1/1s

# Block bad bots
User-agent: AhrefsBot
Disallow: /
Crawl-delay: 10

User-agent: SemrushBot
Disallow: /
Crawl-delay: 10

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: YandexBot
Disallow: /admin

User-agent: BaiduSpider
Disallow: /admin

# Sitemap reference
Sitemap: ${siteUrl}/sitemap.xml

# Allow search engines to crawl CSS and JS
User-agent: *
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, s-maxage=604800',
			'X-Robots-Tag': 'index, follow'
		}
	});
};
