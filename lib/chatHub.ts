import { EventEmitter } from 'events';

export interface ChatMessagePush {
  chat_id: string;
  message_id: string;
  text: string;
  author: 'Оператор' | 'Клиент';
  author_name: string;
  date: string;
}

declare global {
  var __chatEmitter: EventEmitter | undefined;
}

const chatEmitter = global.__chatEmitter || new EventEmitter();
if (process.env.NODE_ENV !== 'production') {
  global.__chatEmitter = chatEmitter;
}

chatEmitter.setMaxListeners(200);

export function broadcastChatPush(msg: ChatMessagePush) {
  chatEmitter.emit(`chat:${msg.chat_id}`, msg);
}

export function subscribeToChat(chatId: string, listener: (msg: ChatMessagePush) => void) {
  const eventName = `chat:${chatId}`;
  chatEmitter.on(eventName, listener);
  return () => {
    chatEmitter.off(eventName, listener);
  };
}
