import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/profile'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PROTECTED.some((path) => pathname.startsWith(path))) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      // Редирект на главную — модалка логина откроется через параметр
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', '1');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
