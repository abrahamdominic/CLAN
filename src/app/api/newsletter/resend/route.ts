import { NextResponse } from "next/server";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendWelcomeEmail, getSiteUrl } from "@/lib/email";
import { validEmail } from "@/lib/validation";
import { generateConfirmationToken } from "@/components/footer-actions";
import type { NewsletterSubscriber } from "@/types";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const resendAttempts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const max = 3;
  const entry = resendAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    resendAttempts.set(key, { count: 1, resetAt: now + window });
    if (resendAttempts.size > 10_000) {
      for (const [k, v] of resendAttempts) {
        if (now > v.resetAt) resendAttempts.delete(k);
      }
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let email = "";
  try {
    const body = await request.json();
    email = String(body.email || "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!validEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const sb = getServerClient();
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  const sub = data as NewsletterSubscriber | null;

  if (!sub) {
    // Don't leak whether the email exists; respond generically.
    return NextResponse.json({
      success: true,
      message: "If your email is subscribed, a new confirmation link has been sent.",
    });
  }

  if (sub.active && sub.confirmed_at) {
    return NextResponse.json({ success: true, alreadyConfirmed: true });
  }

  const token = await generateConfirmationToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const { error: updateErr } = await sb
    .from("newsletter_subscribers")
    .update({
      confirmation_token: token,
      confirmation_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  if (updateErr) {
    return NextResponse.json({ error: "Could not update your subscription." }, { status: 500 });
  }

  const name = (sub.name || "").trim();
  const firstName = name ? name.split(" ")[0] : "Friend";

  const emailResult = await sendWelcomeEmail(sub.email, firstName, token);

  return NextResponse.json({
    success: true,
    confirmationUrl: `${getSiteUrl()}/newsletter/confirm?token=${token}`,
    emailSent: emailResult.ok,
  });
}