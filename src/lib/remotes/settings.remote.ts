import { command, form, query } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import {
	DeleteSettingSchema,
	GetSettingSchema,
	GetSettingsByCategorySchema,
	UpdateAdvancedSettingsSchema,
	UpdateCheckoutSettingsSchema,
	UpdateEmailConfigSettingsSchema,
	UpdateGeneralSettingsSchema,
	UpdateMultipleSettingsSchema,
	UpdateSeoSettingsSchema,
	UpdateSettingSchema,
	UpdateStoreInfoSettingsSchema
} from '$lib/server/schemas';
import { eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';
import { requireAdminUser } from '$lib/server/auth';

// Types
type SettingType = 'string' | 'number' | 'boolean' | 'json';
type SettingCategory = 'general' | 'store' | 'checkout' | 'email' | 'seo' | 'advanced';

interface SettingDefinition {
	key: string;
	value: string;
	type: SettingType;
	category: SettingCategory;
	label: string;
	description?: string;
}

// Default settings configuration
const DEFAULT_SETTINGS: SettingDefinition[] = [
	// General Settings
	{
		key: 'store_name',
		value: 'My E-commerce Store',
		type: 'string',
		category: 'general',
		label: 'Store Name',
		description: 'The name of your store displayed across the site'
	},
	{
		key: 'store_logo',
		value: '',
		type: 'string',
		category: 'general',
		label: 'Store Logo',
		description: 'Your store logo (upload an image)'
	},
	{
		key: 'store_favicon',
		value: '',
		type: 'string',
		category: 'general',
		label: 'Favicon',
		description: 'Your site favicon (16x16 or 32x32 PNG)'
	},
	{
		key: 'store_email',
		value: 'contact@example.com',
		type: 'string',
		category: 'general',
		label: 'Store Email',
		description: 'Primary contact email for your store'
	},
	{
		key: 'store_phone',
		value: '',
		type: 'string',
		category: 'general',
		label: 'Store Phone',
		description: 'Primary contact phone number'
	},
	{
		key: 'timezone',
		value: 'UTC',
		type: 'string',
		category: 'general',
		label: 'Timezone',
		description: 'Store timezone for orders and dates'
	},
	{
		key: 'currency',
		value: 'USD',
		type: 'string',
		category: 'general',
		label: 'Currency Code',
		description: 'Currency code (e.g., USD, EUR, GBP)'
	},
	{
		key: 'currency_symbol',
		value: '$',
		type: 'string',
		category: 'general',
		label: 'Currency Symbol',
		description: 'Currency symbol to display'
	},
	{
		key: 'default_language',
		value: 'en',
		type: 'string',
		category: 'general',
		label: 'Default Language',
		description: 'Default language for the store'
	},

	// Store Info Settings
	{
		key: 'store_address_1',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Address Line 1',
		description: 'Street address'
	},
	{
		key: 'store_address_2',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Address Line 2',
		description: 'Apartment, suite, etc.'
	},
	{
		key: 'store_city',
		value: '',
		type: 'string',
		category: 'store',
		label: 'City'
	},
	{
		key: 'store_state',
		value: '',
		type: 'string',
		category: 'store',
		label: 'State/Province'
	},
	{
		key: 'store_postal_code',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Postal Code'
	},
	{
		key: 'store_country',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Country'
	},
	{
		key: 'facebook_url',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Facebook URL',
		description: 'Your Facebook page URL'
	},
	{
		key: 'instagram_url',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Instagram URL',
		description: 'Your Instagram profile URL'
	},
	{
		key: 'twitter_url',
		value: '',
		type: 'string',
		category: 'store',
		label: 'Twitter/X URL',
		description: 'Your Twitter/X profile URL'
	},
	{
		key: 'youtube_url',
		value: '',
		type: 'string',
		category: 'store',
		label: 'YouTube URL',
		description: 'Your YouTube channel URL'
	},
	{
		key: 'linkedin_url',
		value: '',
		type: 'string',
		category: 'store',
		label: 'LinkedIn URL',
		description: 'Your LinkedIn page URL'
	},

	// Checkout Settings
	{
		key: 'enable_guest_checkout',
		value: 'true',
		type: 'boolean',
		category: 'checkout',
		label: 'Enable Guest Checkout',
		description: 'Allow customers to checkout without creating an account'
	},
	{
		key: 'require_phone_number',
		value: 'false',
		type: 'boolean',
		category: 'checkout',
		label: 'Require Phone Number',
		description: 'Make phone number required at checkout'
	},
	{
		key: 'enable_order_notes',
		value: 'true',
		type: 'boolean',
		category: 'checkout',
		label: 'Enable Order Notes',
		description: 'Allow customers to add notes to their order'
	},
	{
		key: 'terms_and_conditions_url',
		value: '',
		type: 'string',
		category: 'checkout',
		label: 'Terms & Conditions URL',
		description: 'Link to your terms and conditions page'
	},
	{
		key: 'privacy_policy_url',
		value: '',
		type: 'string',
		category: 'checkout',
		label: 'Privacy Policy URL',
		description: 'Link to your privacy policy page'
	},
	{
		key: 'return_policy_url',
		value: '',
		type: 'string',
		category: 'checkout',
		label: 'Return Policy URL',
		description: 'Link to your return policy page'
	},
	{
		key: 'enable_newsletter_signup',
		value: 'true',
		type: 'boolean',
		category: 'checkout',
		label: 'Enable Newsletter Signup',
		description: 'Show newsletter signup checkbox at checkout'
	},

	// Email Settings
	{
		key: 'email_smtp_host',
		value: '',
		type: 'string',
		category: 'email',
		label: 'SMTP Host',
		description: 'SMTP server hostname'
	},
	{
		key: 'email_smtp_port',
		value: '587',
		type: 'number',
		category: 'email',
		label: 'SMTP Port',
		description: 'SMTP server port (usually 587 or 465)'
	},
	{
		key: 'email_smtp_username',
		value: '',
		type: 'string',
		category: 'email',
		label: 'SMTP Username',
		description: 'SMTP authentication username'
	},
	{
		key: 'email_smtp_password',
		value: '',
		type: 'string',
		category: 'email',
		label: 'SMTP Password',
		description: 'SMTP authentication password'
	},
	{
		key: 'email_smtp_secure',
		value: 'true',
		type: 'boolean',
		category: 'email',
		label: 'Use SSL/TLS',
		description: 'Use secure connection for SMTP'
	},
	{
		key: 'email_from_name',
		value: 'My Store',
		type: 'string',
		category: 'email',
		label: 'From Name',
		description: 'Sender name for outgoing emails'
	},
	{
		key: 'email_from_address',
		value: 'noreply@example.com',
		type: 'string',
		category: 'email',
		label: 'From Email Address',
		description: 'Sender email address for outgoing emails'
	},
	{
		key: 'email_reply_to_address',
		value: '',
		type: 'string',
		category: 'email',
		label: 'Reply-To Address',
		description: 'Reply-to email address'
	},

	// SEO Settings
	{
		key: 'seo_default_title',
		value: 'My E-commerce Store',
		type: 'string',
		category: 'seo',
		label: 'Default Page Title',
		description: 'Default title for pages without a specific title'
	},
	{
		key: 'seo_default_description',
		value: 'Shop the best products online',
		type: 'string',
		category: 'seo',
		label: 'Default Meta Description',
		description: 'Default meta description for pages'
	},
	{
		key: 'seo_default_keywords',
		value: '',
		type: 'string',
		category: 'seo',
		label: 'Default Keywords',
		description: 'Comma-separated default keywords'
	},
	{
		key: 'seo_default_og_image',
		value: '',
		type: 'string',
		category: 'seo',
		label: 'Default OG Image',
		description: 'Default Open Graph image for social sharing'
	},
	{
		key: 'seo_google_analytics_id',
		value: '',
		type: 'string',
		category: 'seo',
		label: 'Google Analytics ID',
		description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX)'
	},
	{
		key: 'seo_google_search_console_id',
		value: '',
		type: 'string',
		category: 'seo',
		label: 'Google Search Console ID',
		description: 'Google Search Console verification ID'
	},
	{
		key: 'seo_facebook_pixel_id',
		value: '',
		type: 'string',
		category: 'seo',
		label: 'Facebook Pixel ID',
		description: 'Facebook Pixel tracking ID'
	},
	{
		key: 'enable_structured_data',
		value: 'true',
		type: 'boolean',
		category: 'seo',
		label: 'Enable Structured Data',
		description: 'Enable JSON-LD structured data for SEO'
	},
	{
		key: 'enable_sitemap',
		value: 'true',
		type: 'boolean',
		category: 'seo',
		label: 'Enable Sitemap',
		description: 'Enable automatic sitemap generation'
	},

	// Advanced Settings
	{
		key: 'maintenance_mode',
		value: 'false',
		type: 'boolean',
		category: 'advanced',
		label: 'Maintenance Mode',
		description: 'Put the site in maintenance mode'
	},
	{
		key: 'maintenance_message',
		value: 'We are currently performing maintenance. Please check back soon.',
		type: 'string',
		category: 'advanced',
		label: 'Maintenance Message',
		description: 'Message to display when in maintenance mode'
	},
	{
		key: 'custom_head_scripts',
		value: '',
		type: 'string',
		category: 'advanced',
		label: 'Custom Head Scripts',
		description: 'Custom HTML/JS to inject in <head>'
	},
	{
		key: 'custom_body_scripts',
		value: '',
		type: 'string',
		category: 'advanced',
		label: 'Custom Body Scripts',
		description: 'Custom HTML/JS to inject before </body>'
	},
	{
		key: 'enable_debug_mode',
		value: 'false',
		type: 'boolean',
		category: 'advanced',
		label: 'Debug Mode',
		description: 'Enable debug mode for troubleshooting'
	},
	{
		key: 'enable_caching',
		value: 'true',
		type: 'boolean',
		category: 'advanced',
		label: 'Enable Caching',
		description: 'Enable server-side caching'
	},
	{
		key: 'cache_duration',
		value: '3600',
		type: 'number',
		category: 'advanced',
		label: 'Cache Duration (seconds)',
		description: 'How long to cache responses (in seconds)'
	}
];

// Helper to parse setting value based on type
function parseSettingValue(value: string, type: SettingType): unknown {
	switch (type) {
		case 'number':
			return Number(value);
		case 'boolean':
			return value === 'true' || value === '1';
		case 'json':
			try {
				return JSON.parse(value);
			} catch {
				return null;
			}
		case 'string':
		default:
			return value;
	}
}

// Helper to stringify setting value
function stringifySettingValue(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return value.toString();
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return JSON.stringify(value);
}

/**
 * Get all settings
 */
export const getAllSettings = query(async () => {
	requireAdminUser();

	const settings = await db.select().from(tables.siteSetting);

	// Parse values based on type
	return settings.map((setting) => ({
		...setting,
		parsedValue: parseSettingValue(setting.value, setting.type as SettingType)
	}));
});

/**
 * Get a single setting by key
 */
export const getSetting = query(GetSettingSchema, async (data) => {
	const [setting] = await db
		.select()
		.from(tables.siteSetting)
		.where(eq(tables.siteSetting.key, data.key));

	if (!setting) {
		return null;
	}

	return {
		...setting,
		parsedValue: parseSettingValue(setting.value, setting.type as SettingType)
	};
});

/**
 * Get settings by category
 */
export const getSettingsByCategory = query(GetSettingsByCategorySchema, async (data) => {
	requireAdminUser();

	const settings = await db
		.select()
		.from(tables.siteSetting)
		.where(eq(tables.siteSetting.category, data.category));

	return settings.map((setting) => ({
		...setting,
		parsedValue: parseSettingValue(setting.value, setting.type as SettingType)
	}));
});

/**
 * Update a single setting
 */
export const updateSetting = form(UpdateSettingSchema, async (data) => {
	requireAdminUser();

	// Check if setting exists
	const [existing] = await db
		.select()
		.from(tables.siteSetting)
		.where(eq(tables.siteSetting.key, data.key));

	if (existing) {
		// Update existing setting
		const [updated] = await db
			.update(tables.siteSetting)
			.set({
				value: data.value,
				...(data.type && { type: data.type }),
				...(data.category && { category: data.category }),
				...(data.label && { label: data.label }),
				...(data.description && { description: data.description }),
				updatedAt: new Date()
			})
			.where(eq(tables.siteSetting.key, data.key))
			.returning();

		await getAllSettings().refresh();
		return updated;
	} else {
		// Create new setting
		const [created] = await db
			.insert(tables.siteSetting)
			.values({
				key: data.key,
				value: data.value,
				type: data.type || 'string',
				category: data.category || 'general',
				label: data.label,
				description: data.description,
				updatedAt: new Date()
			})
			.returning();

		await getAllSettings().refresh();
		return created;
	}
});

/**
 * Helper function to update multiple settings (internal use)
 */
async function updateMultipleSettingsHelper(
	settings: Array<{ key: string; value: string }>
): Promise<{ success: boolean; updated: number; created: number }> {
	// Get all keys we're updating
	const keys = settings.map((s) => s.key);

	// Get existing settings
	const existingSettings = await db
		.select()
		.from(tables.siteSetting)
		.where(inArray(tables.siteSetting.key, keys));

	const existingKeys = new Set(existingSettings.map((s) => s.key));

	// Separate into updates and inserts
	const updates = settings.filter((s) => existingKeys.has(s.key));
	const inserts = settings.filter((s) => !existingKeys.has(s.key));

	// Perform updates
	for (const setting of updates) {
		await db
			.update(tables.siteSetting)
			.set({
				value: setting.value,
				updatedAt: new Date()
			})
			.where(eq(tables.siteSetting.key, setting.key));
	}

	// Perform inserts
	if (inserts.length > 0) {
		await db.insert(tables.siteSetting).values(
			inserts.map((s) => ({
				key: s.key,
				value: s.value,
				type: 'string' as const,
				category: 'general' as const,
				updatedAt: new Date()
			}))
		);
	}

	await getAllSettings().refresh();

	return { success: true, updated: updates.length, created: inserts.length };
}

/**
 * Update multiple settings at once
 */
export const updateMultipleSettings = form(UpdateMultipleSettingsSchema, async (data) => {
	requireAdminUser();
	return await updateMultipleSettingsHelper(data.settings);
});

/**
 * Delete a setting
 */
export const deleteSetting = form(DeleteSettingSchema, async (data) => {
	requireAdminUser();

	await db.delete(tables.siteSetting).where(eq(tables.siteSetting.key, data.key));

	await getAllSettings().refresh();

	return { success: true };
});

/**
 * Initialize default settings (run once on setup)
 */
export const initializeDefaultSettings = command(v.object({}), async () => {
	requireAdminUser();

	// Check if settings already exist
	const existingSettings = await db.select().from(tables.siteSetting);

	if (existingSettings.length > 0) {
		return {
			success: false,
			message: 'Settings already initialized',
			count: existingSettings.length
		};
	}

	// Insert all default settings
	await db.insert(tables.siteSetting).values(
		DEFAULT_SETTINGS.map((setting) => ({
			...setting,
			updatedAt: new Date()
		}))
	);

	await getAllSettings().refresh();

	return {
		success: true,
		message: 'Default settings initialized',
		count: DEFAULT_SETTINGS.length
	};
});

/**
 * Update general settings
 */
export const updateGeneralSettings = form(UpdateGeneralSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.storeName !== undefined) {
		settingsToUpdate.push({ key: 'store_name', value: data.storeName });
	}
	if (data.storeLogo !== undefined) {
		settingsToUpdate.push({ key: 'store_logo', value: data.storeLogo });
	}
	if (data.storeFavicon !== undefined) {
		settingsToUpdate.push({ key: 'store_favicon', value: data.storeFavicon });
	}
	if (data.storeEmail !== undefined) {
		settingsToUpdate.push({ key: 'store_email', value: data.storeEmail });
	}
	if (data.storePhone !== undefined) {
		settingsToUpdate.push({ key: 'store_phone', value: data.storePhone });
	}
	if (data.timezone !== undefined) {
		settingsToUpdate.push({ key: 'timezone', value: data.timezone });
	}
	if (data.currency !== undefined) {
		settingsToUpdate.push({ key: 'currency', value: data.currency });
	}
	if (data.currencySymbol !== undefined) {
		settingsToUpdate.push({ key: 'currency_symbol', value: data.currencySymbol });
	}
	if (data.defaultLanguage !== undefined) {
		settingsToUpdate.push({ key: 'default_language', value: data.defaultLanguage });
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});

/**
 * Update store info settings
 */
export const updateStoreInfoSettings = form(UpdateStoreInfoSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.storeAddress1 !== undefined) {
		settingsToUpdate.push({ key: 'store_address_1', value: data.storeAddress1 });
	}
	if (data.storeAddress2 !== undefined) {
		settingsToUpdate.push({ key: 'store_address_2', value: data.storeAddress2 });
	}
	if (data.storeCity !== undefined) {
		settingsToUpdate.push({ key: 'store_city', value: data.storeCity });
	}
	if (data.storeState !== undefined) {
		settingsToUpdate.push({ key: 'store_state', value: data.storeState });
	}
	if (data.storePostalCode !== undefined) {
		settingsToUpdate.push({ key: 'store_postal_code', value: data.storePostalCode });
	}
	if (data.storeCountry !== undefined) {
		settingsToUpdate.push({ key: 'store_country', value: data.storeCountry });
	}
	if (data.facebookUrl !== undefined) {
		settingsToUpdate.push({ key: 'facebook_url', value: data.facebookUrl });
	}
	if (data.instagramUrl !== undefined) {
		settingsToUpdate.push({ key: 'instagram_url', value: data.instagramUrl });
	}
	if (data.twitterUrl !== undefined) {
		settingsToUpdate.push({ key: 'twitter_url', value: data.twitterUrl });
	}
	if (data.youtubeUrl !== undefined) {
		settingsToUpdate.push({ key: 'youtube_url', value: data.youtubeUrl });
	}
	if (data.linkedinUrl !== undefined) {
		settingsToUpdate.push({ key: 'linkedin_url', value: data.linkedinUrl });
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});

/**
 * Update SEO settings
 */
export const updateSeoSettings = form(UpdateSeoSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.seoDefaultTitle !== undefined) {
		settingsToUpdate.push({ key: 'seo_default_title', value: data.seoDefaultTitle });
	}
	if (data.seoDefaultDescription !== undefined) {
		settingsToUpdate.push({ key: 'seo_default_description', value: data.seoDefaultDescription });
	}
	if (data.seoDefaultKeywords !== undefined) {
		settingsToUpdate.push({ key: 'seo_default_keywords', value: data.seoDefaultKeywords });
	}
	if (data.seoDefaultOgImage !== undefined) {
		settingsToUpdate.push({ key: 'seo_default_og_image', value: data.seoDefaultOgImage });
	}
	if (data.seoGoogleAnalyticsId !== undefined) {
		settingsToUpdate.push({ key: 'seo_google_analytics_id', value: data.seoGoogleAnalyticsId });
	}
	if (data.seoGoogleSearchConsoleId !== undefined) {
		settingsToUpdate.push({
			key: 'seo_google_search_console_id',
			value: data.seoGoogleSearchConsoleId
		});
	}
	if (data.seoFacebookPixelId !== undefined) {
		settingsToUpdate.push({ key: 'seo_facebook_pixel_id', value: data.seoFacebookPixelId });
	}
	if (data.enableStructuredData !== undefined) {
		settingsToUpdate.push({
			key: 'enable_structured_data',
			value: stringifySettingValue(data.enableStructuredData)
		});
	}
	if (data.enableSitemap !== undefined) {
		settingsToUpdate.push({
			key: 'enable_sitemap',
			value: stringifySettingValue(data.enableSitemap)
		});
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});

/**
 * Update checkout settings
 */
export const updateCheckoutSettings = form(UpdateCheckoutSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.enableGuestCheckout !== undefined) {
		settingsToUpdate.push({
			key: 'enable_guest_checkout',
			value: stringifySettingValue(data.enableGuestCheckout)
		});
	}
	if (data.requirePhoneNumber !== undefined) {
		settingsToUpdate.push({
			key: 'require_phone_number',
			value: stringifySettingValue(data.requirePhoneNumber)
		});
	}
	if (data.enableOrderNotes !== undefined) {
		settingsToUpdate.push({
			key: 'enable_order_notes',
			value: stringifySettingValue(data.enableOrderNotes)
		});
	}
	if (data.termsAndConditionsUrl !== undefined) {
		settingsToUpdate.push({ key: 'terms_and_conditions_url', value: data.termsAndConditionsUrl });
	}
	if (data.privacyPolicyUrl !== undefined) {
		settingsToUpdate.push({ key: 'privacy_policy_url', value: data.privacyPolicyUrl });
	}
	if (data.returnPolicyUrl !== undefined) {
		settingsToUpdate.push({ key: 'return_policy_url', value: data.returnPolicyUrl });
	}
	if (data.enableNewsletterSignup !== undefined) {
		settingsToUpdate.push({
			key: 'enable_newsletter_signup',
			value: stringifySettingValue(data.enableNewsletterSignup)
		});
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});

/**
 * Update email config settings
 */
export const updateEmailConfigSettings = form(UpdateEmailConfigSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.emailSmtpHost !== undefined) {
		settingsToUpdate.push({ key: 'email_smtp_host', value: data.emailSmtpHost });
	}
	if (data.emailSmtpPort !== undefined) {
		settingsToUpdate.push({
			key: 'email_smtp_port',
			value: stringifySettingValue(data.emailSmtpPort)
		});
	}
	if (data.emailSmtpUsername !== undefined) {
		settingsToUpdate.push({ key: 'email_smtp_username', value: data.emailSmtpUsername });
	}
	if (data.emailSmtpPassword !== undefined) {
		settingsToUpdate.push({ key: 'email_smtp_password', value: data.emailSmtpPassword });
	}
	if (data.emailSmtpSecure !== undefined) {
		settingsToUpdate.push({
			key: 'email_smtp_secure',
			value: stringifySettingValue(data.emailSmtpSecure)
		});
	}
	if (data.emailFromName !== undefined) {
		settingsToUpdate.push({ key: 'email_from_name', value: data.emailFromName });
	}
	if (data.emailFromAddress !== undefined) {
		settingsToUpdate.push({ key: 'email_from_address', value: data.emailFromAddress });
	}
	if (data.emailReplyToAddress !== undefined) {
		settingsToUpdate.push({ key: 'email_reply_to_address', value: data.emailReplyToAddress });
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});

/**
 * Update advanced settings
 */
export const updateAdvancedSettings = form(UpdateAdvancedSettingsSchema, async (data) => {
	requireAdminUser();

	const settingsToUpdate = [];

	if (data.maintenanceMode !== undefined) {
		settingsToUpdate.push({
			key: 'maintenance_mode',
			value: stringifySettingValue(data.maintenanceMode)
		});
	}
	if (data.maintenanceMessage !== undefined) {
		settingsToUpdate.push({ key: 'maintenance_message', value: data.maintenanceMessage });
	}
	if (data.customHeadScripts !== undefined) {
		settingsToUpdate.push({ key: 'custom_head_scripts', value: data.customHeadScripts });
	}
	if (data.customBodyScripts !== undefined) {
		settingsToUpdate.push({ key: 'custom_body_scripts', value: data.customBodyScripts });
	}
	if (data.enableDebugMode !== undefined) {
		settingsToUpdate.push({
			key: 'enable_debug_mode',
			value: stringifySettingValue(data.enableDebugMode)
		});
	}
	if (data.enableCaching !== undefined) {
		settingsToUpdate.push({
			key: 'enable_caching',
			value: stringifySettingValue(data.enableCaching)
		});
	}
	if (data.cacheDuration !== undefined) {
		settingsToUpdate.push({
			key: 'cache_duration',
			value: stringifySettingValue(data.cacheDuration)
		});
	}

	if (settingsToUpdate.length === 0) {
		return { success: false, message: 'No settings to update' };
	}

	return await updateMultipleSettingsHelper(settingsToUpdate);
});
