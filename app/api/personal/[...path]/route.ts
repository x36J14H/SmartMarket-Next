import { NextRequest, NextResponse } from 'next/server';

const PERSONAL_URL =
  process.env.ONEC_PERSONAL_URL ??
  (process.env.ONEC_BASE_URL ?? 'http://localhost/smartmarket/hs/site-api').replace(
    /\/hs\/site-api$/,
    '/hs/personal'
  );

const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';
const BASIC_AUTH = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

const ALLOWED_PREFIXES = ['wishlist', 'cart', 'profile'];

type Context = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Context): Promise<NextResponse> {
  const { path } = await params;
  const joined = path.join('/');

  if (!ALLOWED_PREFIXES.some((p) => joined === p || joined.startsWith(`${p}/`))) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const url = `${PERSONAL_URL}/${joined}`;

  const headers: Record<string, string> = {
    Authorization: BASIC_AUTH,
    'X-Auth-Token': token,
  };

  const hasBody = req.method === 'POST' || req.method === 'PATCH';
  let body: string | undefined;
  if (hasBody) {
    const text = await req.text();
    if (text.trim()) {
      headers['Content-Type'] = 'application/json';
      body = text;
    }
  }

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
      credentials: 'omit',
      signal: AbortSignal.timeout(10000),
    });

    const text = await res.text();
    const data = text.trim() ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
