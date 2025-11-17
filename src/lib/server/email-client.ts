/**
 * Email Client
 * Handles sending transactional emails using Resend API
 */

import { Resend } from 'resend';
import {
	orderConfirmationEmail,
	orderShippedEmail,
	orderDeliveredEmail,
	orderCancelledEmail,
	passwordResetEmail,
	welcomeEmail
} from './email-templates';
import type { Order } from './db/schema';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

// Email enabled flag (disable in dev if no API key)
const EMAIL_ENABLED = !!process.env.RESEND_API_KEY;

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

	try {
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
			from: FROM_EMAIL,
			to: payload.order.customerEmail,
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

	try {
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
			from: FROM_EMAIL,
			to: payload.order.customerEmail,
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

	try {
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
			from: FROM_EMAIL,
			to: payload.order.customerEmail,
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

		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: payload.order.customerEmail,
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

	try {
		const html = passwordResetEmail({
			email: data.email,
			resetToken: data.resetToken,
			expiresIn: data.expiresIn || 24
		});

		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: data.email,
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

	try {
		const html = welcomeEmail(data);

		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: data.email,
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
		const result = await resend.emails.send({
			from: FROM_EMAIL,
			to: toEmail,
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
    This email was sent from ${FROM_EMAIL}
  </p>
</body>
</html>
      `
		});

		return { success: true, messageId: result.data?.id };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
