import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = process.env.ONEC_AUTH_URL ?? 'http://localhost/smartmarket/hs/site-auth';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';
const BASIC_AUTH = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Некорректный ответ сервера (HTTP ${res.status})` };
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: BASIC_AUTH },
      body: JSON.stringify(body),
      credentials: 'omit',
      signal: AbortSignal.timeout(10000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Сервер недоступен';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await safeJson(res) as Record<string, unknown>;
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const token = data.token as string | undefined;
  const expires_in = (data.expires_in as number | undefined) ?? 2592000;

  if (!token) {
    return NextResponse.json({ error: 'Сервер не вернул токен' }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expires_in,
  });
  return response;
}
