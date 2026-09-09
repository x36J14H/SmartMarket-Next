import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.ONEC_BASE_URL ?? 'http://localhost/SmartMarket/hs/site-api';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';

const AUTH_HEADER = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

// Разрешённые префиксы путей — защита от SSRF
// 'catalog' покрывает /catalog/{id}/reviews и /catalog/{id}/questions
const ALLOWED_PREFIXES = ['catalog', 'categories', 'brands'];



async function proxyRequest(req: NextRequest, path: string[]): Promise<NextResponse> {
  const joined = path.join('/');

  if (!ALLOWED_PREFIXES.some((prefix) => joined.startsWith(prefix))) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  // Эндпоинт пакетной проверки остатков и цен GET /catalog/availability?ids=...
  // В 1C он обрабатывается через POST /catalog/by-ids
  if (joined === 'catalog/availability') {
    const idsParam = req.nextUrl.searchParams.get('ids');
    if (idsParam === null || idsParam === undefined) {
      return NextResponse.json({ error: 'Параметр ids обязателен' }, { status: 400 });
    }
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    try {
      const res = await fetch(`${BASE_URL}/catalog/by-ids`, {
        method: 'POST',
        headers: {
          Authorization: AUTH_HEADER,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: ids.slice(0, 200) }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return NextResponse.json([]);
      }

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      const availability = items.map((item: { id: string; price?: number; inStock?: number }) => ({
        id: item.id,
        price: typeof item.price === 'number' ? item.price : 0,
        inStock: typeof item.inStock === 'number' ? item.inStock : 0,
      }));

      return NextResponse.json(availability);
    } catch {
      return NextResponse.json([]);
    }
  }

  const url = new URL(`${BASE_URL}/${joined}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const isPost = req.method === 'POST';
    const body = isPost ? await req.text() : undefined;
    const token = req.cookies.get('auth_token')?.value;

    const res = await fetch(url.toString(), {
      method: req.method,
      headers: {
        Authorization: AUTH_HEADER,
        ...(token ? { 'X-Auth-Token': token } : {}),
        ...(isPost ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      credentials: 'omit',
      signal: AbortSignal.timeout(15000),
    });

    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.startsWith('image/')) {
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: res.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=2592000, immutable',
        },
      });
    }

    if (!res.ok) {
      let errData: unknown = {};
      try {
        errData = await res.json();
      } catch {
        errData = { error: res.statusText || `HTTP ${res.status}` };
      }
      console.error(`[1C Proxy Error] ${req.method} ${joined} -> ${res.status}:`, errData);
      return NextResponse.json(errData, { status: res.status });
    }

    const text = await res.text();
    const data = text.trim() ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}
