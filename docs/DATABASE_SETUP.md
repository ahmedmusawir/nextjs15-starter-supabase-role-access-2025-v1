# Database Setup

## Overview

This document is the SQL blueprint for provisioning a fresh Supabase instance for the Pro RBAC starter kit.

It defines:

- application role enum
- `public.user_roles` table
- helper authorization functions
- row level security policies
- automatic trigger for assigning `member` role on signup

> Apply this in your Supabase SQL editor against a fresh project with RLS enabled.

---

## 1. Role Enum

```sql
create type public.app_role as enum ('superadmin', 'admin', 'member');
```

---

## 2. User Roles Table

```sql
create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Recommended indexes

```sql
create index user_roles_role_idx on public.user_roles(role);
create index user_roles_user_id_idx on public.user_roles(user_id);
```

---

## 3. Updated Timestamp Trigger

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();
```

---

## 4. Role Helper Functions

These helpers make RLS policies easier to read and maintain.

### Get the current caller's role

```sql
create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = auth.uid()
  limit 1;
$$;
```

### Superadmin check

```sql
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() = 'superadmin'::public.app_role;
$$;
```

### Admin-or-higher check

```sql
create or replace function public.is_admin_or_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() in ('admin'::public.app_role, 'superadmin'::public.app_role);
$$;
```

---

## 5. Row Level Security on `user_roles`

Enable RLS:

```sql
alter table public.user_roles enable row level security;
```

### Policy: users can read their own role row

```sql
create policy "users_can_read_own_role"
on public.user_roles
for select
using (user_id = auth.uid());
```

### Policy: superadmins can read all role rows

```sql
create policy "superadmins_can_read_all_roles"
on public.user_roles
for select
using (public.is_superadmin());
```

### Policy: superadmins can update roles

```sql
create policy "superadmins_can_update_roles"
on public.user_roles
for update
using (public.is_superadmin())
with check (public.is_superadmin());
```

### Optional policy: superadmins can insert roles manually

```sql
create policy "superadmins_can_insert_roles"
on public.user_roles
for insert
with check (public.is_superadmin());
```

> In this starter, privileged insert/update operations are normally performed through the service role key, which bypasses RLS. These policies are still useful if you want controlled SQL-console or RPC-based admin workflows.

---

## 6. Automatic Default Member Trigger

When a new auth user signs up, the database should automatically create a matching `member` role row.

### Trigger function

```sql
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member'::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
```

### Trigger on `auth.users`

```sql
create trigger on_auth_user_created_assign_member_role
after insert on auth.users
for each row
execute function public.handle_new_user_role();
```

---

## 7. Promote the First Superadmin

Public signup creates `member` users by default. The first superadmin must be promoted manually once.

```sql
update public.user_roles
set role = 'superadmin'::public.app_role
where user_id = 'REPLACE-WITH-AUTH-USER-ID';
```

After that, your in-app superadmin flow can create admins safely.

---

## 8. Example Domain Table Policy Pattern

Below is a sample pattern for any protected domain table.

```sql
create table public.projects (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
```

### Members can read their own projects

```sql
create policy "members_read_own_projects"
on public.projects
for select
using (owner_user_id = auth.uid());
```

### Admins and superadmins can read all projects

```sql
create policy "admins_read_all_projects"
on public.projects
for select
using (public.is_admin_or_superadmin());
```

This pattern is how the starter should be extended for real product data.

---

## 9. Full Blueprint Script

```sql
create type public.app_role as enum ('superadmin', 'admin', 'member');

create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles(role);
create index user_roles_user_id_idx on public.user_roles(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();

create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() = 'superadmin'::public.app_role;
$$;

create or replace function public.is_admin_or_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_my_role() in ('admin'::public.app_role, 'superadmin'::public.app_role);
$$;

alter table public.user_roles enable row level security;

create policy "users_can_read_own_role"
on public.user_roles
for select
using (user_id = auth.uid());

create policy "superadmins_can_read_all_roles"
on public.user_roles
for select
using (public.is_superadmin());

create policy "superadmins_can_update_roles"
on public.user_roles
for update
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "superadmins_can_insert_roles"
on public.user_roles
for insert
with check (public.is_superadmin());

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member'::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_assign_member_role
after insert on auth.users
for each row
execute function public.handle_new_user_role();
```

---

## 10. Final Notes

- Keep the service role key server-only.
- Do not store authorization flags in `user_metadata`.
- Extend RLS to every domain table that matters.
- Treat `user_roles` as the canonical authority for app-level role identity.

> **Factory Standard rule:** The database must be able to defend the product even if the UI is compromised.
