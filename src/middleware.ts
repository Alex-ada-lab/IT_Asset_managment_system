import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files through
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Check for auth token stored as a cookie.
  // The AuthContext also stores in localStorage, but cookies are accessible
  // server-side. The AuthContext sets a "token" cookie on login for SSR guard.
  const tokenCookie = request.cookies.get('token')?.value;

  // Skip middleware protection for static Next.js assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If no token cookie, redirect to /login
  if (!tokenCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files, images, favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
