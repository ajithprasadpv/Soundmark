import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no authentication required
  const publicRoutes = ['/', '/demo', '/auth/signin', '/auth/error'];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'))) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Check subscription status (allow trial and active)
    // In a real app, you'd fetch this from the database
    // For now, we'll allow all authenticated users
    return NextResponse.next();
  }

  // Protect admin routes - require super_admin role
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // Protect old login route - redirect to new auth
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
