"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

const PAGE_SIZE = 6;

export type UserWithRole = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string | null;
};

// ---------------------------------------------------------------------------
// getUsers — paginated list of admin + member users (no superadmins)
// ---------------------------------------------------------------------------
export async function getUsers(page: number = 1): Promise<{
  users: UserWithRole[];
  total: number;
}> {
  const adminClient = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Query 1: paginated profiles
  const { data: profiles, error: profilesError, count } = await adminClient
    .from("profiles")
    .select("id, full_name, email, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    return { users: [], total: count ?? 0 };
  }

  // Query 2: roles for only the users on this page
  const ids = profiles.map((p) => p.id);
  const { data: roles, error: rolesError } = await adminClient
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", ids);

  if (rolesError) {
    throw new Error(`Failed to fetch roles: ${rolesError.message}`);
  }

  // Build a role lookup map
  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

  const users: UserWithRole[] = profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    created_at: p.created_at,
    role: roleMap.get(p.id) ?? "member",
  }));

  return { users, total: count ?? 0 };
}

// ---------------------------------------------------------------------------
// getUserById — fetch a single user's profile + role for the edit form
// ---------------------------------------------------------------------------
export async function getUserById(userId: string): Promise<UserWithRole | null> {
  const adminClient = createAdminClient();

  const [{ data: profile, error: profileError }, { data: roleRow, error: roleError }] =
    await Promise.all([
      adminClient
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("id", userId)
        .single(),
      adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single(),
    ]);

  if (profileError || !profile) return null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    created_at: profile.created_at,
    role: roleError || !roleRow ? "member" : roleRow.role,
  };
}

// ---------------------------------------------------------------------------
// editUser — update a user's full_name only (admins cannot change roles)
// ---------------------------------------------------------------------------
export async function editUser(
  userId: string,
  formData: { name: string }
): Promise<{ error?: string }> {
  const adminClient = createAdminClient();

  // Update display name in auth user_metadata (keep in sync with profiles)
  const { error: authError } = await adminClient.auth.admin.updateUserById(
    userId,
    { user_metadata: { full_name: formData.name } }
  );

  if (authError) {
    return { error: authError.message };
  }

  // Update full_name in profiles table
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ full_name: formData.name })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin-portal");
  return {};
}

// ---------------------------------------------------------------------------
// deleteUser — delete from auth (cascades to profiles + user_roles via FK)
// Only for member users, not admins
// ---------------------------------------------------------------------------
export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin-portal");
  return {};
}
