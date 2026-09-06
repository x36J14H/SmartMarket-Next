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

function normalizeDateStr(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const match = /\/Date\((\d+)(?:[+-]\d+)?\)\//.exec(raw);
    if (match) return new Date(parseInt(match[1], 10)).toISOString();
  }
  const d = new Date(raw as string | number);
  return !isNaN(d.getTime()) ? d.toISOString() : String(raw);
}

function normalizeOrderItem(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const rawTotal = item.total ?? item.total_amount ?? 0;
  const total = Number(rawTotal);
  return {
    ...item,
    total: isNaN(total) ? 0 : total,
    total_amount: isNaN(total) ? 0 : total,
    date: item.date ? normalizeDateStr(item.date) : item.date,
  };
}

function normalizeOrdersData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(normalizeOrderItem);
  }
  if (data && typeof data === 'object') {
    if (data.order && typeof data.order === 'object') {
      data.order = normalizeOrderItem(data.order);
    }
    return normalizeOrderItem(data);
  }
  return data;
}

type Context = { params: Promise<{ path?: string[] }> };

async function proxy(req: NextRequest, { params }: Context): Promise<NextResponse> {
  const { path } = await params;
  // Срезаем префикс orders, если он был передан (например, /api/orders/orders)
  const cleanPath = path?.[0] === 'orders' ? path.slice(1) : (path ?? []);
  const subPath = cleanPath.length > 0 ? `/${cleanPath.join('/')}` : '';

  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const targetUrl = new URL(`${PERSONAL_URL}/orders${subPath}`);
  req.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

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
    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
      credentials: 'omit',
      signal: AbortSignal.timeout(15000),
    });

    const text = await res.text();
    const rawData = text.trim() ? JSON.parse(text) : {};
    const data = res.ok ? normalizeOrdersData(rawData) : rawData;
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
