/**
 * SMS Club API Client
 *
 * SMS Club is a Ukrainian SMS gateway service.
 * Docs: https://smsclub.mobi/
 *
 * This client handles:
 * - Sending SMS messages (single and bulk)
 * - Checking account balance
 * - Managing sender names (originators)
 * - Registering new sender names
 * - Getting SMS status
 */

import { SMS_CLUB_API_TOKEN } from '$env/static/private';

interface SMSClubConfig {
	apiToken: string;
}

interface SendSmsParams {
	phone: string | string[];
	message: string;
	senderName: string;
	lifetime?: number; // Optional lifetime in minutes
}

interface PersonalizedSmsMessage {
	phone: string;
	message: string;
}

interface SendPersonalizedSmsParams {
	messages: PersonalizedSmsMessage[];
	senderName: string;
	lifetime?: number;
}

interface SmsStatus {
	id: string;
	status: 'ENROUTE' | 'DELIVRD' | 'EXPIRED' | 'UNDELIV' | 'REJECTD';
}

interface ApiResponse<T> {
	success_request?: {
		info?: T;
		add_info?: Record<string, unknown>;
	};
	status?: number;
}

interface BalanceResponse {
	money: string;
	currency: string;
}

interface OriginatorInfo {
	[key: string]: string; // originator_name: status
}

interface OriginatorRegistrationParams {
	senderId: string;
	companyName: string;
	companyType: 'tov' | 'fop'; // Limited company or individual entrepreneur
	inn?: string; // Individual entrepreneur registration number
	okpo?: string; // Limited company registration number
	subject: string;
	description: string;
	siteUrl: string;
}

interface OriginatorStatus {
	originator: string;
	status:
		| 'Approved'
		| 'Being moderated'
		| 'Rejected'
		| 'Awaiting moderation by operator'
		| 'Waiting for Additional. Information';
}

export class SMSClubClient {
	private apiToken: string;
	private apiUrl = 'https://im.smsclub.mobi';

	constructor(config: SMSClubConfig) {
		this.apiToken = config.apiToken;
	}

	/**
	 * Make an API request to SMS Club
	 */
	private async request<T>(
		endpoint: string,
		body?: Record<string, unknown>
	): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${this.apiUrl}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiToken}`
				},
				body: body ? JSON.stringify(body) : undefined
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('SMS Club API request failed:', errorText);
				throw new Error(`API request failed: ${response.statusText}`);
			}

			return (await response.json()) as ApiResponse<T>;
		} catch (error) {
			console.error('SMS Club API error:', error);
			throw error;
		}
	}

	/**
	 * Send SMS to one or multiple numbers with the same message
	 */
	async sendSms(params: SendSmsParams): Promise<Record<string, string>> {
		const phones = Array.isArray(params.phone) ? params.phone : [params.phone];

		const body: Record<string, unknown> = {
			src_addr: params.senderName,
			phone: phones,
			message: params.message
		};

		if (params.lifetime) {
			body.lifetime = params.lifetime;
		}

		const response = await this.request<Record<string, string>>('/sms/send', body);

		if (response.success_request?.info) {
			return response.success_request.info;
		}

		throw new Error(
			`Failed to send SMS: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Send personalized SMS messages (different message per number)
	 */
	async sendPersonalizedSms(params: SendPersonalizedSmsParams): Promise<Record<string, string>> {
		const body: Record<string, unknown> = {
			src_addr: params.senderName,
			data_message: params.messages.map((msg) => ({
				phone: msg.phone,
				message: msg.message
			}))
		};

		if (params.lifetime) {
			body.lifetime = params.lifetime;
		}

		const response = await this.request<Record<string, string>>('/v2/sms/send', body);

		if (response.success_request?.info) {
			return response.success_request.info;
		}

		throw new Error(
			`Failed to send personalized SMS: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Get SMS status by IDs
	 */
	async getSmsStatus(ids: string[]): Promise<Record<string, SmsStatus['status']>> {
		const response = await this.request<Record<string, string>>('/sms/status', {
			id_sms: ids
		});

		if (response.success_request?.info) {
			return response.success_request.info as Record<string, SmsStatus['status']>;
		}

		throw new Error(
			`Failed to get SMS status: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Get account balance
	 */
	async getBalance(): Promise<BalanceResponse> {
		const response = await this.request<BalanceResponse>('/sms/balance');

		if (response.success_request?.info) {
			return response.success_request.info;
		}

		throw new Error(
			`Failed to get balance: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Get list of available sender names (originators)
	 */
	async getOriginators(): Promise<OriginatorInfo> {
		const response = await this.request<OriginatorInfo>('/sms/originator');

		if (response.success_request?.info) {
			// info could be either an array or an object depending on the format
			const info = response.success_request.info;
			if (Array.isArray(info)) {
				// If it's an array, convert to object
				const result: OriginatorInfo = {};
				for (const originator of info) {
					if (typeof originator === 'string') {
						result[originator] = 'Approved';
					}
				}
				return result;
			}
			return info;
		}

		throw new Error(
			`Failed to get originators: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Get status of a specific originator or all originators
	 */
	async getOriginatorStatus(senderId?: string): Promise<Record<string, string>> {
		const body = senderId ? { sender_id: senderId } : {};
		const response = await this.request<Record<string, string>>(
			'/originators/stat-originators',
			body
		);

		if (response.success_request?.info) {
			return response.success_request.info;
		}

		throw new Error(
			`Failed to get originator status: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}

	/**
	 * Register a new sender name (originator)
	 */
	async registerOriginator(params: OriginatorRegistrationParams): Promise<OriginatorStatus> {
		const body: Record<string, unknown> = {
			sender_id: params.senderId,
			company: params.companyName,
			company_type: params.companyType,
			subject: params.subject,
			description: params.description,
			site: params.siteUrl
		};

		if (params.companyType === 'fop' && params.inn) {
			body.inn = params.inn;
		} else if (params.companyType === 'tov' && params.okpo) {
			body.okpo = params.okpo;
		}

		const response = await this.request<OriginatorStatus>(
			'/originators/registration-originators',
			body
		);

		if (response.success_request?.info) {
			return response.success_request.info;
		}

		throw new Error(
			`Failed to register originator: ${JSON.stringify(response.success_request?.add_info || response)}`
		);
	}
}

/**
 * Get SMS Club client instance
 */
export function getSMSClubClient(): SMSClubClient {
	const apiToken = SMS_CLUB_API_TOKEN;

	if (!apiToken) {
		throw new Error(
			'SMS Club API token not configured. Set SMS_CLUB_API_TOKEN environment variable.'
		);
	}

	return new SMSClubClient({ apiToken });
}
