import type { PageServerLoad } from './$types';
import { generateSeoMeta, createWebsiteSchema, createOrganizationSchema } from '$lib/utils/seo';

export const load: PageServerLoad = async ({ url }) => {
	const baseUrl = url.origin;

	// Generate SEO metadata for homepage
	const seo = generateSeoMeta({
		title: 'E-commerce CMS - Online Store | Quality Products',
		description:
			'Discover our wide selection of quality products at competitive prices. Fast shipping, secure payment, and excellent customer service.',
		keywords:
			'online store, e-commerce, shopping, products, quality, affordable, fast shipping',
		image: '/og-image.jpg',
		imageAlt: 'E-commerce CMS Store',
		type: 'website',
		canonical: `${baseUrl}/`,
		noindex: false,
		nofollow: false,
		locale: 'uk_UA',
		alternateLocales: ['en_US']
	});

	// Create structured data for website search
	const websiteSchema = createWebsiteSchema('E-commerce CMS', '/search?q={search_term_string}', baseUrl);

	// Create organization schema
	const organizationSchema = createOrganizationSchema({
		name: 'E-commerce CMS',
		url: baseUrl,
		logo: `${baseUrl}/logo.png`,
		description: 'Your trusted online store for quality products',
		email: 'info@example.com',
		phone: '+380123456789',
		address: {
			street: '123 Business Street',
			city: 'Kyiv',
			region: 'Kyiv Oblast',
			postalCode: '01001',
			country: 'Ukraine'
		},
		socialProfiles: []
	});

	return {
		seo,
		structuredData: {
			website: websiteSchema,
			organization: organizationSchema
		}
	};
};
