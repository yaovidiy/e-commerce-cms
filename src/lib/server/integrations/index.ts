/**
 * Telegram Integration Exports
 * Main entry point for Telegram bot functionality
 */

export { TelegramClient, createTelegramClient, createTelegramClientWithDbFallback } from './telegram.client';
export type { TelegramClientConfig, TelegramSendMessageParams, TelegramSendPhotoParams, TelegramResponse, TelegramUser, TelegramMessage } from './telegram.client';

export { TelegramOrderNotificationService, createTelegramOrderNotificationService } from './telegram.order-notifications';
export type { OrderNotificationPayload } from './telegram.order-notifications';
