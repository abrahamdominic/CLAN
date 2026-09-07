import { NextResponse } from "next/server";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const provider = process.env.PAYMENT_PROVIDER || "";
  if (provider !== "paystack") {
    return new NextResponse("Payment provider not enabled", { status: 400 });
  }

  const secret = process.env.PAYMENT_PROVIDER_SECRET;
  if (!secret) {
    return new NextResponse("Provider not configured", { status: 400 });
  }

  // Verify signature (Paystack uses 'x-paystack-signature' HMAC SHA512 of raw body using secret key)
  const signature = request.headers.get("x-paystack-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 401 });
  }

  const rawBody = await request.text();
  const crypto = await import("node:crypto");
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const isSignatureValid =
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!isSignatureValid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string; amount?: number; currency?: string; customer?: { email?: string } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid body", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference && isSupabaseConfigured) {
    const reference = event.data.reference;
    const amountKobo = event.data.amount ?? 0;
    const currency = event.data.currency || "USD";

    // Check if already recorded
    const { data: existing } = await getServerClient()
      .from("donations")
      .select("id")
      .eq("reference", reference)
      .single();

    if (!existing) {
      const { error: insertError } = await getServerClient().from("donations").insert({
        amount: amountKobo / 100,
        currency,
        donor_email: event.data.customer?.email || null,
        status: "completed",
        reference,
      });
      if (insertError) {
        // Return 5xx so Paystack retries the webhook. Returning 2xx would mark
        // the delivery as successful and permanently lose the donation record.
        console.error("[paystack-webhook] failed to record donation", insertError.message);
        return NextResponse.json(
          { received: true, error: "Failed to record donation" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
