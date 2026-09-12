import { NextRequest, NextResponse } from 'next/server';
import { broadcastChatPush, ChatMessagePush } from '@/lib/chatHub';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ChatMessagePush>;

    if (!body.chat_id || !body.text) {
      return NextResponse.json({ error: 'chat_id and text are required' }, { status: 400 });
    }

    const message: ChatMessagePush = {
      chat_id: String(body.chat_id),
      message_id: String(body.message_id || Date.now()),
      text: String(body.text),
      author: body.author === 'Клиент' ? 'Клиент' : 'Оператор',
      author_name: String(body.author_name || 'Оператор'),
      date: String(body.date || new Date().toISOString()),
    };

    // Мгновенная доставка во все открытые вкладки покупателя по данному чату
    broadcastChatPush(message);

    return NextResponse.json({ success: true, message: 'Delivered via SSE' });
  } catch (error) {
    console.error('Error handling chat push webhook:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
