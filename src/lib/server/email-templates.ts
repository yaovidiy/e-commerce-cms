/**
 * Email Templates
 * Simple HTML email templates for transactional emails
 */

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
`;

const cardStyle = `
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #0070f3;
  color: white !important;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 20px 0;
`;

const footerStyle = `
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

interface OrderEmailData {
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	total: number;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
	shippingAddress?: string;
	trackingNumber?: string;
}

export function orderConfirmationEmail(data: OrderEmailData): string {
	const itemsHtml = data.items
		.map(
			(item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
        ${item.name}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
        ${(item.price / 100).toFixed(2)} UAH
      </td>
    </tr>
  `
		)
		.join('');

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #0070f3; margin-top: 0;">Order Confirmation</h1>
      
      <p>Hi ${data.customerName},</p>
      
      <p>Thank you for your order! We've received your order and will begin processing it shortly.</p>
      
      <div style="background-color: #f0f7ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Order Number:</strong> ${data.orderNumber}
      </div>
      
      <h3>Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 15px 0; font-weight: bold;">Total</td>
            <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px;">
              ${(data.total / 100).toFixed(2)} UAH
            </td>
          </tr>
        </tbody>
      </table>
      
      ${
				data.shippingAddress
					? `
      <h3>Shipping Address</h3>
      <p style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
        ${data.shippingAddress.replace(/\n/g, '<br>')}
      </p>
      `
					: ''
			}
      
      <a href="${process.env.ORIGIN || 'http://localhost:5173'}/dashboard/orders/${data.orderNumber}" style="${buttonStyle}">
        View Order Status
      </a>
      
      <div style="${footerStyle}">
        <p>If you have any questions, please contact us at support@yourdomain.com</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function orderShippedEmail(data: OrderEmailData): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #10b981; margin-top: 0;">📦 Your Order Has Shipped!</h1>
      
      <p>Hi ${data.customerName},</p>
      
      <p>Great news! Your order is on its way.</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Order Number:</strong> ${data.orderNumber}<br>
        ${data.trackingNumber ? `<strong>Tracking Number:</strong> ${data.trackingNumber}` : ''}
      </div>
      
      <p>Your order should arrive within 3-5 business days. You can track your shipment using the tracking number above.</p>
      
      <a href="${process.env.ORIGIN || 'http://localhost:5173'}/dashboard/orders/${data.orderNumber}" style="${buttonStyle}">
        Track Your Order
      </a>
      
      <div style="${footerStyle}">
        <p>Thank you for shopping with us!</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function orderDeliveredEmail(data: OrderEmailData): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #10b981; margin-top: 0;">✅ Order Delivered!</h1>
      
      <p>Hi ${data.customerName},</p>
      
      <p>Your order has been successfully delivered!</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Order Number:</strong> ${data.orderNumber}
      </div>
      
      <p>We hope you love your purchase! If you have any issues or questions, please don't hesitate to reach out.</p>
      
      <a href="${process.env.ORIGIN || 'http://localhost:5173'}/dashboard/orders/${data.orderNumber}" style="${buttonStyle}">
        View Order Details
      </a>
      
      <div style="${footerStyle}">
        <p>Thank you for your business!</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function orderCancelledEmail(
	data: OrderEmailData & { reason?: string }
): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #ef4444; margin-top: 0;">Order Cancelled</h1>
      
      <p>Hi ${data.customerName},</p>
      
      <p>Your order has been cancelled.</p>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Order Number:</strong> ${data.orderNumber}<br>
        ${data.reason ? `<strong>Reason:</strong> ${data.reason}` : ''}
      </div>
      
      <p>If you paid for this order, a refund will be processed to your original payment method within 5-7 business days.</p>
      
      <p>If you have any questions about this cancellation, please contact our support team.</p>
      
      <a href="${process.env.ORIGIN || 'http://localhost:5173'}/products" style="${buttonStyle}">
        Continue Shopping
      </a>
      
      <div style="${footerStyle}">
        <p>Contact us at support@yourdomain.com</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function passwordResetEmail(data: {
	email: string;
	resetToken: string;
	expiresIn: number;
}): string {
	const resetUrl = `${process.env.ORIGIN || 'http://localhost:5173'}/auth/reset-password?token=${data.resetToken}`;

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #0070f3; margin-top: 0;">🔐 Password Reset Request</h1>
      
      <p>Hi,</p>
      
      <p>We received a request to reset the password for your account (${data.email}).</p>
      
      <p>Click the button below to reset your password. This link will expire in ${data.expiresIn} hours.</p>
      
      <a href="${resetUrl}" style="${buttonStyle}">
        Reset Password
      </a>
      
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        If you didn't request this, you can safely ignore this email. Your password will not be changed.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        For security, the link above will expire after ${data.expiresIn} hours.
      </p>
      
      <div style="${footerStyle}">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #0070f3;">${resetUrl}</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function welcomeEmail(data: { name: string; email: string }): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${cardStyle}">
      <h1 style="color: #0070f3; margin-top: 0;">🎉 Welcome to Your Store!</h1>
      
      <p>Hi ${data.name},</p>
      
      <p>Thank you for creating an account with us! We're excited to have you as part of our community.</p>
      
      <p>With your new account, you can:</p>
      <ul style="line-height: 1.8;">
        <li>Track your orders in real-time</li>
        <li>Save your favorite products</li>
        <li>Speed through checkout with saved addresses</li>
        <li>Get exclusive offers and updates</li>
      </ul>
      
      <a href="${process.env.ORIGIN || 'http://localhost:5173'}/products" style="${buttonStyle}">
        Start Shopping
      </a>
      
      <div style="${footerStyle}">
        <p>Need help? Contact us at support@yourdomain.com</p>
        <p>&copy; ${new Date().getFullYear()} Your Store. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
