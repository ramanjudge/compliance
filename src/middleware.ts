import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Super simple hardcoded credentials for demo/admin
      // In production, use environment variables
      if (user === 'admin' && pwd === 'password123') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Auth Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Portal"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
