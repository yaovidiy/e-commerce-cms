/**
 * LiqPay API Client
 * 
 * LiqPay is the leading payment gateway in Ukraine.
 * Docs: https://www.liqpay.ua/documentation/en/
 */

import crypto from 'crypto';

interface LiqPayConfig {
	publicKey: string;
	privateKey: string;
	isSandbox?: boolean;
}

interface LiqPayPaymentParams {
	orderId: string;
	amount: number; // in UAH
	currency?: string;
	description: string;
	email?: string;
	phone?: string;
	resultUrl?: string;
	serverUrl?: string;
}

interface LiqPayData {
	version: number;
	public_key: string;
	action: string;
	amount: number;
	currency: string;
	description: string;
	order_id: string;
	sandbox?: number;
	result_url?: string;
	server_url?: string;
	email?: string;
	phone?: string;
}

interface LiqPayResponse {
	data: string;
	signature: string;
}

interface LiqPayStatusResponse {
	status: string;
	payment_id?: number;
	order_id: string;
	amount: number;
	currency: string;
	err_code?: string;
	err_description?: string;
	create_date?: number;
	end_date?: number;
	transaction_id?: number;
}

interface LiqPayWebhookData {
	status: string;
	payment_id?: number;
	order_id: string;
	amount: number;
	currency: string;
	sender_phone?: string;
	sender_card_mask2?: string;
	err_code?: string;
	err_description?: string;
	create_date?: number;
	end_date?: number;
	transaction_id?: number;
}

export class LiqPayClient {
	private publicKey: string;
	private privateKey: string;
	private isSandbox: boolean;
	private apiUrl = 'https://www.liqpay.ua/api/';

	constructor(config: LiqPayConfig) {
		this.publicKey = config.publicKey;
		this.privateKey = config.privateKey;
		this.isSandbox = config.isSandbox ?? false;
	}

	/**
	 * Generate signature for LiqPay request
	 */
	private generateSignature(data: string): string {
		const signString = this.privateKey + data + this.privateKey;
		return crypto.createHash('sha1').update(signString).digest('base64');
	}

	/**
	 * Encode data to base64
	 */
	private encodeData(data: object): string {
		return Buffer.from(JSON.stringify(data)).toString('base64');
	}

	/**
	 * Decode base64 data
	 */
	private decodeData(data: string): Record<string, unknown> {
		return JSON.parse(Buffer.from(data, 'base64').toString('utf-8')) as Record<string, unknown>;
	}

	/**
	 * Verify webhook signature
	 */
	public verifySignature(data: string, signature: string): boolean {
		const expectedSignature = this.generateSignature(data);
		return expectedSignature === signature;
	}

	/**
	 * Create payment and get checkout URL
	 */
	public createPayment(params: LiqPayPaymentParams): LiqPayResponse {
		const data: LiqPayData = {
			version: 3,
			public_key: this.publicKey,
			action: 'pay',
			amount: params.amount,
			currency: params.currency || 'UAH',
			description: params.description,
			order_id: params.orderId
		};

		// Add optional fields
		if (this.isSandbox) {
			data.sandbox = 1;
		}

		if (params.resultUrl) {
			data.result_url = params.resultUrl;
		}

		if (params.serverUrl) {
			data.server_url = params.serverUrl;
		}

		if (params.email) {
			data.email = params.email;
		}

		if (params.phone) {
			data.phone = params.phone;
		}

		const encodedData = this.encodeData(data);
		const signature = this.generateSignature(encodedData);

		return {
			data: encodedData,
			signature
		};
	}

	/**
	 * Get checkout URL for redirect
	 */
	public getCheckoutUrl(response: LiqPayResponse): string {
		return `${this.apiUrl}3/checkout?data=${encodeURIComponent(response.data)}&signature=${encodeURIComponent(response.signature)}`;
	}

	/**
	 * Check payment status
	 */
	public async checkPaymentStatus(orderId: string): Promise<LiqPayStatusResponse> {
		const data = {
			version: 3,
			public_key: this.publicKey,
			action: 'status',
			order_id: orderId
		};

		const encodedData = this.encodeData(data);
		const signature = this.generateSignature(encodedData);

		const response = await fetch(`${this.apiUrl}request`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				data: encodedData,
				signature
			})
		});

		const result = (await response.json()) as LiqPayStatusResponse;
		return result;
	}

	/**
	 * Parse webhook data
	 */
	public parseWebhook(data: string, signature: string): LiqPayWebhookData | null {
		if (!this.verifySignature(data, signature)) {
			return null;
		}

		return this.decodeData(data) as unknown as LiqPayWebhookData;
	}

	/**
	 * Create refund
	 */
	public async createRefund(orderId: string, amount: number): Promise<LiqPayStatusResponse> {
		const data = {
			version: 3,
			public_key: this.publicKey,
			action: 'refund',
			order_id: orderId,
			amount
		};

		const encodedData = this.encodeData(data);
		const signature = this.generateSignature(encodedData);

		const response = await fetch(`${this.apiUrl}request`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				data: encodedData,
				signature
			})
		});

		const result = (await response.json()) as LiqPayStatusResponse;
		return result;
	}
}

/**
 * Get LiqPay client instance
 */
export function getLiqPayClient(): LiqPayClient {
	const publicKey = process.env.LIQPAY_PUBLIC_KEY;
	const privateKey = process.env.LIQPAY_PRIVATE_KEY;
	const isSandbox = process.env.LIQPAY_SANDBOX === 'true';

	if (!publicKey || !privateKey) {
		throw new Error('LiqPay credentials not configured. Set LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY environment variables.');
	}

	return new LiqPayClient({
		publicKey,
		privateKey,
		isSandbox
	});
}
