import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.ONEC_BASE_URL ?? 'http://localhost/SmartMarket/hs/site-api';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';

const AUTH_HEADER = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

// Разрешённые префиксы путей — защита от SSRF
const ALLOWED_PREFIXES = ['catalog', 'categories', 'brands'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const joined = path.join('/');

  if (!ALLOWED_PREFIXES.some((prefix) => joined.startsWith(prefix))) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const url = new URL(`${BASE_URL}/${joined}`);
  // Прокидываем все query-параметры (page, limit, category, brand, q и т.д.)
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: AUTH_HEADER },
      signal: AbortSignal.timeout(15000),
    });

    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.startsWith('image/')) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: res.status,
        headers: {
          'Content-Type': contentType,
          // fileId — неизменяемый UUID, кэшируем на 30 дней
          'Cache-Control': 'public, max-age=2592000, immutable',
        },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
