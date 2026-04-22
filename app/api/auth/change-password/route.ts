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
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BASIC_AUTH,
        'X-Auth-Token': token,
      },
      body: JSON.stringify(body),
      credentials: 'omit',
      signal: AbortSignal.timeout(10000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Сервер недоступен';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await safeJson(res);
  return NextResponse.json(data, { status: res.status });
}
