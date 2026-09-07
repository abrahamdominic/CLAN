"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendWelcomeEmail, getSiteUrl } from "@/lib/email";
import { validEmail, sanitizeText, truncate } from "@/lib/validation";
import type { NewsletterSubscriber } from "@/types";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function generateConfirmationToken(): Promise<string> {
  return randomBytes(32).toString("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Client-facing newsletter subscription action.
 * Creates an inactive subscriber, generates a confirmation token, sends a
 * welcome email, and returns the confirmation URL so the client can redirect.
 */
export async function subscribeNewsletter(formData: FormData) {
  const name = sanitizeText(truncate(String(formData.get("name") || ""), 120));
  const email = normalizeEmail(String(formData.get("email") || "").trim());
  const phone = formData.get("phone")
    ? sanitizeText(truncate(String(formData.get("phone")), 40))
    : null;

  if (!name) {
    return { error: "Name is required." };
  }
  if (!validEmail(email)) {
    return { error: "Please provide a valid email address." };
  }
  if (!isSupabaseConfigured) {
    return { error: "Newsletter subscription is temporarily unavailable." };
  }

  const sb = getServerClient();

  // Look up existing subscriber by normalized email
  const { data: existingRaw } = await sb
    .from("newsletter_subscribers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  const existing = existingRaw as NewsletterSubscriber | null;

  const token = await generateConfirmationToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  // --- Duplicate handling ---
  if (existing) {
    if (existing.active) {
      return { error: "You're already subscribed to the CLAN newsletter." };
    }
    // Inactive/unconfirmed: refresh token + resend confirmation, no dup record.
    const { error: updateErr } = await sb
      .from("newsletter_subscribers")
      .update({
        name,
        phone_number: phone && phone !== "" ? phone : existing.phone_number,
        confirmation_token: token,
        confirmation_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (updateErr) return { error: updateErr.message };

    const emailResult = await sendWelcomeEmail(email, name.split(" ")[0] || name, token);
    revalidatePath("/");
    // Only surface the confirmation URL when the email was actually delivered.
    // Otherwise a subscriber would be silently confirmed without verification,
    // defeating the double opt-in.
    if (!emailResult.ok) {
      return { success: true, emailSent: false };
    }
    return {
      success: true,
      confirmationUrl: `${getSiteUrl()}/newsletter/confirm?token=${token}`,
      emailSent: true,
    };
  }

  // --- New subscriber ---
  const { error: insertErr } = await sb.from("newsletter_subscribers").insert({
    name,
    email,
    phone_number: phone && phone !== "" ? phone : null,
    active: false,
    confirmation_token: token,
    confirmation_token_expires_at: expiresAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (insertErr) {
    // Unique violation could still happen in a race — retry as duplicate
    if (insertErr.code === "23505") {
      return subscribeNewsletter(formData);
    }
    return { error: insertErr.message };
  }

  const emailResult = await sendWelcomeEmail(email, name.split(" ")[0] || name, token);

  revalidatePath("/");
  if (!emailResult.ok) {
    return { success: true, emailSent: false };
  }
  return {
    success: true,
    confirmationUrl: `${getSiteUrl()}/newsletter/confirm?token=${token}`,
    emailSent: true,
  };
}

/**
 * Called from the legacy footer form. Kept for backwards compatibility but the
 * new NewsletterForm client component uses subscribeNewsletter directly.
 */
export async function submitNewsletter(formData: FormData) {
  return subscribeNewsletter(formData);
}