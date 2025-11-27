/**
 * Notification Service
 * Handles template rendering and sending notifications
 */

import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { NotificationTemplate, Order, OrderItem } from '$lib/server/db/schema';

export interface NotificationContext {
	orderId?: string;
	userId?: string;
	customerEmail?: string;
	customerPhone?: string;
	variables: Record<string, string | number | boolean>;
}

export interface RenderedNotification {
	subject?: string;
	content: string;
	recipient: string;
}

/**
 * Render template content with dynamic variables
 * Replaces {{variable_name}} placeholders with actual values
 */
export function renderTemplateContent(template: string, variables: Record<string, any>): string {
	let rendered = template;

	// Replace all {{variable}} placeholders
	const placeholderRegex = /\{\{([a-z_]+)\}\}/gi;
	rendered = rendered.replace(placeholderRegex, (match, variableName) => {
		const value = variables[variableName.toLowerCase()];
		return value !== undefined ? String(value) : match;
	});

	return rendered;
}

/**
 * Render a notification template with context data
 */
export function renderNotification(
	template: NotificationTemplate,
	context: NotificationContext
): RenderedNotification {
	const subject = template.subject
		? renderTemplateContent(template.subject, context.variables)
		: undefined;

	const content = renderTemplateContent(template.content, context.variables);

	// Determine recipient
	let recipient = '';
	const channel = template.channel as 'email' | 'sms';
	if (channel === 'email') {
		recipient = context.customerEmail || String(context.variables.customer_email || '');
	} else if (channel === 'sms') {
		recipient = context.customerPhone || String(context.variables.customer_phone || '');
	}

	return {
		subject,
		content,
		recipient
	};
}

/**
 * Send a notification using rendered template
 */
export async function sendNotification(
	templateId: string,
	context: NotificationContext
): Promise<{
	success: boolean;
	logId?: string;
	error?: string;
	messageId?: string;
}> {
	try {
		// Get template
		const [template] = await db
			.select()
			.from(tables.notificationTemplate)
			.where(eq(tables.notificationTemplate.id, templateId));

		if (!template) {
			return {
				success: false,
				error: 'Template not found'
			};
		}

		// Render notification
		const rendered = renderNotification(template, context);

		if (!rendered.recipient) {
			return {
				success: false,
				error: `No ${template.channel} recipient found`
			};
		}

		// Create notification log entry
		const [log] = await db
			.insert(tables.notificationLog)
			.values({
				id: crypto.randomUUID(),
				templateId,
				orderId: context.orderId,
				userId: context.userId,
				channel: template.channel,
				recipient: rendered.recipient,
				subject: rendered.subject,
				content: rendered.content,
				status: 'pending',
				createdAt: new Date()
			})
			.returning();

		// TODO: Integrate with actual email/SMS providers
		// For now, just return success with pending status
		// In production, you would call Resend for email or SMS Club for SMS here

		return {
			success: true,
			logId: log.id,
			messageId: crypto.randomUUID() // Placeholder for provider message ID
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/**
 * Build context variables for different order events
 */
export function buildOrderNotificationContext(
	order: Order,
	orderItems: OrderItem[] = [],
	additionalVars: Record<string, string | number | boolean> = {}
): NotificationContext {
	// Format order items list
	const itemsList = orderItems
		.map((item) => {
			const price = (item.price / 100).toFixed(2);
			return `${item.quantity}x ${item.productName} - ${price} грн.`;
		})
		.join('\n');

	// Format totals
	const total = (order.total / 100).toFixed(2);
	const subtotal = (order.subtotal / 100).toFixed(2);

	const variables: Record<string, string | number> = {
		order_id: order.id,
		order_number: order.orderNumber,
		order_total: `${total} грн.`,
		order_subtotal: `${subtotal} грн.`,
		order_status: order.status,
		order_items_list: itemsList,
		
		customer_name: `${order.customerFirstName} ${order.customerLastName}`,
		customer_first_name: order.customerFirstName,
		customer_last_name: order.customerLastName,
		customer_email: order.customerEmail,
		customer_phone: order.customerPhone || '',
		
		payment_method: order.paymentMethod || 'Not specified',
		payment_status: order.paymentStatus,
		shipping_method: order.shippingMethod || 'Not specified',
		tracking_number: '',
		shipping_address: formatAddress(JSON.parse(order.shippingAddress || '{}')),
		carrier_name: 'Nova Poshta', // Default carrier
		
		...additionalVars
	};

	return {
		orderId: order.id,
		userId: order.userId ?? undefined,
		customerEmail: order.customerEmail,
		customerPhone: order.customerPhone ?? undefined,
		variables
	};
}

/**
 * Format address object for display
 */
function formatAddress(address: Record<string, string>): string {
	if (!address || typeof address !== 'object') {
		return 'Address not available';
	}

	const parts = [
		address.address1,
		address.address2,
		address.city,
		address.state,
		address.postalCode,
		address.country
	].filter(Boolean);

	return parts.join(', ');
}

/**
 * Get template with parsed variables
 */
export async function getTemplateWithVariables(templateId: string): Promise<(NotificationTemplate & { variables: string[] }) | null> {
	const [template] = await db
		.select()
		.from(tables.notificationTemplate)
		.where(eq(tables.notificationTemplate.id, templateId));

	if (!template) {
		return null;
	}

	return {
		...template,
		variables: JSON.parse(template.variables || '[]')
	};
}
