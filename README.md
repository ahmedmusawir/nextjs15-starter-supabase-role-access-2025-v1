# nextjs15-starter-supabase-role-access-2025-v1

\*\* React Upgraded to safe 19.2.1 ... Next 15.4.6 is already safe
This is the latest starter project w/ Next.js 15, Shadcn and Supabase role based access enabled v1

# CURRENT SETUP

### Supabase Auth + SSR session handling

- **Middleware-based session sync is active:**
  - `src/middleware.ts` → `updateSession(request)` from `src/utils/supabase/middleware.ts`.
  - `src/utils/supabase/middleware.ts` creates a server client and calls `supabase.auth.getUser()` to keep cookies in sync on every request.
- **Server/browser clients:**
  - **Server:** `src/utils/supabase/server.ts` uses `next/headers` cookies and `@supabase/ssr`.
  - **Client:** `src/utils/supabase/client.ts` uses `createBrowserClient`.
- **Conclusion:** SSR session refresh is configured and correct for Next.js App Router.

---

### RBAC guard (app-level), not RLS

- **RBAC is enforced in App Router group layouts via `protectPage()`:**
  - **Admin:** `src/app/(admin)/layout.tsx` → `await protectPage(["admin"])`.
  - **Members:** `src/app/(members)/layout.tsx` → `await protectPage(["member"])`.
  - **Superadmin:** `src/app/(superadmin)/layout.tsx` → `await protectPage(["superadmin"])`.
- **Guard logic:** `src/utils/supabase/actions.ts`:
  - `protectPage(allowedRoles)` is a server action that:
    - Creates server client (`createClient()`).
    - `supabase.auth.getUser()` → if no user, `redirect("/auth")`.
    - Derives role via `getUserRole(user.user_metadata)` from `src/utils/get-user-role.ts`.
    - If role not in `allowedRoles`, `redirect("/auth")`.
- **Role derivation:**
  - `src/utils/get-user-role.ts` returns one of `'superadmin' | 'admin' | 'member'` based on user metadata flags:
    - `is_qr_superadmin === 1` → `superadmin`
    - Else if `is_qr_admin === 1` → `admin`
    - Else if `is_qr_member === 1` → `member`
    - Else `null`
- **Conclusion:** RBAC is implemented at the application layer with role flags in `user_metadata` and server-side redirects; RLS is not yet implemented.

---

### Auth API endpoints (`/api/auth`)

- `src/app/api/auth/login/route.ts`
  - `POST` → `supabase.auth.signInWithPassword({ email, password })`.
  - Sets no-cache headers; returns auth data on success.
- `src/app/api/auth/logout/route.ts`
  - `POST` → `supabase.auth.signOut()`.
- `src/app/api/auth/signup/route.ts`
  - `POST` → `supabase.auth.signUp({ email, password, options: { data: user_metadata } })`.
- `src/app/api/auth/confirm/route.ts`
  - `GET` with `token_hash`, `type`, `next`.
  - `supabase.auth.verifyOtp({ type, token_hash });` on success redirects to `next` (default `/`), else redirects to `/error`.
  - **Note:** This gives you an email-confirmation flow via the confirm API route, not a dedicated `/email-confirmed` page.

---

### Auth store and components (client-side flow)

- **Store:** `src/store/useAuthStore.ts`
  - `login(email,password)` calls `/api/auth/login`, updates user and roles from `user_metadata`.
  - Determines redirect:
    - `superadmin` → `/superadmin-portal`
    - `admin` → `/admin-portal`
    - `member` → `/members-portal`
  - Saves `redirectAfterLogin` in `localStorage`, then forces `window.location.reload()` to sync with server auth state.
  - `logout()` hits `/api/auth/logout`, clears state, hard reloads.
- **`src/components/auth/LoginForm.tsx`**
  - Submits to store `login()`.
  - On mount, checks `localStorage.redirectAfterLogin`; if present, performs `router.replace(target)` and clears the key (this runs after the hard reload).
- **`src/components/auth/RegisterForm.tsx`**
  - Signs up via `/api/auth/signup` with default metadata: `is_qr_member: 1` by default.
  - On success: `router.push("/dashboard")` (**Note:** there is no `/dashboard` route yet; see below).

---

### App Router structure (pages)

- **Public:** `src/app/(public)/page.tsx`, `src/app/(public)/demo/page.tsx`
- **Auth:** `src/app/(auth)/auth/page.tsx`
- **Members:** `src/app/(members)/layout.tsx`, `src/app/(members)/members-portal/page.tsx`, `src/app/(members)/booking/page.tsx`
- **Admin:** `src/app/(admin)/layout.tsx`, `admin-portal/page.tsx`, `admin-booking/page.tsx`, `users/page.tsx`
- **Superadmin:** `src/app/(superadmin)/layout.tsx`, `superadmin-portal/page.tsx`
- **Error/template:** `src/app/error/page.tsx`, `src/app/template/page.tsx`
- **API routes:** listed above
- **Missing the following requested pages:**
  - `/email-confirmed` → Not present (confirmation handled by API redirect).
  - `/post-checkout` → Not present.
  - `/billing` → Not present.
  - `/dashboard` → Not present. Also, `RegisterForm` pushes to `/dashboard` which currently `404`s. Consider aligning with RBAC target (e.g., `/members-portal`) or adding a `/dashboard` that dispatches by role server-side.

---

### Stripe integration

- None present. No `stripe` dependency, no `/api/stripe/*`, no webhook handlers.

---

### Pharmacy/member data model

- No `pharma_` prefixed schema or SQL in the repo yet.
- Current RBAC depends solely on user `user_metadata` flags.

---

### Summary

- Supabase Auth is correctly wired with SSR session refresh via middleware and server/client helpers.
- RBAC is implemented at the app level using `user_metadata` + `protectPage()` in group layouts (admin, member, superadmin).
- Confirmation, login, logout, signup API routes exist and are functional.
- Requested routes `/email-confirmed`, `/post-checkout`, `/billing`, `/dashboard` are not yet implemented; `/dashboard` is referenced by registration and should be added or replaced with role-aware redirect.
- No Stripe integration or `pharma_` schema yet.
