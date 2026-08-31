"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function submitNewsletter(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Email is required." };
  if (isSupabaseConfigured) {
    const { error } = await getServerClient()
      .from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email" });
    if (error) return { error: error.message };
  }
  revalidatePath("/");
  return { success: true };
}
