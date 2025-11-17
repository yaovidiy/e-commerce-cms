import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = url.origin;

	const robotsTxt = `# Robots.txt for E-commerce CMS
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /checkout
Disallow: /dashboard
Disallow: /auth/reset-password

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /

User-agent: dotbot
Disallow: /
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
		}
	});
};
