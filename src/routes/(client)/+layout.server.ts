import type { LayoutServerLoad } from './$types';
import { getPublicSettings } from '$lib/remotes/settings.remote';
import type { SeoMeta } from '$lib/utils/seo';

export const load: LayoutServerLoad = async () => {
	try {
		const settings = await getPublicSettings();

		// Default SEO metadata from settings
		const defaultSeo: SeoMeta = {
			title: settings?.seoDefaultTitle || 'E-commerce CMS - Your Online Store',
			description: settings?.seoDefaultDescription || 'Quality products at competitive prices',
			keywords: 'e-commerce, online shopping, products',
			image: settings?.seoDefaultOgImage || '/og-image.jpg',
			imageAlt: 'Store Logo',
			type: 'website',
			locale: 'uk_UA',
			alternateLocales: ['en_US'],
			noindex: false,
			nofollow: false
		};

		return {
			settings,
			defaultSeo
		};
	} catch (error) {
		console.error('Failed to load public settings:', error);
		// Return default SEO if settings fail to load
		return {
			settings: null,
			defaultSeo: {
				title: 'E-commerce CMS - Your Online Store',
				description: 'Quality products at competitive prices',
				keywords: 'e-commerce, online shopping, products',
				image: '/og-image.jpg',
				imageAlt: 'Store Logo',
				type: 'website',
				locale: 'uk_UA',
				alternateLocales: ['en_US'],
				noindex: false,
				nofollow: false
			}
		};
	}
};
