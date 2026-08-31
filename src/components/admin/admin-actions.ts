"use server";

import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { currentUserIsSuperAdmin } from "@/lib/admin-db";

// Tables whose deletion requires super_admin privileges.
const SUPER_ONLY_DELETE = new Set([
  "newsletter_subscribers",
]);

/* ==================== Generic Admin CRUD ==================== */

export async function adminCreate(table: string, data: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  if (data.title && !data.slug) data.slug = slugify(String(data.title));
  const { error } = await getServerClient().from(table).insert(data);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminUpdate(table: string, id: string, data: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  if (data.title && !data.slug) data.slug = slugify(String(data.title));
  const { error } = await getServerClient().from(table).update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDelete(table: string, id: string) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  if (SUPER_ONLY_DELETE.has(table) && !(await currentUserIsSuperAdmin())) {
    return { error: "Only a super admin can perform this action." };
  }
  const { error } = await getServerClient().from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminToggleField(table: string, id: string, field: string, value: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from(table).update({ [field]: value }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
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
  revalidatePath("/admin/settings");
  return { success: true };
}
