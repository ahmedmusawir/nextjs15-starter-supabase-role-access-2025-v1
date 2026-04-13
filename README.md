# Pro RBAC Next.js 15x + Supabase Starter Kit 2025 v1

> **Factory Standard manual for a production-grade Next.js + Supabase starter with SSR authentication, database-authoritative RBAC, service-role admin provisioning, cache-safe auth transitions, and Jest-backed security tests.**

This repository is a hardened starter kit for teams that want a serious authentication and authorization foundation from day one.

It is built around one non-negotiable principle:

> **Next.js handles routing and experience. Postgres decides access.**

---

## What This Starter Is

This starter provides:

- **Next.js App Router** with protected route groups
- **Supabase SSR authentication** with cookie-based session refresh
- **Database-backed RBAC** using a dedicated `public.user_roles` table
- **Typed role guards** using the `AppRole` enum
- **Server-side route protection** via `protectPage()`
- **Privileged admin provisioning** using a server-only service role key
- **Next.js cache invalidation** for login, signup, logout, and role changes
- **Jest security tests** for core RBAC surfaces
- **Reusable UI foundation** with shadcn/ui and Tailwind

---

## Core Security Philosophy

### Receptionist vs. Vault Guard

- **Next.js is the receptionist**
  - decides which page or portal to show
  - performs layout-level route gating
  - redirects unauthorized users away from protected UI

- **Postgres is the vault guard**
  - evaluates the authenticated caller
  - reads role truth from `public.user_roles`
  - enforces final data access with Row Level Security

This means the frontend is never trusted as the final permission boundary.

---

## High-Level Feature Set

### Authentication

- Supabase Auth signup, login, logout, and confirmation flows
- SSR-safe cookie handling
- `proxy.ts` middleware session refresh loop
- cache-aware auth transitions using `revalidatePath()` and `router.refresh()`

### Authorization

- `public.user_roles` as the canonical role authority
- `AppRole` enum for type-safe route guards
- `protectPage()` in server-side layouts
- automatic default `member` assignment via Postgres trigger
- secure superadmin-only admin creation flow

### Testing

- Jest + ts-jest
- shared mocks for `next/navigation`, `next/cache`, and Supabase clients
- security-focused tests for role lookup, route protection, proxy, and superadmin provisioning

---

## Tech Stack

```txt
Next.js 16
React 19
TypeScript
Supabase Auth
Supabase SSR
Postgres + RLS
Zustand
Tailwind CSS
shadcn/ui
Jest + ts-jest
```

---

## Environment Variables

Create a `.env.local` file with the following values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Variable Reference

- **`NEXT_PUBLIC_SUPABASE_URL`**
  - your Supabase project URL

- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**
  - the publishable client key used by SSR/browser clients

- **`SUPABASE_SECRET_KEY`**
  - the server-only privileged key used for superadmin provisioning flows
  - **never expose this to the browser**

- **`NEXT_PUBLIC_SITE_URL`**
  - used for site-aware behavior such as secure cookie handling

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Populate `.env.local` with your Supabase project values.

### 3. Set up the database

Apply the SQL blueprint in:

- [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md)

### 4. Start the app

```bash
npm run dev
```

### 5. Run tests

```bash
npm test
```

### 6. Validate production build

```bash
npm run build
```

---

## Documentation Index

### Core Manuals

- **[Architecture](docs/ARCHITECTURE.md)**
  - Receptionist vs. Vault Guard
  - system responsibilities
  - request flow
  - trust boundaries
  - cache invalidation model

- **[Authentication](docs/AUTHENTICATION.md)**
  - Supabase Auth flow
  - SSR session handling
  - `proxy.ts` refresh loop
  - why `user_metadata` is not used for roles

- **[Authorization](docs/AUTHORIZATION.md)**
  - `user_roles` table
  - `AppRole` enum
  - `protectPage()` server action
  - default member trigger
  - superadmin admin-creation One-Two Punch

- **[Database Setup](docs/DATABASE_SETUP.md)**
  - exact SQL blueprint
  - enum creation
  - tables
  - helper functions
  - RLS policies
  - trigger setup

- **[Testing](docs/TESTING.md)**
  - Jest setup
  - mocking architecture
  - security test suite coverage
  - test execution commands

---

## Important Application Flows

### Public Signup

1. User submits name, email, and password
2. Supabase creates the auth account
3. Postgres trigger inserts a `member` role row
4. Next.js cache is invalidated
5. User is routed into the members portal

### Login

1. Supabase authenticates credentials
2. Login route reads the user's role from `public.user_roles`
3. Next.js server cache is invalidated
4. Client router cache is refreshed
5. User is routed to the correct portal

### Superadmin Creates Admin

1. Route verifies the caller is authenticated
2. Route verifies the caller's role is `superadmin`
3. Server-only admin client creates the new auth user
4. Server-only admin client updates `public.user_roles`

This is the starter kit's privileged provisioning model.

---

## Project Structure

```txt
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── AUTHENTICATION.md
│   ├── AUTHORIZATION.md
│   ├── DATABASE_SETUP.md
│   └── TESTING.md
├── src/
│   ├── app/
│   ├── components/
│   ├── store/
│   └── utils/
├── jest.config.js
├── README.md
└── package.json
```

---

## Factory Standard Rules

- **Do not** store authorization-critical role flags in `user_metadata`
- **Do not** expose `SUPABASE_SECRET_KEY` to the browser
- **Do not** trust hidden UI as a security boundary
- **Do** keep role truth in `public.user_roles`
- **Do** enforce domain data permissions with RLS
- **Do** use server-side route guards for protected layouts

---

## Current Status

This starter currently includes:

- database-authoritative RBAC
- cache-safe auth routing
- superadmin admin provisioning
- protected Next.js App Router portals
- passing Jest security suite
- clean production build

---

## Final Note

This is not a toy auth scaffold.

It is a reusable **senior-team starter kit** designed to give you a strong default position on authentication, authorization, session consistency, and testability.

> **Factory Standard rule:** The UI can guide access. The database must defend it.
