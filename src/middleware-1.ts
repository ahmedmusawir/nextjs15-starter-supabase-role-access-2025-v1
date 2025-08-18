import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, type AppRole } from './utils/get-user-role';

/**
 * Declarative map of protected route prefixes and the roles allowed to access them.
 * This map enforces a STRICT, non-hierarchical policy.
 */
const protectedRoutes: Record<string, AppRole[]> = {
  // Admin areas - ONLY 'admin' can access
  '/admin-portal': ['admin'],
  '/users': ['admin'],

  // Superadmin areas - ONLY 'superadmin' can access
  '/superadmin-portal': ['superadmin'],

  // Member areas - ONLY 'member' can access
  '/booking': ['member'],
  '/members-portal': ['member'],
};

export async function middleware(request: NextRequest) {
  // Prepare a pass-through response we can mutate cookies on and forward headers
  let response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const envHeader = hasEnv ? 'ok' : 'missing';
  response.headers.set('x-supabase-env', envHeader);

  // Create Supabase server client with explicit cookie adapter suitable for Edge Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Fetch the authenticated user (if any)
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  const { pathname } = request.nextUrl;

  // Identify if current path falls under any protected prefix
  const matchedPrefix = Object.keys(protectedRoutes).find((prefix) =>
    pathname.startsWith(prefix)
  );

  // If route is not protected, let it pass
  if (!matchedPrefix) {
    // Add debug headers
    response.headers.set('x-rbac-path', pathname);
    response.headers.set('x-rbac-role', user ? getUserRole(user.user_metadata) ?? 'none' : 'none');
    response.headers.set('x-supabase-env', envHeader);
    return response;
  }

  // If no authenticated user, redirect to auth page
  if (!user) {
    const authUrl = new URL('/auth', request.url);
    const redirect = NextResponse.redirect(authUrl);
    // propagate any Set-Cookie from Supabase client into redirect
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set('x-rbac-path', pathname);
    redirect.headers.set('x-rbac-role', 'none');
    redirect.headers.set('x-supabase-env', envHeader);
    return redirect;
  }

  // Determine user's effective role from metadata
  const role = getUserRole(user.user_metadata);
  const allowed = protectedRoutes[matchedPrefix];

  // If role missing or not allowed for the matched route, redirect to home
  if (!role || !allowed.includes(role)) {
    // Optional: minimal diagnostic logging
    console.warn(`RBAC: Deny ${pathname} for role: ${role ?? 'none'}`);
    const redirect = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    redirect.headers.set('x-rbac-path', pathname);
    redirect.headers.set('x-rbac-role', role ?? 'none');
    redirect.headers.set('x-supabase-env', envHeader);
    return redirect;
  }

  // Authorized → continue (include debug headers)
  response.headers.set('x-rbac-path', pathname);
  response.headers.set('x-rbac-role', role);
  response.headers.set('x-supabase-env', envHeader);
  return response;
}

export const config = {
  // Exclude API routes, Next internals, static assets, and public auth pages
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|auth).*)',
  ],
};
