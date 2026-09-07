import { getSupabaseServer, getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

const STAFF_ROLES = new Set(["super_admin", "admin", "editor"]);

/**
 * Verifies that the current request has a valid admin auth session from cookies
 * AND that the authenticated user holds a staff profile role
 * (super_admin / admin / editor). Used server-side in admin API routes and
 * middleware so unauthenticated or non-staff callers are rejected even though
 * the admin API uses the service-role client (which bypasses RLS).
 */
export async function requireAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    return await isStaffUser(user.id);
  } catch {
    return false;
  }
}

/**
 * Checks whether a given auth user id maps to a staff profile role.
 * Bypasses RLS intentionally (profiles are admin-only data).
 */
export async function isStaffUser(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data } = await getServerClient()
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .limit(1);
    // Prefer the most-privileged profile row in case duplicate profiles exist.
    const roles = (data ?? []).map((p) => p.role);
    return roles.some((r) => STAFF_ROLES.has(r));
  } catch {
    return false;
  }
}