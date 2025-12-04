import type { PageServerLoad } from './$types';
import { generateSeoMeta, createProductSchema, createBreadcrumbSchema } from '$lib/utils/seo';
import { getProductBySlug } from '$lib/remotes/product.remote';

export const load: PageServerLoad = async ({ url, params }) => {
	const baseUrl = url.origin;
	const { slug } = params;

	// Fetch product data
	const product = await getProductBySlug(slug);

	if (!product) {
		return {
			seo: generateSeoMeta({
				title: 'Product Not Found',
				description: 'The product you are looking for does not exist.',
				noindex: true,
				type: 'website'
			})
		};
	}

	// Parse images if available
	let images: string[] = [];
	try {
		if (product.images) {
			const imageIds = JSON.parse(product.images);
			images = imageIds.map((id: string) => `/api/assets/${id}`);
		}
	} catch (e) {
		console.warn('Failed to parse product images:', e);
	}

	// Generate SEO metadata for product page
	const seo = generateSeoMeta({
		title: `${product.name} | E-commerce CMS`,
		description: product.description
			? product.description.substring(0, 160)
			: `Buy ${product.name} at competitive prices.`,
		keywords: `${product.name}, buy online, shop, products`,
		image: images[0] || '/og-image.jpg',
		imageAlt: product.name,
		type: 'product',
		canonical: `${baseUrl}/products/${slug}`,
		noindex: false,
		nofollow: false,
		productPrice: product.price,
		productCurrency: 'UAH',
		productAvailability: product.trackInventory && product.quantity === 0 ? 'out of stock' : 'in stock',
		productBrand: product.brand?.name || 'E-commerce CMS'
	});

	// Create product structured data
	const productSchema = createProductSchema({
		name: product.name,
		description: product.description || '',
		image: images.length > 0 ? images : [`${baseUrl}/og-image.jpg`],
		brand: product.brand?.name || 'E-commerce CMS',
		sku: product.sku || undefined,
		price: product.price,
		currency: 'UAH',
		availability: product.trackInventory && product.quantity === 0 ? 'OutOfStock' : 'InStock',
		url: `${baseUrl}/products/${slug}`
	});

	// Create breadcrumb structured data
	const breadcrumbs = [
		{ name: 'Home', url: '/' },
		{ name: 'Products', url: '/products' }
	];

	if (product.category?.slug) {
		breadcrumbs.push({
			name: product.category.name,
			url: `/products?category=${product.category.slug}`
		});
	}

	breadcrumbs.push({
		name: product.name,
		url: `/products/${slug}`
	});

	const breadcrumbSchema = createBreadcrumbSchema(breadcrumbs, baseUrl);

	return {
		product,
		seo,
		structuredData: {
			product: productSchema,
			breadcrumb: breadcrumbSchema
		}
	};
};
