import { NextResponse } from "next/server";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { NewsletterSubscriber } from "@/types";

// Simple in-memory rate limiter for the confirmation endpoint
const confirmAttempts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 min
  const max = 20;
  const entry = confirmAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    confirmAttempts.set(key, { count: 1, resetAt: now + window });
    if (confirmAttempts.size > 10_000) {
      for (const [k, v] of confirmAttempts) {
        if (now > v.resetAt) confirmAttempts.delete(k);
      }
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

type ConfirmResult =
  | { status: "success" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "already_confirmed" }
  | { status: "error" };

async function confirmSubscription(token: string): Promise<ConfirmResult> {
  if (!isSupabaseConfigured) return { status: "error" };

  const sb = getServerClient();
  const { data, error } = await sb
    .from("newsletter_subscribers")
    .select("*")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (error) return { status: "error" };
  if (!data) return { status: "invalid" };

  const sub = data as NewsletterSubscriber;

  // Already confirmed
  if (sub.active) {
    return { status: "already_confirmed" };
  }

  // Expired?
  const expiresAt = sub.confirmation_token_expires_at
    ? new Date(sub.confirmation_token_expires_at).getTime()
    : 0;
  if (!expiresAt || Date.now() > expiresAt) {
    return { status: "expired" };
  }

  // Consume the token (single use): null it out + mark active + confirmed_at
  const { error: updateErr } = await sb
    .from("newsletter_subscribers")
    .update({
      active: true,
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
      confirmation_token_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sub.id);

  if (updateErr) return { status: "error" };
  return { status: "success" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  if (!token) {
    return NextResponse.redirect(new URL("/newsletter/confirm?status=invalid", request.url));
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.redirect(new URL("/newsletter/confirm?status=error", request.url));
  }

  const result = await confirmSubscription(token);

  switch (result.status) {
    case "success":
      return NextResponse.redirect(new URL("/newsletter/confirm?status=success", request.url));
    case "expired":
      return NextResponse.redirect(new URL("/newsletter/confirm?status=expired", request.url));
    case "already_confirmed":
      return NextResponse.redirect(new URL("/newsletter/confirm?status=already", request.url));
    case "error":
      return NextResponse.redirect(new URL("/newsletter/confirm?status=error", request.url));
    case "invalid":
    default:
      return NextResponse.redirect(new URL("/newsletter/confirm?status=invalid", request.url));
  }
}