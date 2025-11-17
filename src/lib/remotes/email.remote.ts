/**
 * Email Settings Remote Functions
 * Admin-only functions for managing email configuration
 */

import { query, form } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateEmailSettingsSchema, TestEmailSchema } from '$lib/server/schemas';
import * as auth from '$lib/server/auth';

/**
 * Get email settings
 */
export const getEmailSettings = query(async () => {
	auth.requireAdminUser();

	const [settings] = await db.select().from(tables.emailSettings).limit(1);

	// Return default settings if none exist
	if (!settings) {
		return {
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
	}

	return settings;
});

/**
 * Update email settings
 */
export const updateEmailSettings = form(UpdateEmailSettingsSchema, async (data) => {
	auth.requireAdminUser();

	const [existingSettings] = await db.select().from(tables.emailSettings).limit(1);

	if (existingSettings) {
		// Update existing settings
		const [updated] = await db
			.update(tables.emailSettings)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(tables.emailSettings.id, existingSettings.id))
			.returning();

		// Refresh query
		await getEmailSettings().refresh();

		return updated;
	} else {
		// Create new settings
		const [created] = await db
			.insert(tables.emailSettings)
			.values({
				id: crypto.randomUUID(),
				...data,
				provider: 'resend',
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();

		// Refresh query
		await getEmailSettings().refresh();

		return created;
	}
});

/**
 * Test email delivery
 */
export const sendTestEmail = form(TestEmailSchema, async (data) => {
	auth.requireAdminUser();

	try {
		const { sendTestEmail: sendEmail } = await import('$lib/server/email-client');
		const result = await sendEmail(data.toEmail);

		if (result.success) {
			return {
				success: true,
				message: `Test email sent successfully to ${data.toEmail}`,
				messageId: result.messageId
			};
		} else {
			return {
				success: false,
				message: result.error || result.message || 'Failed to send test email'
			};
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
});
