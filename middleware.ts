import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup'];

// Define API routes that don't require authentication
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files (images, etc.) to be served without authentication
  const staticFileExtensions = ['.svg', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico', '.pdf'];
  const isStaticFile = staticFileExtensions.some(ext => pathname.endsWith(ext));
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Redirect old dashboard routes to unified dashboard
  if (pathname === '/dashboard/professor' || pathname === '/dashboard/student') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the token from the cookie
  const token = request.cookies.get('jwt')?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes - only allow admin role
  if (pathname.startsWith('/admin')) {
    try {
      // Decode JWT to check role
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/hello (health check endpoint)
     * Note: Static files are handled in the middleware function itself
     */
    '/((?!_next/static|_next/image|favicon.ico|api/hello).*)',
  ],
};
