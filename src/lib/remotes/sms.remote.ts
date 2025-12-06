import { command, form, query } from '$app/server';
import * as v from 'valibot';
import { getSMSClubClient } from '$lib/server/services/sms-club';
import { requireAdminUser, getUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { createNotification } from '$lib/server/services/notification-manager';

/**
 * Check SMS balance and create notification if low
 * Low balance threshold: 100 UAH
 */
async function checkAndNotifyLowBalance(balance: number, currency: string): Promise<void> {
	const LOW_BALANCE_THRESHOLD = 100; // 100 UAH
	
	if (balance < LOW_BALANCE_THRESHOLD) {
		const user = getUser();
		if (user && user.id) {
			await createNotification(user.id, {
				title: 'Low SMS Balance Warning',
				message: `Your SMS Club account balance is low: ${balance} ${currency}. Please top up your account to continue sending SMS messages.`,
				type: 'warning',
				actionUrl: '/admin/sms',
				actionLabel: 'View SMS Settings',
				metadata: {
					balance,
					currency,
					threshold: LOW_BALANCE_THRESHOLD,
					type: 'sms_low_balance'
				}
			});
		}
	}
}

/**
 * Send test SMS message
 * Used to verify SMS Club integration is working
 */
export const sendTestSms = form(
	v.object({
		phone: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
		message: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
		senderName: v.pipe(v.string(), v.minLength(1), v.maxLength(50))
	}),
	async (data) => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const result = await client.sendSms({
				phone: data.phone,
				message: data.message,
				senderName: data.senderName
			});

			// Check balance after sending SMS
			const balance = await client.getBalance();
			await checkAndNotifyLowBalance(balance.money, balance.currency);

			return {
				success: true,
				messageIds: result,
				message: 'SMS sent successfully'
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(400, `Failed to send SMS: ${errorMessage}`);
		}
	}
);

/**
 * Send personalized SMS messages
 */
export const sendPersonalizedSms = form(
	v.object({
		messages: v.pipe(
			v.array(
				v.object({
					phone: v.pipe(v.string(), v.minLength(1)),
					message: v.pipe(v.string(), v.minLength(1))
				})
			),
			v.minLength(1),
			v.maxLength(100)
		),
		senderName: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		lifetime: v.optional(v.number())
	}),
	async (data) => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const result = await client.sendPersonalizedSms({
				messages: data.messages,
				senderName: data.senderName,
				lifetime: data.lifetime
			});

			// Check balance after sending SMS
			const balance = await client.getBalance();
			await checkAndNotifyLowBalance(balance.money, balance.currency);

			return {
				success: true,
				messageIds: result,
				message: `${Object.keys(result).length} SMS messages sent successfully`
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(400, `Failed to send personalized SMS: ${errorMessage}`);
		}
	}
);

/**
 * Get account balance
 */
export const getAccountBalance = query(async () => {
	requireAdminUser();

	try {
		const client = getSMSClubClient();
		const balance = await client.getBalance();

		// Check for low balance and create notification if needed
		await checkAndNotifyLowBalance(balance.money, balance.currency);

		return {
			success: true,
			money: balance.money,
			currency: balance.currency
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(400, `Failed to get balance: ${errorMessage}`);
	}
});

/**
 * Get list of available sender names
 */
export const getOriginators = query(async () => {
	requireAdminUser();

	try {
		const client = getSMSClubClient();
		const originators = await client.getOriginators();

		// Transform into array format for easier display
		const originatorsList = Object.entries(originators).map(([name, status]) => ({
			name,
			status
		}));

		return {
			success: true,
			originators: originatorsList
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		error(400, `Failed to get originators: ${errorMessage}`);
	}
});

/**
 * Get status of sender names
 */
export const getOriginatorStatuses = query(
	v.object({
		senderId: v.optional(v.string())
	}),
	async (data) => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const statuses = await client.getOriginatorStatus(data?.senderId);

			const statusList = Object.entries(statuses).map(([name, status]) => ({
				name,
				status
			}));

			return {
				success: true,
				statuses: statusList
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(400, `Failed to get originator statuses: ${errorMessage}`);
		}
	}
);

/**
 * Register a new sender name
 */
export const registerOriginator = form(
	v.object({
		senderId: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
		companyName: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
		companyType: v.picklist(['tov', 'fop']),
		inn: v.optional(v.string()),
		okpo: v.optional(v.string()),
		subject: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
		description: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
		siteUrl: v.pipe(v.string(), v.minLength(1), v.maxLength(255))
	}),
	async (data) => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const result = await client.registerOriginator({
				senderId: data.senderId,
				companyName: data.companyName,
				companyType: data.companyType,
				inn: data.inn,
				okpo: data.okpo,
				subject: data.subject,
				description: data.description,
				siteUrl: data.siteUrl
			});

			// Refresh originator list after registration
			await getOriginatorStatuses({ senderId: undefined }).refresh();

			return {
				success: true,
				originator: result.originator,
				status: result.status,
				message: `Sender name "${result.originator}" registered with status: ${result.status}`
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(400, `Failed to register originator: ${errorMessage}`);
		}
	}
);

/**
 * Get SMS status by message IDs
 */
export const getSmsStatus = query(
	v.object({
		messageIds: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(100))
	}),
	async (data) => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const statuses = await client.getSmsStatus(data.messageIds);

			const statusList = Object.entries(statuses).map(([id, status]) => ({
				id,
				status
			}));

			return {
				success: true,
				statuses: statusList
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error(400, `Failed to get SMS status: ${errorMessage}`);
		}
	}
);

/**
 * Test SMS Club connection
 * This is a simple command to verify the API token is working
 */
export const testSmsClubConnection = command(
	v.object({}),
	async () => {
		requireAdminUser();

		try {
			const client = getSMSClubClient();
			const balance = await client.getBalance();

			return {
				success: true,
				message: 'SMS Club connection successful',
				balance: {
					money: balance.money,
					currency: balance.currency
				}
			};
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			return {
				success: false,
				message: `Connection failed: ${errorMessage}`
			};
		}
	}
);
