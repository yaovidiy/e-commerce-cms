import type { PageServerLoad } from './$types';
import { generateSeoMeta, createBreadcrumbSchema } from '$lib/utils/seo';

export const load: PageServerLoad = async ({ url }) => {
	const baseUrl = url.origin;
	const categoryParam = url.searchParams.get('category');
	const brandParam = url.searchParams.get('brand');
	const searchParam = url.searchParams.get('search');

	let title = 'Products | E-commerce CMS';
	let description = 'Browse our complete selection of products.';
	let keywords = 'products, shop, online store, buy';

	if (categoryParam) {
		title = `${categoryParam} Products | E-commerce CMS`;
		description = `Shop all ${categoryParam} products at competitive prices.`;
		keywords = `${categoryParam}, products, shop`;
	}

	if (brandParam) {
		title = `${brandParam} Products | E-commerce CMS`;
		description = `Explore ${brandParam} products and find the best deals.`;
		keywords = `${brandParam}, products, brand`;
	}

	if (searchParam) {
		title = `Search Results: ${searchParam} | E-commerce CMS`;
		description = `Search results for "${searchParam}". Find exactly what you're looking for.`;
		keywords = `search, ${searchParam}, products`;
	}

	const seo = generateSeoMeta({
		title,
		description,
		keywords,
		image: '/og-image.jpg',
		imageAlt: 'Products',
		type: 'website',
		canonical: `${baseUrl}${url.pathname}${url.search}`,
		noindex: false,
		nofollow: false,
		locale: 'uk_UA',
		alternateLocales: ['en_US']
	});

	// Create breadcrumb structured data
	const breadcrumbs = [{ name: 'Home', url: '/' }, { name: 'Products', url: '/products' }];

	if (categoryParam) {
		breadcrumbs.push({
			name: categoryParam,
			url: `/products?category=${categoryParam}`
		});
	}

	if (brandParam) {
		breadcrumbs.push({
			name: brandParam,
			url: `/products?brand=${brandParam}`
		});
	}

	const breadcrumbSchema = createBreadcrumbSchema(breadcrumbs, baseUrl);

	return {
		seo,
		structuredData: {
			breadcrumb: breadcrumbSchema
		}
	};
};
