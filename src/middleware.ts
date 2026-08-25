import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/admin-auth.server';

// NOTE: verifyAdminToken is in src/lib and uses process.env.ADMIN_SECRET
// Exclude auth endpoints from protection and handle API/browser differences
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth endpoints and static files
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Protect admin UI and admin-admin API routes only
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // For API auth we already allowed /api/auth above
    const token = request.cookies.get('admin_session')?.value;
    const valid = await verifyAdminToken(token);

    if (valid) {
      return NextResponse.next();
    }

    // If request expects JSON (API), return 401; otherwise redirect to login
    const accept = request.headers.get('accept') || '';
    if (accept.includes('application/json') || pathname.startsWith('/api/admin')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
