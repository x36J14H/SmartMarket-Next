import { NextRequest, NextResponse } from 'next/server';

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DADATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { suggestions: [], error: 'API key not configured' },
        { status: 200 }
      );
    }

    const { query, count = 5 } = await req.json();
    const trimmed = typeof query === 'string' ? query.trim() : '';

    if (!trimmed || trimmed.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const res = await fetch(DADATA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        query: trimmed,
        count: Math.min(Math.max(count, 1), 10),
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    return NextResponse.json({ suggestions: data.suggestions ?? [] });
  } catch (err) {
    console.error('DaData suggest error:', err);
    return NextResponse.json({ suggestions: [] });
  }
}
