import { NextResponse } from "next/server";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ZERO_DECIMAL_CURRENCIES } from "@/lib/stripe";

export async function POST(request: Request) {
  const provider = process.env.PAYMENT_PROVIDER || "";
  if (provider !== "stripe") {
    return new NextResponse("Payment provider not enabled", { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_PROVIDER_SECRET;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return new NextResponse("Provider not configured", { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 401 });
  }

  const rawBody = await request.text();

  let event;
  try {
    const Stripe = (await import("stripe")).default;
    const client = new Stripe(secret);
    event = client.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new NextResponse(`Invalid signature: ${(err as Error).message}`, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      amount_total?: number | null;
      currency?: string | null;
      customer_email?: string | null;
      customer_details?: { email?: string | null; name?: string | null } | null;
      metadata?: Record<string, string> | null;
      payment_status?: string | null;
    };

    if (session.payment_status === "paid" && isSupabaseConfigured) {
      const reference = session.id;
      const currency = (session.currency || "usd").toUpperCase();
      // Convert from minor units accounting for zero-decimal currencies.
      const minorFactor = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
      const amount = (session.amount_total ?? 0) / minorFactor;
      const donor_email = session.customer_details?.email || session.customer_email || null;
      const donor_name = session.customer_details?.name || null;
      const category = session.metadata?.category || "General ministry";

      const { error } = await getServerClient()
        .from("donations")
        .upsert(
          {
            amount,
            currency,
            category,
            donor_name,
            donor_email,
            status: "completed",
            reference,
          },
          { onConflict: "reference", ignoreDuplicates: true }
        );
      if (error) {
        // Return 5xx so Stripe retries the webhook. Returning 2xx would mark
        // the delivery as successful and permanently lose the donation record.
        console.error("[stripe-webhook] failed to record donation", error.message);
        return NextResponse.json(
          { received: true, error: "Failed to record donation" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}