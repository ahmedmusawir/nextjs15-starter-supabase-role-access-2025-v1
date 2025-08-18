import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, type AppRole } from './utils/get-user-role';

// THIS IS BEING KEPT CUZ THIS ONE ALLOWS CASCADING ROLE ACCESS
// SUPERADMIN CAN ACCESS ALL OTHERS
// ADMIN CAN ACCESS MEMEBERS
// MEMBERS CAN ACCESS ONLY THEMSELVES

/**
 * Declarative map of protected route prefixes and the roles allowed to access them.
 * Keys are pathname prefixes; values are arrays of roles that can access those paths.
 * Adjust these as your route structure evolves.
 */
const protectedRoutes: Record<string, AppRole[]> = {
  // Admin areas
  '/admin-portal': ['admin', 'superadmin'],
  '/users': ['admin', 'superadmin'],

  // Superadmin areas
  '/superadmin-portal': ['superadmin'],

  // Member areas
  '/booking': ['member', 'admin', 'superadmin'],
  '/members-portal': ['member', 'admin', 'superadmin'],
};

export async function middleware(request: NextRequest) {
  // Prepare a pass-through response we can mutate cookies on
  let response = NextResponse.next({ request });

  // Create Supabase server client with explicit cookie adapter suitable for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the incoming request cookies (for this lifecycle)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Recreate NextResponse and apply Set-Cookie headers to the outgoing response
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
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
    return response;
  }

  // If no authenticated user, redirect to auth page
  if (!user) {
    const authUrl = new URL('/auth', request.url);
    return NextResponse.redirect(authUrl);
  }

  // Determine user's effective role from metadata
  const role = getUserRole(user.user_metadata);
  const allowed = protectedRoutes[matchedPrefix];

  // If role missing or not allowed for the matched route, redirect to home
  if (!role || !allowed.includes(role)) {
    // Optional: log minimal info for diagnostics (avoids leaking PII)
    console.warn(`RBAC: Deny ${pathname} for role: ${role ?? 'none'}`);
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Authorized → continue
  return response;
}

export const config = {
  // Exclude API routes, Next internals, static assets, and public auth pages
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|auth).*)',
  ],
};
