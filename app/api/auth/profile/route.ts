import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = process.env.ONEC_AUTH_URL ?? 'http://localhost/smartmarket/hs/site-auth';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';
const BASIC_AUTH = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const res = await fetch(`${AUTH_URL}/profile`, {
    headers: { Authorization: BASIC_AUTH, 'X-Auth-Token': token },
    signal: AbortSignal.timeout(10000),
  });

  const text = await res.text();
  const data = text.trim() ? JSON.parse(text) : {};
  return NextResponse.json(data, { status: res.status });
}
