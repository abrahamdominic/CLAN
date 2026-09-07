import { NextResponse } from "next/server";
import { adminGetNewsletterSubscribers, adminResendConfirmation } from "@/lib/admin-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") || "all") as "active" | "inactive" | "all";
  try {
    const data = await adminGetNewsletterSubscribers(page, 20, { search, status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], count: 0 });
  }
}

export async function POST(request: Request) {
  // Resend confirmation email
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Subscriber ID is required." }, { status: 400 });
    const result = await adminResendConfirmation(id);
    if (result.error) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to resend confirmation." }, { status: 400 });
  }
}