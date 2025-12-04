/**
 * SEO Utilities for server-side SEO meta tag generation
 * These utilities help generate proper SEO data that can be used in load functions
 */

export interface SeoMeta {
	title: string;
	description: string;
	keywords?: string;
	image?: string;
	imageAlt?: string;
	type: 'website' | 'article' | 'product' | 'local_business';
	canonical?: string;
	noindex?: boolean;
	nofollow?: boolean;
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
	productPrice?: number;
	productCurrency?: string;
	productAvailability?: 'in stock' | 'out of stock' | 'preorder';
	productBrand?: string;
	// Additional SEO properties
	locale?: string;
	alternateLocales?: string[];
	structuredData?: Record<string, unknown>;
}

/**
 * Generate SEO meta tags for a page
 * This function can be used in +page.server.ts load functions
 */
export function generateSeoMeta(data: Partial<SeoMeta>): SeoMeta {
	return {
		title: data.title || 'E-commerce CMS',
		description: data.description || '',
		keywords: data.keywords || '',
		image: data.image || '',
		imageAlt: data.imageAlt || '',
		type: data.type || 'website',
		canonical: data.canonical,
		noindex: data.noindex ?? false,
		nofollow: data.nofollow ?? false,
		author: data.author,
		publishedTime: data.publishedTime,
		modifiedTime: data.modifiedTime,
		productPrice: data.productPrice,
		productCurrency: data.productCurrency || 'UAH',
		productAvailability: data.productAvailability,
		productBrand: data.productBrand,
		locale: data.locale || 'uk_UA',
		alternateLocales: data.alternateLocales || ['en_US'],
		structuredData: data.structuredData
	};
}

/**
 * Validate and truncate SEO title to 60 characters
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
	if (title.length <= maxLength) return title;
	return title.substring(0, maxLength).trim() + '...';
}

/**
 * Validate and truncate meta description to 160 characters
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
	if (description.length <= maxLength) return description;
	return description.substring(0, maxLength).trim() + '...';
}

/**
 * Generate a slug from a string (used for canonical URLs)
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Get OG image URL (ensure it's absolute)
 */
export function getOgImageUrl(image: string | undefined, baseUrl: string): string {
	if (!image) return '';
	if (image.startsWith('http')) return image;
	return `${baseUrl}${image}`;
}

/**
 * Format price for product schema
 */
export function formatPrice(cents: number): string {
	return (cents / 100).toFixed(2);
}

/**
 * Check if a page should be indexed based on its status or type
 */
export function shouldIndexPage(
	status?: string,
	isVisible?: boolean,
	customNoindex?: boolean
): boolean {
	if (customNoindex) return false;
	if (isVisible === false) return false;
	if (status && status !== 'published' && status !== 'active') return false;
	return true;
}

/**
 * Create canonical URL
 */
export function createCanonicalUrl(baseUrl: string, pathname: string): string {
	// Remove trailing slash for consistency, except for root
	const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
	return `${baseUrl}${cleanPath}`;
}

/**
 * Create breadcrumb structured data
 */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: `${baseUrl}${item.url}`
		}))
	};
}

/**
 * Create organization structured data
 */
export interface OrganizationData {
	name: string;
	logo?: string;
	url: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: {
		street: string;
		city: string;
		region: string;
		postalCode: string;
		country: string;
	};
	socialProfiles?: string[];
}

export function createOrganizationSchema(org: OrganizationData) {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: org.name,
		url: org.url,
		description: org.description || ''
	};

	if (org.logo) {
		schema.logo = org.logo;
	}

	if (org.email) {
		schema.email = org.email;
	}

	if (org.phone) {
		schema.telephone = org.phone;
	}

	if (org.address) {
		schema.address = {
			'@type': 'PostalAddress',
			streetAddress: org.address.street,
			addressLocality: org.address.city,
			addressRegion: org.address.region,
			postalCode: org.address.postalCode,
			addressCountry: org.address.country
		};
	}

	if (org.socialProfiles && org.socialProfiles.length > 0) {
		schema.sameAs = org.socialProfiles;
	}

	return schema;
}

/**
 * Create product structured data
 */
export interface ProductData {
	name: string;
	description?: string;
	image: string[];
	brand?: string;
	sku?: string;
	price: number;
	currency: string;
	availability: 'InStock' | 'OutOfStock' | 'PreOrder';
	condition?: string;
	rating?: {
		value: number;
		count: number;
	};
	url?: string;
}

export function createProductSchema(product: ProductData) {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.description || '',
		image: product.image,
		brand: {
			'@type': 'Brand',
			name: product.brand || 'Unknown Brand'
		},
		offers: {
			'@type': 'Offer',
			price: formatPrice(product.price),
			priceCurrency: product.currency,
			availability: `https://schema.org/${product.availability}`
		}
	};

	if (product.sku) {
		schema.sku = product.sku;
	}

	if (product.condition) {
		schema.condition = `https://schema.org/${product.condition}`;
	}

	if (product.rating) {
		schema.aggregateRating = {
			'@type': 'AggregateRating',
			ratingValue: product.rating.value,
			reviewCount: product.rating.count
		};
	}

	if (product.url) {
		schema.url = product.url;
	}

	return schema;
}

/**
 * Create FAQPage structured data
 */
export interface FAQItem {
	question: string;
	answer: string;
}

export function createFaqSchema(items: FAQItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	};
}

/**
 * Create LocalBusiness structured data
 */
export interface LocalBusinessData extends OrganizationData {
	businessType?: string;
	priceRange?: string;
	openingHoursSpecification?: Array<{
		dayOfWeek: string;
		opens: string;
		closes: string;
	}>;
}

export function createLocalBusinessSchema(business: LocalBusinessData) {
	const schema = createOrganizationSchema(business) as Record<string, unknown>;
	schema['@type'] = business.businessType || 'LocalBusiness';

	if (business.priceRange) {
		schema.priceRange = business.priceRange;
	}

	if (business.openingHoursSpecification) {
		schema.openingHoursSpecification = business.openingHoursSpecification.map((hours) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: hours.dayOfWeek,
			opens: hours.opens,
			closes: hours.closes
		}));
	}

	return schema;
}

/**
 * Create website search action structured data
 */
export function createWebsiteSchema(name: string, searchUrl: string, url: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: name,
		url: url,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${url}${searchUrl}`
			},
			query_input: 'required name=search_term_string'
		}
	};
}

/**
 * Create article/blog structured data
 */
export interface ArticleData {
	headline: string;
	description?: string;
	image?: string;
	author?: string;
	datePublished?: string;
	dateModified?: string;
	url?: string;
}

export function createArticleSchema(article: ArticleData) {
	const schema: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: article.headline,
		description: article.description || ''
	};

	if (article.image) {
		schema.image = article.image;
	}

	if (article.author) {
		schema.author = {
			'@type': 'Person',
			name: article.author
		};
	}

	if (article.datePublished) {
		schema.datePublished = article.datePublished;
	}

	if (article.dateModified) {
		schema.dateModified = article.dateModified;
	}

	if (article.url) {
		schema.url = article.url;
	}

	return schema;
}
