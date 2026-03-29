# Stark SaaS Starter

A generic Next.js starter kit for building role-based SaaS applications with Supabase SSR authentication, App Router route protection, and a reusable UI foundation.

---

## What This Starter Includes

- Next.js App Router structure
- Supabase SSR session handling
- App-layer RBAC for `superadmin`, `admin`, and `member`
- shadcn/ui-based component library
- Zustand auth store for client-side transitions
- Theme support with `next-themes`

---

## Auth and RBAC Overview

### SSR Session Handling

- `src/middleware.ts` delegates to `src/utils/supabase/middleware.ts`
- `src/utils/supabase/server.ts` creates the server Supabase client using `cookies()`
- `src/utils/supabase/client.ts` creates the browser Supabase client

### Route Protection

Protected App Router groups call `protectPage()` in their layouts:

- `src/app/(admin)/layout.tsx`
- `src/app/(members)/layout.tsx`
- `src/app/(superadmin)/layout.tsx`

Role derivation lives in `src/utils/get-user-role.ts` and resolves one of:

- `superadmin`
- `admin`
- `member`

### Auth APIs

The starter ships with these routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/signup`
- `GET /api/auth/confirm`
- `POST /api/auth/superadmin-add-user`

---

## Folder Snapshot

```
.
├── agent_docs/
│   ├── APP_FACTORY/
│   ├── CURRENT_APP/
│   ├── SESSIONS/
│   └── STARTER_PROJECT_OVERVIEW.md
├── src/
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── utils/
│   └── middleware.ts
├── RECOVERY.md
├── WINDSURF.md
└── package.json
```

---

## Important Constraints

- RBAC is currently enforced at the application layer
- Supabase middleware/session logic should be treated as infrastructure
- UI primitives in `src/components/ui/` should remain reusable and domain-agnostic

---

## Development Commands

```bash
npm install
npm run dev
npm run build
```

---

## Current Status

This repository is positioned as a reusable starter, not a domain-specific product. Customize branding, routes, and business entities in app-facing files while preserving the auth and platform foundation.
