import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = process.env.ONEC_AUTH_URL ?? 'http://localhost/smartmarket/hs/site-auth';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';
const BASIC_AUTH = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  try {
    await fetch(`${AUTH_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: BASIC_AUTH },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // Намеренно не раскрываем ошибку — всегда 200
  }

  // Всегда 200 — не раскрываем наличие email
  return NextResponse.json({ ok: true });
}
