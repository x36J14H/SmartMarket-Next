import { onecClient } from './client';

export interface ChatMessage {
  id: string;
  date: string;
  author: 'Клиент' | 'Оператор';
  author_name: string;
  text: string;
  is_operator: boolean;
}

export interface ChatHistoryResponse {
  chat_id: string;
  status: string;
  client_name?: string;
  operator_name?: string;
  messages: ChatMessage[];
}

export interface SendMessagePayload {
  chat_id?: string;
  text: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}

export interface SendMessageResponse {
  chat_id: string;
  message_id: string;
  text: string;
  author: string;
  author_name: string;
  date: string;
  status: string;
}

/**
 * Загружает историю сообщений напрямую из 1С.
 * В браузере история НЕ сохраняется в localStorage — 1С является единым источником правды.
 */
export async function getChatHistory(chatId: string, signal?: AbortSignal): Promise<ChatHistoryResponse> {
  if (!chatId) {
    return { chat_id: '', status: 'Новый', messages: [] };
  }
  return onecClient.get<ChatHistoryResponse>(`chat/messages?chat_id=${encodeURIComponent(chatId)}`, signal);
}

/**
 * Отправляет сообщение клиента в 1С (создавая чат, если он новый).
 * Запрос отправляется ТОЛЬКО в момент фактической отправки реплики пользователем.
 */
export async function sendChatMessage(payload: SendMessagePayload, signal?: AbortSignal): Promise<SendMessageResponse> {
  return onecClient.post<SendMessageResponse>('chat/messages', payload, signal);
}

/**
 * Завершает диалог с оператором со стороны клиента.
 */
export async function closeChat(chatId: string, signal?: AbortSignal): Promise<{ success: boolean }> {
  return onecClient.post<{ success: boolean }>('chat/close', { chat_id: chatId }, signal);
}
