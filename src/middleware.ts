import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log(`--- [SMOKE TEST] Middleware is RUNNING for path: ${request.nextUrl.pathname} ---`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|auth).*)',
  ],
};
