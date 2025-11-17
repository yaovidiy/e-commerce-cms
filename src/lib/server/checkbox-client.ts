/**
 * Checkbox РРО API Client
 * 
 * Checkbox is a cloud-based fiscal receipt system (програмний РРО) required by Ukrainian law.
 * Docs: https://dev.checkbox.ua/doc/api/
 */

interface CheckboxConfig {
	login: string;
	password: string;
	licenseKey: string;
	cashRegisterId?: string;
	isProduction?: boolean;
}

interface CheckboxAuthResponse {
	access_token: string;
	expires_at: number;
	token_type: string;
}

interface CheckboxReceiptItem {
	code: string; // Product code/SKU
	name: string;
	price: number; // Price in kopiykas (cents)
	quantity: number;
	cost: number; // Total cost (price * quantity)
	tax: number[]; // Tax rates (e.g., [20] for 20% VAT)
	discount?: number;
}

interface CheckboxReceiptPayment {
	type: 'CASHLESS'; // Безготівка (card payment)
	value: number; // Amount in kopiykas
}

interface CreateReceiptRequest {
	goods: CheckboxReceiptItem[];
	payments: CheckboxReceiptPayment[];
	delivery?: {
		email?: string;
		phone?: string;
	};
	order_id?: string; // External order ID
}

interface CheckboxReceiptResponse {
	id: string;
	type: string;
	serial: number;
	status: string;
	fiscal_code: string;
	fiscal_date: string;
	total_sum: number;
	total_payment: number;
	delivered_at?: string;
	created_at: string;
	updated_at: string;
	related_receipt_id?: string;
	receipt_url?: string;
	tax_url?: string;
}

interface CheckboxShiftResponse {
	id: string;
	serial: number;
	status: string;
	opened_at: string;
	closed_at?: string;
	initial_transaction_id?: string;
	closing_transaction_id?: string;
	cash_register_id: string;
	created_at: string;
	updated_at: string;
	balance?: {
		cash: number;
		cashless: number;
	};
}

interface CheckboxCashierInfo {
	id: string;
	full_name: string;
	email: string;
	permissions: string[];
	roles: string[];
	organization: {
		id: string;
		name: string;
	};
}

interface CheckboxCashRegister {
	id: string;
	fiscal_number: string;
	name: string;
	address: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
}

export class CheckboxClient {
	private login: string;
	private password: string;
	private licenseKey: string;
	private cashRegisterId?: string;
	private baseUrl: string;
	private accessToken: string | null = null;
	private tokenExpiry: number = 0;

	constructor(config: CheckboxConfig) {
		this.login = config.login;
		this.password = config.password;
		this.licenseKey = config.licenseKey;
		this.cashRegisterId = config.cashRegisterId;
		this.baseUrl = config.isProduction
			? 'https://api.checkbox.ua/api/v1'
			: 'https://dev-api.checkbox.ua/api/v1';
	}

	/**
	 * Authenticate with Checkbox API
	 */
	private async authenticate(): Promise<void> {
		// Check if token is still valid
		if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
			return; // Token valid for at least 1 more minute
		}

		const response = await fetch(`${this.baseUrl}/cashier/signin`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				login: this.login,
				password: this.password
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Checkbox authentication failed: ${error.message || response.statusText}`);
		}

		const data = (await response.json()) as CheckboxAuthResponse;
		this.accessToken = data.access_token;
		this.tokenExpiry = data.expires_at;
	}

	/**
	 * Make authenticated request to Checkbox API
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		await this.authenticate();

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
				'X-License-Key': this.licenseKey
			}
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: response.statusText }));
			throw new Error(`Checkbox API error: ${error.message || response.statusText}`);
		}

		return (await response.json()) as T;
	}

	/**
	 * Get current cashier info
	 */
	async getCashierInfo(): Promise<CheckboxCashierInfo> {
		return await this.request<CheckboxCashierInfo>('/cashier/me', {
			method: 'GET'
		});
	}

	/**
	 * Get current open shift
	 */
	async getCurrentShift(): Promise<CheckboxShiftResponse | null> {
		try {
			const shifts = await this.request<{ results: CheckboxShiftResponse[] }>('/shifts', {
				method: 'GET'
			});

			const openShift = shifts.results.find(s => s.status === 'OPENED');
			return openShift || null;
		} catch {
			return null;
		}
	}

	/**
	 * Open new shift (касова зміна)
	 */
	async openShift(): Promise<CheckboxShiftResponse> {
		return await this.request<CheckboxShiftResponse>('/shifts', {
			method: 'POST',
			body: JSON.stringify({})
		});
	}

	/**
	 * Close current shift
	 */
	async closeShift(): Promise<CheckboxShiftResponse> {
		const currentShift = await this.getCurrentShift();
		
		if (!currentShift) {
			throw new Error('No open shift found');
		}

		return await this.request<CheckboxShiftResponse>(`/shifts/${currentShift.id}/close`, {
			method: 'POST',
			body: JSON.stringify({})
		});
	}

	/**
	 * Create sale receipt (чек продажу)
	 */
	async createSaleReceipt(data: CreateReceiptRequest): Promise<CheckboxReceiptResponse> {
		// Ensure shift is open
		let shift = await this.getCurrentShift();
		
		if (!shift) {
			shift = await this.openShift();
		}

		return await this.request<CheckboxReceiptResponse>('/receipts/sell', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	/**
	 * Create return receipt (чек повернення)
	 */
	async createReturnReceipt(data: CreateReceiptRequest): Promise<CheckboxReceiptResponse> {
		// Ensure shift is open
		let shift = await this.getCurrentShift();
		
		if (!shift) {
			shift = await this.openShift();
		}

		return await this.request<CheckboxReceiptResponse>('/receipts/return', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	/**
	 * Get receipt by ID
	 */
	async getReceipt(receiptId: string): Promise<CheckboxReceiptResponse> {
		return await this.request<CheckboxReceiptResponse>(`/receipts/${receiptId}`, {
			method: 'GET'
		});
	}

	/**
	 * Get receipt text (for printing)
	 */
	async getReceiptText(receiptId: string): Promise<string> {
		return await this.request<string>(`/receipts/${receiptId}/text`, {
			method: 'GET'
		});
	}

	/**
	 * Get receipt HTML
	 */
	async getReceiptHtml(receiptId: string): Promise<string> {
		return await this.request<string>(`/receipts/${receiptId}/html`, {
			method: 'GET'
		});
	}

	/**
	 * Get cash register info
	 */
	async getCashRegisterInfo(cashRegisterId?: string): Promise<CheckboxCashRegister> {
		const id = cashRegisterId || this.cashRegisterId;
		
		if (!id) {
			throw new Error('Cash register ID not provided');
		}

		return await this.request<CheckboxCashRegister>(`/cash-registers/${id}`, {
			method: 'GET'
		});
	}

	/**
	 * Get all cash registers for cashier
	 */
	async getCashRegisters(): Promise<CheckboxCashRegister[]> {
		const response = await this.request<{ results: CheckboxCashRegister[] }>('/cash-registers', {
			method: 'GET'
		});

		return response.results;
	}
}

/**
 * Get Checkbox client instance
 */
export function getCheckboxClient(): CheckboxClient {
	const login = process.env.CHECKBOX_LOGIN;
	const password = process.env.CHECKBOX_PASSWORD;
	const licenseKey = process.env.CHECKBOX_LICENSE_KEY;
	const cashRegisterId = process.env.CHECKBOX_CASH_REGISTER_ID;
	const isProduction = process.env.CHECKBOX_PRODUCTION === 'true';

	if (!login || !password || !licenseKey) {
		throw new Error(
			'Checkbox credentials not configured. Set CHECKBOX_LOGIN, CHECKBOX_PASSWORD, and CHECKBOX_LICENSE_KEY environment variables.'
		);
	}

	return new CheckboxClient({
		login,
		password,
		licenseKey,
		cashRegisterId,
		isProduction
	});
}
