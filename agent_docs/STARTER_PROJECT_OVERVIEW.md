# STARTER PROJECT OVERVIEW

**Project Name:** Cyber Bugs - Next.js 15 Starter with Supabase RBAC  
**Date Generated:** December 30, 2025  
**Framework:** Next.js 15.4.6 (App Router)  
**React Version:** 19.2.1 (Security Update)

---

## Executive Summary

This is a production-ready Next.js 15 starter project with Supabase authentication and role-based access control (RBAC). The project implements a three-tier role system (superadmin, admin, member) with protected routes, SSR session management, and a modern UI built with Tailwind CSS and shadcn/ui components.

**Key Strengths:**
- Properly configured Supabase SSR with middleware-based session refresh
- Clean RBAC implementation at the application layer
- Modern tech stack with latest stable versions
- Well-structured component architecture
- Comprehensive authentication flow

**Areas for Enhancement:**
- Missing database-level RLS (Row Level Security)
- No Stripe integration yet
- Some referenced routes not implemented (/dashboard, /billing, etc.)
- No data models beyond user authentication

---

## Technology Stack

### Core Framework
- **Next.js:** 15.4.6 (App Router only, no Pages Router)
- **React:** 19.2.1
- **TypeScript:** 5.x
- **Node.js:** Compatible with Next.js 15

### Backend & Authentication
- **Supabase:** Auth + Postgres database
- **@supabase/ssr:** 0.6.1 (Server-side rendering support)
- **@supabase/supabase-js:** 2.44.0

### UI & Styling
- **Tailwind CSS:** 3.4.1
- **shadcn/ui:** Component library (Radix UI primitives)
- **next-themes:** 0.3.0 (Dark mode support)
- **Lucide React:** 0.394.0 (Icon library)
- **SASS:** 1.77.6

### State Management & Forms
- **Zustand:** 4.5.4 (with persist middleware)
- **React Hook Form:** 7.51.5
- **Zod:** 3.23.8 (Schema validation)
- **@hookform/resolvers:** 3.6.0

### UI Components (Radix UI)
- Avatar, Dialog, Dropdown Menu, Label, Slot, Tabs, Toast

### Additional Libraries
- **class-variance-authority:** 0.7.0 (CVA for component variants)
- **clsx & tailwind-merge:** Utility classes
- **cmdk:** 1.0.0 (Command palette)
- **@heroicons/react:** 2.1.5

### Testing
- **Jest:** 30.0.5
- **ts-jest:** 29.4.1
- **@types/jest:** 30.0.0

---

## Project Structure

```
cyberbugs-nextjs-cloud-v1/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (admin)/                  # Admin route group
│   │   │   ├── layout.tsx            # Protected with protectPage(['admin'])
│   │   │   ├── admin-portal/
│   │   │   ├── admin-booking/
│   │   │   └── users/
│   │   ├── (auth)/                   # Auth route group
│   │   │   └── auth/page.tsx         # Login/Register page
│   │   ├── (members)/                # Members route group
│   │   │   ├── layout.tsx            # Protected with protectPage(['member'])
│   │   │   ├── members-portal/
│   │   │   └── booking/
│   │   ├── (public)/                 # Public route group
│   │   │   ├── page.tsx              # Home page
│   │   │   └── demo/
│   │   ├── (superadmin)/             # Superadmin route group
│   │   │   ├── layout.tsx            # Protected with protectPage(['superadmin'])
│   │   │   └── superadmin-portal/
│   │   ├── api/                      # API routes
│   │   │   └── auth/
│   │   │       ├── login/route.ts
│   │   │       ├── logout/route.ts
│   │   │       ├── signup/route.ts
│   │   │       ├── confirm/route.ts
│   │   │       └── superadmin-add-user/route.ts
│   │   ├── error/page.tsx
│   │   ├── layout.tsx                # Root layout with ThemeProvider
│   │   ├── not-found.tsx
│   │   └── providers/
│   │       └── ThemeProvider.tsx
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   ├── auth/                     # Auth components
│   │   │   ├── AuthTabs.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── Logout.tsx
│   │   ├── common/                   # Shared components
│   │   ├── dashboard/
│   │   ├── global/                   # Global components
│   │   │   ├── Navbar.tsx
│   │   │   ├── NavbarHome.tsx
│   │   │   ├── NavbarSuperadmin.tsx
│   │   │   └── ThemeToggler.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── members/
│   │   ├── posts/
│   │   └── ui/                       # shadcn/ui components
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       └── ... (17 components total)
│   ├── lib/
│   │   └── utils.ts                  # Utility functions (cn, etc.)
│   ├── services/                     # Service layer
│   ├── store/
│   │   └── useAuthStore.ts           # Zustand auth store
│   ├── styles/
│   │   └── globals.scss
│   ├── types/                        # TypeScript type definitions
│   ├── utils/
│   │   ├── get-user-role.ts          # Role derivation logic
│   │   ├── get-user-role.test.ts     # Unit tests
│   │   └── supabase/
│   │       ├── actions.ts            # protectPage server action
│   │       ├── client.ts             # Browser client
│   │       ├── server.ts             # Server client (async)
│   │       ├── middleware.ts         # Session refresh middleware
│   │       └── fetchUserData.ts
│   └── middleware.ts                 # Next.js middleware entry
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── .windsurf.md                      # AI assistant instructions
├── SESSION_30DEC2025.md              # Current session log
├── components.json                   # shadcn/ui config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Authentication & Authorization

### Authentication Flow

#### 1. Supabase SSR Configuration
- **Middleware-based session refresh:** `src/middleware.ts` calls `updateSession()` on every request
- **Session sync:** `src/utils/supabase/middleware.ts` creates server client and calls `supabase.auth.getUser()` to keep cookies synchronized
- **Server client:** `src/utils/supabase/server.ts` uses `next/headers` cookies with `@supabase/ssr` (async function)
- **Browser client:** `src/utils/supabase/client.ts` uses `createBrowserClient` for client components

#### 2. API Routes
All routes in `src/app/api/auth/`:

- **POST /api/auth/login**
  - Calls `supabase.auth.signInWithPassword({ email, password })`
  - Returns user data with metadata
  - Sets no-cache headers

- **POST /api/auth/logout**
  - Calls `supabase.auth.signOut()`
  - Clears session cookies

- **POST /api/auth/signup**
  - Calls `supabase.auth.signUp()` with user_metadata
  - Default metadata: `{ is_qr_member: 1 }`

- **GET /api/auth/confirm**
  - Email confirmation via OTP
  - Parameters: `token_hash`, `type`, `next`
  - Redirects to `next` on success, `/error` on failure

- **POST /api/auth/superadmin-add-user**
  - Admin endpoint to create users with custom metadata

#### 3. Client-Side Auth Store (Zustand)
`src/store/useAuthStore.ts`:

```typescript
interface AuthState {
  user: any | null;
  roles: {
    is_qr_superadmin: number;
    is_qr_admin: number;
    is_qr_member: number;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

**Login Flow:**
1. Calls `/api/auth/login`
2. Updates Zustand store with user and roles
3. Determines redirect based on role hierarchy:
   - `is_qr_superadmin === 1` → `/superadmin-portal`
   - `is_qr_admin === 1` → `/admin-portal`
   - `is_qr_member === 1` → `/members-portal`
4. Saves redirect to `localStorage.redirectAfterLogin`
5. Forces `window.location.reload()` to sync server/client state

**Logout Flow:**
1. Calls `/api/auth/logout`
2. Clears Zustand state
3. Forces `window.location.reload()`

### Role-Based Access Control (RBAC)

#### Role System
Three roles defined in `src/utils/get-user-role.ts`:

```typescript
type AppRole = 'superadmin' | 'admin' | 'member';
```

**Role Derivation Logic:**
- Checks `user_metadata` flags in priority order (highest to lowest)
- Supports numeric (1/0), boolean, and string ('1', 'true') values
- Returns first match or `null`

```typescript
if (is_qr_superadmin) return 'superadmin';
if (is_qr_admin) return 'admin';
if (is_qr_member) return 'member';
return null;
```

#### Route Protection
**Server-side protection via layout files:**

```typescript
// src/app/(admin)/layout.tsx
export default async function AdminLayout({ children }) {
  await protectPage(['admin']);
  // ...
}
```

**protectPage Implementation** (`src/utils/supabase/actions.ts`):
1. Creates server Supabase client
2. Calls `supabase.auth.getUser()`
3. If no user → `redirect('/auth')`
4. Derives role from `user_metadata`
5. If role not in `allowedRoles` → `redirect('/auth')`
6. Returns user object

**Protected Route Groups:**
- **(admin):** Requires `['admin']` role
- **(members):** Requires `['member']` role
- **(superadmin):** Requires `['superadmin']` role

**Important Notes:**
- RBAC is enforced at **application layer**, not database layer
- No Row Level Security (RLS) policies implemented yet
- Role flags stored in Supabase `auth.users.user_metadata`
- Server-side redirects prevent unauthorized access

---

## UI & Component Architecture

### Design System
- **Styling:** Tailwind CSS with custom theme configuration
- **Component Library:** shadcn/ui (17 components)
- **Dark Mode:** next-themes with system preference detection
- **Icons:** Lucide React + Heroicons
- **Typography:** Inter font (Google Fonts)

### Theme Configuration
`tailwind.config.ts`:
- Custom color system using CSS variables (HSL)
- Responsive container with 2xl breakpoint at 1400px
- Custom animations (accordion-down, accordion-up)
- Plugins: typography, aspect-ratio, grid-auto-fit, animate

### Component Categories

#### 1. UI Components (shadcn/ui)
Located in `src/components/ui/`:
- Form controls: Button, Input, Textarea, Label, Form
- Data display: Card, Table, Badge, Avatar
- Overlays: Dialog, Dropdown Menu, Toast
- Navigation: Tabs, Command, Pagination

#### 2. Global Components
Located in `src/components/global/`:
- **Navbar.tsx:** Main navigation with user dropdown
- **NavbarHome.tsx:** Public home navigation
- **NavbarSuperadmin.tsx:** Superadmin-specific navigation
- **ThemeToggler.tsx:** Dark/light mode toggle

All navbars:
- Use client-side Supabase client
- Display user email when authenticated
- Include avatar dropdown with profile/logout
- Active link highlighting based on pathname

#### 3. Auth Components
Located in `src/components/auth/`:
- **AuthTabs.tsx:** Tab switcher for login/register
- **LoginForm.tsx:** React Hook Form + Zod validation
- **RegisterForm.tsx:** Registration with metadata
- **Logout.tsx:** Logout button component

#### 4. Layout Components
Located in `src/components/layout/`:
- **Sidebar.tsx:** Members sidebar navigation
- **AdminSidebar.tsx:** Admin sidebar navigation

### Form Handling
- **React Hook Form** for form state management
- **Zod** for schema validation
- **@hookform/resolvers** for Zod integration
- Example in LoginForm:
  ```typescript
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" }
  });
  ```

---

## Configuration Files

### Next.js Configuration
`next.config.js`:
- React Strict Mode enabled
- Cloudinary image domain whitelisted
- **Aggressive no-cache headers** on all routes:
  - `Cache-Control: no-store, no-cache, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`

**Note:** These global no-cache headers may impact performance. Consider applying selectively to auth routes only.

### TypeScript Configuration
`tsconfig.json`:
- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Incremental compilation
- App Router compatible

### Tailwind Configuration
- Dark mode via class strategy
- Custom color system with CSS variables
- Responsive utilities
- Animation support
- Typography and aspect-ratio plugins

### shadcn/ui Configuration
`components.json`:
- TypeScript enabled
- Tailwind CSS integration
- Component path: `@/components/ui`
- Utility path: `@/lib/utils`

---

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=<your-site-url>
```

Used for:
- Supabase client initialization (server & browser)
- Cookie security settings (secure flag based on HTTPS)

---

## Route Inventory

### Implemented Routes

#### Public Routes
- `/` - Home page (public)
- `/demo` - Demo page
- `/auth` - Login/Register page

#### Protected Routes
**Members:**
- `/members-portal` - Members dashboard
- `/booking` - Booking page

**Admin:**
- `/admin-portal` - Admin dashboard
- `/admin-booking` - Admin booking management
- `/users` - User management

**Superadmin:**
- `/superadmin-portal` - Superadmin dashboard

#### Utility Routes
- `/error` - Error page
- `/template` - Template page
- `/not-found` - 404 page (custom per route group)

#### API Routes
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/signup`
- `GET /api/auth/confirm`
- `POST /api/auth/superadmin-add-user`

### Missing/Referenced Routes

**Not Implemented:**
- `/dashboard` - Referenced in RegisterForm redirect (currently 404s)
- `/email-confirmed` - Email confirmation handled by API redirect instead
- `/post-checkout` - No Stripe integration yet
- `/billing` - No billing system yet
- `/profile` - Referenced in navbar dropdown but not implemented

**Recommendation:** Either implement `/dashboard` or update RegisterForm to redirect to role-specific portals.

---

## Data Models & Database

### Current State
- **No custom database tables** beyond Supabase Auth defaults
- **No RLS policies** implemented
- **No Stripe schema** (customers, subscriptions, etc.)
- **No domain-specific models** (bugs, tickets, projects, etc.)

### User Metadata Schema
Stored in `auth.users.user_metadata`:
```typescript
{
  is_qr_superadmin: 0 | 1,
  is_qr_admin: 0 | 1,
  is_qr_member: 0 | 1
}
```

### Future Considerations
For a bug tracking system, you'll need:
- Projects table
- Bugs/Issues table
- Comments table
- Attachments table
- User assignments
- RLS policies for data access control

---

## Testing

### Current Setup
- **Jest:** 30.0.5 configured
- **ts-jest:** TypeScript support
- `jest.config.js` present

### Existing Tests
- `src/utils/get-user-role.test.ts` - Unit tests for role derivation logic

### Test Coverage
- Minimal test coverage currently
- Only utility functions tested
- No component or integration tests

### Recommendations
- Add React Testing Library for component tests
- Test auth flows (login, logout, signup)
- Test protected route access
- Test role-based redirects

---

## Security Considerations

### Current Security Measures

**Strengths:**
1. Server-side session validation via middleware
2. Protected routes with server-side checks
3. Supabase Auth handles password hashing
4. HTTPS enforcement for production cookies
5. No sensitive data in client-side code

**Weaknesses & Risks:**
1. **No RLS policies** - Database queries not restricted by user role
2. **Application-layer RBAC only** - Can be bypassed with direct database access
3. **User metadata is mutable** - Users could potentially modify their own roles
4. **No rate limiting** on auth endpoints
5. **Global no-cache headers** may expose sensitive data in browser history
6. **No CSRF protection** visible
7. **No input sanitization** beyond Zod validation

### Recommendations

**High Priority:**
1. Implement Supabase RLS policies for all tables
2. Move role management to a separate `user_roles` table
3. Add rate limiting to auth endpoints
4. Implement CSRF tokens for state-changing operations
5. Add input sanitization for user-generated content

**Medium Priority:**
6. Add session timeout/refresh logic
7. Implement audit logging for sensitive operations
8. Add email verification requirement
9. Implement password strength requirements
10. Add 2FA support

**Low Priority:**
11. Add security headers (CSP, X-Frame-Options, etc.)
12. Implement API key rotation
13. Add honeypot fields to forms

---

## Performance Considerations

### Current Configuration

**Potential Issues:**
1. **Global no-cache headers** prevent any browser/CDN caching
2. **Hard page reloads** on login/logout (not SPA-like)
3. **No image optimization config** beyond Cloudinary domain
4. **No bundle analysis** setup
5. **Middleware runs on every request** (necessary but impacts performance)

### Optimization Opportunities

**Quick Wins:**
1. Remove global no-cache headers, apply only to auth routes
2. Implement proper cache strategies for static assets
3. Add `loading.tsx` files for better UX (already present in some routes)
4. Use Next.js Image component for optimized images
5. Implement route prefetching for common navigation paths

**Advanced:**
6. Add Redis for session caching
7. Implement ISR (Incremental Static Regeneration) for public pages
8. Add bundle analyzer to identify large dependencies
9. Implement code splitting for role-specific features
10. Add service worker for offline support

---

## Development Workflow

### Available Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest"
}
```

### Development Server
- Runs on `http://localhost:3000` (default)
- Hot module replacement enabled
- TypeScript type checking on save

### Build Process
- Next.js production build
- TypeScript compilation
- Tailwind CSS purging
- Bundle optimization

---

## Known Issues & Technical Debt

### Critical
1. **RegisterForm redirects to non-existent /dashboard** - Causes 404 after registration
2. **No RLS policies** - Database is wide open to authenticated users
3. **React 19.2.1 compatibility** - Recently fixed `cookies()` async issues

### High Priority
4. **Missing profile page** - Referenced in navbar but not implemented
5. **No error boundaries** - Unhandled errors crash the app
6. **Hard reloads on auth** - Poor UX, loses client state
7. **No loading states** on auth operations

### Medium Priority
8. **No email verification flow** - Users can sign up without confirming email
9. **No password reset** - Users can't recover accounts
10. **No user profile editing** - Can't update email, password, metadata
11. **Aggressive caching disabled globally** - Performance impact

### Low Priority
12. **Multiple navbar components** - Could be consolidated with role-based rendering
13. **Unused route groups** - Some empty directories
14. **No API documentation** - Endpoints not documented
15. **No Storybook** - Component documentation missing

---

## Migration & Upgrade Notes

### Recent Changes (Dec 30, 2025)
- **React upgraded:** 18.x → 19.2.1 (security update)
- **Next.js:** Already on 15.4.6 (safe)
- **Breaking change:** `cookies()` now requires `await` in Next.js 15 + React 19
- **Fixed files:** All server-side Supabase client instantiations updated to async/await

### Files Modified for React 19 Compatibility
1. `src/utils/supabase/server.ts` - Made `createClient` async
2. `src/utils/supabase/actions.ts` - Awaited `createClient()`
3. `src/app/api/auth/login/route.ts` - Awaited `createClient()`
4. `src/app/api/auth/logout/route.ts` - Awaited `createClient()`
5. `src/app/api/auth/confirm/route.ts` - Awaited `createClient()`
6. `src/app/api/auth/signup/route.ts` - Awaited `createClient()`
7. `src/app/api/auth/superadmin-add-user/route.ts` - Awaited `createClient()`
8. `src/utils/supabase/fetchUserData.ts` - Awaited `createClient()`

### Future Upgrade Considerations
- Monitor Next.js 16 release for breaking changes
- Watch Supabase SSR package updates
- Keep shadcn/ui components updated
- Consider migrating to React Server Components patterns

---

## Recommendations for Production

### Before Launch Checklist

**Security:**
- [ ] Implement RLS policies on all tables
- [ ] Move roles to dedicated table with proper constraints
- [ ] Add rate limiting to auth endpoints
- [ ] Enable email verification requirement
- [ ] Add CSRF protection
- [ ] Implement session timeout
- [ ] Add security headers
- [ ] Audit all user inputs for XSS vulnerabilities

**Performance:**
- [ ] Remove global no-cache headers
- [ ] Implement proper cache strategies
- [ ] Add CDN for static assets
- [ ] Optimize images with Next.js Image
- [ ] Add bundle analysis
- [ ] Implement monitoring (Sentry, LogRocket, etc.)

**Functionality:**
- [ ] Implement /dashboard or update RegisterForm redirect
- [ ] Add profile page
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Create error boundaries
- [ ] Add proper loading states
- [ ] Implement user profile editing

**Testing:**
- [ ] Add integration tests for auth flows
- [ ] Add component tests with React Testing Library
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Test all protected routes
- [ ] Test role-based access control
- [ ] Load testing for auth endpoints

**Documentation:**
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document database schema
- [ ] Add inline code documentation

**DevOps:**
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Set up error tracking
- [ ] Configure logging

---

## Strengths of This Starter

1. **Modern Stack:** Latest stable versions of Next.js, React, and Supabase
2. **Clean Architecture:** Well-organized folder structure with clear separation of concerns
3. **Type Safety:** Full TypeScript implementation with strict mode
4. **SSR Auth:** Properly configured Supabase SSR with middleware
5. **Component Library:** shadcn/ui provides high-quality, accessible components
6. **Dark Mode:** Built-in theme support with system preference detection
7. **Form Handling:** React Hook Form + Zod for robust form validation
8. **Role System:** Clear RBAC implementation with three-tier roles
9. **Developer Experience:** Hot reload, TypeScript, ESLint, proper tooling
10. **Testing Setup:** Jest configured and ready for tests

---

## Conclusion

This starter project provides a solid foundation for building a role-based SaaS application with Next.js 15 and Supabase. The authentication and authorization systems are well-implemented at the application layer, though database-level security (RLS) needs to be added before production deployment.

The codebase follows modern React patterns, uses TypeScript throughout, and includes a comprehensive UI component library. The recent React 19.2.1 upgrade has been properly handled with async/await fixes for the cookies API.

**Best suited for:**
- Multi-tenant SaaS applications
- Internal tools with role-based access
- Bug tracking systems (like Cyber Bugs)
- Admin dashboards with different permission levels

**Next steps:**
1. Implement RLS policies in Supabase
2. Build out domain-specific data models
3. Fix missing routes (/dashboard, /profile)
4. Add comprehensive testing
5. Optimize caching strategy
6. Implement missing auth features (password reset, email verification)

This starter successfully balances modern best practices with practical, production-ready patterns. With the security and functionality enhancements listed above, it will be ready for production deployment.
