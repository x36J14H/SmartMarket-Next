import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.ONEC_BASE_URL ?? 'http://localhost/SmartMarket/hs/site-api';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';

const AUTH_HEADER = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

// Разрешённые префиксы путей — защита от SSRF
const ALLOWED_PREFIXES = ['catalog', 'categories', 'brands'];

async function proxyRequest(req: NextRequest, path: string[]): Promise<NextResponse> {
  const joined = path.join('/');

  if (!ALLOWED_PREFIXES.some((prefix) => joined.startsWith(prefix))) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const url = new URL(`${BASE_URL}/${joined}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const isPost = req.method === 'POST';
    const body = isPost ? await req.text() : undefined;

    const res = await fetch(url.toString(), {
      method: req.method,
      headers: {
        Authorization: AUTH_HEADER,
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
