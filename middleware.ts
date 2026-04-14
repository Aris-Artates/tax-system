import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// We just check for presence in middleware to avoid Edge runtime issues with complex signing 
// Detailed verification happens in layouts and API routes via auth-guard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('tax_session');

  // 1. Define public paths
  const isAuthPage = pathname === '/';
  const isAuthApi = pathname.startsWith('/api/auth');
  const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next');

  if (isPublicFile || isAuthApi) {
    return NextResponse.next();
  }

  // 2. Redirect to login if no session and trying to access protected page
  if (!session && !isAuthPage) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Optional: Redirect to dashboard if session exists and on login page
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
