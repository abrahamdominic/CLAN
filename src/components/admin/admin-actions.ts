"use server";

import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { slugify } from "@/lib/utils";
import { validEmail } from "@/lib/validation";
import { currentUserIsSuperAdmin } from "@/lib/admin-db";
import { clearMaintenanceCache } from "@/lib/maintenance";

// Tables whose deletion requires super_admin privileges.
const SUPER_ONLY_DELETE = new Set([
  "newsletter_subscribers",
]);

// Tables that admin CRUD server actions are allowed to touch. The service-role
// client bypasses RLS, so restricting the allowable tables here prevents an
// authorized user from operating on arbitrary database objects (e.g. profiles,
// auth.users) via the generic write helpers.
const ALLOWED_TABLES = new Set([
  "sermons",
  "events",
  "discipleship_programs",
  "outreach_projects",
  "blog_posts",
  "testimonials",
  "speakers",
  "categories",
  "faqs",
  "media",
  "prayer_requests",
  "membership_applications",
  "contact_messages",
  "newsletter_subscribers",
  "donations",
]);

function assertAllowedTable(table: string): string | null {
  if (!ALLOWED_TABLES.has(table)) {
    return `Unknown table: ${table}`;
  }
  return null;
}

// Public cache tags + page that each admin table affects, so published content
// appears immediately without waiting for the 30s data-layer TTL.
const TABLE_CACHE_TAGS: Record<string, string[]> = {
  sermons: ["content-sermons"],
  events: ["content-events"],
  discipleship_programs: ["content-programs"],
  outreach_projects: ["content-outreach"],
  blog_posts: ["content-blog"],
  testimonials: ["content-testimonials"],
  speakers: ["content-speakers"],
  categories: ["content-categories"],
  faqs: ["content-faqs"],
};

const TABLE_PUBLIC_PATHS: Record<string, string[]> = {
  sermons: ["/sermons"],
  events: ["/events"],
  discipleship_programs: ["/discipleship"],
  outreach_projects: ["/outreach"],
  blog_posts: ["/resources"],
  testimonials: ["/testimonies"],
  speakers: ["/sermons"],
  categories: ["/sermons", "/resources"],
};

/* ==================== Generic Admin CRUD ==================== */

function revalidateAdminAndPublic(table: string, path?: string) {
  revalidatePath("/admin");
  if (path) revalidatePath(path);
  for (const p of TABLE_PUBLIC_PATHS[table] ?? []) revalidatePath(p);
  for (const tag of TABLE_CACHE_TAGS[table] ?? []) revalidateTag(tag);
  revalidateTag("admin-stats");
}

export async function adminCreate(table: string, data: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const notAllowed = assertAllowedTable(table);
  if (notAllowed) return { error: notAllowed };
  if (data.title && !data.slug) data.slug = slugify(String(data.title));
  const { error } = await getServerClient().from(table).insert(data);
  if (error) return { error: error.message };
  revalidateAdminAndPublic(table);
  return { success: true };
}

export async function adminUpdate(table: string, id: string, data: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const notAllowed = assertAllowedTable(table);
  if (notAllowed) return { error: notAllowed };
  if (data.title && !data.slug) data.slug = slugify(String(data.title));
  const { error } = await getServerClient().from(table).update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidateAdminAndPublic(table);
  return { success: true };
}

export async function adminDelete(table: string, id: string) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const notAllowed = assertAllowedTable(table);
  if (notAllowed) return { error: notAllowed };
  if (SUPER_ONLY_DELETE.has(table) && !(await currentUserIsSuperAdmin())) {
    return { error: "Only a super admin can perform this action." };
  }
  const { error } = await getServerClient().from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAdminAndPublic(table);
  return { success: true };
}

export async function adminToggleField(table: string, id: string, field: string, value: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const notAllowed = assertAllowedTable(table);
  if (notAllowed) return { error: notAllowed };
  const { error } = await getServerClient().from(table).update({ [field]: value }).eq("id", id);
  if (error) return { error: error.message };
  revalidateAdminAndPublic(table);
  return { success: true };
}

/* ==================== File Upload ==================== */

export async function uploadFile(formData: FormData) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return { error: "File too large (max 10MB)" };

  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    "audio/mpeg", "audio/wav", "audio/ogg",
    "video/mp4", "video/webm",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) return { error: "File type not allowed" };

  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await getServerClient().storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = getServerClient().storage.from("media").getPublicUrl(path);

  const { error: dbError } = await getServerClient().from("media").insert({
    name: file.name,
    url: urlData.publicUrl,
    type: file.type,
    size: file.size,
  });
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/media");
  return { success: true, url: urlData.publicUrl };
}

/* ==================== Blog image upload ==================== */

const BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOG_IMAGE_MAX = 5 * 1024 * 1024;

export async function uploadBlogImage(formData: FormData) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };
  if (file.size > BLOG_IMAGE_MAX) return { error: "Image too large (max 5MB)" };
  if (!BLOG_IMAGE_TYPES.includes(file.type)) return { error: "Only JPG, PNG or WebP images are allowed" };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadError } = await getServerClient().storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = getServerClient().storage.from("media").getPublicUrl(path);
  await getServerClient().from("media").insert({
    name: file.name,
    url: urlData.publicUrl,
    type: file.type,
    size: file.size,
  });
  revalidatePath("/admin/media");
  return { success: true, url: urlData.publicUrl };
}

/* ==================== Settings ==================== */

export async function updateSettings(data: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  if (!(await currentUserIsSuperAdmin())) {
    return { error: "Only a super admin can update site settings." };
  }
  const { error } = await getServerClient()
    .from("settings")
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) return { error: error.message };
  clearMaintenanceCache();
  revalidatePath("/admin/settings");
  revalidateTag("content-settings");
  return { success: true };
}

/* ==================== Admin team / invites ==================== */

const TEAM_ROLES = new Set(["super_admin", "admin", "editor"]);

// Assigns/updates the profile role for an auth user id so that when the invited
// person accepts and signs in, the middleware's staff check passes.
async function setProfileRole(userId: string, email: string, role: string) {
  const sb = getServerClient();
  const { data: existing } = await sb
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  if (existing && existing.length > 0) {
    return sb.from("profiles").update({ role }).eq("user_id", userId);
  }
  return sb.from("profiles").insert({ user_id: userId, email, role });
}

export async function inviteAdmin(formData: FormData) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  if (!(await currentUserIsSuperAdmin())) {
    return { error: "Only a super admin can send admin invites." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "admin");
  if (!validEmail(email)) return { error: "Please provide a valid email address." };
  if (!TEAM_ROLES.has(role) || role === "super_admin") {
    return { error: "Please choose a valid role (Admin or Editor)." };
  }

  const sb = getServerClient();
  const { data: users, error: listError } = await sb.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) return { error: "Could not verify existing accounts." };
  const existing = (users?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email
  );

  // The account already exists — promote the profile role in place instead of
  // firing a second invite.
  if (existing) {
    if (existing.email_confirmed_at) {
      const { data: profile } = await sb
        .from("profiles")
        .select("role")
        .eq("user_id", existing.id)
        .limit(1);
      const currentRole = profile?.[0]?.role;
      if (currentRole && TEAM_ROLES.has(currentRole)) {
        return { error: `${email} is already a team member.` };
      }
      const { error: promoteError } = await setProfileRole(existing.id, email, role);
      if (promoteError) return { error: promoteError.message };
      revalidatePath("/admin/admin-team");
      return {
        success: true,
        note: `${email} already had an account — their role was updated to ${role}.`,
      };
    }
    return { error: "An invite has already been sent to this email." };
  }

  const invite = await sb.auth.admin.inviteUserByEmail(email);
  if (invite.error) return { error: invite.error.message };

  const { error: roleError } = await setProfileRole(invite.data.user.id, email, role);
  if (roleError) return { error: roleError.message };

  revalidatePath("/admin/admin-team");
  return { success: true, note: `Invite sent to ${email}.` };
}
