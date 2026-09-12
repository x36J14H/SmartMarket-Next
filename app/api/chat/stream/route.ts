import { NextRequest } from 'next/server';
import { subscribeToChat } from '@/lib/chatHub';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const chatId = req.nextUrl.searchParams.get('chat_id');

  if (!chatId) {
    return new Response('chat_id query parameter is required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Отправляем подтверждение установки соединения
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', chat_id: chatId })}\n\n`)
      );

      // Подписываемся на события пуша от 1С для данного chat_id
      const unsubscribe = subscribeToChat(chatId, (msg) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'message', message: msg })}\n\n`)
          );
        } catch {
          // stream could be closed
        }
      });

      // Keep-alive пинг каждые 20 секунд против разрыва прокси
      const keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(keepAliveTimer);
        }
      }, 20000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepAliveTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
