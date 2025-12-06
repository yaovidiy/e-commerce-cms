/**
 * PDF Generator Service
 * Generates PDF documents for orders using Puppeteer and HTML rendering
 */

import puppeteer from 'puppeteer';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Order, OrderItem } from '$lib/server/db/schema';

interface OrderData {
	order: Order;
	items: OrderItem[];
}

/**
 * Format price as currency (cents to formatted string)
 */
function formatPrice(cents: number): string {
	const pounds = cents / 100;
	return pounds.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

/**
 * Format quantity with thousand separators
 */
function formatQuantity(qty: number): string {
	return qty.toLocaleString('en-US');
}

/**
 * Parse JSON safely
 */
function safeJsonParse(json: string | null, defaultValue: any = {}) {
	if (!json) return defaultValue;
	try {
		return JSON.parse(json);
	} catch {
		return defaultValue;
	}
}

/**
 * Get order data with items
 */
async function getOrderData(orderId: string): Promise<OrderData | null> {
	const [order] = await db.select().from(tables.order).where(eq(tables.order.id, orderId));

	if (!order) return null;

	const items = await db.select().from(tables.orderItem).where(eq(tables.orderItem.orderId, orderId));

	return { order, items };
}

/**
 * Generate PDF for an order
 * Returns a Buffer containing the PDF data
 */
export async function generateOrderPDF(orderId: string): Promise<Buffer> {
	const orderData = await getOrderData(orderId);

	if (!orderData) {
		throw new Error(`Order ${orderId} not found`);
	}

	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});

	try {
		const page = await browser.newPage();
		const html = generatePDFHTML(orderData);

		// Set the HTML content
		await page.setContent(html, { waitUntil: 'networkidle0' });

		// Generate PDF
		const pdf = await page.pdf({
			format: 'A4',
			margin: { top: '40px', right: '40px', bottom: '60px', left: '40px' }
		});

		await page.close();
		return Buffer.from(pdf);
	} finally {
		await browser.close();
	}
}

/**
 * Generate HTML for PDF rendering
 */
function generatePDFHTML(orderData: OrderData): string {
	const { order, items } = orderData;

	// Format order date in Ukrainian
	const dateObj = new Date(order.createdAt);
	const day = dateObj.getDate();
	const monthNames = [
		'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
		'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
	];
	const month = monthNames[dateObj.getMonth()];
	const year = dateObj.getFullYear();
	const createdDate = `${day} ${month} ${year}`;

	// Parse addresses
	const shippingAddress = safeJsonParse(order.shippingAddress);

	// Status labels in Ukrainian
	const statusLabels: Record<string, string> = {
		pending: 'Очікується',
		processing: 'Обробляється',
		shipped: 'Відправлено',
		delivered: 'Доставлено',
		cancelled: 'Скасовано',
		refunded: 'Повернено'
	};

	const paymentStatusLabels: Record<string, string> = {
		pending: 'Очікується',
		completed: 'Завершено',
		failed: 'Помилка',
		refunded: 'Повернено'
	};

	// Build product rows HTML
	const productRowsHTML = items
		.map(
			(item) => `
		<tr>
			<td style="border: 1px solid #ecf0f1; padding: 10px;">${escapeHtml(item.productName)}</td>
			<td style="border: 1px solid #ecf0f1; padding: 10px; text-align: center;">${formatQuantity(item.quantity)}</td>
			<td style="border: 1px solid #ecf0f1; padding: 10px; text-align: right;">${formatPrice(item.price)} ₴</td>
			<td style="border: 1px solid #ecf0f1; padding: 10px; text-align: right;">${formatPrice(item.subtotal)} ₴</td>
		</tr>
	`
		)
		.join('');

	const html = `
<!DOCTYPE html>
<html lang="uk">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Рахунок</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: Arial, sans-serif;
			color: #2c3e50;
			line-height: 1.6;
		}
		
		.container {
			max-width: 900px;
			margin: 0 auto;
			padding: 40px;
		}
		
		.header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 20px;
		}
		
		.header h1 {
			font-size: 32px;
			color: #2c3e50;
		}
		
		.header .order-number {
			font-size: 18px;
			color: #e74c3c;
			text-align: right;
		}
		
		.meta-info {
			margin-bottom: 30px;
			font-size: 14px;
		}
		
		.info-section {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 30px;
			margin-bottom: 30px;
		}
		
		.info-block h3 {
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 10px;
			color: #2c3e50;
		}
		
		.info-block p {
			font-size: 12px;
			margin-bottom: 5px;
		}
		
		.items-section {
			margin-bottom: 30px;
		}
		
		.items-section h2 {
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 10px;
			color: #2c3e50;
		}
		
		table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 30px;
		}
		
		thead {
			background-color: #f9f9f9;
		}
		
		thead th {
			border: 1px solid #ecf0f1;
			padding: 12px;
			text-align: left;
			font-weight: bold;
			color: #2c3e50;
			font-size: 13px;
		}
		
		tbody td {
			border: 1px solid #ecf0f1;
			padding: 10px;
			font-size: 12px;
		}
		
		.totals {
			display: flex;
			justify-content: flex-end;
			margin-bottom: 30px;
		}
		
		.totals-box {
			width: 400px;
		}
		
		.total-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 10px;
			font-size: 13px;
		}
		
		.total-row.total {
			border-top: 2px solid #2c3e50;
			padding-top: 10px;
			font-size: 16px;
			font-weight: bold;
			color: #e74c3c;
		}
		
		.total-row.discount {
			color: #e74c3c;
		}
		
		.footer {
			border-top: 1px solid #ecf0f1;
			padding-top: 20px;
			text-align: center;
			font-size: 11px;
			color: #7f8c8d;
		}
	</style>
</head>
<body>
	<div class="container">
		<!-- Header -->
		<div class="header">
			<h1>РАХУНОК</h1>
			<div class="order-number">Замовлення №${escapeHtml(order.orderNumber)}</div>
		</div>
		
		<!-- Meta Info -->
		<div class="meta-info">
			Дата: ${createdDate} | Статус: ${escapeHtml(statusLabels[order.status as keyof typeof statusLabels] || order.status)}
		</div>
		
		<!-- Contact and Payment Info -->
		<div class="info-section">
			<div class="info-block">
				<h3>Адреса доставки</h3>
				<p>${escapeHtml(order.customerFirstName)} ${escapeHtml(order.customerLastName)}</p>
				${shippingAddress.street ? `<p>${escapeHtml(shippingAddress.street)}</p>` : ''}
				${
					shippingAddress.city || shippingAddress.postalCode
						? `<p>${[shippingAddress.city, shippingAddress.postalCode].filter(Boolean).join(', ')}</p>`
						: ''
				}
				${shippingAddress.country ? `<p>${escapeHtml(shippingAddress.country)}</p>` : ''}
			</div>
			
			<div class="info-block">
				<h3>Контактна інформація</h3>
				<p>Електронна пошта: ${escapeHtml(order.customerEmail)}</p>
				${order.customerPhone ? `<p>Телефон: ${escapeHtml(order.customerPhone)}</p>` : ''}
			</div>
			
			<div class="info-block">
				<h3>Оплата та доставка</h3>
				<p>Спосіб оплати: ${escapeHtml(order.paymentMethod || 'Не вказано')}</p>
				<p>Статус оплати: ${escapeHtml(paymentStatusLabels[order.paymentStatus as keyof typeof paymentStatusLabels] || order.paymentStatus)}</p>
				<p>Спосіб доставки: ${escapeHtml(order.shippingMethod || 'Не вказано')}</p>
				<p>Вартість доставки: ${formatPrice(order.shippingCost)} ₴</p>
			</div>
		</div>
		
		<!-- Items -->
		<div class="items-section">
			<h2>Товари замовлення</h2>
			<table>
				<thead>
					<tr>
						<th>Товар</th>
						<th style="text-align: center;">Кількість</th>
						<th style="text-align: right;">Ціна</th>
						<th style="text-align: right;">Сума</th>
					</tr>
				</thead>
				<tbody>
					${productRowsHTML}
				</tbody>
			</table>
		</div>
		
		<!-- Totals -->
		<div class="totals">
			<div class="totals-box">
				<div class="total-row">
					<span>Проміжна сума:</span>
					<span>${formatPrice(order.subtotal)} ₴</span>
				</div>
				<div class="total-row">
					<span>Доставка:</span>
					<span>${formatPrice(order.shippingCost)} ₴</span>
				</div>
				${order.tax > 0 ? `
				<div class="total-row">
					<span>Податок:</span>
					<span>${formatPrice(order.tax)} ₴</span>
				</div>
				` : ''}
				${order.discount > 0 ? `
				<div class="total-row discount">
					<span>Знижка:</span>
					<span>-${formatPrice(order.discount)} ₴</span>
				</div>
				` : ''}
				<div class="total-row total">
					<span>РАЗОМ:</span>
					<span>${formatPrice(order.total)} ₴</span>
				</div>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="footer">
			<p>Дякуємо за ваше замовлення!</p>
			<p>Якщо у вас є запитання, зв'яжіться з нами: support@example.com</p>
		</div>
	</div>
</body>
</html>
	`;

	return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (char) => map[char]);
}
