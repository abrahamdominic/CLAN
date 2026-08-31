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

  if (signature !== expected) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string; amount?: number; customer?: { email?: string } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid body", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference && isSupabaseConfigured) {
    const reference = event.data.reference;
    const amountKobo = event.data.amount ?? 0;

    // Check if already recorded
    const { data: existing } = await getServerClient()
      .from("donations")
      .select("id")
      .eq("reference", reference)
      .single();

    if (!existing) {
      await getServerClient().from("donations").insert({
        amount: amountKobo / 100,
        donor_email: event.data.customer?.email || null,
        status: "completed",
        reference,
      });
    }
  }

  return NextResponse.json({ received: true });
}
