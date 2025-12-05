/**
 * Notification Service
 * Handles template rendering and sending notifications
 */

import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { NotificationTemplate, Order, OrderItem } from '$lib/server/db/schema';
import { getSMSClubClient } from './sms-club';

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
export function renderTemplateContent(template: string, variables: Record<string, string | number | boolean>): string {
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

		// Create notification log entry with pending status
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

		// Send notification based on channel type
		const channel = template.channel as 'email' | 'sms';
		let messageId: string | undefined;
		let sendError: string | undefined;

		try {
			if (channel === 'email') {
				// Send via email using Resend (dynamic import to avoid build-time issues)
				const { sendCustomOrderEmail } = await import('$lib/server/email-client');
				const emailResult = await sendCustomOrderEmail({
					toEmail: rendered.recipient,
					subject: rendered.subject || template.name,
					message: rendered.content,
					orderNumber: context.variables.order_number as string,
					customerName: context.variables.customer_name as string
				});

				if (emailResult.success && emailResult.messageId) {
					messageId = emailResult.messageId;
				} else {
					sendError = emailResult.error || 'Failed to send email';
				}
			} else if (channel === 'sms') {
				// Send via SMS using SMS Club
				const smsClient = getSMSClubClient();
				const smsResult = await smsClient.sendSms({
					phone: rendered.recipient,
					message: rendered.content,
					senderName: 'Zamovlennia' // Default sender name, can be customized
				});

				// Extract message ID from SMS Club response
				// Response format: { "sms_id": "phone_number" }
				const firstMessageId = Object.keys(smsResult)[0];
				if (firstMessageId) {
					messageId = firstMessageId;
				} else {
					sendError = 'No message ID returned from SMS Club';
				}
			}
		} catch (providerError) {
			sendError = providerError instanceof Error ? providerError.message : 'Unknown provider error';
			console.error(`[Notification] Failed to send ${channel}:`, sendError);
		}

		// Update notification log status based on send result
		const finalStatus = messageId ? 'sent' : 'failed';
		const now = new Date();
		await db
			.update(tables.notificationLog)
			.set({
				status: finalStatus,
				providerId: messageId,
				sentAt: messageId ? now : undefined,
				failedAt: !messageId ? now : undefined,
				error: sendError
			})
			.where(eq(tables.notificationLog.id, log.id));

		if (messageId) {
			console.log(`[Notification] ${channel} sent successfully:`, {
				logId: log.id,
				messageId,
				recipient: rendered.recipient
			});

			return {
				success: true,
				logId: log.id,
				messageId
			};
		} else {
			console.error(`[Notification] Failed to send ${channel}:`, sendError);

			return {
				success: false,
				logId: log.id,
				error: sendError || 'Failed to send notification'
			};
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[Notification] Send notification error:', errorMessage);

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Render order items list using custom template or default format
 */
export function renderOrderItemsList(
	orderItems: OrderItem[] = [],
	itemTemplate?: string,
	itemSeparator?: string,
	wrapperTemplate?: string,
	useHtmlFormatting: boolean = false
): string {
	if (orderItems.length === 0) {
		return '';
	}

	// Use custom template if provided, otherwise use default
	const template = itemTemplate || (useHtmlFormatting 
		? '<tr><td>{{quantity}}x</td><td>{{productName}}</td><td>{{price}} грн.</td></tr>'
		: '{{quantity}}x {{productName}} - {{price}} грн.');

	const separator = itemSeparator || (useHtmlFormatting ? '' : '\n');

	// Render each item using the template
	const renderedItems = orderItems.map((item) => {
		const price = (item.price / 100).toFixed(2);
		const subtotal = (item.subtotal / 100).toFixed(2);
		// Ensure all values are properly stringified
		const itemVars: Record<string, string> = {
			quantity: String(item.quantity),
			productName: String(item.productName),
			productSlug: String(item.productSlug),
			productImage: String(item.productImage || ''),
			price: String(price),
			subtotal: String(subtotal)
		};

		// Replace all {{variable}} placeholders
		let rendered = template;
		const placeholderRegex = /\{\{([a-z_]+)\}\}/gi;
		rendered = rendered.replace(placeholderRegex, (match, variableName) => {
			const value = itemVars[variableName];
			return value !== undefined && value !== 'undefined' ? value : match;
		});

		return rendered;
	});

	let itemsList = renderedItems.join(separator);

	// Wrap with wrapper template if provided
	if (wrapperTemplate) {
		itemsList = wrapperTemplate.replace('{{items}}', itemsList);
	}

	return itemsList;
}

/**
 * Build context variables for different order events
 */
export function buildOrderNotificationContext(
	order: Order,
	orderItems: OrderItem[] = [],
	additionalVars: Record<string, string | number | boolean> = {},
	itemTemplate?: string,
	itemSeparator?: string,
	wrapperTemplate?: string,
	useHtmlFormatting: boolean = false
): NotificationContext {
	// Format order items list using custom template or default
	const itemsList = renderOrderItemsList(
		orderItems,
		itemTemplate,
		itemSeparator,
		wrapperTemplate,
		useHtmlFormatting
	);

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

/**
 * Get order item template for a notification template
 */
export async function getOrderItemTemplate(notificationTemplateId: string) {
	const [itemTemplate] = await db
		.select()
		.from(tables.orderItemTemplate)
		.where(eq(tables.orderItemTemplate.notificationTemplateId, notificationTemplateId));

	return itemTemplate || null;
}
