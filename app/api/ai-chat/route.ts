import { NextRequest, NextResponse } from 'next/server';
import { resolveProductSlug } from '../../../lib/1c/catalog';

const AI_CHAT_URL = `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/v1/chat`;
const UUID_RE = /\((?:\/products\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/gi;

export async function POST(req: NextRequest) {
  try {
    const { message, session_id } = await req.json();

    const res = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message, session_id: session_id || 'default' }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: res.status });
    }

    const data = await res.json();
    const answer: string = data.answer || '';

    // Собираем все UUID из ссылок /products/<uuid> прямо в тексте ответа
    const ids = [...new Set([...answer.matchAll(UUID_RE)].map((m) => m[1]))];

    // Резолвим каждый UUID → slug напрямую через 1С
    const slugMap: Record<string, string> = {};
    await Promise.all(
      ids.map(async (id) => {
        const slug = await resolveProductSlug(id);
        console.log(`[ai-chat] resolve ${id} → ${slug}`);
        if (slug) slugMap[id] = slug;
      })
    );

    // Заменяем (UUID) → (/product/<slug>) прямо в markdown
    const fixedAnswer = answer.replace(
      UUID_RE,
      (_, id: string) => `(/product/${slugMap[id] ?? id})`
    );

    return NextResponse.json({ text: fixedAnswer });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}
