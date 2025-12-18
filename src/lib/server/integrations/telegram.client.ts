import { error as logError } from 'console';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID } from '$env/static/private';

export interface TelegramClientConfig {
  botToken: string;
  channelId: string | number;
}

export interface TelegramSendMessageParams {
  chat_id: string | number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_markup?: unknown;
}

export interface TelegramSendPhotoParams {
  chat_id: string | number;
  photo: string;
  caption?: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_markup?: unknown;
}

export interface TelegramResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramMessage {
  message_id: number;
  date: number;
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
  };
  text?: string;
}

/**
 * Telegram Bot API Client
 * Provides type-safe methods for interacting with Telegram Bot API
 * Reference: https://core.telegram.org/bots/api
 */
export class TelegramClient {
  private botToken: string;
  private channelId: string | number;
  private baseUrl = 'https://api.telegram.org';

  constructor(config: TelegramClientConfig) {
    if (!config.botToken) {
      throw new Error('Telegram bot token is required');
    }
    if (!config.channelId) {
      throw new Error('Telegram channel ID is required');
    }

    this.botToken = config.botToken;
    this.channelId = config.channelId;
  }

  /**
   * Constructs the full API URL for a method
   */
  private getApiUrl(method: string): string {
    return `${this.baseUrl}/bot${this.botToken}/${method}`;
  }

  /**
   * Makes a request to the Telegram Bot API
   */
  private async request<T = unknown>(
    method: string,
    params: Record<string, unknown>
  ): Promise<TelegramResponse<T>> {
    try {
      const response = await fetch(this.getApiUrl(method), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data: TelegramResponse<T> = await response.json();

      if (!response.ok || !data.ok) {
        logError('Telegram API Error:', {
          method,
          status: response.status,
          error: data.description,
          errorCode: data.error_code,
          ...(params.chat_id && { chat_id: params.chat_id, chat_id_type: typeof params.chat_id }),
        });
      }

      return data;
    } catch (err) {
      logError('Telegram API Request Error:', err);
      return {
        ok: false,
        description: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Tests the bot authentication token
   * Reference: https://core.telegram.org/bots/api#getme
   */
  async getMe(): Promise<TelegramUser | null> {
    const response = await this.request<TelegramUser>('getMe', {});
    return response.ok && response.result ? response.result : null;
  }

  /**
   * Gets information about a chat to verify bot access and permissions
   * Reference: https://core.telegram.org/bots/api#getchat
   */
  async getChatInfo(): Promise<{ ok: boolean; message: string; data?: unknown }> {
    try {
      const response = await this.request<unknown>('getChat', {
        chat_id: this.channelId,
      });

      if (!response.ok) {
        return {
          ok: false,
          message: `Cannot access chat: ${response.description || 'Unknown error'}. Make sure: 
1. The bot is added to the channel/group as an admin
2. The channel ID is correct
3. The channel/group is not private or restricted`,
        };
      }

      return {
        ok: true,
        message: 'Bot has access to the chat',
        data: response.result,
      };
    } catch (err) {
      return {
        ok: false,
        message: `Error checking chat access: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validates that the bot can send messages to the configured chat
   * This should be called before attempting to send any messages
   */
  async validateChannelAccess(): Promise<{ valid: boolean; message: string }> {
    try {
      // First check if bot token is valid
      const botInfo = await this.getMe();
      if (!botInfo) {
        return {
          valid: false,
          message: 'Invalid bot token. Check TELEGRAM_BOT_TOKEN in environment variables.',
        };
      }

      // Then check if bot can access the chat
      const chatInfo = await this.getChatInfo();
      if (!chatInfo.ok) {
        return {
          valid: false,
          message: chatInfo.message,
        };
      }

      return {
        valid: true,
        message: `✅ Bot is ready! Connected to chat with ID: ${this.channelId}`,
      };
    } catch (err) {
      return {
        valid: false,
        message: `Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Sends a text message
   * Reference: https://core.telegram.org/bots/api#sendmessage
   */
  async sendMessage(
    text: string,
    params?: Omit<TelegramSendMessageParams, 'chat_id' | 'text'>
  ): Promise<TelegramMessage | null> {
    const fullParams: TelegramSendMessageParams = {
      chat_id: this.channelId,
      text,
      parse_mode: 'HTML',
      ...params,
    };

    const response = await this.request<TelegramMessage>('sendMessage', fullParams);
    return response.ok && response.result ? response.result : null;
  }

  /**
   * Sends a photo
   * Reference: https://core.telegram.org/bots/api#sendphoto
   */
  async sendPhoto(
    photo: string,
    params?: Omit<TelegramSendPhotoParams, 'chat_id' | 'photo'>
  ): Promise<TelegramMessage | null> {
    const fullParams: TelegramSendPhotoParams = {
      chat_id: this.channelId,
      photo,
      parse_mode: 'HTML',
      ...params,
    };

    const response = await this.request<TelegramMessage>('sendPhoto', fullParams);
    return response.ok && response.result ? response.result : null;
  }

  /**
   * Sends a document (file)
   * Reference: https://core.telegram.org/bots/api#senddocument
   */
  async sendDocument(
    fileUrl: string,
    params?: {
      caption?: string;
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disable_notification?: boolean;
    }
  ): Promise<TelegramMessage | null> {
    const response = await this.request<TelegramMessage>('sendDocument', {
      chat_id: this.channelId,
      document: fileUrl,
      parse_mode: 'HTML',
      ...params,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Edits a previously sent message
   * Reference: https://core.telegram.org/bots/api#editmessagetext
   */
  async editMessage(
    messageId: number,
    text: string,
    params?: {
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disable_web_page_preview?: boolean;
    }
  ): Promise<boolean> {
    const response = await this.request<TelegramMessage>('editMessageText', {
      chat_id: this.channelId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...params,
    });

    return response.ok;
  }

  /**
   * Deletes a message
   * Reference: https://core.telegram.org/bots/api#deletemessage
   */
  async deleteMessage(messageId: number): Promise<boolean> {
    const response = await this.request('deleteMessage', {
      chat_id: this.channelId,
      message_id: messageId,
    });

    return response.ok;
  }

  /**
   * Sends a chat action (typing, upload_photo, etc.)
   * Reference: https://core.telegram.org/bots/api#sendchataction
   */
  async sendChatAction(
    action:
      | 'typing'
      | 'upload_photo'
      | 'record_video'
      | 'upload_video'
      | 'record_voice'
      | 'upload_voice'
      | 'upload_document'
      | 'find_location'
  ): Promise<boolean> {
    const response = await this.request('sendChatAction', {
      chat_id: this.channelId,
      action,
    });

    return response.ok;
  }

  /**
   * Pins a message in the channel
   * Reference: https://core.telegram.org/bots/api#pinchatmessage
   */
  async pinMessage(
    messageId: number,
    params?: {
      disable_notification?: boolean;
    }
  ): Promise<boolean> {
    const response = await this.request('pinChatMessage', {
      chat_id: this.channelId,
      message_id: messageId,
      ...params,
    });

    return response.ok;
  }

  /**
   * Unpins a message from the channel
   * Reference: https://core.telegram.org/bots/api#unpinchatmessage
   */
  async unpinMessage(messageId: number): Promise<boolean> {
    const response = await this.request('unpinChatMessage', {
      chat_id: this.channelId,
      message_id: messageId,
    });

    return response.ok;
  }

  /**
   * Gets information about a chat
   * Reference: https://core.telegram.org/bots/api#getchat
   */
  async getChat(): Promise<Record<string, unknown> | null> {
    const response = await this.request('getChat', {
      chat_id: this.channelId,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Sets the channel description
   * Reference: https://core.telegram.org/bots/api#setchatdescription
   */
  async setChannelDescription(description: string): Promise<boolean> {
    const response = await this.request('setChatDescription', {
      chat_id: this.channelId,
      description,
    });

    return response.ok;
  }

  /**
   * Sends a media group (multiple photos/videos)
   * Reference: https://core.telegram.org/bots/api#sendmediagroup
   */
  async sendMediaGroup(
    media: Array<{
      type: 'photo' | 'video' | 'audio' | 'document';
      media: string;
      caption?: string;
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    }>
  ): Promise<TelegramMessage[] | null> {
    const response = await this.request<TelegramMessage[]>('sendMediaGroup', {
      chat_id: this.channelId,
      media,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Sends a location message
   * Reference: https://core.telegram.org/bots/api#sendlocation
   */
  async sendLocation(
    latitude: number,
    longitude: number,
    params?: {
      disable_notification?: boolean;
    }
  ): Promise<TelegramMessage | null> {
    const response = await this.request<TelegramMessage>('sendLocation', {
      chat_id: this.channelId,
      latitude,
      longitude,
      ...params,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Forwards a message from another chat
   * Reference: https://core.telegram.org/bots/api#forwardmessage
   */
  async forwardMessage(
    fromChatId: string | number,
    messageId: number,
    params?: {
      disable_notification?: boolean;
    }
  ): Promise<TelegramMessage | null> {
    const response = await this.request<TelegramMessage>('forwardMessage', {
      chat_id: this.channelId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...params,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Gets file information
   * Reference: https://core.telegram.org/bots/api#getfile
   */
  async getFile(
    fileId: string
  ): Promise<{ file_id: string; file_unique_id: string; file_size?: number; file_path?: string } | null> {
    const response = await this.request(
      'getFile',
      {
        file_id: fileId,
      }
    );

    return response.ok && response.result ? (response.result as any) : null;
  }

  /**
   * Gets the file download URL
   */
  getFileUrl(filePath: string): string {
    return `${this.baseUrl}/file/bot${this.botToken}/${filePath}`;
  }

  /**
   * Sends a document via URL or file ID with specific chat ID (override)
   */
  async sendDocumentToChat(
    chatId: string | number,
    fileUrl: string,
    params?: {
      caption?: string;
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disable_notification?: boolean;
    }
  ): Promise<TelegramMessage | null> {
    const response = await this.request<TelegramMessage>('sendDocument', {
      chat_id: chatId,
      document: fileUrl,
      parse_mode: 'HTML',
      ...params,
    });

    return response.ok && response.result ? response.result : null;
  }

  /**
   * Sends a message to a specific chat (override)
   */
  async sendMessageToChat(
    chatId: string | number,
    text: string,
    params?: Omit<TelegramSendMessageParams, 'chat_id' | 'text'>
  ): Promise<TelegramMessage | null> {
    const fullParams: TelegramSendMessageParams = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...params,
    };

    const response = await this.request<TelegramMessage>('sendMessage', fullParams);
    return response.ok && response.result ? response.result : null;
  }

  /**
   * Answers a callback query
   * Reference: https://core.telegram.org/bots/api#answercallbackquery
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    params?: {
      text?: string;
      show_alert?: boolean;
      url?: string;
      cache_time?: number;
    }
  ): Promise<boolean> {
    const response = await this.request('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      ...params,
    });

    return response.ok;
  }

  /**
   * Restricts a chat member
   * Reference: https://core.telegram.org/bots/api#restrictchatmember
   */
  async restrictChatMember(
    userId: number,
    permissions: Record<string, boolean>,
    params?: {
      until_date?: number;
    }
  ): Promise<boolean> {
    const response = await this.request('restrictChatMember', {
      chat_id: this.channelId,
      user_id: userId,
      permissions,
      ...params,
    });

    return response.ok;
  }

  /**
   * Bans a chat member
   * Reference: https://core.telegram.org/bots/api#banchatmember
   */
  async banChatMember(
    userId: number,
    params?: {
      until_date?: number;
      revoke_messages?: boolean;
    }
  ): Promise<boolean> {
    const response = await this.request('banChatMember', {
      chat_id: this.channelId,
      user_id: userId,
      ...params,
    });

    return response.ok;
  }

  /**
   * Unbans a chat member
   * Reference: https://core.telegram.org/bots/api#unbanchatmember
   */
  async unbanChatMember(userId: number): Promise<boolean> {
    const response = await this.request('unbanChatMember', {
      chat_id: this.channelId,
      user_id: userId,
    });

    return response.ok;
  }
}

/**
 * Get Telegram channel ID from database or environment
 * Returns {channelId, source} where source is 'database' or 'environment'
 */
async function getTelegramChannelIdWithFallback(): Promise<{
  channelId: string | number;
  source: 'database' | 'environment';
}> {
  try {
    // Try to get from database first
    const { getTelegramChannelId } = await import('$lib/remotes/settings.remote');
    const result = await getTelegramChannelId();

    if (result.success && result.channelId) {
      // Convert channel ID to number if it's numeric
      let channelId: string | number = result.channelId;
      if (/^-?\d+$/.test(result.channelId)) {
        channelId = parseInt(result.channelId, 10);
      }

      return {
        channelId,
        source: result.source
      };
    }
  } catch (error) {
    logError('Failed to get channel ID from database, falling back to environment:', error);
  }

  // Fallback to environment variable
  const channelIdEnv = TELEGRAM_CHANNEL_ID;
  if (!channelIdEnv) {
    throw new Error(
      'No Telegram channel ID found in database or TELEGRAM_CHANNEL_ID environment variable'
    );
  }

  // Convert channel ID to number if it's numeric
  let channelId: string | number = channelIdEnv;
  if (/^-?\d+$/.test(channelIdEnv)) {
    channelId = parseInt(channelIdEnv, 10);
  }

  return {
    channelId,
    source: 'environment'
  };
}

/**
 * Factory function to create a Telegram client
 */
export function createTelegramClient(): TelegramClient {
  const botToken = TELEGRAM_BOT_TOKEN;
  const channelIdEnv = TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelIdEnv) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID environment variables are required');
  }

  // Convert channel ID to number if it's numeric, otherwise keep as string for @username format
  let channelId: string | number = channelIdEnv;
  if (/^-?\d+$/.test(channelIdEnv)) {
    channelId = parseInt(channelIdEnv, 10);
  }

  return new TelegramClient({
    botToken,
    channelId,
  });
}

/**
 * Async factory function to create a Telegram client with DB-first, env-fallback
 */
export async function createTelegramClientWithDbFallback(): Promise<TelegramClient> {
  const botToken = TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
  }

  const { channelId, source } = await getTelegramChannelIdWithFallback();

  console.log(`[Telegram] Using channel ID from ${source}:`, channelId);

  return new TelegramClient({
    botToken,
    channelId,
  });
}
