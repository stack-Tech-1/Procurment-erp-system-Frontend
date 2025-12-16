// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for auth pages and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname === '/signup' ||
    pathname === '/login' ||
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/support'
  ) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};