/**
 * Email Settings Helper
 * Provides cached access to email configuration for use throughout the application
 */

import { db } from './db';
import * as tables from './db/schema';
import type { EmailSettings } from './db/schema';

// Cache for email settings (cleared on each update)
let emailSettingsCache: EmailSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get email settings with optional caching
 * Returns default settings if none are configured
 */
export async function getEmailSettingsConfig(useCache = true): Promise<EmailSettings> {
	const now = Date.now();
	
	// Return cached settings if still valid
	if (useCache && emailSettingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
		return emailSettingsCache;
	}

	// Fetch from database
	const [settings] = await db.select().from(tables.emailSettings).limit(1);

	// Use settings from DB or return defaults
	const emailSettings = settings || {
		id: 'default',
		fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
		fromName: 'Your Store',
		replyToEmail: null,
		enableOrderConfirmation: true,
		enableOrderShipped: true,
		enableOrderDelivered: true,
		enableOrderCancelled: true,
		enablePasswordReset: true,
		enableWelcome: true,
		provider: 'resend',
		apiKey: null,
		smtpHost: null,
		smtpPort: null,
		smtpUsername: null,
		smtpPassword: null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	// Update cache
	emailSettingsCache = emailSettings;
	cacheTimestamp = now;

	return emailSettings;
}

/**
 * Clear email settings cache
 * Call this after updating settings to ensure fresh data
 */
export function clearEmailSettingsCache() {
	emailSettingsCache = null;
	cacheTimestamp = 0;
}

/**
 * Check if a specific email type is enabled
 */
export async function isEmailTypeEnabled(
	type: 'orderConfirmation' | 'orderShipped' | 'orderDelivered' | 'orderCancelled' | 'passwordReset' | 'welcome'
): Promise<boolean> {
	const settings = await getEmailSettingsConfig();
	
	const enableFieldMap = {
		orderConfirmation: 'enableOrderConfirmation',
		orderShipped: 'enableOrderShipped',
		orderDelivered: 'enableOrderDelivered',
		orderCancelled: 'enableOrderCancelled',
		passwordReset: 'enablePasswordReset',
		welcome: 'enableWelcome'
	} as const;

	const field = enableFieldMap[type] as keyof typeof settings;
	return settings[field] === true;
}

/**
 * Get sender information for emails
 */
export async function getEmailSenderInfo() {
	const settings = await getEmailSettingsConfig();
	
	return {
		fromEmail: settings.fromEmail,
		fromName: settings.fromName,
		replyToEmail: settings.replyToEmail || settings.fromEmail
	};
}
