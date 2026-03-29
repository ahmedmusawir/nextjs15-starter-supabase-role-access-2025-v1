# STARTER PROJECT OVERVIEW

**Project Name:** Stark SaaS Starter  
**Purpose:** Generic onboarding guide for Factory agents working in this starter repository  
**Framework:** Next.js 16.2.1 (App Router)  
**React Version:** 19.2.4

---

## Executive Summary

This starter provides a reusable foundation for role-based SaaS applications built on Next.js, Supabase SSR authentication, and a shared UI system. It is intended for future Factory agents to extend safely without disturbing the auth foundation or reusable platform primitives.

The codebase is already structured around three main concerns:

- platform/auth infrastructure
- app-facing routes and components
- agent workflow and session recovery

---

## Core Auth Flow

### Server-Side Session Management

The authentication model uses Supabase SSR patterns for App Router:

- `src/middleware.ts` calls `updateSession(request)`
- `src/utils/supabase/middleware.ts` refreshes session cookies per request
- `src/utils/supabase/server.ts` creates the server client with the cookie adapter pattern
- `src/utils/supabase/client.ts` creates the browser client for client components

### API Endpoints

Authentication routes live in `src/app/api/auth/`:

- `login/route.ts`
- `logout/route.ts`
- `signup/route.ts`
- `confirm/route.ts`
- `superadmin-add-user/route.ts`

### Client Auth State

`src/store/useAuthStore.ts` manages:

- current user
- derived role flags
- authenticated state
- login/logout actions

Important behavior:

- login updates Zustand state and persists redirect intent
- logout clears client state and syncs with server auth
- navbar components also read the current user directly from the Supabase browser client

---

## RBAC Structure

Role derivation lives in `src/utils/get-user-role.ts`.

Supported roles:

- `superadmin`
- `admin`
- `member`

Route protection is enforced in App Router group layouts through `protectPage()` from `src/utils/supabase/actions.ts`.

Protected groups:

- `src/app/(superadmin)`
- `src/app/(admin)`
- `src/app/(members)`

Public and auth routes live separately under:

- `src/app/(public)`
- `src/app/(auth)`

**Important:** RBAC is application-layer enforcement. This repo does not yet establish full domain-level RLS policies for custom business tables.

---

## Folder Taxonomy for Factory Agents

### `agent_docs/APP_FACTORY/`

Immutable factory doctrine. These files define cross-project playbooks and are not app-specific. Treat them as read-only unless explicitly instructed otherwise.

### `agent_docs/CURRENT_APP/`

App-focused planning and reference material for the currently active product built on top of the starter.

### `agent_docs/SESSIONS/`

Chronological execution logs used for crash recovery, approvals, and resuming work. Always write plan state here before implementation when the workflow requires it.

### `src/app/`

Application routes and layouts organized by App Router groups. This is where most business-facing changes happen.

### `src/components/`

UI implementation split into:

- `ui/` for reusable primitives
- `global/` for shared app chrome
- feature folders for business-facing components

### `src/utils/supabase/`

Supabase integration layer for browser, server, middleware, and auth guards. High-risk area: change only with intent and verification.

---

## Recommended Working Rules for Future Agents

1. Read `WINDSURF.md` first
2. Read `RECOVERY.md` next
3. Read the latest file in `agent_docs/SESSIONS/`
4. Preserve auth and RBAC infrastructure unless the task explicitly requires changing it
5. Keep domain branding out of shared starter primitives
6. Verify upgrades with a production build, not just dev mode

---

## Current Technical Baseline

- Next.js 16.2.1
- React 19.2.4
- Supabase SSR helpers
- Zustand for client auth state
- Tailwind CSS + shadcn/ui
- `next-themes` for theme switching

---

## High-Risk Areas

Use extra care when editing:

- `src/utils/supabase/server.ts`
- `src/utils/supabase/middleware.ts`
- `src/utils/supabase/actions.ts`
- App Router layout guards
- package upgrades affecting App Router or React hydration

---

## Safe Customization Areas

Generally safe places to customize for a new product:

- homepage and public marketing copy
- navbar branding and route labels
- feature pages inside route groups
- app-specific docs in `CURRENT_APP/` and `SESSIONS/`
- top-level starter documentation

---

## Conclusion

This repository should now be treated as a clean, generic SaaS starter with SSR auth and RBAC patterns already in place. Future work should layer product-specific entities and UI on top of this foundation without mutating the factory doctrine or casually rewriting the Supabase infrastructure.
