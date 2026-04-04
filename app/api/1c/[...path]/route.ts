import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.ONEC_BASE_URL ?? 'http://localhost/SmartMarket/hs/site-api';
// Basic Auth: "Администратор" без пароля
const AUTH_HEADER = 'Basic ' + Buffer.from('Администратор:').toString('base64');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${BASE_URL}/${path.join('/')}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: AUTH_HEADER },
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
