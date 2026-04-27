import { NextRequest, NextResponse } from 'next/server';

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 10 } = await req.json();
    if (!query?.trim()) return NextResponse.json({ ids: [] });

    // Пробуем семантический поиск, таймаут 5 сек
    try {
      const res = await fetch(`${AI_BASE_URL}/api/v1/products/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: limit }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ ids: data.ids ?? [], source: 'semantic' });
      }
    } catch {
      // таймаут или сервис недоступен — идём в fallback
    }

    // Fallback — текстовый поиск через 1С
    const credentials = Buffer.from(
      `${process.env.ONEC_USERNAME}:${process.env.ONEC_PASSWORD}`
    ).toString('base64');
    const qs = new URLSearchParams({ q: query.trim(), limit: String(limit) });
    const res = await fetch(`${process.env.ONEC_BASE_URL}/catalog?${qs}`, {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    const ids = (data.items ?? []).map((p: { id: string }) => p.id);
    return NextResponse.json({ ids, source: 'text' });
  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json({ ids: [] }, { status: 500 });
  }
}
