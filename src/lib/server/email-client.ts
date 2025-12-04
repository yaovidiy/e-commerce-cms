/**
 * Email Client
 * Handles sending transactional emails using Resend API
 */

import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import {
	orderConfirmationEmail,
	orderShippedEmail,
	orderDeliveredEmail,
	orderCancelledEmail,
	passwordResetEmail,
	welcomeEmail
} from './email-templates';
import { getEmailSettingsConfig, isEmailTypeEnabled, getEmailSenderInfo } from './email-settings';
import type { Order } from './db/schema';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// Email enabled flag (disable in dev if no API key)
const EMAIL_ENABLED = !!RESEND_API_KEY;

interface OrderEmailPayload {
	order: Order & {
		items: Array<{
			productName: string;
			quantity: number;
			price: number;
		}>;
	};
	trackingNumber?: string;
	cancellationReason?: string;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Order confirmation (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if order confirmation emails are enabled
	if (!(await isEmailTypeEnabled('orderConfirmation'))) {
		console.log('[Email] Skipped: Order confirmation (disabled in settings)');
		return { success: false, message: 'Order confirmation emails are disabled' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const html = orderConfirmationEmail({
			orderNumber: payload.order.orderNumber,
			customerName: `${payload.order.customerFirstName} ${payload.order.customerLastName}`,
			customerEmail: payload.order.customerEmail,
			total: payload.order.total,
			items: payload.order.items.map((item) => ({
				name: item.productName,
				quantity: item.quantity,
				price: item.price
			})),
			shippingAddress: typeof payload.order.shippingAddress === 'string' 
				? payload.order.shippingAddress 
				: JSON.stringify(payload.order.shippingAddress, null, 2)
		});

		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: payload.order.customerEmail,
			replyTo: senderInfo.replyToEmail,
			subject: `Order Confirmation - ${payload.order.orderNumber}`,
			html
		});

		console.log('[Email] Order confirmation sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send order confirmation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(payload: OrderEmailPayload) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Order shipped (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if order shipped emails are enabled
	if (!(await isEmailTypeEnabled('orderShipped'))) {
		console.log('[Email] Skipped: Order shipped (disabled in settings)');
		return { success: false, message: 'Order shipped emails are disabled' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const html = orderShippedEmail({
			orderNumber: payload.order.orderNumber,
			customerName: `${payload.order.customerFirstName} ${payload.order.customerLastName}`,
			customerEmail: payload.order.customerEmail,
			total: payload.order.total,
			items: payload.order.items.map((item) => ({
				name: item.productName,
				quantity: item.quantity,
				price: item.price
			})),
			trackingNumber: payload.trackingNumber
		});

		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: payload.order.customerEmail,
			replyTo: senderInfo.replyToEmail,
			subject: `Your Order Has Shipped - ${payload.order.orderNumber}`,
			html
		});

		console.log('[Email] Order shipped sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send order shipped:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(payload: OrderEmailPayload) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Order delivered (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if order delivered emails are enabled
	if (!(await isEmailTypeEnabled('orderDelivered'))) {
		console.log('[Email] Skipped: Order delivered (disabled in settings)');
		return { success: false, message: 'Order delivered emails are disabled' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const html = orderDeliveredEmail({
			orderNumber: payload.order.orderNumber,
			customerName: `${payload.order.customerFirstName} ${payload.order.customerLastName}`,
			customerEmail: payload.order.customerEmail,
			total: payload.order.total,
			items: payload.order.items.map((item) => ({
				name: item.productName,
				quantity: item.quantity,
				price: item.price
			}))
		});

		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: payload.order.customerEmail,
			replyTo: senderInfo.replyToEmail,
			subject: `Order Delivered - ${payload.order.orderNumber}`,
			html
		});

		console.log('[Email] Order delivered sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send order delivered:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send order cancelled email
 */
export async function sendOrderCancelledEmail(payload: OrderEmailPayload) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Order cancelled (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if order cancelled emails are enabled
	if (!(await isEmailTypeEnabled('orderCancelled'))) {
		console.log('[Email] Skipped: Order cancelled (disabled in settings)');
		return { success: false, message: 'Order cancelled emails are disabled' };
	}

	try {
		const html = orderCancelledEmail({
			orderNumber: payload.order.orderNumber,
			customerName: `${payload.order.customerFirstName} ${payload.order.customerLastName}`,
			customerEmail: payload.order.customerEmail,
			total: payload.order.total,
			items: payload.order.items.map((item) => ({
				name: item.productName,
				quantity: item.quantity,
				price: item.price
			})),
			reason: payload.cancellationReason
		});

		const senderInfo = await getEmailSenderInfo();
		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: payload.order.customerEmail,
			replyTo: senderInfo.replyToEmail,
			subject: `Order Cancelled - ${payload.order.orderNumber}`,
			html
		});

		console.log('[Email] Order cancelled sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send order cancelled:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
	email: string;
	resetToken: string;
	expiresIn?: number;
}) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Password reset (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if password reset emails are enabled
	if (!(await isEmailTypeEnabled('passwordReset'))) {
		console.log('[Email] Skipped: Password reset (disabled in settings)');
		return { success: false, message: 'Password reset emails are disabled' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const html = passwordResetEmail({
			email: data.email,
			resetToken: data.resetToken,
			expiresIn: data.expiresIn || 24
		});

		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: data.email,
			replyTo: senderInfo.replyToEmail,
			subject: 'Password Reset Request',
			html
		});

		console.log('[Email] Password reset sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send password reset:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: { name: string; email: string }) {
	if (!EMAIL_ENABLED) {
		console.log('[Email] Skipped: Welcome (no API key)');
		return { success: false, message: 'Email service not configured' };
	}

	// Check if welcome emails are enabled
	if (!(await isEmailTypeEnabled('welcome'))) {
		console.log('[Email] Skipped: Welcome (disabled in settings)');
		return { success: false, message: 'Welcome emails are disabled' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const html = welcomeEmail(data);

		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: data.email,
			replyTo: senderInfo.replyToEmail,
			subject: 'Welcome to Your Store!',
			html
		});

		console.log('[Email] Welcome email sent:', result.data?.id);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send welcome email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Test email delivery
 * Useful for admin settings page to verify email configuration
 */
export async function sendTestEmail(toEmail: string) {
	if (!EMAIL_ENABLED) {
		return { success: false, message: 'Email service not configured' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: toEmail,
			replyTo: senderInfo.replyToEmail,
			subject: 'Test Email - E-commerce CMS',
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #0070f3;">✅ Email Configuration Test</h1>
  <p>This is a test email from your e-commerce CMS.</p>
  <p>If you're seeing this, your email configuration is working correctly!</p>
  <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    This email was sent from ${senderInfo.fromEmail}
  </p>
</body>
</html>
      `
		});

		return { success: true, messageId: result.data?.id, fromEmail: senderInfo.fromEmail  };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Send custom email to customer about their order
 * Used by admin to communicate with customers
 */
export async function sendCustomOrderEmail(data: {
	toEmail: string;
	subject: string;
	message: string;
	orderNumber: string;
	customerName: string;
}) {
	if (!EMAIL_ENABLED) {
		return { success: false, message: 'Email service not configured' };
	}

	try {
		const senderInfo = await getEmailSenderInfo();
		const result = await resend.emails.send({
			from: senderInfo.fromEmail,
			to: data.toEmail,
			replyTo: senderInfo.replyToEmail,
			subject: `${data.subject} - Order #${data.orderNumber}`,
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #333; margin: 0 0 10px 0;">Order #${data.orderNumber}</h2>
    <p style="color: #666; margin: 0;">Dear ${data.customerName},</p>
  </div>
  
  <div style="padding: 20px 0; line-height: 1.6; color: #333;">
    ${data.message.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line}</p>`).join('')}
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    If you have any questions, please reply to this email or contact our customer support.
  </p>
  
  <p style="color: #999; font-size: 12px; margin-top: 20px;">
    This email was sent from ${senderInfo.fromEmail}
  </p>
</body>
</html>
      `
		});

		console.log('[Email] Custom order email sent:', result);
		return { success: true, messageId: result.data?.id };
	} catch (error) {
		console.error('[Email] Failed to send custom order email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
