"use server";

import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { validEmail, validMessage, validName, sanitizeText, truncate } from "@/lib/validation";

/* -------------------------- Form submissions -------------------------- */

export async function submitPrayerRequest(formData: FormData) {
  const payload = {
    name: sanitizeText(truncate(String(formData.get("name") || ""), 120)),
    email: formData.get("email")
      ? sanitizeText(truncate(String(formData.get("email")), 200))
      : null,
    phone: formData.get("phone")
      ? sanitizeText(truncate(String(formData.get("phone")), 40))
      : null,
    request: sanitizeText(truncate(String(formData.get("request") || ""), 4000)),
    category: formData.get("category")
      ? sanitizeText(truncate(String(formData.get("category")), 80))
      : null,
    visibility: String(formData.get("visibility") || "private"),
  };
  if (payload.email && !validEmail(payload.email)) {
    return { error: "Please provide a valid email address." };
  }
  if (!validName(payload.name) || !validMessage(payload.request)) {
    return { error: "Name and prayer request are required." };
  }
  if (!["private", "anonymous", "public"].includes(payload.visibility)) {
    payload.visibility = "private";
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient()
      .from("prayer_requests")
      .insert(payload);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function submitJoinForm(formData: FormData) {
  const payload = {
    full_name: sanitizeText(truncate(String(formData.get("full_name") || ""), 120)),
    email: sanitizeText(truncate(String(formData.get("email") || ""), 200)),
    phone: formData.get("phone")
      ? sanitizeText(truncate(String(formData.get("phone")), 40))
      : null,
    location: formData.get("location")
      ? sanitizeText(truncate(String(formData.get("location")), 200))
      : null,
    church: formData.get("church")
      ? sanitizeText(truncate(String(formData.get("church")), 200))
      : null,
    areas_of_interest: formData.getAll("areas_of_interest").map(String).slice(0, 12),
    discovered_via: formData.get("discovered_via")
      ? sanitizeText(truncate(String(formData.get("discovered_via")), 200))
      : null,
    message: formData.get("message")
      ? sanitizeText(truncate(String(formData.get("message")), 2000))
      : null,
  };
  if (!validName(payload.full_name) || !validEmail(payload.email)) {
    return { error: "A valid name and email are required." };
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient()
      .from("membership_applications")
      .insert(payload);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function submitContact(formData: FormData) {
  const payload = {
    name: sanitizeText(truncate(String(formData.get("name") || ""), 120)),
    email: sanitizeText(truncate(String(formData.get("email") || ""), 200)),
    phone: formData.get("phone")
      ? sanitizeText(truncate(String(formData.get("phone")), 40))
      : null,
    subject: formData.get("subject")
      ? sanitizeText(truncate(String(formData.get("subject")), 200))
      : null,
    message: sanitizeText(truncate(String(formData.get("message") || ""), 4000)),
  };
  if (!validName(payload.name) || !validEmail(payload.email) || !validMessage(payload.message)) {
    return { error: "Name, a valid email and message are required." };
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient().from("contact_messages").insert(payload);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function subscribeNewsletter(formData: FormData) {
  const email = sanitizeText(truncate(String(formData.get("email") || ""), 200));
  if (!validEmail(email)) return { error: "Please provide a valid email address." };
  if (isSupabaseConfigured) {
    const { error } = await getServerClient()
      .from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email" });
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function submitTestimonial(formData: FormData) {
  const payload = {
    name: sanitizeText(truncate(String(formData.get("name") || ""), 120)),
    email: formData.get("email")
      ? sanitizeText(truncate(String(formData.get("email")), 200))
      : null,
    testimony: sanitizeText(truncate(String(formData.get("testimony") || ""), 4000)),
    photo_url: null,
    approved: false,
  };
  if (payload.email && !validEmail(payload.email)) {
    return { error: "Please provide a valid email address." };
  }
  if (!validName(payload.name) || !validMessage(payload.testimony)) {
    return { error: "Name and testimony are required." };
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient().from("testimonials").insert(payload);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function registerForProgram(formData: FormData) {
  const program = sanitizeText(truncate(String(formData.get("program") || ""), 200));
  const name = sanitizeText(truncate(String(formData.get("name") || ""), 120));
  const email = sanitizeText(truncate(String(formData.get("email") || ""), 200));
  if (!program || !validName(name) || !validEmail(email)) {
    return { error: "Program, valid name and email are required." };
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient()
      .from("membership_applications")
      .insert({
        full_name: name,
        email,
        areas_of_interest: ["discipleship"],
        message: `Program registration: ${program}`,
      });
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function submitDonation(formData: FormData) {
  const payload = {
    amount: Number(formData.get("amount") || 0),
    category: String(formData.get("category") || "General ministry").trim(),
    donor_name: String(formData.get("donor_name") || "").trim() || null,
    donor_email: String(formData.get("donor_email") || "").trim() || null,
    status: "recorded",
  };
  if (payload.amount <= 0) {
    return { error: "A valid donation amount is required." };
  }
  if (isSupabaseConfigured) {
    const { error } = await getServerClient().from("donations").insert(payload);
    if (error) return { error: error.message };
  }
  return { success: true };
}

/* -------------------------- Donations (payment) -------------------------- */

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "";

export async function createDonationIntent(formData: FormData) {
  const amount = Math.round(Number(formData.get("amount") || 0) * 100);
  const category = String(formData.get("category") || "General ministry").trim();
  const donor_name = String(formData.get("donor_name") || "").trim() || null;
  const donor_email = String(formData.get("donor_email") || "").trim() || null;

  if (!amount || amount <= 0) return { error: "A valid donation amount is required." };

  // No payment provider configured — record the intent directly (dev/test mode)
  if (!PAYMENT_PROVIDER || PAYMENT_PROVIDER === "test") {
    if (isSupabaseConfigured) {
      const { error } = await getServerClient().from("donations").insert({
        amount: amount / 100,
        category,
        donor_name,
        donor_email,
        status: "recorded",
      });
      if (error) return { error: error.message };
    }
    return {
      success: true,
      mode: "test" as const,
    };
  }

  // Paystack
  if (PAYMENT_PROVIDER === "paystack") {
    const secret = process.env.PAYMENT_PROVIDER_SECRET;
    if (!secret) return { error: "Payment provider is not fully configured." };
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          email: donor_email || `${Date.now()}@clanministry.org`,
          metadata: {
            category,
            donor_name,
            custom_fields: [
              { display_name: "Giving Category", variable_name: "category", value: category },
            ],
          },
          callback_url: `${siteUrl}/give?status=success`,
        }),
      });
      const json = await res.json();
      if (!json.status) return { error: json.message || "Payment could not be initialized." };
      return {
        success: true,
        mode: "paystack" as const,
        authorizationUrl: json.data.authorization_url,
        reference: json.data.reference,
      };
    } catch {
      return { error: "Payment provider is temporarily unavailable." };
    }
  }

  return { error: "Unsupported payment provider." };
}

/* -------------------------- Auth -------------------------- */

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!isSupabaseConfigured) {
    return { error: "Supabase is not configured. Set your environment variables first." };
  }
  const sb = getServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function adminLogout() {
  if (isSupabaseConfigured) {
    await getServerClient().auth.signOut();
  }
  revalidatePath("/admin");
}

/* ------------------- Generic CMS helpers (admin) ------------------- */

export async function deleteRecord(table: string, id: string) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const sb = getServerClient();
  const { error } = await sb.from(table as never).delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function togglePublish(table: string, id: string, published: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const sb = getServerClient();
  const { error } = await sb
    .from(table as never)
    .update({ published })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function makeSlug(title: string) {
  return slugify(title);
}
