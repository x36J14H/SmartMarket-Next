import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = process.env.ONEC_AUTH_URL ?? 'http://localhost/smartmarket/hs/site-auth';
const USERNAME = process.env.ONEC_USERNAME ?? 'Администратор';
const PASSWORD = process.env.ONEC_PASSWORD ?? '';
const BASIC_AUTH = 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (token) {
    fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: BASIC_AUTH, 'X-Auth-Token': token },
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('auth_token');
  return response;
}
